const express = require("express");
const routes = express.Router();
const Saee = require("../model/companies/saee");
const { checkCompany } = require("../middleware/company");
const { isAdminAuth } = require("../middleware/admin");
const { createUserOrder, getSticker, edit, getUserOrders, trackingOrderByNum, getCities, cancelOrder } = require("../controller/saee");
const { isValid } = require("../middleware/api-production");

routes.post("/create-user-order", isValid, checkCompany(Saee), createUserOrder);
// routes.post("/create-order-last-mile", isValid, checkCompany(Saee), createOrderLastMile);
routes.post("/print-sticker/:id", isValid, getSticker);
routes.post("/cancel-order", isValid, cancelOrder);
routes.post("/track-order-by-number", isValid, trackingOrderByNum);

routes.post("/get-cities", isValid, getCities);
routes.post("/get-user-orders", isValid, getUserOrders);

routes.post("/edit", isAdminAuth, edit);

module.exports = routes;