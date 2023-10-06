const axios = require("axios");
const User = require("../model/user");
const Anwan = require("../model/companies/anwan");
const AnwanOrders = require("../model/orders/anwanOrders");

exports.createUserOrder = async (req, res) => {
    const userId = req.body.userId
    const user = await User.findById(userId);
    let ordersNum = await AnwanOrders.count();
    const totalShipPrice = res.locals.totalShipPrice;
    let { s_phone, s_name, s_email, c_email, description, s_city, c_phone, s_address, c_name, c_city, pieces, c_address, cod, weight } = req.body
    if (cod) {
        var BookingMode = "COD"
        var codValue = res.locals.codAmount;;
        var paytype = "cod";
    } else {
        var BookingMode = "CC"
        var codValue = 0;
        var paytype = "cc";
    }
    var nameCode = s_name;
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
    axios(config)
        .then(async response => {
            if (response.data.status !== 200) {
                return res.status(400).json({
                    error: response.data
                })
            } else {
                const newOrder = new AnwanOrders({
                    user: req.user.user.id,
                    company: "anwan",
                    ordernumber: ordersNum + 2,
                    paytype: paytype,
                    data: response.data,
                    price: totalShipPrice,
                    marktercode: markterCode,
                    createdate: new Date(),
                    inovicedaftra: invo
                })
                newOrder.save()
                    .then(async (o) => {
                        if (!cod) {
                            user.wallet = user.wallet - totalShipPrice;

                            user.save()
                                .then(u => {
                                    res.status(200).json({
                                        data: o
                                    })
                                })
                        } else {
                            res.status(200).json({
                                data: o
                            })
                        }
                    })
                    .catch(err => {
                        console.log(err)
                    })
            }
        })
        .catch(function (error) {
            res.status(500).json({
                msg: error
            })
            console.log(error);
        });
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
    AnwanOrders.find({ user: userId })
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