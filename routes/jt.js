const express = require("express");
const routes = express.Router();
const { isValid } = require("../middleware/api-production");
const { isAdminAuth } = require("../middleware/admin");
const { jtCheck } = require("../middleware/company");
const { createUserOrder, getSticker, getUserOrders, cancelOrder, edit } = require("../controller/jt");

routes.post("/create-user-order", isValid, jtCheck, createUserOrder);
routes.post("/print-sticker/:id", isValid, getSticker);
routes.post("/cancel-order", isValid, cancelOrder);
routes.post("/get-user-orders", isValid, getUserOrders);
// routes.get("/get-all-cities", getAllCities);
// routes.post("/track-order-by-number", isValid, trackingOrderByNum);

routes.post("/edit", isAdminAuth, edit);

module.exports = routes;