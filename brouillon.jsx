import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./index.css";

const GameDetail = () => {
    const { id } = useParams(); // Extraction correcte du paramètre gameId
    const [game, setGame] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isCompleted, setIsCompleted] = useState(false);
    const [completionPercentage, setCompletionPercentage] = useState(0);
    const [level, setLevel] = useState("");

    useEffect(() => {
        console.log("ID récupéré:", id); // Pour déboguer

        fetch(`http://localhost:3000/api/games/multi/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`Erreur ${res.status}: Jeu non trouvé`);
                }
                return res.json();
            })
            .then((data) => {
                console.log("Données du jeu reçues:", data);
                setGame(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Erreur lors du chargement du jeu :", err);
                setError(err.message);
                setLoading(false);
            });
    }, [id]);

    // Gestion des changements
    const handleCompletionChange = (e) => {
        const checked = e.target.checked;
        setIsCompleted(checked);
        if (checked) {
            setCompletionPercentage(100);
        } else {
            setCompletionPercentage(0);
        }
    };

    const handlePercentageChange = (e) => {
        const value = parseInt(e.target.value) || 0;
        setCompletionPercentage(value);
        if (value === 100) {
            setIsCompleted(true);
        } else if (value === 0) {
            setIsCompleted(false);
        }
    };

    if (loading) return (
        <div className="loading-container">
            <div className="spinner"></div>
            <p>Chargement...</p>
        </div>
    );

    if (error) return (
        <div className="error-container">
            <p>Erreur: {error}</p>
        </div>
    );

    if (!game) return (
        <div className="warning-container">
            <p>Jeu non trouvé</p>
        </div>
    );

    return (
        <div className="game-detail">
            <h2 className="game-title">{game?.title}</h2>
            <div className="form-container">
                {game.isSinglePlayer && (
                    <div className="single-player-section">
                        <div className="checkbox-container">
                            <div className="custom-checkbox">
                                <input
                                    type="checkbox"
                                    id="completed"
                                    checked={isCompleted}
                                    onChange={handleCompletionChange}
                                    className="checkbox-input"
                                />
                                <label htmlFor="completed" className="checkbox-label">
                                    <div className={`checkbox-box ${isCompleted ? 'checked' : ''}`}>
                                        {isCompleted && (
                                            <svg className="checkmark" viewBox="0 0 24 24">
                                                <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        )}
                                    </div>
                                    <span className={`checkbox-text ${isCompleted ? 'completed-text' : ''}`}>
                                        Terminé ?
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div className={`percentage-container ${isCompleted || completionPercentage > 0 ? 'visible' : 'hidden'}`}>
                            <div className="percentage-content">
                                <label className="percentage-label">
                                    Pourcentage terminé : {completionPercentage}%
                                </label>
                                <div className="percentage-controls">
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={completionPercentage}
                                        onChange={handlePercentageChange}
                                        className="range-slider"
                                    />
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={completionPercentage}
                                        onChange={handlePercentageChange}
                                        className="number-input"
                                    />
                                    <span className="percentage-symbol">%</span>
                                </div>
                                <div className="progress-bar-container">
                                    <div
                                        className="progress-bar"
                                        style={{ width: `${completionPercentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {game.isMultiplayer && (
                    <div className="multiplayer-section">
                        <label className="level-label">Niveau :</label>
                        <input
                            type="text"
                            value={level}
                            onChange={(e) => setLevel(e.target.value)}
                            placeholder="Entrez votre niveau..."
                            className="level-input"
                        />
                    </div>
                )}

                <button className="save-button">
                    Enregistrer
                </button>
            </div>
        </div>
    );
};

export default GameDetail;