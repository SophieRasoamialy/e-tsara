const express = require('express');
const router = express.Router();
const ClassController = require('../controllers/NiveauController');

/**
 * @swagger
 * tags:
 *   name: Classes
 *   description: Gestion des classes
 */

/**
 * @swagger
 * /classes:
 *   post:
 *     summary: Créer une nouvelle classe
 *     tags: [Classes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Class'
 *     responses:
 *       201:
 *         description: Classe créée avec succès
 *       400:
 *         description: Erreur dans la requête
 */
router.post('/', ClassController.createClass);

/**
 * @swagger
 * /classes:
 *   get:
 *     summary: Obtenir toutes les classes
 *     tags: [Classes]
 *     responses:
 *       200:
 *         description: Liste des classes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Class'
 */
router.get('/', ClassController.getClasses);

/**
 * @swagger
 * /classes/{id}:
 *   get:
 *     summary: Obtenir une classe par ID
 *     tags: [Classes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Identifiant de la classe
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Détails de la classe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Class'
 *       404:
 *         description: Classe non trouvée
 */
router.get('/:id', ClassController.getClassById);

/**
 * @swagger
 * /classes/{id}:
 *   put:
 *     summary: Mettre à jour une classe par ID
 *     tags: [Classes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Identifiant de la classe
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Class'
 *     responses:
 *       200:
 *         description: Classe mise à jour avec succès
 *       400:
 *         description: Erreur dans la requête
 *       404:
 *         description: Classe non trouvée
 */
router.put('/:id', ClassController.updateClass);

/**
 * @swagger
 * /classes/{id}:
 *   delete:
 *     summary: Supprimer une classe par ID
 *     tags: [Classes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Identifiant de la classe
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Classe supprimée avec succès
 *       404:
 *         description: Classe non trouvée
 */
router.delete('/:id', ClassController.deleteClass);

/**
 * @swagger
 * /classes/search:
 *   get:
 *     summary: Rechercher des classes par nom
 *     tags: [Classes]
 *     parameters:
 *       - in: query
 *         name: name
 *         description: Nom de la classe pour filtrer les résultats
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des classes filtrées
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Class'
 */
router.get('/search/name', ClassController.searchClasses);

module.exports = router;
