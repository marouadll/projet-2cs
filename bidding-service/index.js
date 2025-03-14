const express = require('express');
const axios = require('axios');
const app = express();

// Configuration de base
const EUREKA_SERVER = 'http://localhost:8087/eureka'; // Adresse du serveur Eureka
const SERVICE_NAME = 'bidding-service'; // Nom du service
const HOST = 'localhost'; // Hôte de votre service
const PORT = 3000; // Port de bidding-service

// Fonction pour s’enregistrer auprès d’Eureka
async function registerWithEureka() {
  const instanceId = `${HOST}:${SERVICE_NAME}:${PORT}`; // Identifiant unique: localhost:bidding-service:3000
  const instance = {
    instance: {
      instanceId: instanceId, // ID explicite pour cohérence
      hostName: HOST,
      app: SERVICE_NAME,
      ipAddr: '127.0.0.1',
      port: {
        $: PORT,
        '@enabled': 'true',
      },
      healthCheckUrl: `http://${HOST}:${PORT}/health`,
      statusPageUrl: `http://${HOST}:${PORT}/status`,
      homePageUrl: `http://${HOST}:${PORT}/`,
      status: 'UP',
      dataCenterInfo: {
        '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
        name: 'MyOwn',
      },
    },
  };

  try {
    await axios.post(`${EUREKA_SERVER}/apps/${SERVICE_NAME}`, instance, {
      headers: { 'Content-Type': 'application/json' },
    });
    console.log('bidding-service enregistré auprès d’Eureka');
  } catch (error) {
    console.error('Erreur lors de l’enregistrement:', error.message);
    if (error.response) {
      console.error('Détails:', error.response.status, error.response.data);
    }
  }
}

// Fonction pour envoyer un heartbeat
async function sendHeartbeat() {
  const instanceId = `${HOST}:${SERVICE_NAME}:${PORT}`; // Même ID que lors de l’enregistrement
  try {
    await axios.put(`${EUREKA_SERVER}/apps/${SERVICE_NAME}/${instanceId}`);
    console.log('Heartbeat envoyé');
  } catch (error) {
    console.error('Erreur heartbeat:', error.message);
    if (error.response) {
      console.error('Détails:', error.response.status, error.response.data);
    }
  }
}

// Routes nécessaires pour Eureka et le service
app.get('/', (req, res) => {
  res.send('bidding-service fonctionne !');
});

app.get('/health', (req, res) => {
  res.status(200).send('OK'); // Pour le health check d’Eureka
});

app.get('/status', (req, res) => {
  res.status(200).send('UP'); // Pour le status check d’Eureka
});

// Démarrer le service et s’enregistrer
app.listen(PORT, async () => {
  console.log(`bidding-service sur port ${PORT}`);
  await registerWithEureka(); // Enregistrement au démarrage
  setInterval(sendHeartbeat, 30000); // Heartbeat toutes les 30 secondes
});