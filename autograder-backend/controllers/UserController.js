const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role'); 
require('dotenv').config();


// Configuration de la clé secrète pour JWT 
const SECRET_KEY = process.env.SECRET_KEY;

// Fonction pour obtenir tous les utilisateurs
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().populate('role'); // Peupler le champ role avec les données de Role
    res.json(users);
  } catch (error) {
    res.status(500).json({ msg: 'Erreur du serveur' });
  }
};

// Fonction pour obtenir un utilisateur par ID
exports.getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id).populate('role'); // Peupler le champ role avec les données de Role
    if (!user) {
      return res.status(404).json({ msg: 'Utilisateur non trouvé' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ msg: 'Erreur du serveur' });
  }
};

// Fonction pour rechercher des utilisateurs par nom ou adresse email
exports.searchUsers = async (req, res) => {
  const { query } = req.query;

  try {
    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    }).populate('role'); // Peupler le champ role avec les données de Role

    if (users.length === 0) {
      return res.status(404).json({ msg: 'Aucun utilisateur trouvé pour cette recherche' });
    }

    res.json(users);
  } catch (error) {
    res.status(500).json({ msg: 'Erreur du serveur' });
  }
};

// Fonction pour rechercher des utilisateurs par rôle
exports.getUsersByRole = async (req, res) => {
  const { role } = req.params; // ID du rôle au lieu du nom du rôle

  try {
    const users = await User.find({ role: role }).populate('role'); // Peupler le champ role avec les données de Role
    if (users.length === 0) {
      return res.status(404).json({ msg: `Aucun utilisateur trouvé pour le rôle avec ID: ${role}` });
    }
    res.json(users);
  } catch (error) {
    res.status(500).json({ msg: 'Erreur du serveur' });
  }
};

// Fonction pour créer un compte utilisateur
exports.register = async (req, res) => {
  const { email, name, password, role } = req.body; 
  
  try {
    // Vérification si l'utilisateur existe déjà
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'Cet utilisateur existe déjà' });
    }

    // Hachage du mot de passe
    const password_hash = await bcrypt.hash(password, 10);

    // Création de l'utilisateur
    user = new User({
      email,
      name,
      password_hash,
      role,
    });

    await user.save();

    res.status(201).json({ msg: 'Compte créé avec succès' });
  } catch (error) {
    console.error(error); 
    res.status(500).json({ msg: 'Erreur du serveur' });
  }
};

// Fonction pour la connexion (login)
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Recherche de l'utilisateur par adresse email
    const user = await User.findOne({ email }).populate('role'); // Peupler le champ role avec les données de Role

    if (!user) {
      return res.status(400).json({ msg: 'Email ou mot de passe incorrect' });
    }
    // Vérification du mot de passe
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Email ou mot de passe incorrect' });
    }

    // Génération du token JWT
    const token = jwt.sign({ id: user._id, role: user.role.name }, SECRET_KEY, { expiresIn: '1h' });

    // Définir le cookie avec SameSite
    res.cookie('token', token, {
      HttpOnly: true,
      Secure:  true, 
      SameSite: 'None', 
    });
    // Retourner les informations de l'utilisateur et le token JWT
    res.json({ msg: 'Connexion réussie', token, role: user.role.name });

  } catch (error) {
    res.status(500).json({ msg: 'Erreur du serveur' });
  }
};



// Fonction pour modifier un compte utilisateur
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, password, roleId } = req.body; // Utiliser roleId au lieu de role

  try {
    // Préparation des données à mettre à jour
    const updateData = { name, role: roleId }; // Référence au rôle
    
    if (password) {
      updateData.password_hash = await bcrypt.hash(password, 10);
    }

    // Mise à jour de l'utilisateur
    const user = await User.findByIdAndUpdate(id, updateData, { new: true }).populate('role');
    
    if (!user) {
      return res.status(404).json({ msg: 'Utilisateur non trouvé' });
    }

    res.json({ msg: 'Compte mis à jour avec succès', user });
  } catch (error) {
    res.status(500).json({ msg: 'Erreur du serveur' });
  }
};

// Fonction pour supprimer un compte utilisateur
exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    // Suppression de l'utilisateur
    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      return res.status(404).json({ msg: 'Utilisateur non trouvé' });
    }

    res.json({ msg: 'Compte supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ msg: 'Erreur du serveur' });
  }
};

// Fonction pour récupérer tous les rôles
exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.find(); 
    res.status(200).json(roles); 
  } catch (error) {
    console.error('Erreur lors de la récupération des rôles:', error);
    res.status(500).json({ message: 'Erreurre serveur' });
  }
};
