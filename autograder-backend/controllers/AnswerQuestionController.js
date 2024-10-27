const AnswerQuestion = require('../models/AnswerQuestion');
const Question = require('../models/Question');

// Fonction pour créer une nouvelle réponse à une question
exports.createAnswerQuestion = async (req, res) => {
  const { question_id, answer } = req.body;

  try {
    // Vérifier si la question existe
    let existingQuestion = await Question.findById(question_id);
    if (!existingQuestion) {
      return res.status(404).json({ msg: 'Question non trouvée' });
    }

    // Création de la réponse
    const newAnswerQuestion = new AnswerQuestion({
      question_id,
      answer,
    });

    await newAnswerQuestion.save();
    res.status(201).json({ msg: 'Réponse créée avec succès', newAnswerQuestion });
  } catch (error) {
    res.status(500).json({ msg: 'Erreur du serveur', error });
  }
};

// Fonction pour obtenir une réponse par ID
exports.getAnswerQuestionById = async (req, res) => {
  const { id } = req.params;

  try {
    const answer = await AnswerQuestion.findById(id).populate('question_id');
    if (!answer) {
      return res.status(404).json({ msg: 'Réponse non trouvée' });
    }

    res.json(answer);
  } catch (error) {
    res.status(500).json({ msg: 'Erreur du serveur', error });
  }
};

// Fonction pour mettre à jour une réponse par ID
exports.updateAnswerQuestion = async (req, res) => {
  const { id } = req.params;
  const { question_id, answer } = req.body;

  try {
    // Vérifier si la question existe
    let existingQuestion = await Question.findById(question_id);
    if (!existingQuestion) {
      return res.status(404).json({ msg: 'Question non trouvée' });
    }

    const updatedAnswerQuestion = await AnswerQuestion.findByIdAndUpdate(
      id,
      { question_id, answer },
      { new: true }
    ).populate('question_id');

    if (!updatedAnswerQuestion) {
      return res.status(404).json({ msg: 'Réponse non trouvée' });
    }

    res.json({ msg: 'Réponse mise à jour avec succès', updatedAnswerQuestion });
  } catch (error) {
    res.status(500).json({ msg: 'Erreur du serveur', error });
  }
};

// Fonction pour supprimer une réponse par ID
exports.deleteAnswerQuestion = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedAnswerQuestion = await AnswerQuestion.findByIdAndDelete(id);

    if (!deletedAnswerQuestion) {
      return res.status(404).json({ msg: 'Réponse non trouvée' });
    }

    res.json({ msg: 'Réponse supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ msg: 'Erreur du serveur', error });
  }
};

// Fonction pour rechercher des réponses par question
exports.getAnswersByQuestion = async (req, res) => {
  const { question_id } = req.params;

  try {
    const answers = await AnswerQuestion.find({ question_id }).populate('question_id');
    if (answers.length === 0) {
      return res.status(404).json({ msg: 'Aucune réponse trouvée pour cette question' });
    }

    res.json(answers);
  } catch (error) {
    res.status(500).json({ msg: 'Erreur du serveur', error });
  }
};
