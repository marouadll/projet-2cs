const socketIO = require("socket.io");

let io;  // hada bach ystocker instance de Socket.IO


// Initialiser les WebSockets
exports.init = (server) => {
  io = socketIO(server, {
    cors: {
      origin: "*", 
    },
  });

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // Rejoindre une room pour un produit 
    socket.on("joinProductRoom", (productId) => {
      socket.join(productId);
      console.log(`Client joined product room: ${productId}`);
    });

    // Quitter une room
    socket.on("leaveProductRoom", (productId) => {
      socket.leave(productId);
      console.log(`Client left product room: ${productId}`);
    });

    // Écouter les nouvelles bids
    socket.on("newBid", (data) => {
      console.log("New bid received from client:", data);

      // Envoyer une notification à tous les clients dans la room
      io.to(data.productId).emit("newBid", data);
    });

    // Écouter la fermeture de l'enchère
    socket.on("auctionClosed", (data) => {
      console.log("Auction closed by client:", data);

      // Envoyer une notification à tous les clients dans la room
      io.to(data.productId).emit("auctionClosed", data);
    });

    // Déconnexion
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
};

// Envoyer une notification à tous les clients dans une room
exports.notifyClients = (productId, event, data) => {
  console.log(`Sending ${event} to room ${productId}:`, data); 
  io.to(productId).emit(event, data);
};

module.exports = exports;