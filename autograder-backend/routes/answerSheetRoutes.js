const express = require('express');
const router = express.Router();
const AnswerSheetController = require('../controllers/AnswerSheetController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');

// Configurer Multer pour le téléchargement de fichiers
const storage = multer.memoryStorage(); // Stocker les fichiers en mémoire pour traitement avec AWS Textract
const upload = multer({ storage: storage });

router.get('/count-uploaded-sheets', AnswerSheetController.countUploadedSheets);
router.get('/count-corrected-sheets', AnswerSheetController.countCorrectedSheets);

// Route pour obtenir les performances par semestre
router.get('/performance/semester', AnswerSheetController.getSemesterPerformance);


// Définir la route pour l'upload et l'analyse des feuilles de réponses
router.post('/upload-answer-sheets', upload.array('files'), AnswerSheetController.uploadAndSaveAnswerSheets);

router.post('/save-edited-pdf', authMiddleware, upload.single('pdf'), AnswerSheetController.saveEditedPdf);


/**
 * @swagger
 * /answer-sheets:
 *   post:
 *     summary: Créer une nouvelle feuille de réponse
 *     description: Crée une nouvelle feuille de réponse pour un étudiant, un sujet, et un examen spécifiés.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AnswerSheet'
 *     responses:
 *       '201':
 *         description: Feuille de réponse créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AnswerSheet'
 *       '500':
 *         description: Erreur serveur
 */
router.post('/', AnswerSheetController.createAnswerSheet);

/**
 * @swagger
 * /answer-sheets/{id}:
 *   get:
 *     summary: Obtenir une feuille de réponse par ID
 *     description: Récupère une feuille de réponse spécifique par son identifiant.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Identifiant de la feuille de réponse
 *     responses:
 *       '200':
 *         description: Feuille de réponse trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AnswerSheet'
 *       '404':
 *         description: Feuille de réponse non trouvée
 *       '500':
 *         description: Erreur serveur
 */
router.get('/:id', AnswerSheetController.getAnswerSheetById);

/**
 * @swagger
 * /answer-sheets/{id}:
 *   put:
 *     summary: Mettre à jour une feuille de réponse par ID
 *     description: Met à jour une feuille de réponse existante par son identifiant.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Identifiant de la feuille de réponse
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AnswerSheet'
 *     responses:
 *       '200':
 *         description: Feuille de réponse mise à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AnswerSheet'
 *       '404':
 *         description: Feuille de réponse non trouvée
 *       '500':
 *         description: Erreur serveur
 */
router.put('/:id', AnswerSheetController.updateAnswerSheet);

/**
 * @swagger
 * /answer-sheets/student/{student_id}:
 *   get:
 *     summary: Obtenir les feuilles de réponses par étudiant
 *     description: Récupère toutes les feuilles de réponses pour un étudiant spécifique.
 *     parameters:
 *       - in: path
 *         name: student_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Identifiant de l'étudiant
 *     responses:
 *       '200':
 *         description: Feuilles de réponses trouvées
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AnswerSheet'
 *       '404':
 *         description: Aucune feuille de réponse trouvée pour cet étudiant
 *       '500':
 *         description: Erreur serveur
 */
router.get('/student/:student_id', AnswerSheetController.getAnswerSheetsByStudent);

/**
 * @swagger
 * /answer-sheets/exam/{exam_id}/subject/{subject_id}:
 *   get:
 *     summary: Obtenir les feuilles de réponses par examen et matière
 *     description: Récupère toutes les feuilles de réponses pour un examen et une matière spécifiques.
 *     parameters:
 *       - in: path
 *         name: exam_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Identifiant de l'examen
 *       - in: path
 *         name: subject_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Identifiant de la matière
 *     responses:
 *       '200':
 *         description: Feuilles de réponses trouvées
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AnswerSheet'
 *       '404':
 *         description: Aucune feuille de réponse trouvée pour cet examen et cette matière
 *       '500':
 *         description: Erreur serveur
 */
router.post('/exam/sheet-answer', AnswerSheetController.getAnswerSheetsByExam);

router.post('/exam/sheet-answer/correct', AnswerSheetController.correctAnswerSheet);

router.post('/corrigees', AnswerSheetController.getSheetsCorrige)



module.exports = router;
