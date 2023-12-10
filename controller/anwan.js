const axios = require("axios");
const User = require("../model/user");
const Anwan = require("../model/companies/anwan");
const AnwanOrders = require("../model/orders/anwanOrders");
const sendEmail = require("../modules/sendEmail");
const balanceAlertMailSubject = "Alert! Your wallet balance is less than 100 SAR."

exports.createUserOrder = async (req, res) => {
    let { c_name, c_email, c_phone, c_city, c_address,
        s_name, s_email, s_phone, s_city, s_address,
        pieces, cod, weight, description, userId } = req.body

    const user = await User.findById(userId);
    let ordersNum = await AnwanOrders.count();

    try {
        if (cod) {
            var BookingMode = "COD"
            var codValue = res.locals.codAmount;
            var paytype = "cod";
        } else {
            var BookingMode = "CC"
            var codValue = 0;
            var paytype = "cc";
        }
        if (markterCode) {
            var nameCode = `${s_name} (${markterCode})`;
        } else {
            var nameCode = s_name;
        }
        var data = {
            "format": "json",
            "secret_key": process.env.ANWAN_SECRET_KEY,
            "customerId": process.env.ANWAN_CUSTOMER_ID,
            "param": {
                "sender_phone": s_phone,
                "sender_name": nameCode,
                "sender_email": s_email,
                "receiver_email": c_email,
                "description": description,
                "origin": s_city,
                "receiver_phone": c_phone,
                "sender_address": s_address,
                "receiver_name": c_name,
                "destination": c_city,
                "BookingMode": BookingMode,
                "pieces": pieces,
                "weight": weight,
                "receiver_address": c_address,
                "reference_id": `gotex-${ordersNum + "/" + Date.now()}`,
                "codValue": codValue,
                "productType": "Parcel"
            }
        };
        var config = {
            method: 'post',
            url: 'https://api.fastcoo-tech.com/API_v2/CreateOrder',
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };
        const response = await axios(config)

        const order = await anwanorders.create({
            user: req.user.user.id,
            company: "anwan",
            ordernumber: ordersNum + 2,
            paytype: paytype,
            data: response.data,
            price: totalShipPrice,
            codPrice: res.locals.codAmount,
            marktercode: markterCode,
            created_at: new Date()
        })

        if (response.data.status !== 200) {
            order.status = 'failed'
            await order.save()
            return res.status(400).json({ error: response.data })
        }

        if (!cod) {
            user.wallet = user.wallet - totalShipPrice;
            if (user.wallet <= 100 && !user.isSentBalanceAlert) {
                sendEmail(user.email, "", "", "/../views/balanceAlert.ejs", balanceAlertMailSubject)
                user.isSentBalanceAlert = true
                await user.save()
            }
            await user.save()
        }

        res.status(200).json({ data: order })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}
exports.getSticker = (req, res) => {
    const orderId = req.params.id;
    AnwanOrders.findById(orderId)
        .then(o => {
            res.status(200).json({
                data: o.data.label_print
            })
        })
        .catch(error => {
            console.log(error);
            res.status(500).json({
                msg: error
            })
        })
}

exports.getCities = (req, res) => {
    var data = JSON.stringify({
        "ClientInfo": {
            "UserName": process.env.AR_USERNAME,
            "Password": process.env.AR_PASSWORD,
            "Version": "v1.0",
            "AccountNumber": process.env.AR_ACCOUNT,
            "AccountPin": process.env.AR_PIN,
            "AccountEntity": "JED",
            "AccountCountryCode": "SA",
            "Source": 24
        },
        "CountryCode": "SA",
        "NameStartsWith": "",
        "State": "",
        "Transaction": {
            "Reference1": "",
            "Reference2": "",
            "Reference3": "",
            "Reference4": "",
            "Reference5": ""
        }
    });

    var config = {
        method: 'post',
        url: 'https://ws.aramex.net/ShippingAPI.V2/Location/Service_1_0.svc/json/FetchCities',
        headers: {
            'Content-Type': 'application/json'
        },
        data: data
    };

    axios(config)
        .then(function (response) {
            res.status(200).json({
                data: response.data
            })
        })
        .catch(function (error) {
            console.log(error);
            res.status(500).json({
                msg: error
            })
        });

}
exports.getUserOrders = (req, res) => {
    const userId = req.user.user.id;
    AnwanOrders.find({ user: userId, status: { $ne: "failed" } })
        .then(o => {
            res.status(200).json({
                data: o
            })
        })
        .catch(err => {
            console.log(err.request)
        })
}

exports.edit = (req, res) => {
    const status = req.body.status;
    const userprice = req.body.userprice;
    const userCodPrice = req.body.userCodPrice;

    const kgprice = req.body.kgprice;
    Anwan.findOne()
        .then(a => {
            a.status = status;
            a.userprice = userprice;
            a.kgprice = kgprice;
            a.codprice = userCodPrice
            return a.save()
        })
        .then(a => {
            res.status(200).json({
                msg: "ok"
            })
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                msg: err.message
            })
        })
}