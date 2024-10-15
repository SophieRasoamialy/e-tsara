const express = require('express');
const router = express.Router();
const SubjectController = require('../controllers/MatiereController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Subjects
 *   description: API pour gérer les matières.
 */

/**
 * @swagger
 * /subjects:
 *   post:
 *     summary: Créer un nouveau sujet
 *     tags: [Subjects]
 *     requestBody:
 *       description: Objet représentant le nouveau sujet
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Subject'
 *     responses:
 *       201:
 *         description: Sujet créé avec succès
 *       400:
 *         description: Erreur de validation des données
 */
router.post('/', SubjectController.createSubject);

/**
 * @swagger
 * /subjects:
 *   get:
 *     summary: Obtenir tous les sujets
 *     tags: [Subjects]
 *     responses:
 *       200:
 *         description: Liste des sujets
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Subject'
 */
router.get('/', SubjectController.getSubjects);

/**
 * @swagger
 * /subjects/me:
 *   get:
 *     summary: Obtenir les matières enseignées par l'enseignant authentifié
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des matières enseignées par l'enseignant authentifié
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Subject'
 *       401:
 *         description: Non autorisé ou token invalide
 *       404:
 *         description: Aucun sujet trouvé pour cet enseignant
 */

router.get('/me', authMiddleware, SubjectController.getSubjectsForAuthenticatedTeacher);


/**
 * @swagger
 * /subjects/{id}:
 *   get:
 *     summary: Obtenir un sujet par ID
 *     tags: [Subjects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Identifiant unique du sujet
 *     responses:
 *       200:
 *         description: Sujet trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Subject'
 *       404:
 *         description: Sujet non trouvé
 */


router.get('/:id', SubjectController.getSubjectById);

/**
 * @swagger
 * /subjects/{id}:
 *   put:
 *     summary: Mettre à jour un sujet par ID
 *     tags: [Subjects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Identifiant unique du sujet
 *     requestBody:
 *       description: Objet représentant les nouvelles données du sujet
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Subject'
 *     responses:
 *       200:
 *         description: Sujet mis à jour avec succès
 *       400:
 *         description: Erreur de validation des données
 *       404:
 *         description: Sujet non trouvé
 */
router.put('/:id', SubjectController.updateSubject);

/**
 * @swagger
 * /subjects/{id}:
 *   delete:
 *     summary: Supprimer un sujet par ID
 *     tags: [Subjects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Identifiant unique du sujet
 *     responses:
 *       200:
 *         description: Sujet supprimé avec succès
 *       404:
 *         description: Sujet non trouvé
 */
router.delete('/:id', SubjectController.deleteSubject);

/**
 * @swagger
 * /subjects/teacher/{teacher_id}:
 *   get:
 *     summary: Obtenir les sujets par enseignant
 *     tags: [Subjects]
 *     parameters:
 *       - in: path
 *         name: teacher_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Identifiant de l'enseignant
 *     responses:
 *       200:
 *         description: Liste des sujets pour l'enseignant
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Subject'
 *       404:
 *         description: Aucun sujet trouvé pour cet enseignant
 */
router.get('/teacher/:teacher_id', SubjectController.getSubjectsByTeacher);

/**
 * @swagger
 * /subjects/module/{module_id}:
 *   get:
 *     summary: Obtenir les sujets par module
 *     tags: [Subjects]
 *     parameters:
 *       - in: path
 *         name: module_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Identifiant du module
 *     responses:
 *       200:
 *         description: Liste des sujets pour le module
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Subject'
 *       404:
 *         description: Aucun sujet trouvé pour ce module
 */
router.get('/module/:module_id', SubjectController.getSubjectsByModule);

/**
 * @swagger
 * /subjects/search:
 *   get:
 *     summary: Rechercher des sujets par différents critères
 *     tags: [Subjects]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Nom du sujet pour filtrer les résultats
 *       - in: query
 *         name: teacher_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Identifiant de l'enseignant pour filtrer les résultats
 *       - in: query
 *         name: module_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Identifiant du module pour filtrer les résultats
 *     responses:
 *       200:
 *         description: Liste des sujets correspondant aux critères de recherche
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Subject'
 */
router.get('/search', SubjectController.searchSubjects);

module.exports = router;
