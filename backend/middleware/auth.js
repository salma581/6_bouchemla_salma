    
const jwt = require('jsonwebtoken');        // importation du paquet jwt

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]; // Recuperation du token (bearer token)
        const decodedToken = jwt.verify(token, process.env.SECRET_KEY);  // Vérification du token
        const userId = decodedToken.userId;
        if (req.body.userId && req.body.userId !== userId) { //Si ID  : correspondance avec le TOKEN
            throw 'User ID non valable';
        } else {
            next();
        }
    } catch {
    res.status(401).json({error :'Requête non authentifiée !'});
    }
};