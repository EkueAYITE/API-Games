//middlewares.verifyToken.js
import jwt from 'jsonwebtoken';

const verifyToken = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        console.log(token);
        if (!token) {
            return res.status(401).send({ message: "Unauthorized" });
        }
        jwt.verify(token, process.env.JWT_SECRET)
        next();
    } catch (error) {
        return res.status(401).send({ message: "Unauthorized" });
    }
}

export default verifyToken;