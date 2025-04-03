const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sanitize = require('mongo-sanitize')
const { validationResult } = require('express-validator');
require('dotenv').config()
const User = require('../models/User');

// Enregistrement de nouveaux utilisateurs
exports.signup = (req, res, next) => {
  let email = sanitize(req.body.email);
  let password = sanitize(req.body.password);
  try {
    let regex = /(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/.test(password);
    if (regex) {
      bcrypt.hash(password, 10)
        .then(hash => {
          const user = new User({
            email: email,
            password: hash
          });
          user.save()
            .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
            .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(503).json({ error }));
    } else {
      throw error = new Error('le mot de passe doit contenir au moins 8 caractère , une minuscule ,une majuscule et un chifre ou un caractère spécial');
    }

  } catch (error) {
    res.status(400).json({ error })
  }

};
// pour connecter un utilisateur deja existant
exports.login = (req, res, next) => {
  let email = sanitize(req.body.email);
  let password = sanitize(req.body.password);

  // Vérification des champs
  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }

  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        return res.status(401).json({ error: 'Utilisateur(rice) non trouvé(e)' });
      }
      bcrypt.compare(password, user.password)
        .then(valid => {
          if (!valid) {
            return res.status(401).json({ error: 'Mot de passe incorrect' });
          }
          res.status(200).json({
            userId: user._id,
            token: jwt.sign(
              { userId: user._id },
              `${process.env.SECRET_KEY}`,
              { expiresIn: '24h' }
            )
          });
        })
        .catch(error => res.status(500).json({ error: error.message }));
    })
    .catch(error => res.status(500).json({ error: error.message }));
};

