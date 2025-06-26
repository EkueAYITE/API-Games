
import Games from '../shema/Games.js';
import jwt from 'jsonwebtoken';
import mongoose from "mongoose";


export const getAllGames = async (req, res) => {
    try {
        const allGames = await Games.find();
        res.status(200).json(allGames);
    } catch (error) {
        console.error('Erreur lors de la récupération des jeux:', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }

};
export const SinglePlayerGames = async (req, res) => {

    try {
        const soloGames = await Games.find({ isSinglePlayer: true });
        res.status(200).json(soloGames);
    } catch (error) {
        console.error('Erreur lors de la récupération des jeux solo:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
}
export const MultiplayerGames = async (req, res) => {
    try {
        const multiGames = await Games.find({ isMultiplayer: true });
        res.status(200).json(multiGames);
    } catch (error) {
        console.error('Erreur lors de la récupération des jeux multijoueur:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
}
export const SingleGame = async (req, res) =>{
    try {
        const gameId = req.params.id;
        console.log("GameId reçu:", gameId); // Debug

        // Récupérer les informations du jeu
        const game = await Games.findById(gameId);

        if (!game) {
            return res.status(404).json({ message: "Jeu non trouvé" });
        }

        console.log("Jeu trouvé:", game.title); // Debug

        // Pour l'instant, on ignore le tracking et on retourne juste le jeu
        const response = {
            id: game.id,
            title: game.title,
            isSinglePlayer: game.isSinglePlayer,
            isMultiplayer: game.isMultiplayer,
            // Valeurs par défaut sans tracking pour l'instant
            hasPlayed: false,
            difficulty: null,
            gameProgress: null,
            gameLevel: 1,
            completionPercentage: 0
        };

        res.status(200).json(response);
    } catch (error) {
        console.error("Erreur complète:", error); // Debug détaillé
        res.status(500).json({
            message: "Erreur lors de la récupération du jeu",
            error: error.message
        });
    }
};
export const SingleGameUpdate = async (req, res) => {
    try {
        const gameId = req.params.id;
        const userId = req.user.id; // Depuis le token JWT
        const trackingData = req.body;

        // Vérifier que le jeu existe
        const game = await Game.findById(gameId);
        if (!game) {
            return res.status(404).json({ message: "Jeu non trouvé" });
        }

        // Mettre à jour ou créer le suivi
        const tracking = await Tracking.findOneAndUpdate(
            { gameId: gameId, userId: userId },
            {
                ...trackingData,
                updatedAt: new Date()
            },
            {
                new: true,
                upsert: true // Crée si n'existe pas
            }
        );

        res.status(200).json({
            message: "Suivi mis à jour avec succès",
            data: tracking
        });
    } catch (error) {
        res.status(500).json({
            message: "Erreur lors de la mise à jour du suivi",
            error: error.message
        });
    }
};
