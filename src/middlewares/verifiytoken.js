import jwt from 'jsonwebtoken';

const verifyToken = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Token manquant" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const userId = decoded.id || decoded.userId;

        if (!userId) {
            return res.status(401).json({ message: "Token invalide : id utilisateur manquant" });
        }

        req.user = {
            id: userId,
            userId: userId
        };

        next();
    } catch (error) {
        console.error('Erreur verifyToken:', error.message);
        return res.status(401).json({ message: "Token invalide" });
    }
};

export default verifyToken;
