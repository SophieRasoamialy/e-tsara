require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const specs = require('./swagger');
const userRoutes = require('./routes/userRoutes');
const niveauRoutes = require('./routes/niveauRoutes');
const etudiantRoutes = require('./routes/etudiantRoutes');
const moduleRoutes = require('./routes/moduleRoutes');
const matiereRoutes = require('./routes/matiereRoutes');
const examRoutes = require('./routes/examRoutes');
const answerQuestionRoutes = require('./routes/answerQuestionRoutes');
const answerSheetRoutes = require('./routes/answerSheetRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Configuration de la clé secrète pour JWT 
const SECRET_KEY = process.env.SECRET_KEY;
console.log("SECRET_KEY:", process.env.SECRET_KEY);

const app = express();


app.use(session({
  secret: SECRET_KEY,             // Clé secrète pour signer le cookie
  resave: false,                  // Ne pas enregistrer la session si elle n'a pas été modifiée
  saveUninitialized: false,       // Ne pas créer de session jusqu'à ce qu'elle soit modifiée
  cookie: {
    secure: true,                 // Le cookie doit être envoyé uniquement sur HTTPS
    httpOnly: true,               // Le cookie n'est pas accessible par JavaScript côté client
    sameSite: 'Lax',              // L'option Lax est généralement plus sûre pour les cookies
    maxAge: 24 * 60 * 60 * 1000   // Durée de vie du cookie (ex. 24 heures)
  }
}));


// Configuration CORS
app.use(cors({
  origin: ['http://a1d317365a59b4872ba940da6988fbd2-1517766377.us-east-1.elb.amazonaws.com', 'http://localhost:3000'], 
  credentials: true, 
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.options('*', cors()); // Préparer le backend à répondre aux requêtes CORS OPTIONS


app.use(cookieParser());
console.log("mongo uri", process.env.MONGO_URI)
// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

// Middleware pour parsing JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Utilisation des routes utilisateur
app.get('/api', (req, res) => {
  res.json({ message: 'API is running' });
});

app.use('/api/users', userRoutes);
app.use('/api/classes', niveauRoutes);
app.use('/api/etudiants', etudiantRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/matieres', matiereRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/reponses', answerQuestionRoutes);
app.use('/api/feuilles-reponses', answerSheetRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/cook', (req, res) => {
  console.log('Cookies:', req.cookies);
});


// Route pour Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Middleware pour gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ msg: 'Une erreur est survenue' });
});

// Démarrer le serveur
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
