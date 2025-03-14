const paypal = require('paypal-rest-sdk');
require('dotenv').config();

paypal.configure({
  mode: process.env.PAYPAL_MODE,
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_SECRET,
});

const createPayment = (amount, callback) => {
  const paymentData = {
    intent: 'sale',
    payer: { payment_method: 'paypal' },
    transactions: [{
      amount: { total: amount.toFixed(2), currency: 'USD' },
      description: 'Achat sur la marketplace',
    }],
    redirect_urls: {
      return_url: 'http://localhost:3001/payment/success',
      cancel_url: 'http://localhost:3001/payment/cancel',
    },
  };

  paypal.payment.create(paymentData, callback);
};

const executePayment = (paymentId, payerId, callback) => {
  const executeData = { payer_id: payerId }; // Format correct pour PayPal
  paypal.payment.execute(paymentId, executeData, callback);
};

const refundPayment = (transactionId, amount, callback) => {
  paypal.sale.refund(transactionId, { amount: { total: amount.toFixed(2), currency: 'USD' } }, callback);
};

module.exports = { createPayment, executePayment, refundPayment };