const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

app.use(express.json());

app.use("/api/auth", require("./routes/auth.route"));

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`🚀 Serveur démarré sur le port ${port}`));