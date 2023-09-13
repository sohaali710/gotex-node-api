const axios = require("axios");
const cron = require('node-cron');
const User = require("../model/user");
const Imile = require("../model/companies/imile");
const ImileOrders = require("../model/orders/imileOrders");
const ImileClients = require("../model/clients/imileClients");
const Daftra = require("../modules/daftra");

exports.createOrder = async (req, res) => {
    const { p_company, c_company, c_name, c_mobile, c_city, c_area, c_street, c_address,
        markterCode, desc, cod, goodsValue, skuName, skuDetailList, weight, daftraid,
        userId } = req.body
    // const c_zipcode = req.bode.c_zipcode;

    let ordersNum = await ImileOrders.count();
    const imile = await Imile.findOne();
    const user = await User.findById(userId);
    const totalShipPrice = res.locals.totalShipPrice;
    const shipmentDate = Date.now();
    const token = Imile.token;

    try {
        if (cod) {
            const codAmount = res.locals.codAmount;
            const PaymentType = "p";
            const paymentMethod = 100;
        } else {
            const codAmount = 0;
            const PaymentType = "P";
            const paymentMethod = 200;
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
                "goodsValue": goodsValue,
                "collectingMoney": codAmount,
                "paymentMethod": paymentMethod,
                "totalCount": 1,
                "totalWeight": weight,
                "totalVolume": 0,
                "skuTotal": skuDetailList.length,
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

        const response = axios(config)
        if (response.data.code != '200') {
            res.status(400).json({
                msg: response.data
            })
        } else {
            const paytype = cod ? "cod" : "cc";
            user.wallet = cod ? user.wallet : user.wallet - totalShipPrice;
            await user.save()

            const order = new ImileOrders({
                user: userId,
                company: "imile",
                ordernumber: ordersNum + 2,
                data: response.data,
                paytype,
                price: totalShipPrice,
                createdate: new Date()
            })

            res.status(200).json({ data: { order } })
        }
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
        console.log('imile.token')
        console.log(imile.token)
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
    const orderCodeNo = req.params.orderCodeNo;

    try {
        const order = await ImileOrders.findById(orderCodeNo)
        if (!order) {
            return res.send(400).json({ msg: 'Order not found' })
        }

        const data = JSON.stringify({
            "customerId": "C21018568",
            "sign": "MIICdgIBADANBgkqhkiG9w0BAQEFAASCAmAwggJcAgEAAoGBAJCsjrUxRgqrTDMr",
            "accessToken": "7c1155ae-aca6-42c0-8df6-7409c434b3ca",
            "signMethod": "SimpleKey",
            "format": "json",
            "version": "1.0.0",
            "timestamp": 1648883951481,
            "timeZone": "+4",
            "param": {
                "customerId": "C2102224",
                "orderCodeList": [
                    orderCodeNo
                ],
                "orderCodeType": 2
            }
        })

        const config = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'secret': `${process.env.SAEE_KEY_P}`
            },
            url: `https://openapi.52imile.cn/client/order/batchRePrintOrder`,
            data
        }

        const response = await axios(config)
        if (response.data.message !== 'success') {
            return res.status(400).json({ msg: response.data })
        }

        res.status(200).json({ msg: "ok", data: bill.data })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            error: err.message
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
    ImileOrders.find({ user: userId })
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
    const marketerprice = req.body.marketerprice;
    const mincodmarkteer = req.body.mincodmarkteer;
    const maxcodmarkteer = req.body.maxcodmarkteer;
    const kgprice = req.body.kgprice;
    Imile.findOne()
        .then(a => {
            console.log(a)
            a.status = status;
            a.userprice = userprice;
            a.marketerprice = marketerprice;
            a.kgprice = kgprice;
            a.maxcodmarkteer = maxcodmarkteer;
            a.mincodmarkteer = mincodmarkteer;
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
