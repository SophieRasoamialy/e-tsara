const express = require('express');
const router = express.Router();
const ModuleController = require('../controllers/ModuleController');

/**
 * @swagger
 * tags:
 *   name: Modules
 *   description: Gestion des modules
 */

/**
 * @swagger
 * /modules:
 *   post:
 *     summary: Créer un nouveau module
 *     tags: [Modules]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Module'
 *     responses:
 *       201:
 *         description: Module créé avec succès
 *       400:
 *         description: Erreur dans la requête
 */
router.post('/', ModuleController.createModule);

/**
 * @swagger
 * /modules:
 *   get:
 *     summary: Obtenir tous les modules
 *     tags: [Modules]
 *     responses:
 *       200:
 *         description: Liste des modules
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Module'
 */
router.get('/', ModuleController.getModules);

/**
 * @swagger
 * /modules/{id}:
 *   get:
 *     summary: Obtenir un module par ID
 *     tags: [Modules]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Identifiant du module
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Détails du module
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Module'
 *       404:
 *         description: Module non trouvé
 */
router.get('/:id', ModuleController.getModuleById);

/**
 * @swagger
 * /modules/{id}:
 *   put:
 *     summary: Mettre à jour un module par ID
 *     tags: [Modules]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Identifiant du module
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Module'
 *     responses:
 *       200:
 *         description: Module mis à jour avec succès
 *       400:
 *         description: Erreur dans la requête
 *       404:
 *         description: Module non trouvé
 */
router.put('/:id', ModuleController.updateModule);

/**
 * @swagger
 * /modules/{id}:
 *   delete:
 *     summary: Supprimer un module par ID
 *     tags: [Modules]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Identifiant du module
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Module supprimé avec succès
 *       404:
 *         description: Module non trouvé
 */
router.delete('/:id', ModuleController.deleteModule);

/**
 * @swagger
 * /modules/class/{class_id}:
 *   get:
 *     summary: Obtenir les modules par classe (niveau)
 *     tags: [Modules]
 *     parameters:
 *       - in: path
 *         name: class_id
 *         required: true
 *         description: Identifiant de la classe
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Liste des modules pour la classe spécifiée
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Module'
 *       404:
 *         description: Classe non trouvée
 */
router.get('/class/:class_id', ModuleController.getModulesByClass);

/**
 * @swagger
 * /modules/search/class/{class_id}:
 *   get:
 *     summary: Rechercher des modules par nom dans une classe (niveau) sélectionnée
 *     tags: [Modules]
 *     parameters:
 *       - in: path
 *         name: class_id
 *         required: true
 *         description: Identifiant de la classe
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: name
 *         description: Nom du module pour filtrer les résultats
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des modules filtrés
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Module'
 *       404:
 *         description: Classe non trouvée
 */
router.get('/search/class/:class_id', ModuleController.searchModulesByName);

module.exports = router;
