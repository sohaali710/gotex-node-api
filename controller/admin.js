const jwt = require("jsonwebtoken");
const User = require("../model/user");
const AnwanOrders = require("../model/orders/anwanOrders");
const AramexOrders = require("../model/orders/aramexOrders");
const GltOrders = require("../model/orders/gltOrders");
const ImileOrders = require("../model/orders/imileOrders");
const JtOrders = require("../model/orders/jtOrders");
const SaeeOrders = require("../model/orders/saeeOrders");
const SmsaOrders = require("../model/orders/smsaOrders");
const SplOrders = require("../model/orders/splOrders");
const Anwan = require("../model/companies/anwan");
const Aramex = require("../model/companies/aramex");
const Glt = require("../model/companies/glt");
const Imile = require("../model/companies/imile");
const Jt = require("../model/companies/jt");
const Saee = require("../model/companies/saee");
const Smsa = require("../model/companies/smsa");
const Spl = require("../model/companies/spl");
const paginate = require("../modules/paginate");


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
            msg: "server error",
            error: err.message
        })
    }
}

/**
 * @Desc : User CRUD
 */
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
        res.status(200).json({ results: users.length, data: { users } })
    } catch (err) {
        res.status(500).json({
            msg: "server error",
            error: err.message
        })
    }
}
exports.addWalletToUser = async (req, res) => {
    const { id, deposit } = req.body

    try {
        const user = await User.findById(id)
        if (!user) {
            return res.status(400).json({ msg: "This user doesn't exist" })
        }

        user.wallet = user.wallet + deposit;
        user.isSentBalanceAlert = false
        await user.save()

        res.status(200).json({ msg: "ok" })
    } catch (err) {
        res.status(500).json({
            msg: "server error",
            error: err.message
        })
    }
}
exports.proofCrForUser = async (req, res) => {
    const email = req.body.email;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: "Wrong email" })
        }

        user.isCrProofed = true;
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
exports.unProofCrForUser = async (req, res) => {
    const email = req.body.email;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: "Wrong email" })
        }

        user.isCrProofed = false;
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

/**
 * @Desc : Companies CRUD
 */
exports.getAllCompanies = async (req, res) => {
    try {
        const anwan = await Anwan.findOne();
        const aramex = await Aramex.findOne();
        const glt = await Glt.findOne();
        const imile = await Imile.findOne();
        const jt = await Jt.findOne();
        const saee = await Saee.findOne();
        const smsa = await Smsa.findOne();
        const spl = await Spl.findOne();

        let companies = [aramex, anwan, glt, imile, jt, saee, smsa, spl];
        res.status(200).json({ data: { companies } })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            msg: "server error",
            error: err.message
        })
    }
}
/**
 * @Desc : Orders CRUD
 */
exports.getAllOrders = async (req, res) => {
    try {
        const saeeOrders = await SaeeOrders.find().populate("user");
        const gltOrders = await GltOrders.find().populate("user");
        const aramexOrders = await AramexOrders.find().populate("user");
        const smsaOrders = await SmsaOrders.find().populate("user");
        const anwanOrders = await AnwanOrders.find().populate("user");
        const imileOrders = await ImileOrders.find().populate("user");
        const jtOrders = await JtOrders.find().populate("user");

        let orders = [...saeeOrders, ...gltOrders, ...aramexOrders, ...jtOrders, ...smsaOrders, ...anwanOrders, ...imileOrders];
        res.status(200).json({ data: { orders } })
    } catch (err) {
        console.log(err);
        res.status(500).json({
            msg: "server error",
            error: err.message
        })
    }
}

/**
 * @Desc :  Filter with company, paytype, billCode or keyword (user data -> name, email or mobile)
 *        + Filter by date
 *        + Pagination
 */
exports.allOrders = async (req, res) => {
    /** Pagination -> default: page=1, limit=30 (max number of items (orders) per page)*/
    let page = +req.query.page || 1
    const limit = +req.query.limit || 30
    const startDate = req.query.startDate || new Date('2000-01-01')
    const endDate = req.query.endDate || new Date()
    const { company, paytype = '', billCode = '', keyword = '' } = req.query

    try {
        const anwanOrders = AnwanOrders.find({
            paytype: { $regex: paytype, $options: 'i' },// $options: 'i' to make it case-insensitive (accept capital or small chars)
            "data.awb_no": { $regex: billCode, $options: 'i' },
            created_at: {
                $gte: startDate,
                $lte: endDate
            },
            status: { $ne: "failed" }
        }).populate({
            path: 'user',
            /**@Desc if users.name or user.email != keyword, it returns user=null */
            match: {
                $or: [
                    { name: { $regex: keyword, $options: 'i' } },
                    { email: { $regex: keyword, $options: 'i' } },
                    { mobile: { $regex: keyword, $options: 'i' } }
                ]
            }
        });
        const aramexOrders = AramexOrders.find({
            paytype: { $regex: paytype, $options: 'i' },
            "data.Shipments.ID": { $regex: billCode, $options: 'i' },
            created_at: {
                $gte: startDate,
                $lte: endDate
            },
            status: { $ne: "failed" }
        }).populate({
            path: 'user',
            match: {
                $or: [
                    { name: { $regex: keyword, $options: 'i' } },
                    { email: { $regex: keyword, $options: 'i' } },
                    { mobile: { $regex: keyword, $options: 'i' } }
                ]
            }
        });
        const imileOrders = ImileOrders.find({
            paytype: { $regex: paytype, $options: 'i' },
            "data.data.expressNo": { $regex: billCode, $options: 'i' },
            created_at: {
                $gte: startDate,
                $lte: endDate
            },
            status: { $ne: "failed" }
        }).populate({
            path: 'user',
            match: {
                $or: [
                    { name: { $regex: keyword, $options: 'i' } },
                    { email: { $regex: keyword, $options: 'i' } },
                    { mobile: { $regex: keyword, $options: 'i' } }
                ]
            }
        });
        const jtOrders = JtOrders.find({
            paytype: { $regex: paytype, $options: 'i' },
            "data.data.billCode": { $regex: billCode, $options: 'i' },
            created_at: {
                $gte: startDate,
                $lte: endDate
            },
            status: { $ne: "failed" }
        }).populate({
            path: 'user',
            match: {
                $or: [
                    { name: { $regex: keyword, $options: 'i' } },
                    { email: { $regex: keyword, $options: 'i' } },
                    { mobile: { $regex: keyword, $options: 'i' } }
                ]
            }
        });
        const saeeOrders = SaeeOrders.find({
            paytype: { $regex: paytype, $options: 'i' },
            "data.waybill": { $regex: billCode, $options: 'i' },
            created_at: {
                $gte: startDate,
                $lte: endDate
            },
            status: { $ne: "failed" }
        }).populate({
            path: 'user',
            match: {
                $or: [
                    { name: { $regex: keyword, $options: 'i' } },
                    { email: { $regex: keyword, $options: 'i' } },
                    { mobile: { $regex: keyword, $options: 'i' } }
                ]
            }
        });
        const smsaOrders = SmsaOrders.find({
            paytype: { $regex: paytype, $options: 'i' },
            "data.sawb": { $regex: billCode, $options: 'i' },
            created_at: {
                $gte: startDate,
                $lte: endDate
            },
            status: { $ne: "failed" }
        }).populate({
            path: 'user',
            match: {
                $or: [
                    { name: { $regex: keyword, $options: 'i' } },
                    { email: { $regex: keyword, $options: 'i' } },
                    { mobile: { $regex: keyword, $options: 'i' } }
                ]
            }
        });
        const splOrders = SplOrders.find({
            paytype: { $regex: paytype, $options: 'i' },
            "data.Items.Barcode": { $regex: billCode, $options: 'i' },
            created_at: {
                $gte: startDate,
                $lte: endDate
            },
            status: { $ne: "failed" }
        }).populate({
            path: 'user',
            match: {
                $or: [
                    { name: { $regex: keyword, $options: 'i' } },
                    { email: { $regex: keyword, $options: 'i' } },
                    { mobile: { $regex: keyword, $options: 'i' } }
                ]
            }
        });

        /** Filter by company */
        let orders = []
        switch (company) {
            case 'anwan':
                orders = await anwanOrders
                break;
            case 'aramex':
                orders = await aramexOrders
                break;
            case 'imile':
                orders = await imileOrders
                break;
            case 'jt':
                orders = await jtOrders
                break;
            case 'saee':
                orders = await saeeOrders
                break;
            case 'smsa':
                orders = await smsaOrders
                break;
            case 'spl':
                orders = await splOrders
                break;
            default:
                // Use promise.all to ensure that these promises are executed in parallel.
                const [anwanOrdersRes, aramexOrdersRes, imileOrdersRes, jtOrdersRes, saeeOrdersRes, smsaOrdersRes, splOrdersRes] = await Promise.all([anwanOrders, aramexOrders, imileOrders, jtOrders, saeeOrders, smsaOrders, splOrders]);
                orders = [...anwanOrdersRes, ...saeeOrdersRes, ...aramexOrdersRes, ...smsaOrdersRes, ...imileOrdersRes, ...jtOrdersRes, ...splOrdersRes];
                break;
        }

        if (keyword) {
            orders = orders.filter(order => order.user) // filter orders to remove user=null
        }

        const ordersPagination = paginate(orders, page, limit)
        res.status(200).json({ ...ordersPagination })
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: err.message
        })
    }
}