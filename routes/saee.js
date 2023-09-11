const express = require("express");
const routes = express.Router();
const { isAuth, isVerified } = require('../middleware/user');
const { isAdminAuth } = require("../middleware/admin");
const { saeeCheck } = require("../middleware/company");
const { createUserOrder, getSticker, edit, getUserOrders, trackingOrderByNum, getCities } = require("../controller/saee");
const apiMiddleware = require("../middleware/api-test");
routes.post("/create-user-order", apiMiddleware.isValid, saeeCheck, createUserOrder);
routes.post("/print-sticker/:id", apiMiddleware.isValid, getSticker);
routes.post("/get-cities", apiMiddleware.isValid, getCities);
routes.post("/get-user-orders", apiMiddleware.isValid, getUserOrders);

routes.post("/edit", isAdminAuth, edit);
routes.post("/track-order-by-number", isAuth, trackingOrderByNum);

module.exports = routes;