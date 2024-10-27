const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');

    // Récupérer le token depuis les en-têtes Authorization ou les cookies
    let token = authHeader ? authHeader.replace('Bearer ', '') : req.cookies.token;

    if (!token) {
      throw new Error('Token non trouvé dans les en-têtes ou les cookies');
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    const user = await User.findById(decoded.id);

    if (!user) {
      throw new Error('Utilisateur non trouvé avec ce token');
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Erreur d'authentification :", error);
    res.status(401).send({ error: 'Veuillez vous authentifier.' });
  }
};


module.exports = authMiddleware;
