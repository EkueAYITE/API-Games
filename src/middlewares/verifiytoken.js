import jwt from 'jsonwebtoken';

const verifyToken = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Token manquant" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Structurez req.user comme attendu par vos contrôleurs
        req.user = {
            id: decoded.id,  // Assurez-vous que le token contient bien un champ 'id'
            userId: decoded.id // Double accès pour compatibilité
        };

        next();
    } catch (error) {
        console.error('Erreur verifyToken:', error.message);
        return res.status(401).json({ message: "Token invalide" });
    }
};

export default verifyToken;
