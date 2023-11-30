const express = require("express");
const routes = express.Router();
const { isValid } = require("../middleware/api-production");
const { isAdminAuth } = require("../middleware/admin");
const { createOrder, getSticker, getCities, getUserOrders, edit, createPickup } = require("../controller/aramex");
const Aramex = require("../model/companies/aramex");
const { checkCompany } = require("../middleware/company");

routes.post("/create-user-order", isValid, checkCompany(Aramex), createOrder);
routes.post("/create-pickup", isValid, checkCompany(Aramex), createPickup);
routes.post("/print-sticker/:id", getSticker);

routes.post("/get-user-orders", isValid, getUserOrders);
routes.post("/get-cities", isValid, getCities);

routes.post("/edit", isAdminAuth, edit);

module.exports = routes;