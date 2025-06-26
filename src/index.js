import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import verifyToken from "./middlewares/verifiytoken.js";
import fs from 'fs';
import mongoose from 'mongoose';
import {getAllUsers, login, logout, register} from "./controllers/auth.js";
import dotenv from 'dotenv';
import jwt from "jsonwebtoken";
import User from "./shema/user.js";
import {
    getUserTrackedGames,
    MultiplayerGames,
    SingleGame,
    SingleGameUpdate,
    SinglePlayerGames,
} from "./controllers/games.js";

dotenv.config();

// Connexion à la base de données MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/GameHub_db')
    .then(() => console.log("✅ Connecté à MongoDB"))
    .catch(err => console.error("❌ Erreur de connexion MongoDB:", err));



// Configuration des chemins
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Création de l'application Express
const app = express();
const PORT = 3000;


// Middleware pour parser le JSON
app.use(express.json());
// Configuration de CO RS pour permettre l'accès
app.use(cors({ origin : 'http://localhost:5173',
    methods : ['GET','POST','PUT','DELETE'],
    credentials: true}))



app.use((req, res, next) => {
    console.log(`⚡ Requête: ${req.method} ${req.originalUrl}`);
    next();
});

app.get('/test-status', (req, res) => {
    res.json({ message: 'Serveur fonctionnel' });
});

// Servir les fichiers statiques depuis le dossier assets
app.use('/assets', express.static(join(__dirname, 'assets')));


// Vos routes et middlewares ici
// Chargement des données des jeux (assurez-vous que le chemin est correct)
const gamesDataPath = join(__dirname, 'data', 'games.json');
let games = [];

try {
    const gamesData = fs.readFileSync(gamesDataPath, 'utf8');
    games = JSON.parse(gamesData);
} catch (error) {
    console.error('Erreur lors du chargement des jeux:', error);
}

// Routes API

//Route pour s'inscrire
app.post('/api/register', register);

// Route pour obtenir tous les utilisateurs
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find({}, '-password'); // Exclure le mot de passe des résultats
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({message: "Erreur lors de la récupération des utilisateurs", error: error.message});
    }
});
// Route pour se connecter
app.post('/api/login', login);

// Route pour vérifier l'état de la connexion
app.get('/api/db-status', (req, res) => {
    const statut = mongoose.connection.readyState;
    const etats = ['Déconnecté', 'Connecté', 'Connexion en cours', 'Déconnexion en cours'];

    res.json({
        connect: statut === 1,
        statut: etats[statut],
        message: statut === 1 ? "Base de données connectée" : "Base de données non connectée"
    });
});
// Route pour obtenir tous les jeux
app.get('/api/games', (req, res) => {
    res.json(games);
});

// Route pour les jeux solo
app.get('/api/games/singleplayer',SinglePlayerGames) ;

// Route pour les jeux multijoueur
app.get('/api/games/multiplayer',MultiplayerGames);


// Route pour rechercher des jeux par titre
app.get('/api/games/search/:query', (req, res) => {
    const query = req.params.query.toLowerCase();
    const filteredGames = games.filter(game =>
        game.title.toLowerCase().includes(query)
    );
    res.json(filteredGames);
});

// Route pour obtenir un jeu par ID et remplir les données
app.get('/api/games/player/:id', verifyToken,SingleGame);

//Route pour mettre à jour un jeu par ID
app.put('/api/games/update/:id',verifyToken ,SingleGameUpdate);

// Route pour obtenir les jeux suivis par un utilisateur
app.get('/api/games/tracking', verifyToken, getUserTrackedGames);

// Route de base pour vérifier que le serveur fonctionne
app.get('/', (req, res) => {
    res.json({ message: 'Bienvenue sur l\'API GameHub!' });
});

// Route pour la déconnexion
app.get('/api/logout', (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(400).json({ message: "Aucun token fourni" });
        }
        // 3. Option 2: Si vous utilisez des cookies pour stocker le token
        res.clearCookie('jwt');
        console.log("Déconnexion réussie, token supprimé");
        res.status(200).json({ message: "Déconnexion réussie" });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la déconnexion", error: error.message });
    }
});

console.log("Je suis AVANT le listen");
app.listen(PORT, () => {
    console.log(`Le Serveur est démarré sur http://localhost:3000 normalement`);
});




