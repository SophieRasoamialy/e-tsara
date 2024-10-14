const Notification = require('../models/Notification');

// Fonction pour créer une nouvelle notification
const createNotification = async (req, res) => {
  try {
    const { recipient_id, title, message, type } = req.body;

    const newNotification = new Notification({
      recipient_id,
      title,
      message,
      type
    });

    const savedNotification = await newNotification.save();
    res.status(201).json(savedNotification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fonction pour obtenir toutes les notifications
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .populate('recipient_id', 'name email')
      .sort({ created_at: -1 });
    
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fonction pour obtenir une notification par ID
const getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findById(id)
      .populate('recipient_id', 'name email');

    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fonction pour mettre à jour une notification par ID
const updateNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedNotification = await Notification.findByIdAndUpdate(id, updates, { new: true })
      .populate('recipient_id', 'name email');

    if (!updatedNotification) return res.status(404).json({ message: 'Notification not found' });
    res.status(200).json(updatedNotification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fonction pour supprimer une notification par ID
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedNotification = await Notification.findByIdAndDelete(id);

    if (!deletedNotification) return res.status(404).json({ message: 'Notification not found' });
    res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fonction pour obtenir les notifications d'un utilisateur spécifique
const getNotificationsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await Notification.find({ recipient_id: userId })
      .sort({ created_at: -1 });

    if (!notifications.length) return res.status(404).json({ message: 'No notifications found for this user' });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Exporter les fonctions
module.exports = {
  createNotification,
  getNotifications,
  getNotificationById,
  updateNotification,
  deleteNotification,
  getNotificationsByUser
};
