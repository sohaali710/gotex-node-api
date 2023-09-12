const axios = require("axios");
const User = require("../model/user");
const Daftra = require("../modules/daftra");
const Saee = require("../model/companies/saee");
const SaeeOrder = require("../model/orders/saeeOrders");


exports.createUserOrder = async (req, res) => {
    const {
        p_name, p_city, p_mobile, p_streetaddress,
        c_name, c_city, c_mobile, c_streetaddress, weight, quantity,
        cod, daftraid, description, userId } = req.body

    const totalShipPrice = res.locals.totalShipPrice;
    const cashondelivery = res.locals.codAmount;

    const user = await User.findById(userId);
    let ordersNum = await SaeeOrder.count();

    try {
        const paytype = cod ? "cod" : "cc";
        // const nameCode = markterCode ? `${p_name} (${markterCode})` : p_name;
        const nameCode = p_name;

        const data = {
            secret: process.env.SAEE_KEY_P,
            cashonpickup: 0,
            cashondelivery,

            p_name, p_city, p_mobile, p_streetaddress,
            c_name, c_city, c_mobile, c_streetaddress, weight, quantity,
            cod, daftraid, description,

            ordernumber: `${ordersNum + "/" + Date.now() + "gotex"}`,
            sendername: nameCode,
            senderphone: p_mobile,
            senderaddress: p_streetaddress,
            sendercity: p_city,
            // sendercountry: "SA"
        }
        console.log('*************')
        console.log(data)

        const response = await axios({
            method: 'POST',
            headers: { 'Content-Type': 'application/json;charset=utf-8' },
            url: 'https://k-w-h.com/deliveryrequest/newpickup',
            data: data
        })
        console.log('*************')
        console.log(response)

        if (!response.data.success) {
            return res.status(400).json({ msg: response.data })
        } else {
            user.wallet = cod ? user.wallet : (user.wallet - totalShipPrice);
            await user.save()

            // const invo = await Daftra.CreateInvo(daftraid, req.user.user.daftraid, description, paytype, totalShipPrice);
            const order = await SaeeOrder.create({
                user: userId,
                company: "saee",
                ordernumber: `${ordersNum + "/" + Date.now() + "gotex"}`,
                data: response.data,
                paytype,
                price: totalShipPrice,
                // marktercode,
                createdate: new Date(),
                // inovicedaftra: invo
            })

            res.status(200).json({ msg: "order created", data: { order } })
        }
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
            console.log('//////////////////////')
            console.log(o.data.waybill)
            axios({
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'secret': `${process.env.SAEE_KEY_P}`
                },
                url: `https://corporate.k-w-h.com/deliveryrequest/printsticker/WAYBILL`,
                waybill: o.data.waybill
            })
                /**production */
                // axios({
                //     method: 'GET',
                //     headers: {
                //         'Content-Type': 'application/json',
                //         'secret': `${process.env.SAEE_KEY_P}`
                //     },
                //     url: `https://corporate.k-w-h.com/deliveryrequest/printsticker/WAYBILL`
                // })
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


exports.getCities = (req, res) => {
    axios({
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'secret': `${process.env.SAEE_KEY_P}`
        },
        url: `https://corporate.k-w-h.com/deliveryrequest/getallcities`
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
    SaeeOrder.find({ user: userId })
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
    const { status, userprice, userCodPrice, marketerprice, mincodmarkteer, maxcodmarkteer, kgprice } = req.body;

    Saee.findOne()
        .then(s => {
            s.status = status;
            s.userprice = userprice;
            s.marketerprice = marketerprice;
            s.kgprice = kgprice;
            s.maxcodmarkteer = maxcodmarkteer;
            s.maxcodmarkteer = mincodmarkteer;
            s.codprice = userCodPrice
            return s.save()
        })
        .then(s => {
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
exports.trackingOrderByNum = async (req, res) => {
    const { orderId, userId } = req.body;
    const order = await SaeeOrder.findById(orderId);
    // const ordernumber = order.ordernumber.split('/')[1].split('gotex')[0]

    console.log(order.data.waybill)
    axios({
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'secret': `${process.env.SAEE_KEY_P}`
        },
        url: `https://corporate.k-w-h.com/tracking/ordernumber`,
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
            url: 'https://corporate.k-w-h.com/deliveryrequest/cancelpickup',
            headers: {
                'secret': process.env.SAEE_KEY_P,
                'Content-Type': 'application/json',
            },
            data: data
        };

        const saeeRes = await axios.request(config);
        if (saeeRes.data.success == true) {
            return res.status(200).json({
                data: saeeRes.data
            })
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