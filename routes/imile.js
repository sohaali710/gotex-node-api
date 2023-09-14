const express = require("express");
const routes = express.Router();
const { isAdminAuth } = require("../middleware/admin");
const { isValid } = require("../middleware/api-test");
const { imileCheck } = require("../middleware/company");
const { createOrder, addClient, getSticker, getAllClients, getUserOrders, edit } = require("../controller/imile");

routes.post("/create-user-order", isValid, imileCheck, createOrder);
routes.post("/add-client", isValid, addClient);
routes.post("/print-sticker/:id", isValid, getSticker);
routes.post("/get-all-clients", isValid, getAllClients);
routes.post("/get-user-orders", isValid, getUserOrders);

routes.get("/edit", isAdminAuth, edit);

module.exports = routes;