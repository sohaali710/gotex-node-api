const axios = require("axios");
const User = require("../model/user");
const Glt = require("../model/companies/glt");
const GltOrder = require("../model/orders/gltOrders");
const qs = require('qs');
const fs = require('fs');
const base64 = require('base64topdf');
const PDFDocument = require('pdfkit');

exports.createUserOrder = async (req, res) => {
    let ordersNum = await GltOrder.count();
    const user = await User.findById(req.user.user.id);
    const totalShipPrice = res.locals.totalShipPrice;
    /************************** */
    const pieces = req.body.pieces;
    const desc = req.body.description;
    const comment = req.body.clintComment;
    const value = req.body.value;
    const weight = req.body.weight;
    /*************************** */
    const s_address = req.body.s_address;
    const s_city = req.body.s_city;
    const s_mobile = req.body.s_mobile;
    const sender = req.body.s_name;
    /************************* */
    const c_name = req.body.c_name;
    const c_address = req.body.c_address;
    const c_areaName = req.body.c_areaName;
    const c_city = req.body.c_city;
    const c_mobile = req.body.c_mobile;
    const markterCode = req.body.markterCode;
    const clintid = req.body.clintid;
    /**************************** */
    const cod = req.body.cod;
    if (cod) {
        var paymentType = "COD";
        var codAmount = res.locals.codAmount;
        var paytype = "cod";
    } else {
        var paymentType = "CC";
        var codAmount = null;
        var paytype = "cc";
    }
    if (markterCode) {
        var nameCode = `${sender} (${markterCode})`;
    } else {
        var nameCode = sender;
    }
    let data = {
        orders: [
            {
                referenceNumber: ordersNum + Date.now() + "gotex",
                pieces: pieces,
                description: desc,
                codAmount: codAmount,
                paymentType: paymentType,
                clintComment: comment,
                value: value,
                senderInformation: {
                    address: s_address,
                    city: {
                        name: s_city
                    },
                    contactNumber: s_mobile
                },
                customer: {
                    name: c_name,
                    customerAddresses: {
                        address: c_address,
                        areaName: c_areaName,
                        city: {
                            name: c_city
                        },
                    },
                    mobile1: c_mobile
                },
                sender: nameCode,
                weight: weight
            },
        ]
    }
    axios({
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': process.env.GLT_TOKEN,
        },
        url: 'https://devapi.gltmena.com/api/create/order',
        data: data
    })
        .then(response => {
            return response.data.data
        })
        .then(data => {
            let result = data.orders[0];
            if (result.status == 'fail') {
                res.status(400).json({
                    msg: result.msg
                })
            } else {
                const newOrder = new GltOrder({
                    user: req.user.user.id,
                    company: "glt",
                    ordernumber: ordersNum + 1,
                    paytype: paytype,
                    data: result,
                    price: totalShipPrice,
                    marktercode: markterCode,
                    createdate: new Date(),
                    invoice: ""
                })
                return newOrder.save();
            }
        })
        .then(async o => {
            if (clintid) {
                const clint = await Clint.findById(clintid);
                const co = {
                    company: "glt",
                    id: o._id
                }
                clint.wallet = clint.wallet - totalShipPrice;
                clint.orders.push(co);
                await clint.save();
            }
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
exports.getSticker = async (req, res) => {
    const orderId = req.params.id;
    GltOrder.findById(orderId)
        .then(o => {
            var data = qs.stringify({
                'orderid': o.data.orderTrackingNumber
            });
            var config = {
                method: 'post',
                url: 'https://devapi.gltmena.com/api/get/awb',
                headers: {
                    'Authorization': process.env.GLT_TOKEN,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                responseType: 'arraybuffer',
                data: data
            };
            axios(config)
                .then(response => {
                    base64.base64Decode(response.data, `public/gltAwb/${orderId}.pdf`)
                    res.status(200).json({
                        msg: "ok",
                        data: `/gltAwb/${orderId}.pdf`
                    })
                    setTimeout(() => { fs.unlink(`public/gltAwb/${orderId}.pdf`, () => { }) }, 30 * 60 * 1000);
                })
        })
        .catch(err => {
            console.log(err)
            res.status(5000).json({
                msg: err
            })
        })
}

exports.getAllCities = (req, res) => {
    let data = {
        "id": 39
    }
    axios({
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': process.env.GLT_TOKEN,
        },
        url: 'https://devapi.gltmena.com/api/get/all/cities',
        data: data
    })
        .then(response => {
            res.status(200).json({
                data: response.data
            })
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                msg: err
            })
        })
}
exports.getUserOrders = async (req, res) => {
    const userId = req.user.user.id;
    GltOrder.find({ user: userId })
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
    Glt.findOne()
        .then(g => {
            g.status = status;
            g.userprice = userprice;
            g.marketerprice = marketerprice;
            g.kgprice = kgprice;
            g.maxcodmarkteer = maxcodmarkteer;
            g.mincodmarkteer = mincodmarkteer;
            g.codprice = userCodPrice
            return g.save()
        })
        .then(g => {
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