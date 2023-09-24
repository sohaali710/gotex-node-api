const express = require("express");
const routes = express.Router();
const { aramexCheck } = require("../middleware/company");
const { isValid } = require("../middleware/api-test");
const { isAdminAuth } = require("../middleware/admin");
const { createOrder, getSticker, getCities, getUserOrders, edit } = require("../controller/aramex");

routes.post("/create-user-order", isValid, aramexCheck, createOrder);
routes.post("/print-sticker/:id", getSticker);

routes.post("/get-user-orders", isValid, getUserOrders);
routes.post("/get-cities", isValid, getCities);

routes.post("/edit", isAdminAuth, edit);

module.exports = routes;