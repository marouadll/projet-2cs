const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/create', paymentController.createPaymentController);
router.get('/success', paymentController.confirmPaymentController);
router.get('/cancel', paymentController.cancelPaymentController);
router.post('/refund', paymentController.refundPaymentController);
router.post('/webhook', paymentController.handleWebhookController);

module.exports = router;