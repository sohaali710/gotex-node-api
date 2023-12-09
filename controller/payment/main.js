const User = require("../../model/user");
const PaymentOrder = require("../../model/payment/orders");
const axios = require("axios");
const genRandomString = require("../../modules/genRandomString");

exports.userCharge = async (req, res) => {
    const amount = req.body.amount;
    const userId = req.user.user.id;

    try {
        const user = await User.findById(userId)
        const code = genRandomString(10)

        let data = JSON.stringify({
            "amount": amount,
            "currency": "SAR",
            "threeDSecure": true,
            "save_card": false,
            "customer_initiated": true,
            "description": "Test Description",
            "statement_descriptor": "Sample",
            "metadata": {
                "udf1": "test 1",
                "udf2": "test 2"
            },
            "reference": {
                "transaction": "txn_0001",
                "order": "ord_0001"
            },
            "receipt": {
                "email": true,
                "sms": false
            },
            "customer": {
                "first_name": user.name,
                "last_name": "",
                "email": user.email,
                "phone": {
                    "country_code": "966",
                    "number": user.mobile
                }
            },
            "merchant": {
                "id": ""
            },
            "source": {
                "id": "src_all"
            },
            "post": {
                "url": ''
            },
            "redirect": {
                "url": `https://dashboard.go-tex.net/gotex-co-test/user/check-tap-payment/${userId}/${code}`
            }
        });
        let config = {
            method: 'POST',
            url: 'https://api.tap.company/v2/charges/',
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                Authorization: 'Bearer sk_test_iN3MadpErZUhYeIV9WCvXOo4'
            },
            data: data
        };
        const response = await axios(config);

        const paymentOrder = await PaymentOrder.create({
            user: userId,
            data: response.data,
            amount: amount,
            code: code,
            status: "pending"
        })

        res.status(200).json({ data: response.data })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            error: { status: err.status, message: err.message, stack: err.stack }
        })
    }
}
const getCharge = (chargeId) => {
    try {
        const config = {
            method: 'GET',
            url: `https://api.tap.company/v2/charges/${chargeId}`,
            headers: {
                accept: 'application/json',
                Authorization: 'Bearer sk_test_iN3MadpErZUhYeIV9WCvXOo4'
            }
        };

        const response = axios(config);
        return response
    } catch (err) {
        console.log(err)
        res.status(500).json({
            error: { status: err.status, message: err.message, stack: err.stack }
        })
    }
}

exports.checkPayment = async (req, res) => {
    const userId = req.params.userId;
    const code = req.params.code;
    const status = req.params.status;
    try {
        const order = await PaymentOrder.findOne({ code });
        const user = await User.findById(userId);

        const charge = await getCharge(order.data.id)
        const currentStatus = charge.data.status

        if (!order) {
            return res.render("payment-result", {
                myText: "Failed, your wallet is =",
                balance: user.wallet
            })
            res.status(400).json({
                data: "failed"
            })
        }

        if (currentStatus != "CAPTURED") {
            return res.render("payment-result", {
                myText: `${currentStatus}, your wallet is =`,
                balance: user.wallet
            })
            return res.status(400).json({
                data: status
            })
        } else {
            user.wallet = user.wallet + order.amount
            await user.save()
        }

        order.status = currentStatus;
        order.code = genRandomString(10);
        await order.save()
        return res.render("payment-result", {
            myText: `${currentStatus}, your wallet is =`,
            balance: user.wallet
        })

        const data = {
            amount: order.amount,
            userBalance: user.wallet
        }
        res.status(200).json({
            data: data
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            error: err.message
        })
    }
}

exports.getUserPaymentOrders = async (req, res) => {
    const userId = req.user.user.id;
    const orders = await PaymentOrder.find({ user: userId });
    try {
        res.status(200).json({
            data: orders
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            error: err.message
        })
    }
}