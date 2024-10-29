const express = require('express');
const router = express.Router();
const ExamController = require('../controllers/ExamController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Exams
 *   description: Gestion des examens
 */

/**
 * @swagger
 * /exams:
 *   post:
 *     summary: Créer un nouvel examen
 *     tags: [Exams]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Exam'
 *     responses:
 *       201:
 *         description: Examen créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Exam'
 */
router.post('/', authMiddleware, ExamController.createExam);

/**
 * @swagger
 * /exams:
 *   get:
 *     summary: Obtenir tous les examens
 *     tags: [Exams]
 *     responses:
 *       200:
 *         description: Liste des examens
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Exam'
 */
router.get('/', ExamController.getExams);

/**
 * @swagger
 * /exams/{id}:
 *   get:
 *     summary: Obtenir un examen par ID
 *     tags: [Exams]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Détails de l'examen
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Exam'
 */
router.get('/:id', ExamController.getExamById);

/**
 * @swagger
 * /exams/{id}:
 *   put:
 *     summary: Mettre à jour un examen par ID
 *     tags: [Exams]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Exam'
 *     responses:
 *       200:
 *         description: Examen mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Exam'
 */
router.put('/:id', authMiddleware, ExamController.updateExam);

/**
 * @swagger
 * /exams/{id}:
 *   delete:
 *     summary: Supprimer un examen par ID
 *     tags: [Exams]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Examen supprimé avec succès
 */
router.delete('/:id', authMiddleware, ExamController.deleteExam);

/**
 * @swagger
 * /exams/session/{session}:
 *   get:
 *     summary: Rechercher des examens par session
 *     tags: [Exams]
 *     parameters:
 *       - name: session
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           enum: ['1ère session', 'rattrapage']
 *     responses:
 *       200:
 *         description: Liste des examens par session
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Exam'
 */
router.get('/session/:session', ExamController.getExamsBySession);

/**
 * @swagger
 * /exams/semestre/{semestre}:
 *   get:
 *     summary: Rechercher des examens par semestre
 *     tags: [Exams]
 *     parameters:
 *       - name: semestre
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           enum: ['1er semestre', '2ème semestre']
 *     responses:
 *       200:
 *         description: Liste des examens par semestre
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Exam'
 */
router.get('/semestre/:semestre', ExamController.getExamsBySemestre);

/**
 * @swagger
 * /exams/subject/{subject_id}:
 *   get:
 *     summary: Rechercher des examens par matière
 *     tags: [Exams]
 *     parameters:
 *       - name: subject_id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Liste des examens par matière
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Exam'
 */
router.get('/subject/:subject_id', ExamController.getExamsBySubject);


router.get('/level/:classIds', authMiddleware, ExamController.getExamsForLevelByTeacher);

module.exports = router;
