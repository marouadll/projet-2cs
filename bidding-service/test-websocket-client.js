const io = require("socket.io-client");

// Connexion au serveur WebSocket
const socket = io("http://localhost:3000");

socket.on("connect", () => {
  console.log("Connected to server");

  // Rejoindre une room pour un produit spécifique
  const productId = "507f1f77bcf86cd799439011"; // ID du produit
  socket.emit("joinProductRoom", productId);
  console.log(`Joined product room: ${productId}`);

  // Simuler une nouvelle offre après 5 secondes
  setTimeout(() => {
    const newBid = {
      productId,
      buyerId: "507f1f77bcf86cd799439012", // ID de l'acheteur
      amount: 100,
    };
    socket.emit("newBid", newBid);
    console.log("Simulated new bid:", newBid);
  }, 5000);

  // Simuler la fermeture de l'enchère après 10 secondes
  setTimeout(() => {
    const auctionClosedData = {
      productId,
      winner: "507f1f77bcf86cd799439012", // ID du gagnant
      amount: 100,
    };
    socket.emit("auctionClosed", auctionClosedData);
    console.log("Simulated auction closed:", auctionClosedData);
  }, 10000);
});

// Écouter les nouvelles offres
socket.on("newBid", (data) => {
  console.log("New bid received:", data);
});

// Écouter la fermeture de l'enchère
socket.on("auctionClosed", (data) => {
  console.log("Auction closed. Winner:", data);
});

// Écouter les erreurs de connexion
socket.on("connect_error", (err) => {
  console.error("Connection error:", err);
});