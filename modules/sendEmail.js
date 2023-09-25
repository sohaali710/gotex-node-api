const nodemailer = require("nodemailer");
const ejs = require("ejs");

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

module.exports = sendEmail