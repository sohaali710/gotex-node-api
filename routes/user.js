const express = require("express");
const routes = express.Router();
const { signUp, logIn, activateUser, reSendActivateCode, forgetPasswordEmail, setNewPassword, getUserBalance } = require("../controller/user");
const { isValid, isAuth } = require('../middleware/user');


routes.post('/signup', isValid, signUp);
routes.post('/login', logIn);

routes.get("/activate-user/:code/:id", activateUser);
routes.get("/resend-activate-code", isAuth, reSendActivateCode);

routes.post("/forget-password-email", forgetPasswordEmail);
routes.post("/set-new-password/:code", setNewPassword);

routes.get('/get-user-balance', isAuth, getUserBalance);

module.exports = routes;