const express = require('express');
const router = express.Router();
const AnswerQuestionController = require('../controllers/AnswerQuestionController');

/**
 * @swagger
 * tags:
 *   name: AnswerQuestions
 *   description: Gestion des réponses aux questions
 */

/**
 * @swagger
 * /:
 *   post:
 *     summary: Créer une nouvelle réponse
 *     tags: [AnswerQuestions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AnswerQuestion'
 *     responses:
 *       201:
 *         description: Réponse créée avec succès
 *       400:
 *         description: Erreur dans la requête
 */
router.post('/', AnswerQuestionController.createAnswerQuestion);

/**
 * @swagger
 * /{id}:
 *   get:
 *     summary: Obtenir une réponse par ID
 *     tags: [AnswerQuestions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Identifiant de la réponse
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Détails de la réponse
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AnswerQuestion'
 *       404:
 *         description: Réponse non trouvée
 */
router.get('/:id', AnswerQuestionController.getAnswerQuestionById);

/**
 * @swagger
 * /{id}:
 *   put:
 *     summary: Mettre à jour une réponse par ID
 *     tags: [AnswerQuestions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Identifiant de la réponse
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AnswerQuestion'
 *     responses:
 *       200:
 *         description: Réponse mise à jour avec succès
 *       400:
 *         description: Erreur dans la requête
 *       404:
 *         description: Réponse non trouvée
 */
router.put('/:id', AnswerQuestionController.updateAnswerQuestion);

/**
 * @swagger
 * /{id}:
 *   delete:
 *     summary: Supprimer une réponse par ID
 *     tags: [AnswerQuestions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Identifiant de la réponse
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Réponse supprimée avec succès
 *       404:
 *         description: Réponse non trouvée
 */
router.delete('/:id', AnswerQuestionController.deleteAnswerQuestion);

/**
 * @swagger
 * /question/{question_id}:
 *   get:
 *     summary: Rechercher des réponses par question
 *     tags: [AnswerQuestions]
 *     parameters:
 *       - in: path
 *         name: question_id
 *         required: true
 *         description: Identifiant de la question pour filtrer les réponses
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Liste des réponses pour la question spécifiée
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AnswerQuestion'
 *       404:
 *         description: Aucune réponse trouvée pour cette question
 */
router.get('/question/:question_id', AnswerQuestionController.getAnswersByQuestion);

module.exports = router;
