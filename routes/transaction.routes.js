// routes/transaction.routes.js
const express = require("express");
const router = express.Router();

const { protect } = require('../middlewares/auth.middleware');
const {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
} = require("../controllers/transaction.controller");

// Toutes les routes ci-dessous nécessitent un utilisateur connecté
router.use(protect);

// CRUD
router.route("/")
  .post(createTransaction)  // CREATE
  .get(getTransactions);    // READ (list)

router.route("/:id")
  .get(getTransactionById)  // READ (one)
  .put(updateTransaction)   // UPDATE
  .delete(deleteTransaction); // DELETE

module.exports = router;