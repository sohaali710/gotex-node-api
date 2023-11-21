const axios = require("axios");
const cron = require('node-cron');
const User = require("../model/user");
const Imile = require("../model/companies/imile");
const ImileOrders = require("../model/orders/imileOrders");
const ImileClients = require("../model/clients/imileClients");

exports.createOrder = async (req, res) => {
    const { p_company,
        c_company, c_name, c_mobile, c_city, c_street, c_address, weight,
        cod, skuName, skuTotal, skuDetailList = [], userId } = req.body
    // const c_zipcode = req.bode.c_zipcode;

    let ordersNum = await ImileOrders.count();
    const imile = await Imile.findOne();
    const user = await User.findById(userId);
    const totalShipPrice = res.locals.totalShipPrice;
    const shipmentDate = Date.now();

    try {
        if (cod) {
            var codAmount = res.locals.codAmount;
            var PaymentType = "p";
            var paymentMethod = 100;
            var paytype = "cod"
        } else {
            var codAmount = 0;
            var PaymentType = "P";
            var paymentMethod = 200;
            var paytype = "cc"
        }

        let data = JSON.stringify({
            "customerId": process.env.imile_customerid,
            "sign": process.env.imile_sign,
            "accessToken": imile.token,
            "signMethod": "SimpleKey",
            "format": "json",
            "version": "1.0.0",
            "timestamp": 1648883951481,
            "timeZone": "+4",
            "param": {
                "orderCode": `gotex#${Date.now()}`,
                "orderType": "100",
                "consignor": p_company,
                "consignee": c_company,
                "consigneeContact": c_name,
                "consigneePhone": c_mobile,
                "consigneeCountry": "KSA",
                "consigneeProvince": "",
                "consigneeCity": c_city, // c_city
                "consigneeArea": "", //c_area
                "consigneeSuburb": "",
                "consigneeZipCode": "",
                "consigneeStreet": c_street,
                "consigneeExternalNo": "",
                "consigneeInternalNo": "",
                "consigneeAddress": c_address,
                "goodsValue": "",
                "collectingMoney": codAmount,
                "paymentMethod": paymentMethod,
                "totalCount": 1,
                "totalWeight": weight,
                "totalVolume": 0,
                "skuTotal": skuTotal,
                "skuName": skuName,
                "deliveryRequirements": "",
                "orderDescription": "",
                "buyerId": "",
                "platform": "",
                "isInsurance": 0,
                "pickDate": `2023-01-29`,
                "pickType": "0",
                "batterType": "Normal",
                "currency": "Local",
                "isSupportUnpack": 1,
                "consignorJoinFrom": "FC",
                "returnAddressInfo": {
                    "contactCompany": "gotex"
                },
                "skuDetailList": skuDetailList
            }
        });

        let config = {
            method: 'post',
            url: 'https://openapi.52imile.cn/client/order/createOrder',
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };
        const response = await axios(config)

        const order = await ImileOrders.create({
            user: userId,
            company: "imile",
            ordernumber: ordersNum + 2,
            data: response.data,
            paytype,
            price: totalShipPrice,
            createdate: new Date()
        })

        if (response.data.code != '200') {
            order.status = 'failed'
            await order.save()
            return res.status(400).json({ msg: response.data })
        }

        if (!cod) {
            user.wallet = user.wallet - totalShipPrice
            await user.save()
        }

        res.status(200).json({ data: order })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            error: err.message
        })
    }
}
exports.addClient = async (req, res) => {
    let { companyName, contacts, city, address, phone, email,
        backupPhone, attentions } = req.body;

    try {
        const imile = await Imile.findOne();

        let data = JSON.stringify({
            "customerId": process.env.imile_customerid,
            "sign": process.env.imile_sign,
            "accessToken": imile.token,
            "signMethod": "SimpleKey",
            "format": "json",
            "version": "1.0.0",
            "timestamp": "1647727143355",
            "timeZone": "+4",
            "param": {
                "companyName": companyName,
                "contacts": contacts,
                "country": "KSA",
                "city": city,
                "area": "",
                "address": address,
                "phone": phone,
                "email": "",
                "backupPhone": "",
                "attentions": attentions,
                "defaultOption": "0"
            }
        });

        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://openapi.52imile.cn/client/consignor/add',
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };

        const response = await axios(config);
        if (response.data.message !== 'success') {
            return res.status(400).json({ msg: response.data })
        }

        const newClient = await ImileClients.create({
            companyName,
            contacts,
            city,
            address,
            phone,
            email,
            backupPhone,
            attentions
        })

        res.status(200).json({ data: newClient })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            error: err.message
        })
    }
}
exports.getSticker = async (req, res) => {
    const orderId = req.params.id;

    try {
        const imile = await Imile.findOne();
        const order = await ImileOrders.findById(orderId)
        if (!order) {
            return res.status(400).json({ msg: 'Order not found' })
        }
        const orderCodeNo = order.data.data.expressNo
        console.log(orderCodeNo)

        const data = JSON.stringify({
            "customerId": process.env.imile_customerid,
            "sign": process.env.imile_sign,
            "accessToken": imile.token,
            "signMethod": "SimpleKey",
            "format": "json",
            "version": "1.0.0",
            "timestamp": 1648883951481,
            "timeZone": "+4",
            "param": {
                "customerId": process.env.imile_customerid,
                "orderCodeList": [
                    orderCodeNo
                ],
                "orderCodeType": 2
            }
        })

        const config = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            url: `https://openapi.52imile.cn/client/order/batchRePrintOrder`,
            data: data
        }

        const response = await axios(config)
        if (response.data.message !== 'success') {
            return res.status(400).json({ msg: response.data })
        }

        return res.status(200).redirect(response.data.data[0].label)
    } catch (err) {
        console.log(err)
        res.status(500).json({
            error: err.message
        })
    }
}
exports.cancelOrder = async (req, res) => {
    let { orderId, userId } = req.body;
    const imile = await Imile.findOne();
    const order = await ImileOrders.findById(orderId);

    try {
        if (!order || order.user != userId) {
            return res.status(400).json({
                err: "order not found"
            })
        }
        const waybillNo = order.data.data.expressNo

        const data = JSON.stringify({
            "customerId": process.env.imile_customerid,
            "sign": process.env.imile_sign,
            "accessToken": imile.token,
            "signMethod": "SimpleKey",
            "format": "json",
            "version": "1.0.0",
            "timestamp": 1648883951481,
            "timeZone": "+4",
            "param": {
                "waybillNo": waybillNo
            }
        })

        const config = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            url: `https://openapi.52imile.cn/client/order/deleteOrder`,
            data: data
        }

        const response = await axios(config)
        if (response.data.message !== 'success') {
            return res.status(400).json({ msg: response.data })
        }

        order.status = 'canceled'
        await order.save()
        return res.status(200).json({ data: response.data })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            msg: err.message
        })
    }
}

exports.getAllClients = (req, res) => {
    ImileClients.find()
        .then(c => {
            res.status(200).json({
                data: c
            })
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err.message
            })
        })
}
exports.getUserOrders = (req, res) => {
    const userId = req.body.userId;
    ImileOrders.find({ user: userId, status: { $ne: "failed" } })
        .then(o => {
            res.status(200).json({
                data: o
            })
        })
        .catch(err => {
            console.log(err.request)
        })
}

exports.edit = async (req, res) => {
    const { status, userprice, userCodPrice, kgprice } = req.body

    try {
        const imile = await Imile.findOne()

        imile.status = status;
        imile.userprice = userprice;
        imile.kgprice = kgprice;
        imile.codprice = userCodPrice
        await imile.save()

        res.status(200).json({ msg: "ok" })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            msg: err.message
        })
    }
}
/**************************************  */
cron.schedule('0 */2 * * *', async () => {
    try {
        const imile = await Imile.findOne();
        console.log('********')
        console.log(imile)
        let data = JSON.stringify({
            "customerId": process.env.imile_customerid,
            "sign": process.env.imile_sign,
            "signMethod": "SimpleKey",
            "format": "json",
            "version": "1.0.0",
            "timestamp": "1647727143355",
            "timeZone": "+4",
            "param": {
                "grantType": "clientCredential"
            }
        });

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://openapi.52imile.cn/auth/accessToken/grant',
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };
        const tokenRes = await axios(config);
        console.log('****')
        console.log(tokenRes.data.data.accessToken)
        if (tokenRes.data.code == '200') {
            imile.token = tokenRes.data.data.accessToken;
        }
        await imile.save();
        console.log(imile)
    } catch (err) {
        console.log(err)
        res.status(500).json({
            msg: err.message
        })
    }
});
