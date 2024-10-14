const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gestion des utilisateurs
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Obtenir tous les utilisateurs
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get('/', UserController.getAllUsers);

/**
 * @swagger
 * /search:
 *   get:
 *     summary: Rechercher des utilisateurs par nom ou nom d'utilisateur
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: username
 *         schema:
 *           type: string
 *         description: Nom d'utilisateur à rechercher
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Nom complet à rechercher
 *     responses:
 *       200:
 *         description: Liste des utilisateurs correspondant aux critères
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get('/search', UserController.searchUsers);


/**
 * @swagger
 * /register:
 *   post:
 *     summary: Créer un nouvel utilisateur
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *       400:
 *         description: Erreur dans la requête
 */
router.post('/register', UserController.register);

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Connexion d'un utilisateur
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Nom d'utilisateur
 *               password:
 *                 type: string
 *                 description: Mot de passe
 *             required:
 *               - username
 *               - password
 *     responses:
 *       200:
 *         description: Connexion réussie
 *       400:
 *         description: Erreur dans la connexion
 */
router.post('/login', UserController.login);

/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: Gestion des rôles dans l'application
 */

/**
 * @swagger
 * /roles:
 *   get:
 *     summary: Récupérer tous les rôles
 *     tags: [Roles]
 *     responses:
 *       200:
 *         description: Liste des rôles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *       500:
 *         description: Erreur serveur
 */
router.get('/roles', UserController.getRoles);

/**
 * @swagger
 * /user/{id}:
 *   put:
 *     summary: Mettre à jour un utilisateur par ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Identifiant de l'utilisateur
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Utilisateur mis à jour avec succès
 *       400:
 *         description: Erreur dans la requête
 *       404:
 *         description: Utilisateur non trouvé
 */
router.put('/user/:id', UserController.updateUser);

/**
 * @swagger
 * /user/{id}:
 *   delete:
 *     summary: Supprimer un utilisateur par ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Identifiant de l'utilisateur
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Utilisateur supprimé avec succès
 *       404:
 *         description: Utilisateur non trouvé
 */
router.delete('/user/:id', UserController.deleteUser);


/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gestion des utilisateurs dans l'application
 */

/**
 * @swagger
 * /users/role/{role}:
 *   get:
 *     summary: Récupérer les utilisateurs par rôle
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: role
 *         required: true
 *         schema:
 *           type: string
 *         description: Rôle des utilisateurs à filtrer
 *     responses:
 *       200:
 *         description: Liste des utilisateurs avec le rôle spécifié
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: ID de l'utilisateur
 *                   name:
 *                     type: string
 *                     description: Nom de l'utilisateur
 *                   email:
 *                     type: string
 *                     description: Adresse email de l'utilisateur
 *                   role:
 *                     type: string
 *                     description: Rôle de l'utilisateur
 *       500:
 *         description: Erreur serveur
 */
router.get('/role/:role', UserController.getUsersByRole);

/**
 * @swagger
 * /{id}:
 *   get:
 *     summary: Obtenir un utilisateur par ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Identifiant de l'utilisateur
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Détails de l'utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Utilisateur non trouvé
 */
router.get('/:id', UserController.getUserById);



module.exports = router;
