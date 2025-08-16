// models/transaction.model.js
const mongoose = require("mongoose");

const TYPES = ["entree", "sortie"];
const CATEGORIES = [
  "salaire",
  "freelance",
  "nourriture",
  "entrainement",
  "education",
  "medical",
  "taxe",
];

const transactionSchema = new mongoose.Schema(
  {
    // ⬇️ propriete pour lier à l'utilisateur (optionnel mais recommandé)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // passe à false si tu ne veux pas lier aux users
      index: true,
    },

    // Montant (ton formulaire est en input texte, mais on stocke en Number)
    // Si tu veux une précision financière parfaite, voir commentaire Decimal128 plus bas.
    montant: {
      type: Number,
      required: true,
      min: 0,
    },

    // "entree" | "sortie"
    type: {
      type: String,
      enum: TYPES,
      required: true,
      lowercase: true,
      trim: true,
    },

    // Catégorie
    category: {
      type: String,
      enum: CATEGORIES,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    // Date de la transaction
    date: {
      type: Date,
      required: true,
    },

    // Référence (obligatoire). Unique par utilisateur pour éviter les doublons “ref”.
    reference: {
      type: String,
      required: true,
      trim: true,
    },

    // Description (optionnelle)
    description: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_, ret) => {
        ret.id = ret._id;
        delete ret._id;
      },
    },
    toObject: { virtuals: true },
  }
);

// Unicité de la reference par utilisateur (évite les doublons de ref)
transactionSchema.index({ user: 1, reference: 1 }, { unique: true });

module.exports = mongoose.model("Transaction", transactionSchema);

/*
💡 Remarques:

1) Montant & précision:
   - Ici "montant" est un Number. Pour éviter les erreurs de flottants,
     tu peux stocker les montants en centimes (integer) OU utiliser Decimal128:
       montant: { type: mongoose.Schema.Types.Decimal128, required: true }
     et convertir en string/number côté API lors de la sérialisation.

2) Date "DD-MM-YYYY":
   - Le modèle attend un Date JavaScript.
     Dans ton contrôleur, convertis la chaîne "JJ-MM-AAAA" vers un Date:
       // avec dayjs
       const dayjs = require("dayjs");
       const customParseFormat = require("dayjs/plugin/customParseFormat");
       dayjs.extend(customParseFormat);
       const d = dayjs(req.body.date, "DD-MM-YYYY").toDate();

     Ou sans lib:
       const [dd, mm, yyyy] = req.body.date.split("-");
       const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));

3) Si tu ne gères pas de user:
   - Enlève le champ "user" et supprime l’index unique composé:
       // remove:
       user: {...}
       transactionSchema.index({ user: 1, reference: 1 }, { unique: true });
     Et, si besoin, mets "unique: true" directement sur "reference".
*/
