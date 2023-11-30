const express = require("express");
const routes = express.Router();
const Smsa = require("../model/companies/smsa");
const { checkCompany, isCrProofed } = require("../middleware/company");
const { isAdminAuth } = require("../middleware/admin");
const { edit, createUserOrder, getUserOrders, getSticker, cancelOrder } = require("../controller/smsa");
const { isValid } = require("../middleware/api-production");

routes.post("/create-user-order", isValid, isCrProofed, checkCompany(Smsa), createUserOrder);
routes.post("/print-sticker/:id", isValid, getSticker);
routes.post("/cancel-order", isValid, cancelOrder);
routes.post("/get-user-orders", isValid, getUserOrders);
// routes.post("/track-order-by-number", isValid, trackingOrderByNum);

routes.post("/edit", isAdminAuth, edit);

module.exports = routes;