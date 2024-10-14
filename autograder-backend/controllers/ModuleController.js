const Module = require('../models/Module');  
const mongoose = require('mongoose');

// Fonction pour créer un nouveau module
exports.createModule = async (req, res) => {
  const { name, credit, class_ids } = req.body;

  try {
    // Vérifier si le module existe déjà
    let existingModule = await Module.findOne({ name });
    if (existingModule) {
      return res.status(400).json({ msg: 'Ce module existe déjà' });
    }

    // Création du module
    const newModule = new Module({ name, credit, class_ids });
    await newModule.save();

    res.status(201).json({ msg: 'Module créé avec succès', newModule });
  } catch (error) {
    res.status(500).json({ msg: 'Erreur du serveur' });
  }
};


// Fonction pour obtenir tous les modules
exports.getModules = async (req, res) => {
  try {
    // Récupérer tous les modules avec les informations du niveau associé
    const modules = await Module.find().populate('class_ids');

    res.json(modules);
  } catch (error) {
    res.status(500).json({ msg: 'Erreur du serveur' });
  }
};


// Fonction pour obtenir un module par ID
exports.getModuleById = async (req, res) => {
  const { id } = req.params;

  try {
    const module = await Module.findById(id);
    if (!module) {
      return res.status(404).json({ msg: 'Module non trouvé' });
    }

    res.json(module);
  } catch (error) {
    res.status(500).json({ msg: 'Erreur du serveur' });
  }
};

// Fonction pour mettre à jour un module par ID
exports.updateModule = async (req, res) => {
  const { name, credit, class_ids } = req.body;

  try {
    const updatedModule = await Module.findByIdAndUpdate(req.params.id, { name, credit, class_ids }, { new: true });

    if (!updatedModule) {
      return res.status(404).json({ msg: "Module non trouvé" });
    }

    res.status(200).json({ msg: "Module modifié avec succès", updatedModule });
  } catch (error) {
    res.status(500).json({ msg: "Erreur du serveur" });
  }
};


// Fonction pour supprimer un module par ID
exports.deleteModule = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedModule = await Module.findByIdAndDelete(id);

    if (!deletedModule) {
      return res.status(404).json({ msg: 'Module non trouvé' });
    }

    res.json({ msg: 'Module supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ msg: 'Erreur du serveur' });
  }
};

// Fonction pour obtenir les modules par classe (niveau)
exports.getModulesByClass = async (req, res) => {
  try {
    // Récupérer l'identifiant de la classe depuis les paramètres de requête
    const classId = req.params.class_id;

    // Vérifier que l'identifiant de classe est fourni
    if (!classId) {
      return res.status(400).json({ message: 'Class ID is required' });
    }

    // Vérifier si l'ID est un ObjectId valide
    if (!mongoose.Types.ObjectId.isValid(classId)) {
      return res.status(400).json({ message: 'Invalid Class ID format' });
    }

    // Rechercher les modules qui contiennent l'identifiant de classe dans le tableau class_ids
    const modules = await Module.find({ class_ids: classId }).populate('class_ids');

    // Vérifier si des modules ont été trouvés
    if (modules.length === 0) {
      return res.status(404).json({ message: 'No modules found for this class' });
    }

    // Retourner les modules trouvés
    return res.status(200).json(modules);
  } catch (error) {
    // Gérer les erreurs
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};


  
  // Fonction pour rechercher des modules par nom dans une classe (niveau) sélectionnée
  exports.searchModulesByName = async (req, res) => {
    const { class_id } = req.params;
    const { name } = req.query;
  
    try {
      const modules = await Module.find({
        class_id,
        name: { $regex: name, $options: 'i' }
      }).populate('class_id');
  
      if (modules.length === 0) {
        return res.status(404).json({ msg: 'Aucun module trouvé pour cette recherche' });
      }
  
      res.json(modules);
    } catch (error) {
      res.status(500).json({ msg: 'Erreur du serveur' });
    }
  };
  