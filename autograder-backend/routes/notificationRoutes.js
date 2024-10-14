const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/NotificationController');

// Route pour créer une nouvelle notification
/**
 * @swagger
 * /notifications:
 *   post:
 *     summary: Créer une nouvelle notification
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Notification'
 *     responses:
 *       201:
 *         description: Notification créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       500:
 *         description: Erreur serveur
 */
router.post('/', NotificationController.createNotification);

// Route pour obtenir toutes les notifications
/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Obtenir toutes les notifications
 *     tags: [Notifications]
 *     responses:
 *       200:
 *         description: Liste des notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 *       500:
 *         description: Erreur serveur
 */
router.get('/', NotificationController.getNotifications);

// Route pour obtenir une notification par ID
/**
 * @swagger
 * /notifications/{id}:
 *   get:
 *     summary: Obtenir une notification par ID
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la notification
 *     responses:
 *       200:
 *         description: Notification trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       404:
 *         description: Notification non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.get('/:id', NotificationController.getNotificationById);

// Route pour mettre à jour une notification par ID
/**
 * @swagger
 * /notifications/{id}:
 *   put:
 *     summary: Mettre à jour une notification par ID
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la notification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Notification'
 *     responses:
 *       200:
 *         description: Notification mise à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       404:
 *         description: Notification non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.put('/:id', NotificationController.updateNotification);

// Route pour supprimer une notification par ID
/**
 * @swagger
 * /notifications/{id}:
 *   delete:
 *     summary: Supprimer une notification par ID
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la notification
 *     responses:
 *       200:
 *         description: Notification supprimée avec succès
 *       404:
 *         description: Notification non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.delete('/:id', NotificationController.deleteNotification);

// Route pour obtenir les notifications d'un utilisateur spécifique
/**
 * @swagger
 * /notifications/user/{userId}:
 *   get:
 *     summary: Obtenir les notifications d'un utilisateur spécifique
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Liste des notifications de l'utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 *       404:
 *         description: Aucune notification trouvée pour cet utilisateur
 *       500:
 *         description: Erreur serveur
 */
router.get('/user/:userId', NotificationController.getNotificationsByUser);

module.exports = router;
