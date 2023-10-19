const express = require("express");
const routes = express.Router();
const Jt = require("../model/companies/jt");
const { checkCompany } = require("../middleware/company");
const { isValid } = require("../middleware/api-test");
const { isAdminAuth } = require("../middleware/admin");
const { createUserOrder, getSticker, getUserOrders, cancelOrder, edit } = require("../controller/jt");

routes.post("/create-user-order", isValid, checkCompany(Jt), createUserOrder);
routes.post("/print-sticker/:id", isValid, getSticker);
routes.post("/cancel-order", isValid, cancelOrder);
routes.post("/get-user-orders", isValid, getUserOrders);
// routes.get("/get-all-cities", getAllCities);
// routes.post("/track-order-by-number", isValid, trackingOrderByNum);

routes.post("/edit", isAdminAuth, edit);

module.exports = routes;