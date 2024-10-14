const Question = require('../models/Question');  // Assurez-vous que le chemin vers le modèle Question est correct
const Exam = require('../models/Exam');  // Assurez-vous que le chemin vers le modèle Exam est correct

// Fonction pour créer une nouvelle question
exports.createQuestion = async (req, res) => {
  const { exam_id, text, answer_type, answer_duplicated, points } = req.body;

  try {
    // Vérifier si l'examen existe
    let existingExam = await Exam.findById(exam_id);
    if (!existingExam) {
      return res.status(404).json({ msg: "Examen non trouvé" });
    }

    // Création de la question
    const newQuestion = new Question({
      exam_id,
      text,
      answer_type,
      answer_duplicated,
      points,
    });

    await newQuestion.save();
    res.status(201).json({ msg: 'Question créée avec succès', newQuestion });
  } catch (error) {
    res.status(500).json({ msg: 'Erreur du serveur', error });
  }
};



// Fonction pour obtenir une question par ID
exports.getQuestionById = async (req, res) => {
  const { id } = req.params;

  try {
    const question = await Question.findById(id).populate('exam_id');
    if (!question) {
      return res.status(404).json({ msg: 'Question non trouvée' });
    }

    res.json(question);
  } catch (error) {
    res.status(500).json({ msg: 'Erreur du serveur', error });
  }
};

// Fonction pour mettre à jour une question par ID
exports.updateQuestion = async (req, res) => {
  const { id } = req.params;
  const { exam_id, text, answer_type, answer_duplicated, points } = req.body;

  try {
    // Vérifier si l'examen existe
    let existingExam = await Exam.findById(exam_id);
    if (!existingExam) {
      return res.status(404).json({ msg: "Examen non trouvé" });
    }

    const updatedQuestion = await Question.findByIdAndUpdate(
      id,
      { exam_id, text, answer_type, answer_duplicated, points },
      { new: true }
    ).populate('exam_id');

    if (!updatedQuestion) {
      return res.status(404).json({ msg: 'Question non trouvée' });
    }

    res.json({ msg: 'Question mise à jour avec succès', updatedQuestion });
  } catch (error) {
    res.status(500).json({ msg: 'Erreur du serveur', error });
  }
};

// Fonction pour supprimer une question par ID
exports.deleteQuestion = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedQuestion = await Question.findByIdAndDelete(id);

    if (!deletedQuestion) {
      return res.status(404).json({ msg: 'Question non trouvée' });
    }

    res.json({ msg: 'Question supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ msg: 'Erreur du serveur', error });
  }
};



// Fonction pour rechercher des questions par examen
exports.getQuestionsByExam = async (req, res) => {
  const { exam_id } = req.params;

  try {
    const questions = await Question.find({ exam_id }).populate('exam_id');
    if (questions.length === 0) {
      return res.status(404).json({ msg: 'Aucune question trouvée pour cet examen' });
    }

    res.json(questions);
  } catch (error) {
    res.status(500).json({ msg: 'Erreur du serveur', error });
  }
};
