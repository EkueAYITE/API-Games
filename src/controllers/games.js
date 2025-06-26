import jwt from 'jsonwebtoken';
import mongoose from "mongoose";
import Games, { Tracking } from '../shema/Games.js';

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
export const SingleGame = async (req, res) => {
    try {
        const gameId = req.params.id;
        const userId = req.user?.id; // Nécessite que verifyToken soit utilisé en middleware

        if (!mongoose.Types.ObjectId.isValid(gameId)) {
            return res.status(400).json({ error: "ID invalide" });
        }

        const game = await Games.findById(gameId);

        if (!game) {
            return res.status(404).json({ error: "Jeu non trouvé" });
        }

        // Par défaut, on renvoie juste le jeu
        let response = { game };

        // Si l'utilisateur est connecté, on vérifie s'il a un tracking pour ce jeu
        if (userId) {
            const tracking = await Tracking.findOne({ gameId, userId });

            if (tracking) {
                response = {
                    game,
                    tracking
                };
            }
        }

        res.status(200).json(response);
    } catch (error) {
        console.error("Erreur:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

export const SingleGameUpdate = async (req, res) => {
    try {
        console.log('Headers:', req.headers);
        console.log('Body:', req.body);
        console.log('Params:', req.params);
        console.log('User:', req.user);

        const gameId = req.params.id;
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: "Utilisateur non authentifié" });
        }

        if (!mongoose.Types.ObjectId.isValid(gameId)) {
            return res.status(400).json({ message: "ID de jeu invalide" });
        }

        const gameExists = await Games.exists({ _id: gameId });
        if (!gameExists) {
            return res.status(404).json({ message: "Jeu non trouvé" });
        }

        const updateData = {
            ...req.body,
            updatedAt: new Date()
        };

        const tracking = await Tracking.findOneAndUpdate(
            { gameId, userId },
            updateData,
            {
                new: true,
                upsert: true,
                runValidators: true
            }
        ).catch(err => {
            console.error('Erreur Mongoose:', err.message, err);
            throw err;
        });

        return res.status(200).json({
            success: true,
            data: tracking
        });

    } catch (error) {
        console.error('Erreur complète:', error);
        return res.status(500).json({
            success: false,
            message: error.message || "Erreur serveur",
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// controllers/trackingController.js
export const getUserTrackedGames = async (req, res) => {
    try {
        console.log('User ID from token:', req.user.id); // Debug
        console.log('User ID from token (alternative):', req.user.userId); // Debug
        
        // Utilisez soit req.user.id soit req.user.userId selon ce que vous stockez dans le token
        const userId = req.user.id || req.user.userId;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "ID utilisateur invalide" });
        }

        const trackedGames = await Tracking.find({ userId })
            .populate('gameId')
            .lean();

        res.status(200).json(trackedGames || []);
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({
            message: 'Erreur serveur',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};