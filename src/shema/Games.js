import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema({
    title: { type: String, required: true },
    isSinglePlayer: { type: Boolean, default: false },
    isMultiplayer: { type: Boolean, default: false },
    // autres champs...
});

// Modèle Tracking
const trackingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    gameId: { type: mongoose.Schema.Types.ObjectId, ref: 'Game', required: true },
    hasPlayed: { type: Boolean, default: false },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: null },
    gameProgress: { type: String, enum: ['in-progress', 'completed'], default: null },
    gameLevel: { type: Number, min: 1, max: 10, default: 1 },
    completionPercentage: { type: Number, min: 0, max: 10, default: 0 },
    updatedAt: { type: Date, default: Date.now }
});

// Index unique pour éviter les doublons
trackingSchema.index({ userId: 1, gameId: 1 }, { unique: true });