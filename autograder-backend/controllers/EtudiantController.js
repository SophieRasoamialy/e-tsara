const Student = require('../models/Etudiant');  
const Class = require('../models/Niveau');  


// Fonction pour créer un nouvel étudiant
exports.createStudent = async (req, res) => {
  const { matricule, name, class_id } = req.body;

  try {
    // Vérifier si l'étudiant existe déjà
    let existingStudent = await Student.findOne({ matricule });
    if (existingStudent) {
      return res.status(400).json({ msg: 'Cet étudiant existe déjà' });
    }

    // Vérifier si la classe existe
    let existingClass = await Class.findById(class_id);
    if (!existingClass) {
      return res.status(404).json({ msg: 'Classe non trouvée' });
    }

    // Création de l'étudiant
    const newStudent = new Student({ matricule, name, class_id });
    await newStudent.save();

    res.status(201).json({ msg: 'Étudiant créé avec succès', newStudent });
  } catch (error) {
    res.status(500).json({ msg: 'Erreur du serveur' });
  }
};

// Fonction pour obtenir tous les étudiants
exports.getStudents = async (req, res) => {
  try {
    const students = await Student.find().populate('class_id');
    res.json(students);
  } catch (error) {
    res.status(500).json({ msg: 'Erreur du serveur' });
  }
};

// Fonction pour obtenir un étudiant par ID
exports.getStudentById = async (req, res) => {
  const { id } = req.params;

  try {
    const student = await Student.findById(id).populate('class_id');
    if (!student) {
      return res.status(404).json({ msg: 'Étudiant non trouvé' });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ msg: 'Erreur du serveur' });
  }
};

// Fonction pour mettre à jour un étudiant par ID
exports.updateStudent = async (req, res) => {
  const { id } = req.params;
  const { name, class_id } = req.body;

  try {
    // Vérifier si la classe existe
    let existingClass = await Class.findById(class_id);
    if (!existingClass) {
      return res.status(404).json({ msg: 'Classe non trouvée' });
    }

    const updatedStudent = await Student.findByIdAndUpdate(id, { name, class_id }, { new: true });

    if (!updatedStudent) {
      return res.status(404).json({ msg: 'Étudiant non trouvé' });
    }

    res.json({ msg: 'Étudiant mis à jour avec succès', updatedStudent });
  } catch (error) {
    res.status(500).json({ msg: 'Erreur du serveur' });
  }
};

// Fonction pour supprimer un étudiant par ID
exports.deleteStudent = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedStudent = await Student.findByIdAndDelete(id);

    if (!deletedStudent) {
      return res.status(404).json({ msg: 'Étudiant non trouvé' });
    }

    res.json({ msg: 'Étudiant supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ msg: 'Erreur du serveur' });
  }
};


// Fonction pour obtenir les étudiants par classe (niveau)
exports.getStudentsByClass = async (req, res) => {
  const { class_id } = req.params;

  try {
    const students = await Student.find({ class_id }).populate('class_id');
    if (students.length === 0) {
      return res.status(404).json({ msg: 'Aucun étudiant trouvé pour cette classe' });
    }
    res.json(students);
  } catch (error) {
    res.status(500).json({ msg: 'Erreur du serveur' });
  }
};

// Fonction pour rechercher des étudiants par nom ou matricule dans une classe (niveau) sélectionnée
exports.searchStudents = async (req, res) => {
  const { class_id } = req.params;
  const { query } = req.query;

  try {
    const students = await Student.find({
      class_id,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { matricule: { $regex: query, $options: 'i' } }
      ]
    }).populate('class_id');

    if (students.length === 0) {
      return res.status(404).json({ msg: 'Aucun étudiant trouvé pour cette recherche' });
    }

    res.json(students);
  } catch (error) {
    res.status(500).json({ msg: 'Erreur du serveur' });
  }
};
