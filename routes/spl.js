const express = require("express");
const routes = express.Router();
const { isAuth } = require('../middleware/user');
const { isAdminAuth } = require("../middleware/admin");
const { splCheck } = require("../middleware/company");
const { createNewOrder, getCities, getToken, getUserOrders, getCountries, getDistrict, edit } = require("../controller/spl");

routes.post("/crete-new-order", isAuth, splCheck, createNewOrder);
routes.get("/get-cities", getCities);
routes.get("/token", getToken);
routes.get("/get-all-orders", isAuth, getUserOrders); // not added to doc
routes.get("/get-countries", getCountries); // note used 
routes.post("/get-districts", getDistrict); // note used 

routes.post("/edit", isAdminAuth, edit);

module.exports = routes;