const express = require('express');
const router = express.Router();
const EtudiantController = require('../controllers/EtudiantController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Etudiant:
 *       type: object
 *       required:
 *         - matricule
 *         - name
 *         - class_id
 *       properties:
 *         matricule:
 *           type: string
 *           description: Identifiant unique de l'étudiant
 *         name:
 *           type: string
 *           description: Nom complet de l'étudiant
 *         class_id:
 *           type: string
 *           description: ID de la classe à laquelle l'étudiant appartient
 *       example:
 *         matricule: "123456"
 *         name: "Jean Dupont"
 *         class_id: "60b8d295f1b2c2b1d1f1e8d6"
 */

/**
 * @swagger
 * /students:
 *   post:
 *     summary: Créer un nouvel étudiant
 *     tags: [Étudiants]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Etudiant'
 *     responses:
 *       201:
 *         description: Étudiant créé avec succès
 *       400:
 *         description: Erreur de validation des données
 *       500:
 *         description: Erreur du serveur
 */
router.post('/', EtudiantController.createStudent);

/**
 * @swagger
 * /students:
 *   get:
 *     summary: Obtenir tous les étudiants
 *     tags: [Étudiants]
 *     responses:
 *       200:
 *         description: Liste de tous les étudiants
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Etudiant'
 *       500:
 *         description: Erreur du serveur
 */
router.get('/', EtudiantController.getStudents);

/**
 * @swagger
 * /students/{id}:
 *   get:
 *     summary: Obtenir un étudiant par ID
 *     tags: [Étudiants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'étudiant
 *     responses:
 *       200:
 *         description: Détails de l'étudiant
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Etudiant'
 *       404:
 *         description: Étudiant non trouvé
 *       500:
 *         description: Erreur du serveur
 */
router.get('/:id', EtudiantController.getStudentById);

/**
 * @swagger
 * /students/{id}:
 *   put:
 *     summary: Mettre à jour un étudiant par ID
 *     tags: [Étudiants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'étudiant
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Etudiant'
 *     responses:
 *       200:
 *         description: Étudiant mis à jour avec succès
 *       400:
 *         description: Erreur de validation des données
 *       404:
 *         description: Étudiant non trouvé
 *       500:
 *         description: Erreur du serveur
 */
router.put('/:id', EtudiantController.updateStudent);

/**
 * @swagger
 * /students/{id}:
 *   delete:
 *     summary: Supprimer un étudiant par ID
 *     tags: [Étudiants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'étudiant
 *     responses:
 *       200:
 *         description: Étudiant supprimé avec succès
 *       404:
 *         description: Étudiant non trouvé
 *       500:
 *         description: Erreur du serveur
 */
router.delete('/:id', EtudiantController.deleteStudent);

/**
 * @swagger
 * /students/class/{class_id}:
 *   get:
 *     summary: Obtenir les étudiants par classe (niveau)
 *     tags: [Étudiants]
 *     parameters:
 *       - in: path
 *         name: class_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la classe
 *     responses:
 *       200:
 *         description: Liste des étudiants dans la classe spécifiée
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Etudiant'
 *       404:
 *         description: Classe non trouvée
 *       500:
 *         description: Erreur du serveur
 */
router.get('/class/:class_id', EtudiantController.getStudentsByClass);

/**
 * @swagger
 * /students/search/class/{class_id}:
 *   get:
 *     summary: Rechercher des étudiants par nom ou matricule dans une classe (niveau) sélectionnée
 *     tags: [Étudiants]
 *     parameters:
 *       - in: path
 *         name: class_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la classe
 *       - in: query
 *         name: search
 *         required: true
 *         schema:
 *           type: string
 *         description: Nom ou matricule de l'étudiant
 *     responses:
 *       200:
 *         description: Liste des étudiants correspondant à la recherche
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Etudiant'
 *       404:
 *         description: Aucun étudiant trouvé
 *       500:
 *         description: Erreur du serveur
 */
router.get('/search/class/:class_id', EtudiantController.searchStudents);

router.post('/import', EtudiantController.importStudentsFromJson);

module.exports = router;
