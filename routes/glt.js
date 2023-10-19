const express = require("express");
const routes = express.Router();
const Glt = require("../model/companies/glt");
const { checkCompany } = require("../middleware/company");
const { isValid } = require("../middleware/api-test");
const { isAdminAuth } = require("../middleware/admin");
const { createUserOrder, getSticker, getAllCities, getUserOrders, edit } = require("../controller/glt");

routes.post("/create-user-order", isValid, checkCompany(Glt), createUserOrder);
routes.post("/print-sticker/:id", getSticker);
// routes.post("/track-order-by-number", isValid, trakingOrderByNum);

routes.post("/get-all-cities", getAllCities);
routes.post("/get-user-orders", isValid, getUserOrders);

routes.post("/edit", isAdminAuth, edit);

module.exports = routes;