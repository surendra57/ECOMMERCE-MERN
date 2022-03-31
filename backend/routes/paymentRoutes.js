const express = require("express");
const { proccesPayment, sendStripeApiKey } = require("../controller/paymentController");
const router = express.Router();
const { isAuthenticatedUser } = require('../middleware/auth');

router.route("/payment/process").post(isAuthenticatedUser,proccesPayment)
router.route("/stripeApiKey").get(isAuthenticatedUser,sendStripeApiKey)

module.exports = router;