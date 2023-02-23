// Modification de l'extension des fichiers
const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
  };
  
  const storage = multer.diskStorage({
    destination: (req, file, callback) => { //destination de la sauvegarde des fichiers
      callback(null, 'images'); // Si nul ( pas d'erreur) images envoyer dans le dossier de destination 
    },
    // generation du nom du fichier uploadé
    filename: (req, file, callback) => {
      const name = file.originalname.split(' ').join('_');
      const extension = MIME_TYPES[file.mimetype]; // Extension a ajouter au nom
      callback(null, name + Date.now() + '.' + extension);// Format: nom d'origine + date + . + extension
    }
  });
  
  module.exports = multer({storage: storage}).single('image');