const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');

// Route pour récupérer toutes les activités
router.get('/', async (req, res) => {
  try {
    const activities = await Activity.find().sort({ timestamp: -1 }); // Tri par date décroissante
    res.json(activities);
  } catch (error) {
    res.status(500).json({ msg: 'Erreur du serveur' });
  }
});

module.exports = router;
