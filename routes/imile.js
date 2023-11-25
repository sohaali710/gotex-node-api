const express = require("express");
const routes = express.Router();
const Imile = require("../model/companies/imile");
const { checkCompany } = require("../middleware/company");
const { isAdminAuth } = require("../middleware/admin");
const { isValid } = require("../middleware/api-test");
const { createOrder, addClient, getSticker, cancelOrder, getAllClients, getUserOrders, edit } = require("../controller/imile");

routes.post("/create-user-order", isValid, checkCompany(Imile), createOrder);
routes.post("/add-client", isValid, addClient);
routes.post("/get-all-clients", isValid, getAllClients);
routes.post("/print-sticker/:id", isValid, getSticker);
routes.post("/cancel-order", isValid, cancelOrder);

routes.post("/get-user-orders", isValid, getUserOrders);

routes.post("/edit", isAdminAuth, edit);

module.exports = routes;