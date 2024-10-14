const AnswerSheet = require('../models/AnswerSheet');

// Fonction pour créer une nouvelle feuille de réponse
const createAnswerSheet = async (req, res) => {
  try {
    const { student_matricule, sheet, sheet_corrige, note, subject_id, exam_id } = req.body;

    const newAnswerSheet = new AnswerSheet({
      student_matricule,
      sheet,
      sheet_corrige,
      note,
      subject_id,
      exam_id
    });

    const savedAnswerSheet = await newAnswerSheet.save();
    res.status(201).json(savedAnswerSheet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// Fonction pour obtenir une feuille de réponse par ID
const getAnswerSheetById = async (req, res) => {
  try {
    const { id } = req.params;
    const answerSheet = await AnswerSheet.findById(id)
      .populate('student_matricule', 'name')
      .populate('subject_id', 'name')
      .populate('exam_id', 'date');

    if (!answerSheet) return res.status(404).json({ message: 'AnswerSheet not found' });
    res.status(200).json(answerSheet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fonction pour mettre à jour une feuille de réponse par ID
const updateAnswerSheet = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedAnswerSheet = await AnswerSheet.findByIdAndUpdate(id, updates, { new: true })
      .populate('student_matricule', 'name')
      .populate('subject_id', 'name')
      .populate('exam_id', 'date');

    if (!updatedAnswerSheet) return res.status(404).json({ message: 'AnswerSheet not found' });
    res.status(200).json(updatedAnswerSheet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Fonction pour obtenir les feuilles de réponses par étudiant
const getAnswerSheetsByStudent = async (req, res) => {
  try {
    const { student_id } = req.params;
    const answerSheets = await AnswerSheet.find({ student_matricule: student_id })
      .populate('subject_id', 'name')
      .populate('exam_id', 'date');

    if (!answerSheets) return res.status(404).json({ message: 'No answer sheets found for this student' });
    res.status(200).json(answerSheets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Fonction pour obtenir les feuilles de réponses par examen et par matière
const getAnswerSheetsByExamAndSubject = async (req, res) => {
    try {
      const { exam_id, subject_id } = req.params;
  
      const answerSheets = await AnswerSheet.find({ exam_id, subject_id })
        .populate('student_matricule', 'name')
        .populate('subject_id', 'name')
        .populate('exam_id', 'date');
  
      if (!answerSheets.length) {
        return res.status(404).json({ message: 'No answer sheets found for this exam and subject' });
      }
  
      res.status(200).json(answerSheets);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

// Exporter les fonctions
module.exports = {
  createAnswerSheet,
  getAnswerSheetById,
  updateAnswerSheet,
  getAnswerSheetsByStudent,
  getAnswerSheetsByExamAndSubject 
};
