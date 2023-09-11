const express = require("express");
const routes = express.Router();
<<<<<<< HEAD
const { signUp, logIn, activateUser, reSendActivateCode, forgetPasswordEmail, setNewPassword, getUserBalance } = require("../controller/user");
=======
const { signUp, marketerSignUp, logIn, activateUser, reSendActivateCode, forgetPasswordEmail, setNewPassword, getUserBalance, addBalance, checkPaymentOrder, getAllPaymentOrders } = require("../controller/user");
>>>>>>> 2ad3b79 (add payment by telr for user)
const { isValid, isAuth } = require('../middleware/user');


routes.post('/signup', isValid, signUp);
routes.post('/login', logIn);

routes.get("/activate-user/:code/:id", activateUser);
routes.get("/resend-activate-code", isAuth, reSendActivateCode);

routes.post("/forget-password-email", forgetPasswordEmail);
routes.post("/set-new-password/:code", setNewPassword);

routes.get('/get-user-balance', isAuth, getUserBalance);
routes.post("/add-user-balance", isAuth, addBalance);
routes.get("/checkpayment/:status/:uId/:code", checkPaymentOrder);
routes.get("/get-all-payment-orders", isAuth, getAllPaymentOrders);
module.exports = routes;