const Bid = require("../models/Bid");
const biddingSocket = require("../sockets/biddingSocket");
const logger = require("../utils/logger");

// Fermer une enchère après un délai
exports.closeAuction = async (productId, delay) => {
  setTimeout(async () => {
    const bids = await Bid.find({ productId }).sort({ amount: -1 });
    if (bids.length > 0) {
      const winningBid = bids[0];
      await Bid.findByIdAndUpdate(winningBid._id, { status: "accepted" });

      // Notifier les clients
      biddingSocket.notifyClients(productId, "auctionClosed", {
        winner: winningBid.buyerId,
        amount: winningBid.amount,
      });

      logger.info(`Auction closed for product ${productId}. Winner: ${winningBid.buyerId}`);
    }
  }, delay);
};

// Accepter manuellement bid
exports.acceptBid = async (bidId, productId) => {
  const bid = await Bid.findByIdAndUpdate(bidId, { status: "accepted" }, { new: true });

  // Notifier les clients
  biddingSocket.notifyClients(productId, "auctionClosed", {
    winner: bid.buyerId,
    amount: bid.amount,
  });

  logger.info(`Bid ${bidId} accepted for product ${productId}`);
};