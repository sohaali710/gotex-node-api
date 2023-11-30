const express = require("express");
const routes = express.Router();
const { isAdminAuth } = require("../middleware/admin");
const { isValid } = require("../middleware/api-production");
const { createUserOrder, getSticker, getCities, getUserOrders, edit } = require("../controller/anwan");
const Anwan = require("../model/companies/anwan");
const { checkCompany } = require("../middleware/company");

routes.post("/create-user-order", isValid, checkCompany(Anwan), createUserOrder);
routes.post("/print-sticker/:id", getSticker);

routes.post("/get-all-cities", isValid, getCities);
routes.post("/get-user-orders", isValid, getUserOrders);

routes.post("/edit", isAdminAuth, edit);

module.exports = routes;