    
const jwt = require('jsonwebtoken'); // Importation du paquet JWT

module.exports = (req, res, next) => {
    try {
        // Vérification de la présence du header Authorization
        if (!req.headers.authorization) {
            throw new Error('Authorization header missing');
        }

        // Récupération et vérification du token
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
        const userId = decodedToken.userId;

        // Vérification de la correspondance de l'ID utilisateur
        if (req.body.userId && req.body.userId !== userId) {
            throw new Error('User ID non valable');
        }

        // Ajout de l'userId à la requête pour les middlewares suivants
        req.auth = { userId };
        next();

    } catch (error) {
        // Gestion plus précise des erreurs
        console.error('Authentication error:', error.message);
        res.status(401).json({
            error: 'Requête non authentifiée !',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};