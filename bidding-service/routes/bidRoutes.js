const express = require("express");
const { body, validationResult } = require("express-validator");
const bidController = require("../controllers/bidController");

const router = express.Router();

//creer bid
router.post(
  "/bids",
  [
    body("productId").notEmpty().isString(), 
    body("buyerId").notEmpty().isString(),   
    body("amount").notEmpty().isNumeric(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    bidController.createBid(req, res);
  }
);

// Accepter bid
router.put("/bids/:bidId/accept", bidController.acceptBid);

module.exports = router;