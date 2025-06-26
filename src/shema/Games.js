import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema({
    internalName: String,
    title: String,
    steamAppID: String,
    isSinglePlayer: Boolean,
    isMultiplayer: Boolean,
    thumb: String,
    gameID: String,
    metacriticScore: String,
    steamRatingText: String,
    steamRatingPercent: String,
    normalPrice: String,
    salePrice: String,
    dealRating: String,
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: null },
    gameProgress: { type: String, enum: ['in-progress', 'completed'], default: null },
    gameLevel: { type: Number, min: 1, max: 10, default: 1 },
    completionPercentage: { type: Number, min: 0, max: 10, default: 0 }
});

const trackingSchema = new mongoose.Schema({
    gameId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Games' },
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    hasPlayed: { type: Boolean, default: false },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
    gameProgress: { type: String, enum: ['in-progress', 'completed'] },
    gameLevel: { type: Number, min: 1, max: 10 },
    completionPercentage: { type: Number, min: 0, max: 100 },
    updatedAt: { type: Date }
}, { timestamps: true });

const Games = mongoose.model('Games', gameSchema);
const Tracking = mongoose.model('Tracking', trackingSchema);

export default Games;
export { Tracking };
