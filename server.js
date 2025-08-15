const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth.route");
const cors = require("cors");

dotenv.config();
connectDB();

const app = express();

// ✅ Middleware CORS
app.use(cors({
  origin: "http://localhost:3000", // URL de ton frontend (Vite)
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type,Authorization"
}));
app.use(express.json());

app.use("/api/v1/auth", authRoutes);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`🚀 Serveur démarré sur le port ${port}`));