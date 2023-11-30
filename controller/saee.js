const axios = require("axios");
const User = require("../model/user");
const Saee = require("../model/companies/saee");
const SaeeOrder = require("../model/orders/saeeOrders");
const sendEmail = require("../modules/sendEmail");
const balanceAlertMailSubject = "Alert! Your wallet balance is less than 100 SAR."

exports.createUserOrder = async (req, res) => {
    const pickup = req.query.pickup || true // true (default) -> pickup order | false -> last mile
    const {
        p_name, p_city, p_mobile, p_streetaddress,
        c_name, c_city, c_mobile, c_streetaddress,
        weight, quantity, cod, description, userId } = req.body

    const totalShipPrice = res.locals.totalShipPrice;
    const cashondelivery = res.locals.codAmount;

    const user = await User.findById(userId);
    let ordersNum = await SaeeOrder.count();

    try {
        const paytype = cod ? "cod" : "cc";
        let data = {}, url = '';
        if (pickup) {
            url = 'https://corporate.saeex.com/deliveryrequest/newpickup'
            data = {
                secret: process.env.SAEE_KEY_P,
                cashonpickup: 0,
                cashondelivery,

                p_name, p_city, p_mobile, p_streetaddress,
                c_name, c_city, c_mobile, c_streetaddress,
                weight, quantity, description, cod,

                ordernumber: `${ordersNum + "/" + Date.now() + "gotex"}`,
                sendername: p_name,
                senderphone: p_mobile,
                senderaddress: p_streetaddress,
                sendercity: p_city,
                // sendercountry: "SA"
            }
        } else {
            url = 'https://corporate.saeex.com/deliveryrequest/new'
            data = {
                secret: process.env.SAEE_KEY_P,
                cashonpickup: 0,
                cashondelivery,

                name: p_name,
                city: p_city,
                mobile: p_mobile,
                streetaddress: p_streetaddress,
                weight, quantity, description, cod,

                ordernumber: `${ordersNum + "/" + Date.now() + "gotex"}`,
                sendername: p_name,
                senderphone: p_mobile,
                senderaddress: p_streetaddress,
                sendercity: p_city,
                // sendercountry: "SA"
            }
        }

        const config = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json;charset=utf-8' },
            url: url,
            data: data
        }
        const response = await axios(config)

        const order = await SaeeOrder.create({
            user: userId,
            company: "saee",
            ordernumber: `${ordersNum + "/" + Date.now() + "gotex"}`,
            data: response.data,
            paytype,
            price: totalShipPrice,
            createdate: new Date()
        })

        if (!response.data.success) {
            order.status = 'failed'
            await order.save()
            return res.status(400).json({ msg: response.data })
        }

        if (!cod) {
            user.wallet = user.wallet - totalShipPrice
            if (user.wallet <= 100 && !user.isSentBalanceAlert) {
                sendEmail(user.email, "", "", "/../views/balanceAlert.ejs", balanceAlertMailSubject)
                user.isSentBalanceAlert = true
                await user.save()
            }
            await user.save()
        }

        res.status(200).json({ msg: "order created", data: order })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            error: err.message
        })
    }
}
exports.getSticker = async (req, res) => {
    const orderId = req.params.id;

    SaeeOrder.findById(orderId)
        .then(o => {
            const data = { waybill: o.data.waybill }
            axios({
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'secret': `${process.env.SAEE_KEY_P}`
                },
                url: `https://corporate.saeex.com/deliveryrequest/printsticker/${o.data.waybill}`
            })
                .then(bill => {
                    res.status(200).json({
                        msg: "ok",
                        data: bill.data
                    })
                })
        })
        .catch(err => {
            console.log(err)
        })
}
exports.cancelOrder = async (req, res) => {
    let { orderId, userId } = req.body;
    const order = await SaeeOrder.findById(orderId);
    try {
        if (!order || order.user != userId) {
            return res.status(400).json({
                err: "order not found"
            })
        }
        let data = JSON.stringify({
            "waybill": order.data.waybill,
            "canceled_by": 1
        });
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://corporate.saeex.com/deliveryrequest/cancelpickup',
            headers: {
                'secret': process.env.SAEE_KEY_P,
                'Content-Type': 'application/json',
            },
            data: data
        };

        const saeeRes = await axios.request(config);
        if (saeeRes.data.success == true) {
            order.status = 'canceled'
            await order.save()

            return res.status(200).json({ data: saeeRes.data })
        } else {
            return res.status(400).json({
                data: saeeRes.data
            })
        }

    } catch (err) {
        console.log(err)
        res.status(500).json({
            msg: err.message
        })
    }
}

exports.getCities = (req, res) => {
    axios({
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'secret': `${process.env.SAEE_KEY_P}`
        },
        url: `https://corporate.saeex.com/deliveryrequest/getallcities`
    })
        .then(response => {
            res.status(200).json({
                data: response.data
            })
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        })
}
exports.getUserOrders = async (req, res) => {
    const userId = req.body.userId;
    SaeeOrder.find({ user: userId, status: { $ne: "failed" } })
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
        const saee = await Saee.findOne()

        saee.status = status;
        saee.userprice = userprice;
        saee.kgprice = kgprice;
        saee.codprice = userCodPrice
        await saee.save()

        res.status(200).json({ msg: "ok" })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            msg: err.message
        })
    }
}

exports.trackingOrderByNum = async (req, res) => {
    const { orderId, userId } = req.body;
    const order = await SaeeOrder.findById(orderId);
    const ordernumber = order.ordernumber.split('/')[1].split('gotex')[0]

    console.log(order.data.waybill)
    axios({
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'secret': `${process.env.SAEE_KEY_P}`
        },
        url: `https://corporate.saeex.com/tracking/ordernumber?ordernumber=${ordernumber}`,
        ordernumber: order.data.waybill
    })
        .then(response => {
            res.status(200).json({
                data: response.data
            })
        })
        .catch(err => {
            console.log(err)
        })
}