const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Veuillez entrer un email"],
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Veuillez entrer un email valide"],
    },
    password: {
      type: String,
      required: [true, "Veuillez entrer un mot de passe"],
      minlength: 6,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);