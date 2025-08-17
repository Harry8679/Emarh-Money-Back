const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getTransactionsSummary, // ⬅️ nouveau
} = require("../controllers/transaction.controller");

router.use(protect);

router.get("/summary", getTransactionsSummary); // ⬅️ NOUVEAU

router.route("/")
  .post(createTransaction)
  .get(getTransactions);

router.route("/:id")
  .get(getTransactionById)
  .put(updateTransaction)
  .delete(deleteTransaction);

module.exports = router;