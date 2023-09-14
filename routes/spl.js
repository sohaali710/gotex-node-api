const express = require("express");
const routes = express.Router();
const { isAuth } = require('../middleware/user');
const { isValid } = require("../middleware/api-test");
const { isAdminAuth } = require("../middleware/admin");
const { splCheck } = require("../middleware/company");
const { createNewOrder, getCities, getToken, getUserOrders, getCountries, getDistrict, edit } = require("../controller/spl");

routes.post("/create-new-order", isValid, splCheck, createNewOrder); //done
routes.post("/get-cities", isValid, getCities); //done
routes.get("/token", getToken); // don't share this in doc 
routes.post("/get-all-orders", isValid, getUserOrders); // not added to doc  //done
routes.get("/get-countries", getCountries); // note used 
routes.post("/get-districts", getDistrict); // note used 

routes.post("/edit", isAdminAuth, edit);

module.exports = routes;