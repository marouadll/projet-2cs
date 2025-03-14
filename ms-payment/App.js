const express = require('express');
const connectDB = require('./config/db');
const paymentRoutes = require('./routes/payment');
require('dotenv').config();

const app = express();

app.use(express.json());
connectDB();

app.use('/payment', paymentRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});