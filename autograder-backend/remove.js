const mongoose = require('mongoose');
const User = require('./models/User'); // Assurez-vous de bien pointer vers votre modèle User

const removeUsernameField = async () => {
  try {
    await User.updateMany({}, { $unset: { username: "" } });
    console.log('Champ username supprimé de tous les documents.');
  } catch (error) {
    console.error('Erreur lors de la suppression du champ username:', error);
  }
};

removeUsernameField();
