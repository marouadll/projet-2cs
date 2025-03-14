const Joi = require('joi');
const Transaction = require('../models/Transaction');
const { createPayment, executePayment, refundPayment } = require('../services/paypal'); // Enlève payoutToSeller

// Schéma de validation (enlève sellerEmail)
const paymentSchema = Joi.object({
  buyerId: Joi.string().required(),
  sellerId: Joi.string().required(),
  amount: Joi.number().positive().required(),
});

// Créer un paiement
const createPaymentController = async (req, res) => {
  const { error } = paymentSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { buyerId, sellerId, amount } = req.body; // Enlève sellerEmail

  createPayment(amount, async (error, payment) => {
    if (error) return res.status(500).json({ error: error.message });

    const approvalUrl = payment.links.find(link => link.rel === 'approval_url').href;
    const transaction = new Transaction({
      buyerId,
      sellerId,
      amount,
      paypalOrderId: payment.id,
    });
    await transaction.save();

    res.json({ approvalUrl, transactionId: transaction._id });
  });
};

// Confirmer un paiement (sans Payout)
const confirmPaymentController = async (req, res) => {
  const { paymentId, PayerID } = req.query;
  if (!paymentId || !PayerID) {
    return res.status(400).json({ error: "paymentId et PayerID sont requis" });
  }

  executePayment(paymentId, PayerID, async (error, payment) => {
    if (error) {
      console.error('Erreur executePayment:', error.response ? error.response.details : error.message);
      return res.status(500).json({ error: error.message });
    }

    if (payment.state !== 'approved') {
      return res.status(400).json({ error: "Le paiement n'a pas été approuvé" });
    }

    const transaction = await Transaction.findOneAndUpdate(
      { paypalOrderId: paymentId },
      { status: 'COMPLETED' },
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({ error: "Transaction non trouvée" });
    }

    res.json({ message: 'Paiement réussi', transaction });
  });
};

// Annulation
const cancelPaymentController = (req, res) => {
  res.json({ message: 'Paiement annulé' });
};

// Remboursement
const refundPaymentController = async (req, res) => {
  const { transactionId, amount } = req.body;

  refundPayment(transactionId, amount, async (error) => {
    if (error) return res.status(500).json({ error: error.message });
    await Transaction.findByIdAndUpdate(transactionId, { status: 'REFUNDED' });
    res.json({ message: 'Remboursement effectué' });
  });
};

// Webhook PayPal (simplifié, sans Payout)
const handleWebhookController = async (req, res) => {
  const event = req.body;
  if (event.event_type === 'PAYMENT.SALE.COMPLETED') {
    const transaction = await Transaction.findOneAndUpdate(
      { paypalOrderId: event.resource.parent_payment },
      { status: 'COMPLETED' },
      { new: true }
    );
    // Pas de Payout, car tu n’en as pas besoin
  }
  res.status(200).send();
};

module.exports = {
  createPaymentController,
  confirmPaymentController,
  cancelPaymentController,
  refundPaymentController,
  handleWebhookController,
};