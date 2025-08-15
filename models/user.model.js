const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "Veuillez entrer votre prénom"],
      trim: true,
      minlength: [2, "Le prénom doit contenir au moins 2 caractères"],
    },
    lastName: {
      type: String,
      required: [true, "Veuillez entrer votre nom"],
      trim: true,
      minlength: [2, "Le nom doit contenir au moins 2 caractères"],
    },
    email: {
      type: String,
      required: [true, "Veuillez entrer un email"],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Veuillez entrer un email valide"],
    },
    password: {
      type: String,
      required: [true, "Veuillez entrer un mot de passe"],
      minlength: [6, "Le mot de passe doit contenir au moins 6 caractères"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);