const Subject = require('../models/Matiere');  
const User = require('../models/User');  
const Module = require('../models/Module');  

// Fonction pour créer un nouveau sujet
exports.createSubject = async (req, res) => {
  const { name, coeff, teacher_id, module_id } = req.body;

  try {
    // Vérifier si l'enseignant existe
    let existingTeacher = await User.findById(teacher_id);
    if (!existingTeacher) {
      return res.status(404).json({ msg: 'Enseignant non trouvé' });
    }

    // Vérifier si le module existe
    let existingModule = await Module.findById(module_id);
    if (!existingModule) {
      return res.status(404).json({ msg: 'Module non trouvé' });
    }

    // Création du sujet
    const newSubject = new Subject({ name, coeff, teacher_id, module_id });
    await newSubject.save();

    res.status(201).json({ msg: 'Sujet créé avec succès', newSubject });
  } catch (error) {
    res.status(500).json({ msg: 'Erreur du serveur' });
  }
};

// Fonction pour obtenir tous les sujets
exports.getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find().populate('teacher_id').populate('module_id');
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ msg: 'Erreur du serveur' });
  }
};

// Fonction pour obtenir un sujet par ID
exports.getSubjectById = async (req, res) => {
  const { id } = req.params;

  try {
    const subject = await Subject.findById(id).populate('teacher_id').populate('module_id');
    if (!subject) {
      return res.status(404).json({ msg: 'Sujet non trouvé' });
    }

    res.json(subject);
  } catch (error) {
    res.status(500).json({ msg: 'Erreur du serveur' });
  }
};

// Fonction pour mettre à jour un sujet par ID
exports.updateSubject = async (req, res) => {
  const { id } = req.params;
  const { name, coeff, teacher_id, module_id } = req.body;

  try {
    // Vérifier si l'enseignant existe
    let existingTeacher = await User.findById(teacher_id);
    if (!existingTeacher) {
      return res.status(404).json({ msg: 'Enseignant non trouvé' });
    }

    // Vérifier si le module existe
    let existingModule = await Module.findById(module_id);
    if (!existingModule) {
      return res.status(404).json({ msg: 'Module non trouvé' });
    }

    const updatedSubject = await Subject.findByIdAndUpdate(id, { name, coeff, teacher_id, module_id }, { new: true });

    if (!updatedSubject) {
      return res.status(404).json({ msg: 'Sujet non trouvé' });
    }

    res.json({ msg: 'Sujet mis à jour avec succès', updatedSubject });
  } catch (error) {
    res.status(500).json({ msg: 'Erreur du serveur' });
  }
};

// Fonction pour supprimer un sujet par ID
exports.deleteSubject = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedSubject = await Subject.findByIdAndDelete(id);

    if (!deletedSubject) {
      return res.status(404).json({ msg: 'Sujet non trouvé' });
    }

    res.json({ msg: 'Sujet supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ msg: 'Erreur du serveur' });
  }
};

// Fonction pour obtenir les sujets par enseignant
exports.getSubjectsByTeacher = async (req, res) => {
  const { teacher_id } = req.params;

  try {
    const subjects = await Subject.find({ teacher_id }).populate('teacher_id').populate('module_id');
    if (subjects.length === 0) {
      return res.status(404).json({ msg: 'Aucun sujet trouvé pour cet enseignant' });
    }
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ msg: 'Erreur du serveur' });
  }
};

// Fonction pour obtenir les sujets par module
exports.getSubjectsByModule = async (req, res) => {
  const { module_id } = req.params;

  try {
    const subjects = await Subject.find({ module_id }).populate('teacher_id').populate('module_id');
    if (subjects.length === 0) {
      return res.status(404).json({ msg: 'Aucun sujet trouvé pour ce module' });
    }
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ msg: 'Erreur du serveur' });
  }
};

// Fonction pour rechercher des sujets par différents critères
exports.searchSubjects = async (req, res) => {
  const { name, coeff, teacher_id, module_id } = req.query;
  let searchCriteria = {};

  if (name) {
    searchCriteria.name = { $regex: name, $options: 'i' };
  }
  if (coeff) {
    searchCriteria.coeff = coeff;
  }
  if (teacher_id) {
    searchCriteria.teacher_id = teacher_id;
  }
  if (module_id) {
    searchCriteria.module_id = module_id;
  }

  try {
    const subjects = await Subject.find(searchCriteria)
      .populate('teacher_id')
      .populate('module_id');

    if (subjects.length === 0) {
      return res.status(404).json({ msg: 'Aucun sujet trouvé' });
    }

    res.json(subjects);
  } catch (error) {
    res.status(500).json({ msg: 'Erreur du serveur' });
  }
};

// Fonction pour obtenir les matières enseignées par le professeur authentifié
exports.getSubjectsForAuthenticatedTeacher = async (req, res) => {
  try {
    // Récupérer l'ID du professeur authentifié
    const teacherId = req.user._id;

    // Rechercher les matières enseignées par ce professeur
    const subjects = await Subject.find({ teacher_id: teacherId }).populate('module_id');

    if (subjects.length === 0) {
      return res.status(404).json({ msg: 'Aucune matière trouvée pour ce professeur' });
    }

    res.json(subjects);
  } catch (error) {
    res.status(500).json({ msg: 'Erreur du serveur' });
  }
};