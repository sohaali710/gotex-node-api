const User = require("../model/user");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const ejs = require("ejs");
const bcrypt = require('bcrypt');
const salt = 10;
const axios = require('axios');
const paymentOrder = require("../model/payment/orders");
const user = require("../model/user");
/**
 * @Desc : User Registration
 */
exports.signUp = async (req, res) => {
    const { name, password, email, mobile, address, location } = req.body;

    try {
        let cr = []
        if (req.files) {
            req.files.forEach(f => {
                cr.push(f.path)
            });
        }

        const isExist = await User.findOne({ email })
        if (isExist) {
            return res.status(400).json({ msg: "error this email is already used" })
        }

        const hash = bcrypt.hashSync(password, salt);
        const user = await User.create({
            name,
            password: hash,
            email,
            mobile,
            address,
            location,
            verified: false,
            emailCode: genRandomString(4),
            roll: "user",
            cr
        })

        if (user) {
            sendEmail(user.email, user.emailCode, user._id, "/../views/emailTemp.ejs");
            res.status(200).json({ msg: "ok", user })
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({
            msg: "server error",
            error: err.message
        })
    }
}
exports.logIn = async (req, res) => {
    const { email, password } = req.body

    try {
        const userDb = await User.findOne({ email })
        if (!userDb) {
            return res.status(400).json({ msg: "wrong email or password" })
        }

        if (!bcrypt.compareSync(password, userDb.password)) {
            return res.status(400).json({ msg: "wrong email or password" })
        }

        const user = {
            id: userDb._id,
            name: userDb.name,
            roll: userDb.roll,
            isCrProofed: userDb.isCrProofed,
            daftraId: userDb.daftraId
        }
        console.log(user)
        const token = jwt.sign({
            exp: Math.floor(Date.now() / 1000) + (60 * 60),
            data: { user },
        }, process.env.ACCESS_TOKEN);

        res.status(200).json({ msg: "ok", token })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            msg: "server error",
            error: err.message
        })
    }
}


exports.activateUser = async (req, res) => {
    const { id, code } = req.params

    try {
        const user = await User.findById(id)
        if (!user) {
            return res.status(400).json({ msg: "error this user doesn't exist" })
        }

        if (user.emailCode !== code) {
            return res.status(400).json({ msg: "not found" })
        }

        user.verified = true;
        await user.save()
        return res.status(200).redirect("https://gotex.vercel.app/")
    } catch (err) {
        console.log(err)
        res.status(500).json({
            msg: "server error",
            error: err.message
        })
    }
}
exports.reSendActivateCode = async (req, res) => {
    const id = req.user.user.id;

    try {
        const user = await User.findById(id)
        if (!user) {
            return res.status(400).json({ msg: "error this user doesn't exist" })
        }

        user.emailCode = genRandomString(4);
        await user.save()

        sendEmail(user.email, user.emailCode, user._id, "/../views/emailTemp.ejs");
        res.status(200).json({ msg: "email send" })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            msg: "server error",
            error: err.message
        })
    }
}

/**
 * @Desc : Forget password [send email with verifying code + set new password ]
 */
exports.forgetPasswordEmail = async (req, res) => {
    const email = req.body.email;

    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(400).json({ msg: "user email not found" })
        }

        user.emailCode = genRandomString(4);
        await user.save();

        sendEmail(user.email, user.emailCode, user._id, "/../views/password_mail.ejs");
        return res.status(200).json({ msg: "the email has been sent" })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            msg: "server error",
            error: err.message
        })
    }
}
exports.setNewPassword = async (req, res) => {
    const { password } = req.body
    const { code } = req.params

    try {
        const user = await User.findOne({ emailCode: code });
        if (!user) {
            return res.status(400).json({ msg: "wrong code" })
        }

        const hash = bcrypt.hashSync(password, salt);
        user.password = hash;
        user.emailCode = "0000"
        await user.save()

        res.status(200).json({ msg: "ok" })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            msg: "server error",
            error: err.message
        })
    }
}

exports.getUserBalance = async (req, res) => {
    const id = req.user.user.id;

    try {
        const user = await User.findById(id)
        if (!user) {
            res.status(400).json({ msg: "error this user doesn't exist" })
        }

        res.status(200).json({ data: { balance: user.wallet } })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            msg: "server error",
            error: err.message
        })
    }
}
exports.addBalance = async (req, res) => {
    const amount = req.body.amount;
    const uId = req.user.user.id;
    const code = genRandomString(10)
    try {
        let data = JSON.stringify({
            "method": "create",
            "store": process.env.TELR_STORE_ID,
            "authkey": process.env.TELR_AUTH_KEY,
            "framed": 0,
            "order": {
                "cartid": `g-${Date.now()}`,
                "test": "1",
                "amount": amount,
                "currency": "SAR",
                "description": "test payment"
            },
            "return": {
                "authorised": `http://localhost:3000/user/checkpayment/authorised/${uId}/${code}`,
                "declined": `http://localhost:3000/user/checkpayment/declined/${uId}/${code}`,
                "cancelled": `http://localhost:3000/user/checkpayment/cancelled/${uId}/${code}`
            }
        });
        let config = {
            method: 'post',
            url: 'https://secure.telr.com/gateway/order.json',
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };
        const telrRes = await axios(config);
        const nPaymentOrder = new paymentOrder({
            user: uId,
            data: telrRes.data,
            amount: amount,
            code: code,
            status: "pinding"
        })
        await nPaymentOrder.save();
        res.status(200).json({
            data: telrRes.data
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        })
    }
}
exports.checkPaymentOrder = async (req, res) => {
    const uId = req.params.uId;
    const code = req.params.code;
    const status = req.params.status;
    const order = await paymentOrder.findOne({ code: code });
    const user = await User.findById(uId);
    try {
        if (!order) {
            return res.status(400).json({
                data: "failed"
            })
        }
        if (status != "authorised") {
            order.status = status;
            await order.save()
            return res.status(400).json({
                data: status
            })
        }
        if (status == "authorised") {
            user.wallet = user.wallet + order.amount
        }
        order.status = status;
        order.code = genRandomString(10);
        await user.save()
        await order.save()
        var data = {
            amount: order.amount,
            userBalance: user.wallet
        }
        res.status(200).json({
            data: data
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        })
    }
}
exports.getAllPaymentOrders = async (req, res) => {
    const uId = req.user.user.id;
    const orders = await paymentOrder.find({ user: uId });
    try {
        res.status(200).json({
            data: orders
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        })
    }
}
exports.generateApiKeyForTest = async (req, res) => {
    const uId = req.user.user.id;
    const user = await User.findById(uId);
    try {
        const key = genRandomKey(150);
        user.apikey.test = key;
        user.apistatus.test = true;
        await user.save();
        res.status(200).json({
            data: user.apikey.test
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        })
    }
}
/**
 * @Desc : Verify email methods
 */
const sendEmail = async (email, text, id, temp) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.hostinger.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAILPASSWORD,
            },
        });

        ejs.renderFile(__dirname + temp, { code: text, id: id }, async function (err, data) {
            if (err) {
                console.log(err);
            } else {
                transporter.sendMail({
                    from: {
                        name: 'Gotex',
                        address: process.env.EMAIL
                    },
                    to: email,
                    subject: "Verify your gotex account",
                    html: data,
                }, (error, result) => {
                    if (error) return console.error(error);
                    return console.log(result);
                });
                console.log("email sent successfully");
            }
        })
    } catch (error) {
        console.log("email not sent");
        console.log(error);
    }
};
//************************************** */
const genRandomString = (length) => {
    var chars = '0123456789';
    var charLength = chars.length;
    var result = '';
    for (var i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * charLength));
    }
    return result;
}
const genRandomKey = (length) => {
    var chars = '!@#$%0123456789qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM';
    var charLength = chars.length;
    var result = '';
    for (var i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * charLength));
    }
    return result;
}