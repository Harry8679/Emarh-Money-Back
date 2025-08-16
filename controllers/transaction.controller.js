// controllers/transaction.controller.js
const Transaction = require("../models/transaction.model");

/** Parse "DD-MM-YYYY" -> Date, ou tente un Date standard */
function parseDate(input) {
  if (!input) return null;
  if (typeof input === "string") {
    if (/^\d{2}-\d{2}-\d{4}$/.test(input)) {
      const [dd, mm, yyyy] = input.split("-").map(Number);
      return new Date(yyyy, mm - 1, dd);
    }
    const d = new Date(input);
    return isNaN(d) ? null : d;
  }
  if (input instanceof Date) return input;
  return null;
}

/** Créer une transaction */
exports.createTransaction = async (req, res) => {
  try {
    const { montant, type, category, date, reference, description } = req.body;

    // coercions / validations minimales
    const parsedDate = parseDate(date);
    if (!parsedDate) {
      return res.status(400).json({ message: "Date invalide. Format attendu: DD-MM-YYYY" });
    }

    const amount = typeof montant === "string" ? parseFloat(montant.replace(",", ".")) : Number(montant);
    if (isNaN(amount)) {
      return res.status(400).json({ message: "Montant invalide" });
    }

    const transaction = await Transaction.create({
      user: req.user.id,
      montant: amount,
      type,
      category,
      date: parsedDate,
      reference,
      description: description || "",
    });

    return res.status(201).json({ success: true, transaction });
  } catch (err) {
    // erreur d'unicité (ex: reference déjà utilisée pour cet user)
    if (err.code === 11000) {
      return res.status(409).json({ message: "La référence existe déjà pour cet utilisateur." });
    }
    // erreurs de validation mongoose
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

/** Lister les transactions de l'utilisateur (filtres & pagination) */
exports.getTransactions = async (req, res) => {
  try {
    const { type, category, startDate, endDate, freq, page = 1, limit = 10, sort = "-date" } = req.query;

    const filter = { user: req.user.id };

    if (type && type !== "all") filter.type = type; // "entree" | "sortie"
    if (category) filter.category = category;

    // Fenêtre temporelle : freq (7j, 30j, 365j) OU startDate/endDate
    if (freq) {
      const now = new Date();
      const from = new Date();
      if (freq === "7j") from.setDate(now.getDate() - 7);
      else if (freq === "30j") from.setMonth(now.getMonth() - 1);
      else if (freq === "365j") from.setFullYear(now.getFullYear() - 1);
      filter.date = { $gte: from, $lte: now };
    } else {
      if (startDate || endDate) {
        const from = startDate ? parseDate(startDate) : null;
        const to = endDate ? parseDate(endDate) : null;
        if (from || to) {
          filter.date = {};
          if (from) filter.date.$gte = from;
          if (to) filter.date.$lte = to;
        }
      }
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [transactions, total] = await Promise.all([
      Transaction.find(filter).sort(sort).skip(skip).limit(Number(limit)),
      Transaction.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      transactions,
    });
  } catch (err) {
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

/** Lire une transaction par id (si elle appartient à l'utilisateur) */
exports.getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const trx = await Transaction.findOne({ _id: id, user: req.user.id });
    if (!trx) {
      return res.status(404).json({ message: "Transaction introuvable" });
    }
    return res.json({ success: true, transaction: trx });
  } catch (err) {
    return res.status(400).json({ message: "ID invalide" });
  }
};

/** Mettre à jour une transaction (ownership check) */
exports.updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    // Normaliser date/montant si présents
    if (updates.date) {
      const parsedDate = parseDate(updates.date);
      if (!parsedDate) {
        return res.status(400).json({ message: "Date invalide. Format attendu: DD-MM-YYYY" });
      }
      updates.date = parsedDate;
    }
    if (updates.montant !== undefined) {
      const amount = typeof updates.montant === "string" ? parseFloat(updates.montant.replace(",", ".")) : Number(updates.montant);
      if (isNaN(amount)) {
        return res.status(400).json({ message: "Montant invalide" });
      }
      updates.montant = amount;
    }

    const trx = await Transaction.findOneAndUpdate(
      { _id: id, user: req.user.id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!trx) {
      return res.status(404).json({ message: "Transaction introuvable" });
    }
    return res.json({ success: true, transaction: trx });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "La référence existe déjà pour cet utilisateur." });
    }
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }
    return res.status(400).json({ message: "Requête invalide" });
  }
};

/** Supprimer une transaction (ownership check) */
exports.deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const trx = await Transaction.findOneAndDelete({ _id: id, user: req.user.id });
    if (!trx) {
      return res.status(404).json({ message: "Transaction introuvable" });
    }
    return res.json({ success: true, message: "Transaction supprimée" });
  } catch (err) {
    return res.status(400).json({ message: "ID invalide" });
  }
};