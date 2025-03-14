const winston = require("winston");
require("dotenv").config();

// Configuration des transports (fichiers de logs)
const transports = [
  new winston.transports.File({ filename: "error.log", level: "error" }), // Log des erreurs
  new winston.transports.File({ filename: "combined.log" }), // Log général
];

// Si on est en mode développement, on ajoute aussi la console
if (process.env.NODE_ENV !== "production") {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(), // Ajoute des couleurs pour les logs
        winston.format.simple() // Format simple pour la console
      ),
    })
  );
}

// Créer le logger
const logger = winston.createLogger({
  level: "info", // Niveau de log par défaut
  format: winston.format.combine(
    winston.format.timestamp(), // Ajoute un timestamp aux logs
    winston.format.json() // Format JSON pour les fichiers
  ),
  transports,
});

module.exports = logger;