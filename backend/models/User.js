
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

userSchema.plugin(uniqueValidator); // model pour eviter que plusieurs utilisateurs s'inscrive avec le meme addresse email

module.exports = mongoose.model('User', userSchema);