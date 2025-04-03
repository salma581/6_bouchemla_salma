const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sanitize = require('mongo-sanitize');
const { validationResult } = require('express-validator');
require('dotenv').config();
const User = require('../models/User');

// Enregistrement de nouveaux utilisateurs
exports.signup = async (req, res, next) => {
  try {
    // Nettoyage des entrées
    const email = sanitize(req.body.email);
    const password = sanitize(req.body.password);

    // Validation des entrées
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    // Validation du mot de passe
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d|.*\W+).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error: 'Le mot de passe doit contenir :\n- 8 caractères minimum\n- 1 majuscule\n- 1 minuscule\n- 1 chiffre ou caractère spécial'
      });
    }

    // Hashage du mot de passe
    const hash = await bcrypt.hash(password, 10);
    const user = new User({
      email: email.toLowerCase(), // Normalisation de l'email
      password: hash
    });

    // Sauvegarde de l'utilisateur
    await user.save();
    res.status(201).json({ message: 'Utilisateur créé avec succès' });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la création du compte',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Connexion d'un utilisateur existant
exports.login = async (req, res, next) => {
  try {
    // Nettoyage des entrées
    const email = sanitize(req.body.email).toLowerCase();
    const password = sanitize(req.body.password);

    // Validation des champs
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    // Recherche de l'utilisateur
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Identifiants incorrects' }); // Message générique pour la sécurité
    }

    // Vérification du mot de passe
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }

    // Génération du token JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.SECRET_KEY,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      userId: user._id,
      token,
      message: 'Connexion réussie'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la connexion',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};