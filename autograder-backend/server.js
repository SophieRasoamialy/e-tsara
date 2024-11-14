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
const questionRoutes = require('./routes/questionRoutes');
const activityRoutes = require('./routes/activityRoutes');

// Configuration de la clé secrète pour JWT 
const SECRET_KEY = process.env.SECRET_KEY;
console.log("SECRET_KEY:", process.env.SECRET_KEY);


const app = express();


app.use(session({
  secret: SECRET_KEY,             // Clé secrète pour signer le cookie
  resave: false,                  // Ne pas enregistrer la session si elle n'a pas été modifiée
  saveUninitialized: false,       // Ne pas créer de session jusqu'à ce qu'elle soit modifiée
  cookie: {
    secure: false,                 // Le cookie doit être envoyé uniquement sur HTTPS
    httpOnly: true,               // Le cookie n'est pas accessible par JavaScript côté client
    sameSite: 'Lax',              // L'option Lax est généralement plus sûre pour les cookies
    maxAge: 24 * 60 * 60 * 1000   // Durée de vie du cookie (ex. 24 heures)
  }
}));


// Configuration CORS
app.use(cors({
  origin: ['http://a4ae95b8507a24e5d8cc1e932598ea1a-1286203427.eu-west-3.elb.amazonaws.com ', 'http://localhost:3000'], 
  credentials: true, 
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.options('*', cors()); 


app.use(cookieParser());

app.use((req, res, next) => {
  next();
});

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
app.use('/api/questions', questionRoutes);
app.use('/api/activities', activityRoutes);

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
app.listen(PORT, '0.0.0.0',  () => {
  console.log(`Server running on port ${PORT}`);
});
