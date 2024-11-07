const Exam = require("../models/Exam");
const Subject = require("../models/Matiere");
const Module = require("../models/Module");
const Class = require("../models/Niveau");
const Question = require("../models/Question");
const AnswerQuestion = require("../models/AnswerQuestion");
const Activity = require("../models/Activity");

// Fonction pour créer un nouvel examen
exports.createExam = async (req, res) => {
  const { session, semestre, titre, subject_id, academicYear, class_ids } =
    req.body;

  try {
    // Vérifier si la matière (subject) existe
    let existingSubject = await Subject.findById(subject_id);
    if (!existingSubject) {
      return res.status(404).json({ msg: "Matière non trouvée" });
    }

    // Création de l'examen
    const newExam = new Exam({
      session,
      semestre,
      titre,
      subject_id,
      academicYear,
      class_ids,
    });
    await newExam.save();
    // Enregistrement de l'activité
    await Activity.create({
      userId: req.user._id,
      action: "créaction d'examen",
      description: `Création de l'examen ${newExam}`,
    });

    res
      .status(201)
      .json({ msg: "Examen créé avec succès", examId: newExam._id });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ msg: "Erreur du serveur" });
  }
};

// Fonction pour obtenir tous les examens
exports.getExams = async (req, res) => {
  try {
    const exams = await Exam.find()
      .populate("subject_id")
      .populate("class_ids");
    res.json(exams);
  } catch (error) {
    res.status(500).json({ msg: "Erreur du serveur" });
  }
};

// Fonction pour obtenir un examen par ID
exports.getExamById = async (req, res) => {
  const { id } = req.params;

  try {
    // Récupérer les informations de l'examen avec la matière associée
    const exam = await Exam.findById(id)
      .populate("subject_id")
      .populate("class_ids");
    if (!exam) {
      return res.status(404).json({ msg: "Examen non trouvé" });
    }

    // Récupérer les questions associées à cet examen
    const questions = await Question.find({ exam_id: id });

    // Pour chaque question, récupérer les réponses associées
    const questionsWithAnswers = await Promise.all(
      questions.map(async (question) => {
        const answers = await AnswerQuestion.find({
          question_id: question._id,
        });
        return {
          ...question._doc,
          answers: answers.map((answer) => ({
            _id: answer._id,
            answer: answer.answer,
          })),
        };
      })
    );

    // Retourner les informations de l'examen avec les questions et réponses associées
    res.json({
      exam,
      questions: questionsWithAnswers,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'examen:", error);
    res.status(500).json({ msg: "Erreur du serveur" });
  }
};

// Fonction pour mettre à jour un examen par ID
exports.updateExam = async (req, res) => {
  const { id } = req.params;
  const { session, semestre, titre, subject_id, academicYear, class_ids } = req.body;

  try {
    // Vérifier si la matière (subject) existe
    let existingSubject = await Subject.findById(subject_id);
    if (!existingSubject) {
      return res.status(404).json({ msg: "Matière non trouvée" });
    }

    // Trouver l'examen actuel avant la mise à jour pour comparer les changements
    const existingExam = await Exam.findById(id);
    if (!existingExam) {
      return res.status(404).json({ msg: "Examen non trouvé" });
    }

    // Mise à jour de l'examen
    const updatedExam = await Exam.findByIdAndUpdate(
      id,
      { session, semestre, titre, subject_id, academicYear, class_ids },
      { new: true }
    ).populate("subject_id");

    if (!updatedExam) {
      return res.status(404).json({ msg: "Examen non trouvé" });
    }

    // Comparaison des champs modifiés pour une description détaillée
    const changes = [];
    if (existingExam.session !== session) changes.push(`session: ${existingExam.session} → ${session}`);
    if (existingExam.semestre !== semestre) changes.push(`semestre: ${existingExam.semestre} → ${semestre}`);
    if (existingExam.titre !== titre) changes.push(`titre: ${existingExam.titre} → ${titre}`);
    if (existingExam.subject_id.toString() !== subject_id) changes.push(`matière: ${existingExam.subject_id.name} → ${existingSubject.name}`);
    if (existingExam.academicYear !== academicYear) changes.push(`année académique: ${existingExam.academicYear} → ${academicYear}`);
    if (JSON.stringify(existingExam.class_ids) !== JSON.stringify(class_ids)) changes.push(`classes: [${existingExam.class_ids.join(', ')}] → [${class_ids.join(', ')}]`);

    const description = changes.length > 0 ? `Modification de l'examen: ${changes.join(', ')}` : `Aucune modification apportée à l'examen.`;

    // Enregistrement de l'activité
    await Activity.create({
      userId: req.user._id,
      action: "modification d'examen",
      description: description,
    });

    res.json({ msg: "Examen mis à jour avec succès", updatedExam });
  } catch (error) {
    res.status(500).json({ msg: "Erreur du serveur" });
  }
};


// Fonction pour supprimer un examen par ID
exports.deleteExam = async (req, res) => {
  const { id } = req.params;

  try {
    // Trouver l'examen avant de le supprimer pour enregistrer les détails
    const deletedExam = await Exam.findByIdAndDelete(id);

    if (!deletedExam) {
      return res.status(404).json({ msg: "Examen non trouvé" });
    }

    // Enregistrement de l'activité
    await Activity.create({
      userId: req.user._id,
      action: 'supprimer examen',
      description: `Suppression de l'examen "${deletedExam.titre}" pour la matière "${deletedExam.subject_id}" (Session: ${deletedExam.session}, Semestre: ${deletedExam.semestre})`,
    });

    res.json({ msg: "Examen supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ msg: "Erreur du serveur" });
  }
};


// Fonction pour rechercher des examens par session
exports.getExamsBySession = async (req, res) => {
  const { session } = req.params;

  try {
    const exams = await Exam.find({ session })
      .populate("subject_id")
      .populate("class_ids");
    if (exams.length === 0) {
      return res
        .status(404)
        .json({ msg: `Aucun examen trouvé pour la session: ${session}` });
    }

    res.json(exams);
  } catch (error) {
    res.status(500).json({ msg: "Erreur du serveur" });
  }
};

// Fonction pour rechercher des examens par semestre
exports.getExamsBySemestre = async (req, res) => {
  const { semestre } = req.params;

  try {
    const exams = await Exam.find({ semestre })
      .populate("subject_id")
      .populate("class_ids");
    if (exams.length === 0) {
      return res
        .status(404)
        .json({ msg: `Aucun examen trouvé pour le semestre: ${semestre}` });
    }

    res.json(exams);
  } catch (error) {
    res.status(500).json({ msg: "Erreur du serveur" });
  }
};

// Fonction pour rechercher des examens par matière
exports.getExamsBySubject = async (req, res) => {
  const { subject_id } = req.params;

  try {
    const exams = await Exam.find({ subject_id })
      .populate("subject_id")
      .populate("class_ids");
    if (exams.length === 0) {
      return res
        .status(404)
        .json({ msg: "Aucun examen trouvé pour cette matière" });
    }

    res.json(exams);
  } catch (error) {
    res.status(500).json({ msg: "Erreur du serveur" });
  }
};

exports.getExamsForLevelByTeacher = async (req, res) => {
  const teacherId = req.user._id;
  const { classIds } = req.params;

  try {
    // Convertir les classIds en tableau si ce n'est pas déjà le cas
    const classIdsArray = classIds.split(",");

    // Rechercher les matières enseignées par le professeur
    const subjects = await Subject.find({ teacher_id: teacherId }).distinct(
      "_id"
    );
    // Rechercher les examens où la classe est incluse et la matière est enseignée par ce professeur
    const exams = await Exam.find({
      class_ids: { $in: classIdsArray },
      subject_id: { $in: subjects },
    })
      .populate("subject_id", "name") 
      .populate("class_ids", "name"); 

    if (exams.length === 0) {
      return res
        .status(404)
        .json({
          msg: "Aucun examen trouvé pour ce professeur et ces niveaux.",
        });
    }

    // Retourner les examens trouvés
    res.status(200).json(exams);
  } catch (error) {
    console.error("Erreur lors de la récupération des examens:", error);
    res.status(500).json({ msg: "Erreur du serveur", error });
  }
};
