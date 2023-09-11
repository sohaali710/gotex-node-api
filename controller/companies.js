// const User = require("../model/user");
// const jwt = require("jsonwebtoken");
// const SmsaOrders = require("../model/orders/smsaOrders");
// const AnwanOrders = require("../model/orders/anwanOrders");
// const AramexOrders = require("../model/orders/aramexOrders");
// const GltOrders = require("../model/orders/gltOrders");
// const ImileOrders = require("../model/orders/imileOrders");
// const SaeeOrders = require("../model/orders/saeeOrders");
// const Saee = require("../model/companies/saee");
// const Smsa = require("../model/companies/smsa");
// const Anwan = require("../model/companies/anwan");
// const Aramex = require("../model/companies/aramex");
// const Glt = require("../model/companies/glt");
// const Imile = require("../model/companies/imile");


// /**
//  * @Desc : Companies CRUD
//  */
// exports.getAllCompanies = async (req, res) => {
//     try {
//         const saee = await Saee.findOne();
//         const glt = await Glt.findOne();
//         const aramex = await Aramex.findOne();
//         const smsa = await Smsa.findOne();
//         const anwan = await Anwan.findOne();
//         const imile = await Imile.findOne();

//         let companies = [saee, glt, smsa, aramex, anwan, imile];
//         res.status(200).json({ data: { companies } })
//     } catch (err) {
//         console.log(err)
//         res.status(500).json({
//             msg: "server error",
//             error: err.message
//         })
//     }
// }
// /**
//  * @Desc : Orders CRUD
//  */
// exports.getAllOrders = async (req, res) => {
//     try {
//         const saeeOrders = await SaeeOrders.find().populate("user");
//         const gltOrders = await GltOrders.find().populate("user");
//         const aramexOrders = await AramexOrders.find().populate("user");
//         const smsaOrders = await SmsaOrders.find().populate("user");
//         const anwanOrders = await AnwanOrders.find().populate("user");
//         const imileOrders = await ImileOrders.find().populate("user");

//         let orders = [...saeeOrders, ...gltOrders, ...aramexOrders, ...smsaOrders, ...anwanOrders, ...imileOrders];
//         res.status(200).json({ data: { orders } })
//     } catch (err) {
//         console.log(err);
//         res.status(500).json({
//             msg: "server error",
//             error: err.message
//         })
//     }

// }
