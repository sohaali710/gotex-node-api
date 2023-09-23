const express = require("express");
const routes = express.Router();
const { smsaCheck, isCrProofed } = require("../middleware/company");
const { isAdminAuth } = require("../middleware/admin");
const { edit, createUserOrder, getUserOrders, getSticker, cancelOrder } = require("../controller/smsa");
const { isValid } = require("../middleware/api-test");

routes.post("/create-user-order", isValid, isCrProofed, smsaCheck, createUserOrder);
routes.post("/print-sticker/:id", isValid, getSticker);
routes.post("/cancel-order", isValid, cancelOrder);
routes.post("/get-user-orders", isValid, getUserOrders);
// routes.post("/track-order-by-number", isValid, trackingOrderByNum);

routes.post("/edit", isAdminAuth, edit);

module.exports = routes;