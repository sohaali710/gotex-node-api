const User = require("../model/user");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const ejs = require("ejs");
const bcrypt = require('bcrypt');
const salt = 10;

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
            res.status(400).json({ msg: "error this email is already used" })
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
        res.status(500).json({ msg: err.message })
    }
}
exports.marketerSignUp = async (req, res) => {
    const { name, password, email, mobile, address, location, code } = req.body;

    try {
        let cr = []
        if (req.files) {
            req.files.forEach(f => {
                cr.push(f.path)
            });
        }

        const isExist = await User.findOne({ email })
        if (isExist) {
            res.status(400).json({ msg: "error this email is already used" })
        }

        const hash = bcrypt.hashSync(password, salt);
        const user = await User.create({
            name: name,
            password: hash,
            email: email,
            mobile: mobile,
            address: address,
            location: location,
            verified: false,
            emailCode: genRandomString(4),
            roll: "marketer",
        })

        if (user) {
            sendEmail(user.email, user.emailCode, user._id, "/../views/emailTemp.ejs");
            res.status(200).json({ msg: "ok", user })
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({ msg: err.message })
    }
}
exports.logIn = async (req, res) => {
    const { email, password } = req.body

    try {
        const userDb = await User.findOne({ email })
        if (!userDb) {
            res.status(400).json({ msg: "wrong email or password" })
        }

        if (!bcrypt.compareSync(password, userDb.password)) {
            res.status(400).json({ msg: "wrong email or password" })
        }

        const user = {
            id: userDb._id,
            name: userDb.name,
            roll: userDb.roll,
            isCrProofed: userDb.isCrProofed,
            daftraId: userDb.daftraId
        }
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
            res.status(400).json({ msg: "error this user doesn't exist" })
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
            res.status(400).json({ msg: "error this user doesn't exist" })
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
            error: err
        })
    }
}
exports.setNewPassword = async (req, res) => {
    const { password, code } = req.body

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
            error: err
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

const genRandomString = (length) => {
    var chars = '0123456789';
    var charLength = chars.length;
    var result = '';
    for (var i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * charLength));
    }
    return result;
}