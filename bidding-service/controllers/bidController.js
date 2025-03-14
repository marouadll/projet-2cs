const Bid = require("../models/Bid");
const biddingSocket = require("../sockets/biddingSocket");
const auctionManager = require("../utils/auctionManager");
const logger = require("../utils/logger");

//creer bid
exports.createBid = async (req, res) => {
  try {
    const { productId, buyerId, amount } = req.body;

    const newBid = new Bid({ productId, buyerId, amount });
    await newBid.save();

    // hada pour notification
    biddingSocket.notifyClients(productId, "newBid", {
      buyerId,
      amount,
      createdAt: newBid.createdAt,
    });


    auctionManager.closeAuction(productId, 3600000);

    res.status(201).json(newBid);
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Accepter bid
exports.acceptBid = async (req, res) => {
  try {
    const { bidId, productId } = req.params;

    // Accepter bid w fermer l'enchère
    await auctionManager.acceptBid(bidId, productId);

    res.status(200).json({ message: "Bid accepted" });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: err.message });
  }
};