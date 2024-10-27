const express = require('express');
const router = express.Router();
const QuestionController = require('../controllers/QuestionController');

/**
 * @swagger
 * tags:
 *   name: Questions
 *   description: Gestion des questions
 */

/**
 * @swagger
 * /questions:
 *   post:
 *     summary: Créer une nouvelle question
 *     tags: [Questions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Question'
 *     responses:
 *       201:
 *         description: Question créée avec succès
 *       400:
 *         description: Erreur dans la requête
 */
router.post('/', QuestionController.createQuestion);

/**
 * @swagger
 * /questions/{id}:
 *   get:
 *     summary: Obtenir une question par ID
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Identifiant de la question
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Détails de la question
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Question'
 *       404:
 *         description: Question non trouvée
 */
router.get('/:id', QuestionController.getQuestionById);

/**
 * @swagger
 * /questions/{id}:
 *   put:
 *     summary: Mettre à jour une question par ID
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Identifiant de la question
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Question'
 *     responses:
 *       200:
 *         description: Question mise à jour avec succès
 *       400:
 *         description: Erreur dans la requête
 *       404:
 *         description: Question non trouvée
 */
router.put('/:id', QuestionController.updateQuestion);

/**
 * @swagger
 * /questions/{id}:
 *   delete:
 *     summary: Supprimer une question par ID
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Identifiant de la question
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Question supprimée avec succès
 *       404:
 *         description: Question non trouvée
 */
router.delete('/:id', QuestionController.deleteQuestion);

/**
 * @swagger
 * /questions/exam/{exam_id}:
 *   get:
 *     summary: Rechercher des questions par examen
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: exam_id
 *         required: true
 *         description: Identifiant de l'examen pour filtrer les questions
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Liste des questions pour l'examen spécifié
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Question'
 *       404:
 *         description: Aucune question trouvée pour cet examen
 */
router.get('/exam/:exam_id', QuestionController.getQuestionsByExam);

module.exports = router;
