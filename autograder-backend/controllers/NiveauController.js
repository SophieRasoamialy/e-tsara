const Class = require('../models/Niveau');  

// Fonction pour créer une nouvelle classe
exports.createClass = async (req, res) => {
  const { name } = req.body;

  try {
    // Vérifier si la classe existe déjà
    let existingClass = await Class.findOne({ name });
    if (existingClass) {
      return res.status(400).json({ msg: 'Cette classe existe déjà' });
    }

    // Création de la classe
    const newClass = new Class({ name });
    await newClass.save();

    res.status(201).json({ msg: 'Classe créée avec succès', newClass });
  } catch (error) {
    res.status(500).json({ msg: 'Erreur du serveur' });
  }
};

// Fonction pour obtenir toutes les classes
exports.getClasses = async (req, res) => {
  try {
    const classes = await Class.find();
    res.json(classes);
  } catch (error) {
    res.status(500).json({ msg: 'Erreur du serveur' });
  }
};

// Fonction pour obtenir une classe par ID
exports.getClassById = async (req, res) => {
  const { id } = req.params;

  try {
    const classItem = await Class.findById(id);
    if (!classItem) {
      return res.status(404).json({ msg: 'Classe non trouvée' });
    }

    res.json(classItem);
  } catch (error) {
    res.status(500).json({ msg: 'Erreurrere du serveur' });
  }
};

// Fonction pour mettre à jour une classe par ID
exports.updateClass = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const updatedClass = await Class.findByIdAndUpdate(id, { name }, { new: true });

    if (!updatedClass) {
      return res.status(404).json({ msg: 'Classe non trouvée' });
    }

    res.json({ msg: 'Classe mise à jour avec succès', updatedClass });
  } catch (error) {
    res.status(500).json({ msg: 'Erreur du serveur' });
  }
};

// Fonction pour supprimer une classe par ID
exports.deleteClass = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedClass = await Class.findByIdAndDelete(id);

    if (!deletedClass) {
      return res.status(404).json({ msg: 'Classe non trouvée' });
    }

    res.json({ msg: 'Classe supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ msg: 'Erreur du serveur' });
  }
};

// Fonction pour rechercher des classes par nom
exports.searchClasses = async (req, res) => {
  const { query } = req.query;
  console.log("Paramètre de recherche:", query); // Vérifier ce qui est reçu

  if (!query) {
    return res.status(400).json({ msg: 'Le paramètre de recherche est manquant' });
  }

  try {
    const classes = await Class.find({ name: { $regex: query, $options: 'i' } });

    if (classes.length === 0) {
      return res.status(404).json({ msg: 'Aucune classe trouvée pour cette recherche' });
    }

    res.json(classes);
  } catch (error) {
    console.error("Erreur lors de la recherche des classes:", error);
    res.status(500).json({ msg: 'Erreur du serveur' });
  }
};


