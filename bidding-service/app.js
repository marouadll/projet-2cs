const express = require("express");
const http = require("http");
const connectDB = require("./config/db");
const bidRoutes = require("./routes/bidRoutes");
const biddingSocket = require("./sockets/biddingSocket");
const logger = require("./utils/logger");
require("dotenv").config();

const app = express();
const server = http.createServer(app);


// Initialiser les WebSockets
biddingSocket.init(server);

// Middleware pour parser le JSON
app.use(express.json());

// Connexion à MongoDB
connectDB();

// Routes
app.use("/api", bidRoutes);


// Démarrer le serveur
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});