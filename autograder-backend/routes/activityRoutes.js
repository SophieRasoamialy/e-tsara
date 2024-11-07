const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');

// Route pour récupérer toutes les activités
router.get('/', async (req, res) => {
  try {
    const activities = await Activity.find().sort({ timestamp: -1 }).populate('userId'); // Tri par date décroissante
    res.json(activities);
  } catch (error) {
    res.status(500).json({ msg: 'Erreur du serveur' });
  }
});
router.get('/recent-activities', async (req, res) => {
  try {
    const recentActivities = await Activity.find()
      .sort({ timestamp: -1 }) // Trie par ordre décroissant de date
      .limit(3)
      .populate('userId'); // Limite aux 3 dernières activités
    res.status(200).json(recentActivities);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des activités récentes', error });
  }
});
module.exports = router;
