const axios = require("axios");
const User = require("../model/user");
const Jt = require("../model/companies/jt");
const JtOrders = require("../model/orders/jtOrders");
var crypto = require('crypto');
const qs = require('qs');
const fs = require("fs");
const base64 = require('base64topdf');
const sendEmail = require("../modules/sendEmail");
const balanceAlertMailSubject = "Alert! Your wallet balance is less than 100 SAR."

exports.createUserOrder = async (req, res) => {
    let { re_address, re_city, re_mobile, re_name, re_prov,
        s_address, s_city, s_mobile, s_name, s_prov, description,
        weight, goodsType, totalQuantity, items = [], cod, userId } = req.body;

    try {
        const user = await User.findById(userId);
        let ordersNum = await JtOrders.count();

        const totalShipPrice = res.locals.totalShipPrice;
        if (cod) {
            var BookingMode = "COD"
            var codValue = res.locals.codAmount;;
            var paytype = "cod";
        } else {
            var BookingMode = "CC"
            var codValue = 0;
            var paytype = "cc";
        }

        const bizContent = `{
        "customerCode":"${process.env.jt_customer_code}",
        "digest":"${process.env.jt_body_digest}",
        "serviceType":"01",
        "orderType":"2",
        "deliveryType":"04",
        "countryCode":"KSA",
        "receiver":{
           "address":"${re_address}",
           "street":"",
           "city":"${re_city}",
           "mobile":"${re_mobile}",
           "mailBox":"",
           "phone":"",
           "countryCode":"KSA",
           "name":"${re_name}",
           "company":" ",
           "postCode":"",
           "prov":"${re_prov}"
        },
        "expressType":"EZKSA",
        "length":0,
        "weight":${weight},
        "remark":"${description}",
        "txlogisticId":"${1695119354337}Gotex",
        "goodsType":"${goodsType}",
        "priceCurrency":"SAR",
        "totalQuantity":${totalQuantity},
        "sender":{
           "address":"${s_address}",
           "street":"",
           "city":"${s_city}",
           "mobile":"${s_mobile}",
           "mailBox":"",
           "phone":"",
           "countryCode":"KSA",
           "name":"${s_name}",
           "company":"",
           "postCode":"",
           "prov":"${s_prov}"
        },
        "itemsValue":${codValue},
        "offerFee":0,
        "items":${JSON.stringify(items)},
        "operateType":1,
        "payType":"PP_PM",
        "isUnpackEnabled":0
     }`;

        let data = qs.stringify({ bizContent });
        let myText = bizContent + process.env.jt_privte_key;
        var md5Hash = crypto.createHash('md5').update(myText).digest('base64');

        let config = {
            method: 'post',
            url: 'https://demoopenapi.jtjms-sa.com/webopenplatformapi/api/order/addOrder?uuid=7a73e66f9b9c42b18d986f581e6f931e',
            headers: {
                'apiAccount': process.env.jt_api_account,
                'digest': md5Hash,
                'timestamp': '1638428570653',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: data
        };
        const response = await axios(config);

        const order = await JtOrders.create({
            user: userId,
            company: "jt",
            ordernumber: ordersNum + 2,
            paytype: paytype,
            data: response.data,
            price: totalShipPrice,
            codPrice: res.locals.codAmount,
            created_at: new Date()
        })

        if (response.data.code != 1) {
            order.status = 'failed'
            await order.save()
            return res.status(400).json({ msg: response.data })
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

        return res.status(200).json({ data: order })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: error.message
        })
    }
}
exports.getSticker = async (req, res) => {
    const orderId = req.params.id;
    const order = await JtOrders.findById(orderId);
    const billCode = order.data.data.billCode;

    try {
        const bizContent = `{
            "customerCode":"${process.env.jt_customer_code}",
            "digest":"${process.env.jt_body_digest}",
            "billCode":"${billCode}"
         }`;
        let myText = bizContent + process.env.jt_privte_key;
        var md5Hash = crypto.createHash('md5').update(myText).digest('base64');
        let data = qs.stringify({
            bizContent: bizContent
        });
        let config = {
            method: 'post',
            url: 'https://demoopenapi.jtjms-sa.com/webopenplatformapi/api/order/printOrder?uuid=7a73e66f9b9c42b18d986f581e6f931e',
            headers: {
                'apiAccount': process.env.jt_api_account,
                'digest': `${md5Hash}`,
                'timestamp': '1638428570653',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            responseType: 'arraybuffer',
            data: data
        };
        const response = await axios(config);
        base64.base64Decode(response.data, `public/jtAwb/${orderId}.pdf`)
        res.status(200).json({
            msg: "ok",
            data: `/jtAwb/${orderId}.pdf`
        })
        setTimeout(() => { fs.unlink(`public/jtAwb/${orderId}.pdf`, () => { }) }, 30 * 60 * 1000);
    } catch (error) {
        console.log(error)
        res.status(500).json({
            error: error.message
        })
    }
}
exports.cancelOrder = async (req, res) => {
    let { orderId, userId } = req.body;
    const order = await JtOrders.findById(orderId)
    try {
        if (!order || order.user != userId) {
            return res.status(400).json({
                err: "order not found"
            })
        }
        const txlogisticId = order.data.data.txlogisticId
        const billCode = order.data.data.billCode

        const bizContent = `{
            "customerCode":"${process.env.jt_customer_code}",
            "digest":"${process.env.jt_body_digest}",
            "orderType":"2",
            "txlogisticId":"${txlogisticId}",
            "reason":"We no longer needs this order.",
            "billCode":"${billCode}"
         }`;

        let data = qs.stringify({ bizContent });
        let myText = bizContent + process.env.jt_privte_key;
        var md5Hash = crypto.createHash('md5').update(myText).digest('base64');

        let config = {
            method: 'post',
            url: 'https://demoopenapi.jtjms-sa.com/webopenplatformapi/api/order/cancelOrder?uuid=7a73e66f9b9c42b18d986f581e6f931e',
            headers: {
                'apiAccount': process.env.jt_api_account,
                'digest': md5Hash,
                'timestamp': '1638428570653',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: data
        };

        const response = await axios(config);
        if (response.data.code != 1) {
            return res.status(400).json({ data: response.data })
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

exports.getUserOrders = (req, res) => {
    const userId = req.body.userId;

    JtOrders.find({ user: userId, status: { $ne: "failed" } })
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

    Jt.findOne()
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