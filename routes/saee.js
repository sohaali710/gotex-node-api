const express = require("express");
const routes = express.Router();
const { isAuth, isVerified } = require('../middleware/user');
const { isAdminAuth } = require("../middleware/admin");
const { saeeCheck } = require("../middleware/company");
const { createUserOrder, getSticker, edit, getUserOrders, trackingOrderByNum, getCities } = require("../controller/saee");

routes.post("/create-user-order", isAuth, isVerified, saeeCheck, createUserOrder);
routes.get("/print-sticker/:id", isAuth, getSticker);
routes.get("/get-cities", getCities);
routes.get("/get-user-orders", isAuth, getUserOrders);

routes.post("/edit", isAdminAuth, edit);
routes.post("/track-order-by-number", isAuth, trackingOrderByNum);

module.exports = routes;