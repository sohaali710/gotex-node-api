const Smsa = require("../model/companies/smsa");
const SmsaOrders = require("../model/orders/smsaOrders");
const axios = require('axios');
const base64 = require('base64topdf');
const User = require("../model/user");


exports.createUserOrder = async (req, res) => {
    const { c_name, c_ContactPhoneNumber, c_District, c_City, c_AddressLine1,
        p_name, p_ContactPhoneNumber, p_District, p_City, p_AddressLine1,
        pieces, weight, description, value, cod, userId } = req.body

    try {
        const user = await User.findById(userId);
        let ordersNum = await SmsaOrders.count();
        const totalShipPrice = res.locals.totalShipPrice;

        if (cod) {
            var cashondelivery = res.locals.codAmount;
            var paytype = "cod";
        } else {
            var cashondelivery = 0;
            var paytype = "cc";
        }

        const date = new Date().toISOString().split('T')[0];
        const data = JSON.stringify({
            "ConsigneeAddress": {
                "ContactName": c_name,
                "ContactPhoneNumber": c_ContactPhoneNumber,
                // "ContactPhoneNumber2": c_ContactPhoneNumber2,
                "Coordinates": "",
                "Country": "SA",
                "District": c_District,
                "PostalCode": "",
                "City": c_City,
                "AddressLine1": c_AddressLine1
                // ,
                // "AddressLine2": c_AddressLine2
            },
            "ShipperAddress": {
                "ContactName": p_name,
                "ContactPhoneNumber": p_ContactPhoneNumber,
                "Coordinates": "",
                "Country": "SA",
                "District": p_District,
                "PostalCode": "",
                "City": p_City,
                "AddressLine1": p_AddressLine1
                // ,
                // "AddressLine2": p_AddressLine2
            },
            "OrderNumber": "FirstOrder001", /// code 
            "DeclaredValue": value,
            "CODAmount": cashondelivery,
            "Parcels": pieces,
            "ShipDate": `${date}`,
            "ShipmentCurrency": "SAR",
            "SMSARetailID": "0",
            "WaybillType": "PDF",
            "Weight": weight,
            "WeightUnit": "KG",
            "ContentDescription": description,
            "VatPaid": true,
            "DutyPaid": false
        });

        const config = {
            method: 'post',
            url: 'https://ecomapis.smsaexpress.com/api/shipment/b2c/new',
            headers: {
                'Content-Type': 'application/json',
                'apikey': process.env.SMSA_API_KEY
            },
            data: data
        };
        const response = await axios(config)

        const order = await SmsaOrders.create({
            user: userId,
            company: "smsa",
            ordernumber: ordersNum + 1,
            data: response.data,
            paytype: paytype,
            price: totalShipPrice,
            createdate: new Date()
        })

        if (response.status !== 200) {
            order.status = 'failed'
            await order.save()
            return res.status(400).json({ msg: response.data })
        }
        response.data.waybills.forEach((a, i) => {
            base64.base64Decode(a.awbFile, `public/smsaAwb/${ordersNum + 1}-p${i + 1}.pdf`);
        })

        if (!cod) {
            user.wallet = user.wallet - totalShipPrice;
            await user.save()
        }

        res.status(200).json({ msg: "order created successfully", data: order })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            msg: err.message
        })
    }
}
exports.getSticker = async (req, res) => {
    const orderId = req.params.id;
    try {
        const order = await SmsaOrders.findById(orderId)

        let routes = [];
        order.data.waybills.forEach((w, i) => {
            routes.push(`/smsaAwb/${order.ordernumber}-p${i + 1}.pdf`);
        })

        res.status(200).json({ msg: "ok", data: routes })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            msg: err.message
        })
    }
}
exports.cancelOrder = async (req, res) => {
    let { orderId, userId } = req.body;
    const order = await SmsaOrders.findById(orderId)
    try {
        if (!order || order.user != userId) {
            return res.status(400).json({
                err: "order not found"
            })
        }
        const AWB = order.data.sawb
        console.log(AWB)

        const config = {
            method: 'post',
            url: `https://ecomapis.smsaexpress.com/api/c2b/cancel/${AWB}`,
            headers: {
                'Content-Type': 'application/json',
                'apikey': process.env.SMSA_API_KEY
            }
        };

        const response = await axios.request(config);
        if (response.data.success == true) {
            order.status = 'canceled'
            await order.save()

            return res.status(200).json({ data: response.data })
        } else {
            return res.status(400).json({
                data: response.data
            })
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({
            msg: err.message
        })
    }
}

exports.getUserOrders = (req, res) => {
    const userId = req.body.userId;

    SmsaOrders.find({ user: userId, status: { $ne: "failed" } })
        .then(order => {
            res.status(200).json({
                data: order
            })
        })
        .catch(err => {
            console.log(err.request)
        })
}

exports.edit = (req, res) => {
    const { status, userprice, userCodPrice, kgprice } = req.body;

    Smsa.findOne()
        .then(a => {
            a.status = status;
            a.userprice = userprice;
            a.kgprice = kgprice;
            a.codprice = userCodPrice
            return a.save()
        })
        .then(a => {
            res.status(200).json({
                msg: "ok", a
            })
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                msg: err.message
            })
        })
}