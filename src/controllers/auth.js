import User from "../shema/user.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {comparePassword} from "../utils/passwords.js";



const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const register = async (req, res) => {
    try {
        const userBody = req.body;
        console.log(userBody);

        const username = userBody.username;
        const password = userBody.password;

        // Validation du mot de passe avant hash
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message:
                    "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial",
            });
        }

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({username});
        if (existingUser) {
            return res.status(400).json({ message: "Cet utilisateur existe déjà" });
        }

        // Hacher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Créer un nouvel utilisateur
        const user = new User({
            username,
            password: hashedPassword
        });

        await user.save();

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET non défini dans .env");
        }
        // Générer un token JWT
        console.log(process.env.JWT_SECRET)
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Répondre avec message et token
        res.status(201).json({ message: "Utilisateur créé avec succès", token });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de l'inscription", error: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const userBody = req.body;
        console.log(userBody);

        const username = userBody.username;
        const password = userBody.password;

        // Trouver l'utilisateur
        const userLogin = await User.findOne({ username });
        console.log(userLogin);
        if (!userLogin) {
            return res.status(401).json({ message: "Identifiants invalides" });
        }

        // Vérifier le mot de passe
        const isMatch = await comparePassword(password, userLogin.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Identifiants invalides" });
        }

        // Générer un token JWT
        const token = jwt.sign(
            { userId: userLogin._id, username: userLogin.username },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );
        console.log(token);

        res.status(200).json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la connexion", error: error.message });
    }

};

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, '-password'); // Exclure le mot de passe des résultats
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des utilisateurs", error: error.message });
    }
}
export const logout = (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(400).json({ message: "Aucun token fourni" });
        }
        // 3. Option 2: Si vous utilisez des cookies pour stocker le token
        res.clearCookie('jwt');

        res.status(200).json({ message: "Déconnexion réussie" });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la déconnexion", error: error.message });
    }
}