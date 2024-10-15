const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require("./models/User"); 
const Role = require("./models/Role"); 
require('dotenv').config(); 


const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo-db:27017/autograderDB';






// Fonction pour établir la connexion à la base de données
const connectDB = async () => {
  console.log("mongo uri>>>", process.env.MONGO_URI)
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connexion à la base de données réussie.');
  } catch (error) {
    console.error('Erreur de connexion à la base de données:', error);
    process.exit(1); // Arrête le processus si la connexion échoue
  }
};

// Fonction pour ajouter les rôles
const seedRoles = async () => {
  try {
    const roles = ['professeur', 'admin', 'personnel'];

    // Supprimer les rôles existants
    await Role.deleteMany({});

    // Ajouter les nouveaux rôles
    for (const roleName of roles) {
      const role = new Role({ name: roleName });
      await role.save();
    }

    console.log('Les rôles ont été ajoutés avec succès.');
  } catch (error) {
    console.error('Erreur lors de l\'ajout des rôles:', error);
  }
};

// Fonction pour créer l'utilisateur Admin
const createAdmin = async () => {
  try {
    // Trouver le rôle Admin
    const adminRole = await Role.findOne({ name: "admin" }); 
    const hashedPassword = await bcrypt.hash("admin@1234", 10); 

    if (!adminRole) {
      console.error("Le rôle admin n'existe pas !");
      return;
    }

    // Créer un nouvel utilisateur Admin
    const adminUser = new User({
      email: "admin@gmail.com", 
      name: "Admin User",         
      password_hash: hashedPassword, 
      role: adminRole._id,       
    });

    // Enregistrer l'utilisateur dans la base de données
    await adminUser.save();
    console.log("Utilisateur Admin créé avec succès !");
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur Admin :", error);
  }
};

// Exécuter les scripts de seed
const runSeedScripts = async () => {
  await connectDB();  // Connexion à la base de données
  await seedRoles();  // Ajouter les rôles
  await createAdmin(); // Créer l'utilisateur Admin
  mongoose.disconnect(); // Déconnexion de la base de données
};

// Exécuter le script
runSeedScripts();
