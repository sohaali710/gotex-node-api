const express = require("express");
const routes = express.Router();
const Spl = require("../model/companies/spl");
const { checkCompany } = require("../middleware/company");
const { isValid } = require("../middleware/api-production");
const { isAdminAuth } = require("../middleware/admin");
const { createNewOrder, getCities, getToken, getUserOrders, getCountries, getDistrict, edit } = require("../controller/spl");

routes.post("/create-new-order", isValid, checkCompany(Spl), createNewOrder); //done
routes.post("/get-cities", isValid, getCities); //done
routes.get("/token", getToken); // don't share this in doc 
routes.post("/get-user-orders", isValid, getUserOrders); // not added to doc  //done
routes.get("/get-countries", getCountries); // note used 
routes.post("/get-districts", getDistrict); // note used 

routes.post("/edit", isAdminAuth, edit);

module.exports = routes;