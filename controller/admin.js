const User = require("../model/user");
const jwt = require("jsonwebtoken");
const SmsaOrders = require("../model/orders/smsaOrders");
const AnwanOrders = require("../model/orders/anwanOrders");
const AramexOrders = require("../model/orders/aramexOrders");
const GltOrders = require("../model/orders/gltOrders");
const SaeeOrders = require("../model/orders/saeeOrders");
// const Saee = require("../model/companies/saee");
// const Smsa = require("../model/companies/smsa");
// const Anwan = require("../model/companies/anwan");
// const Aramex = require("../model/companies/aramex");
// const Glt = require("../model/companies/glt");


exports.logIn = (req, res) => {
    const { email, password } = req.body

    try {
        if (process.env.ADMINPASS == password) {
            const user = {
                id: 1,
                name: "admin",
                roll: "admin"
            }

            const token = jwt.sign({
                exp: Math.floor(Date.now() / 1000) + (60 * 60),
                data: { user },
            }, process.env.ACCESS_TOKEN);

            res.status(200).json({ msg: "ok", token })
        } else {
            res.status(400).json({
                msg: "wrong password or email"
            })
        }
    } catch (err) {
        res.status(500).json({
            msg: "Server error"
        })
    }
}

exports.getAllUsers = (req, res) => {
    User.find()
        .then(u => {
            res.status(200).json({
                data: u
            })
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                msg: err
            })
        })
}
exports.getAllOrders = async (req, res) => {
    try {
        const saeeOrders = await SaeeOrders.find().populate("user");
        const gltOrders = await GltOrders.find().populate("user");
        const aramexOrders = await AramexOrders.find().populate("user");
        const smsaOrders = await SmsaOrders.find().populate("user");
        const anwanOrders = await AnwanOrders.find().populate("user");
        let orders = [...saeeOrders, ...gltOrders, ...aramexOrders, ...smsaOrders, ...anwanOrders];
        res.status(200).json({
            data: orders
        })
    } catch (err) {
        console.log(err);
        res.status(500).json({
            msg: err
        })
    }

}
exports.addWalletToUser = (req, res) => {
    const deposit = req.body.deposit;
    const id = req.body.id;
    User.findById(id)
        .then(u => {
            u.wallet = u.wallet + deposit;
            return u.save()
        })
        .then(u => {
            res.status(200).json({
                msg: "ok"
            })
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                msg: err
            })
        })
}
exports.proofCrForUser = async (req, res) => {
    try {
        const email = req.body.email;
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(400).json({
                msg: "email is required"
            })
        }
        user.iscrproofed = true;
        await user.save()
        return res.status(200).json({
            msg: "ok"
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            msg: err
        })
    }
}
exports.unProofCrForUser = (req, res) => {
    const email = req.body.email;
    User.findOne({ email: email })
        .then(u => {
            if (!u) {
                return res.status(400).json({
                    msg: "erro email not found"
                })
            } else {
                u.iscrproofed = false;
                u.save()
                    .then(u => {
                        return res.status(200).json({
                            msg: "ok"
                        })
                    })
            }
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: "err"
            })
        })
}
