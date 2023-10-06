const express = require("express");
const routes = express.Router();
const { isAdminAuth } = require("../middleware/admin");
const { saeeCheck } = require("../middleware/company");
const { createUserOrder, getSticker, edit, getUserOrders, trackingOrderByNum, getCities, cancelOrder } = require("../controller/saee");
const { isValid } = require("../middleware/api-production");

routes.post("/create-user-order", isValid, saeeCheck, createUserOrder);
routes.post("/print-sticker/:id", isValid, getSticker);
routes.post("/cancel-order", isValid, cancelOrder);
routes.post("/track-order-by-number", isValid, trackingOrderByNum);

routes.post("/get-cities", isValid, getCities);
routes.post("/get-user-orders", isValid, getUserOrders);

routes.post("/edit", isAdminAuth, edit);

module.exports = routes;