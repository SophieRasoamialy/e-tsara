const Subject = require('../models/Matiere');  
const User = require('../models/User');  
const Module = require('../models/Module'); 
const Class = require('../models/Niveau'); 
const mongoose = require('mongoose');

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

    // Récupérer les IDs des niveaux/classes depuis les paramètres de la requête, sous forme de tableau
    const classIds = req.params.class_ids.split(',').map(id => id.trim()); 

    // Rechercher les matières enseignées par ce professeur
    const subjects = await Subject.find({ 
      teacher_id: teacherId 
    })
    .populate('module_id')
    .exec();
    console.log("Subject", subjects);
    // Filtrer pour obtenir les matières dont les modules sont associés à tous les niveaux sélectionnés
    const commonSubjects = subjects.filter(subject => {
      if (!subject.module_id) return false;
      return classIds.every(classId => subject.module_id.class_ids.includes(classId));
    });

    if (commonSubjects.length === 0) {
      return res.status(404).json({ msg: 'Aucune matière commune trouvée pour ce professeur dans ces niveaux' });
    }

    res.json(commonSubjects);
  } catch (error) {
    console.error('Erreur lors de la récupération des matières:', error);
    res.status(500).json({ msg: 'Erreur du serveur' });
  }
};


exports.getClassesForAuthenticatedTeacher = async (req, res) => {
  try {
    const teacherId = req.user._id; // ID de l'enseignant authentifié récupéré depuis le middleware d'authentification

    // Étape 1: Trouver toutes les matières enseignées par l'enseignant authentifié
    const subjects = await Subject.find({ teacher_id: new mongoose.Types.ObjectId(teacherId) })
                                  .populate('module_id')
                                  .exec();

    // Étape 2: Extraire les IDs des classes liées à ces matières via les modules
    const classIds = [];
    subjects.forEach(subject => {
      if (subject.module_id && subject.module_id.class_ids) {
        classIds.push(...subject.module_id.class_ids);
      }
    });

    // Étape 3: Éliminer les doublons
    const uniqueClassIds = [...new Set(classIds)];

    // Étape 4: Trouver les classes correspondantes
    const classes = await Class.find({ _id: { $in: uniqueClassIds } });

    if (classes.length === 0) {
      return res.status(404).json({ message: "Aucune classe trouvée pour cet enseignant." });
    }

    res.json(classes);
  } catch (error) {
    console.error('Erreur lors de la récupération des classes:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des classes' });
  }
};


// Fonction pour récupérer la liste des matières par classe
exports.getSubjectsByClass = async (req, res) => {
  try {
    // Récupérer l'ID de la classe à partir des paramètres de la requête
    const { classId } = req.params;

    // Vérifier si la classe existe
    const classe = await Class.findById(classId);
    if (!classe) {
      return res.status(404).json({ message: 'Classe non trouvée' });
    }

    // Trouver tous les modules associés à cette classe
    const modules = await Module.find({ class_ids: classId });

    if (modules.length === 0) {
      return res.status(404).json({ message: 'Aucun module trouvé pour cette classe' });
    }

    // Extraire les IDs des modules
    const moduleIds = modules.map(module => module._id);

    // Trouver toutes les matières associées aux modules
    const subjects = await Subject.find({ module_id: { $in: moduleIds } });

    // Vérifier si des matières ont été trouvées
    if (subjects.length === 0) {
      return res.status(404).json({ message: 'Aucune matière trouvée pour cette classe' });
    }

    // Retourner la liste des matières
    res.json(subjects);

  } catch (error) {
    console.error('Erreur lors de la récupération des matières par classe:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

