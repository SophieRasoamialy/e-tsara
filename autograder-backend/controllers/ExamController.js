const Exam = require('../models/Exam');  
const Subject = require('../models/Matiere');  

// Fonction pour créer un nouvel examen
exports.createExam = async (req, res) => {
  const { session, semestre, subject_id, date } = req.body;

  try {
    // Vérifier si la matière (subject) existe
    let existingSubject = await Subject.findById(subject_id);
    if (!existingSubject) {
      return res.status(404).json({ msg: 'Matière non trouvée' });
    }

    // Création de l'examen
    const newExam = new Exam({ session, semestre, subject_id, date });
    await newExam.save();

    res.status(201).json({ msg: 'Examen créé avec succès', newExam });
  } catch (error) {
    res.status(500).json({ msg: 'Erreur du serveur' });
  }
};

// Fonction pour obtenir tous les examens
exports.getExams = async (req, res) => {
  try {
    const exams = await Exam.find().populate('subject_id');
    res.json(exams);
  } catch (error) {
    res.status(500).json({ msg: 'Erreur du serveur' });
  }
};

// Fonction pour obtenir un examen par ID
exports.getExamById = async (req, res) => {
  const { id } = req.params;

  try {
    const exam = await Exam.findById(id).populate('subject_id');
    if (!exam) {
      return res.status(404).json({ msg: 'Examen non trouvé' });
    }

    res.json(exam);
  } catch (error) {
    res.status(500).json({ msg: 'Erreur du serveur' });
  }
};

// Fonction pour mettre à jour un examen par ID
exports.updateExam = async (req, res) => {
  const { id } = req.params;
  const { session, semestre, subject_id, date } = req.body;

  try {
    // Vérifier si la matière (subject) existe
    let existingSubject = await Subject.findById(subject_id);
    if (!existingSubject) {
      return res.status(404).json({ msg: 'Matière non trouvée' });
    }

    const updatedExam = await Exam.findByIdAndUpdate(
      id,
      { session, semestre, subject_id, date },
      { new: true }
    ).populate('subject_id');

    if (!updatedExam) {
      return res.status(404).json({ msg: 'Examen non trouvé' });
    }

    res.json({ msg: 'Examen mis à jour avec succès', updatedExam });
  } catch (error) {
    res.status(500).json({ msg: 'Erreur du serveur' });
  }
};

// Fonction pour supprimer un examen par ID
exports.deleteExam = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedExam = await Exam.findByIdAndDelete(id);

    if (!deletedExam) {
      return res.status(404).json({ msg: 'Examen non trouvé' });
    }

    res.json({ msg: 'Examen supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ msg: 'Erreur du serveur' });
  }
};

// Fonction pour rechercher des examens par session
exports.getExamsBySession = async (req, res) => {
  const { session } = req.params;

  try {
    const exams = await Exam.find({ session }).populate('subject_id');
    if (exams.length === 0) {
      return res.status(404).json({ msg: `Aucun examen trouvé pour la session: ${session}` });
    }

    res.json(exams);
  } catch (error) {
    res.status(500).json({ msg: 'Erreur du serveur' });
  }
};

// Fonction pour rechercher des examens par semestre
exports.getExamsBySemestre = async (req, res) => {
  const { semestre } = req.params;

  try {
    const exams = await Exam.find({ semestre }).populate('subject_id');
    if (exams.length === 0) {
      return res.status(404).json({ msg: `Aucun examen trouvé pour le semestre: ${semestre}` });
    }

    res.json(exams);
  } catch (error) {
    res.status(500).json({ msg: 'Erreur du serveur' });
  }
};

// Fonction pour rechercher des examens par matière
exports.getExamsBySubject = async (req, res) => {
  const { subject_id } = req.params;

  try {
    const exams = await Exam.find({ subject_id }).populate('subject_id');
    if (exams.length === 0) {
      return res.status(404).json({ msg: 'Aucun examen trouvé pour cette matière' });
    }

    res.json(exams);
  } catch (error) {
    res.status(500).json({ msg: 'Erreur du serveur' });
  }
};
