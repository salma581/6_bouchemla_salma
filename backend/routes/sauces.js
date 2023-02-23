// routes/sauces.js


// On déclare notre framework Express
const express = require('express');
const router = express.Router();
const multer = require('../middleware/multer-config');
const auth = require('../middleware/auth');

const sauceCtrl = require('../controllers/sauces');



// La logique routes
router.post('/', auth, multer, sauceCtrl.createSauce);// Envoi des données
router.put('/:id', auth, multer, sauceCtrl.modifySauce);// Modification de l'id
router.delete('/:id', auth, sauceCtrl.deleteSauce);// Suppression de l'id
router.get('/', auth, sauceCtrl.getAllSauces);// Récupère tout les objets
router.get('/:id', auth, sauceCtrl.getOneSauces);// Envoi de l'identifiant
router.post('/:id/like', auth, sauceCtrl.likeSauces); // like / dislike les sauces

module.exports = router;