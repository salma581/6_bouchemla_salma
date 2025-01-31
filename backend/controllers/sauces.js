
const Sauces = require('../models/Sauce');
const fs = require('fs');

// Recuperation de toutes les sauces depuis la base de donne
exports.getAllSauces = (req, res, next) => {
  Sauces.find()
    .then(
      (Sauces) => { res.status(200).json(Sauces) })
    .catch(error => res.status(400).json({ error }));
}

// Recuperation d'une sauce depuis la base de donne
exports.getOneSauces = (req, res, next) => {
  Sauces.findOne({ _id: req.params.id })
    .then((Sauces) => { res.status(200).json(Sauces); })
    .catch((error) => { res.status(404).json({ error: error }); });
};

// Création d'une nouvelle sauce
exports.createSauce = (req, res, next) => {
  const sauce = req.body.sauce
  const saucesObject = JSON.parse(sauce);

  const sauces = new Sauces({
    ...saucesObject,
    likes: 0,
    dislikes: 0,
 
    // generer l'URL de l'image
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });
  sauces.save()
 
    .then(() => res.status(201).json({ message: 'Nouvelle sauce créer!' }))
    .catch(error => res.status(400).json({ error }));

};

// modification d'une sauce existante
exports.modifySauce = (req, res, next) => {
  const sauceModified = req.file ? // Verification du dossier exitant  
    {
      ...JSON.parse(req.body.sauce),// Récuperation de la chaine de caracter pour la transformer en objet JS
      // Modification de l'URL de l'image
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  if (req.file) {
    Sauces.findOne({ _id: req.params.id })
      .then(sauce => { const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, (error) => {
          if (error) {
            console.log(error);
          }
        })
      })
      .catch(error => res.status(500).json({ error }))
  }
  //Update de la sauce : Replacement du 1er argument pour le second 
  Sauces.updateOne({ _id: req.params.id }, { ...sauceModified, _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Sauce modifiée !' }))
    .catch(error => res.status(400).json({ error }));
};

// effacer une sauce
exports.deleteSauce = (req, res, next) => {
  Sauces.findOne({ _id: req.params.id }) // Recherche l'ID de la sauce
    .then(sauce => {
      // Recuperation du nom du fichier 
      const filename = sauce.imageUrl.split('/images/')[1];
      // unlink : Effacement du fichier
      fs.unlink(`images/${filename}`, () => {
        // Suppression de l'objet de la base de donné
        Sauces.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Sauce supprimée !' }))
          .catch(error => res.status(400).json({ error }));
      })
    })
    .catch(error => res.status(400).json({ error }));
};

// envoyer like ou dislike
exports.likeSauces = (req, res, next) => {
  if (req.body.like === 1) { // si l'utilisateur aime la sauce
    Sauces.updateOne({ _id: req.params.id }, { $inc: { likes: req.body.like++ }, $push: { usersLiked: req.body.userId } }) // on ajoute 1 like et on le push l'array usersLiked
      .then(() => res.status(200).json({ message: 'Like ajouté pour cette sauce !' }))
      .catch(error => res.status(400).json({ error }))
  } else if (req.body.like === -1) {
    Sauces.updateOne({ _id: req.params.id }, { $inc: { dislikes: (req.body.like++) * -1 }, $push: { usersDisliked: req.body.userId } })// on ajoute 1 dislike et on le push l'array usersDisliked
      .then(() => res.status(200).json({ message: 'Dislike ajouté pour cette sauce !' }))
      .catch(error => res.status(400).json({ error }))
  } else {
    Sauces.findOne({ _id: req.params.id })
      .then(sauce => {
        if (sauce.usersLiked.includes(req.body.userId)) {
          Sauces.updateOne({ _id: req.params.id }, { $pull: { usersLiked: req.body.userId }, $inc: { likes: -1 } })
            .then(() => res.status(200).json({ message: 'Your Like has been removed for that sauce !' }))
            .catch(error => res.status(400).json({ error }))
        } else if (sauce.usersDisliked.includes(req.body.userId)) {
          Sauces.updateOne({ _id: req.params.id }, { $pull: { usersDisliked: req.body.userId }, $inc: { dislikes: -1 } })
            .then(() => res.status(200).json({ message: 'Your Dislike has been removed for that sauce !' }))
            .catch(error => res.status(400).json({ error }))
        }
      })
      .catch(error => res.status(400).json({ error }))
  }
}