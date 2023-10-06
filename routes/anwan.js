const express = require("express");
const routes = express.Router();
const { isAdminAuth } = require("../middleware/admin");
const { anwanCheck } = require("../middleware/company");
const { isValid } = require("../middleware/api-production");
const { createUserOrder, getSticker, getCities, getUserOrders, edit } = require("../controller/anwan");

routes.post("/create-user-order", isValid, anwanCheck, createUserOrder);
routes.post("/print-sticker/:id", getSticker);

routes.post("/get-all-cities", isValid, getCities);
routes.post("/get-user-orders", isValid, getUserOrders);

routes.post("/edit", isAdminAuth, edit);

module.exports = routes;