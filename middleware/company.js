const User = require("../model/user");
const Aramex = require("../model/companies/aramex");
const Glt = require("../model/companies/glt");
const Saee = require("../model/companies/saee");
const Smsa = require("../model/companies/smsa");
const Anwan = require("../model/companies/anwan");
const Spl = require("../model/companies/spl");
const Imile = require("../model/companies/imile");
const Jt = require("../model/companies/jt");

exports.saeeCheck = async (req, res, next) => {
    const id = req.body.userId;
    const roll = "user";
    const { cod, weight } = req.body; // change cod to number
    let shipmentValue = req.body.shipmentValue; // new number must

    try {
        const user = await User.findById(id);
        const saee = await Saee.findOne();
        console.log(user)
        let weightPrice = weight <= 15 ? 0 : ((weight - 15) * saee.kgprice);
        let shipPrice = 0

        if (cod) {
            if (!shipmentValue) shipmentValue = 0;

            if (roll == "user") {
                shipPrice = saee.codprice;
            } else {
                if (cod > saee.maxcodmarkteer) {
                    return res.status(400).json({ msg: "cod price is grater than your limit" })
                }
                if (cod < saee.mincodmarkteer) {
                    return res.status(400).json({ msg: "cod price is less than your limit" })
                }
                shipPrice = cod;
            }
            const codAmount = shipPrice + weightPrice + shipmentValue; // 10 + (25 - 15)22 + 100
            res.locals.codAmount = codAmount;
            res.locals.totalShipPrice = shipPrice + weightPrice;
            next()
        } else {
            if (roll == "user") {
                shipPrice = saee.userprice;
            } else {
                shipPrice = saee.marketerprice;
            }

            if (user.wallet < (shipPrice + weightPrice)) {
                return res.status(400).json({ msg: "Your wallet balance is not enough to make the shipment" })
            }
            res.locals.codAmount = 0;
            res.locals.totalShipPrice = shipPrice + weightPrice;
            next()
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({
            error: err.message
        })
    }
}
exports.gltCheck = async (req, res, next) => {
    try {
        const cod = req.body.cod; // change to number
        const userId = req.user.user.id;
        const userRoll = req.user.user.roll;
        const weight = req.body.weight;
        let shipmentValue = req.body.shipmentValue; // new number must
        /*********************************************** */
        const glt = await Glt.findOne();
        const user = await User.findById(userId);
        /*********************************************** */
        if (weight <= 15) {
            let weightPrice = 0;
        } else {
            let weightPrice = (weight - 15) * glt.kgprice;
        }
        /*********************************************** */
        if (cod) {
            if (!shipmentValue) {
                shipmentValue = 0
            }
            if (userRoll == "user") {
                if (user.inv) {
                    let codPrice = user.inv.companies[1].cod;
                    let shipPrice = codPrice;
                } else {
                    let shipPrice = glt.codprice;
                }
            } else {
                if (cod > glt.maxcodmarkteer) {
                    return res.status(400).json({
                        msg: "cod price is grater than your limit"
                    })
                }
                if (cod < glt.mincodmarkteer) {
                    return res.status(400).json({
                        msg: "cod price is less than your limit"
                    })
                }
                let shipPrice = cod;
            }
            const codAmount = shipPrice + weightPrice + shipmentValue; // 10 + (25 - 15)22 + 100
            res.locals.codAmount = codAmount;
            res.locals.totalShipPrice = shipPrice + weightPrice;
            next()
        } else {
            if (userRoll == "user") {
                if (user.inv) {
                    let onlinePrice = user.inv.companies[1].onlinePayment;
                    let shipPrice = onlinePrice;
                } else {
                    let shipPrice = glt.userprice;
                }
            } else {
                let shipPrice = glt.marketerprice;
            }
            if (user.wallet < (shipPrice + weightPrice)) {
                return res.status(400).json({
                    msg: "Your wallet balance is not enough to make the shipment"
                })
            }
            res.locals.codAmount = 0;
            res.locals.totalShipPrice = shipPrice + weightPrice;
            next()
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({
            error: err.message
        })
    }
}
exports.aramexCheck = async (req, res, next) => {
    try {
        const cod = req.body.cod; // change to number
        const userId = req.user.user.id;
        const userRoll = req.user.user.roll;
        const weight = req.body.weight;
        let shipmentValue = req.body.shipmentValue; // new number must
        /*********************************************** */
        const aramex = await Aramex.findOne();
        const user = await User.findById(userId);
        /*********************************************** */
        if (weight <= 15) {
            let weightPrice = 0;
        } else {
            let weightPrice = (weight - 15) * aramex.kgprice;
        }
        /*********************************************** */
        if (cod) {
            if (!shipmentValue) {
                shipmentValue = 0
            }
            if (userRoll == "user") {
                if (user.inv) {
                    let codPrice = user.inv.companies[3].cod;
                    let shipPrice = codPrice;
                } else {
                    let shipPrice = aramex.codprice;
                }
            } else {
                if (cod > aramex.maxcodmarkteer) {
                    return res.status(400).json({
                        msg: "cod price is grater than your limit"
                    })
                }
                if (cod < aramex.mincodmarkteer) {
                    return res.status(400).json({
                        msg: "cod price is less than your limit"
                    })
                }
                let shipPrice = cod;
            }
            const codAmount = shipPrice + weightPrice + shipmentValue; // 10 + (25 - 15)22 + 100
            res.locals.codAmount = codAmount;
            res.locals.totalShipPrice = shipPrice + weightPrice;
            next()
        } else {
            if (userRoll == "user") {
                if (user.inv) {
                    let onlinePrice = user.inv.companies[3].onlinePayment;
                    let shipPrice = onlinePrice;
                } else {
                    let shipPrice = aramex.userprice;
                }
            } else {
                let shipPrice = aramex.marketerprice;
            }
            if (user.wallet < (shipPrice + weightPrice)) {
                return res.status(400).json({
                    msg: "Your wallet balance is not enough to make the shipment"
                })
            }
            res.locals.codAmount = 0;
            res.locals.totalShipPrice = shipPrice + weightPrice;
            next()
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({
            error: err.message
        })
    }
}
exports.smsaCheck = async (req, res, next) => {
    try {
        const cod = req.body.cod; // change to number
        const userId = req.user.user.id;
        const userRoll = req.user.user.roll;
        const weight = req.body.weight;
        let shipmentValue = req.body.shipmentValue; // new number must
        /*********************************************** */
        const smsa = await Smsa.findOne();
        const user = await User.findById(userId);
        /*********************************************** */
        if (weight <= 15) {
            let weightPrice = 0;
        } else {
            let weightPrice = (weight - 15) * smsa.kgprice;
        }
        /*********************************************** */
        if (cod) {
            if (!shipmentValue) {
                shipmentValue = 0
            }
            if (userRoll == "user") {
                if (user.inv) {
                    let codPrice = user.inv.companies[2].cod;
                    let shipPrice = codPrice;
                } else {
                    let shipPrice = smsa.codprice;
                }
            } else {
                if (cod > smsa.maxcodmarkteer) {
                    return res.status(400).json({
                        msg: "cod price is grater than your limit"
                    })
                }
                if (cod < smsa.mincodmarkteer) {
                    return res.status(400).json({
                        msg: "cod price is less than your limit"
                    })
                }
                let shipPrice = cod;
            }
            const codAmount = shipPrice + weightPrice + shipmentValue; // 10 + (25 - 15)22 + 100
            res.locals.codAmount = codAmount;
            res.locals.totalShipPrice = shipPrice + weightPrice;
            next()
        } else {
            if (userRoll == "user") {
                if (user.inv) {
                    let onlinePrice = user.inv.companies[2].onlinePayment;
                    let shipPrice = onlinePrice;
                } else {
                    let shipPrice = smsa.userprice;
                }
            } else {
                let shipPrice = smsa.marketerprice;
            }
            if (user.wallet < (shipPrice + weightPrice)) {
                return res.status(400).json({
                    msg: "Your wallet balance is not enough to make the shipment"
                })
            }
            res.locals.codAmount = 0;
            res.locals.totalShipPrice = shipPrice + weightPrice;
            next()
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({
            error: err.message
        })
    }
}
exports.anwanCheck = async (req, res, next) => {
    try {
        const cod = req.body.cod; // change to number
        const userId = req.user.user.id;
        const userRoll = req.user.user.roll;
        const weight = req.body.weight;
        let shipmentValue = req.body.shipmentValue; // new number must
        /*********************************************** */
        const anwan = await Anwan.findOne();
        const user = await User.findById(userId).populate("inv");
        /*********************************************** */
        if (weight <= 15) {
            let weightPrice = 0;
        } else {
            let weightPrice = (weight - 15) * anwan.kgprice;
        }
        /*********************************************** */
        if (cod) {
            if (!shipmentValue) {
                shipmentValue = 0
            }
            if (userRoll == "user") {
                if (user.inv) {
                    let codPrice = user.inv.companies[4].cod;
                    let shipPrice = codPrice;
                } else {
                    let shipPrice = anwan.codprice;
                }
            } else {
                if (cod > anwan.maxcodmarkteer) {
                    return res.status(400).json({
                        msg: "cod price is grater than your limit"
                    })
                }
                if (cod < anwan.mincodmarkteer) {
                    return res.status(400).json({
                        msg: "cod price is less than your limit"
                    })
                }
                let shipPrice = cod;
            }
            const codAmount = shipPrice + weightPrice + shipmentValue; // 10 + (25 - 15)22 + 100
            res.locals.codAmount = codAmount;
            res.locals.totalShipPrice = shipPrice + weightPrice;
            next()
        } else {
            if (userRoll == "user") {
                if (user.inv) {
                    let onlinePrice = user.inv.companies[4].onlinePayment;
                    let shipPrice = onlinePrice;
                } else {
                    let shipPrice = anwan.userprice;
                }
            } else {
                let shipPrice = anwan.marketerprice;
            }
            if (user.wallet < (shipPrice + weightPrice)) {
                return res.status(400).json({
                    msg: "Your wallet balance is not enough to make the shipment"
                })
            }
            res.locals.codAmount = 0;
            res.locals.totalShipPrice = shipPrice + weightPrice;
            next()
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({
            error: err.message
        })
    }
}
exports.splCheck = async (req, res, next) => {
    try {
        const cod = req.body.cod; // change to number
        const userId = req.user.user.id;
        const userRoll = req.user.user.roll;
        const weight = req.body.Weight;
        let shipmentValue = req.body.shipmentValue; // new number must
        /*********************************************** */
        const spl = await Spl.findOne();
        const user = await User.findById(userId);
        /*********************************************** */
        if (weight <= 15) {
            let weightPrice = 0;
        } else {
            let weightPrice = (weight - 15) * spl.kgprice;
        }
        /*********************************************** */
        if (cod) {
            if (!shipmentValue) {
                shipmentValue = 0
            }
            if (userRoll == "user") {
                if (user.inv) {
                    let codPrice = user.inv.companies[0].cod;
                    let shipPrice = codPrice;
                } else {
                    let shipPrice = spl.codprice;
                }
            } else {
                if (cod > spl.maxcodmarkteer) {
                    return res.status(400).json({
                        msg: "cod price is grater than your limit"
                    })
                }
                if (cod < spl.mincodmarkteer) {
                    return res.status(400).json({
                        msg: "cod price is less than your limit"
                    })
                }
                let shipPrice = cod;
            }
            const codAmount = shipPrice + weightPrice + shipmentValue; // 10 + (25 - 15)22 + 100
            console.log(shipPrice)
            console.log(weightPrice)
            console.log(shipmentValue)
            res.locals.codAmount = codAmount;
            res.locals.totalShipPrice = shipPrice + weightPrice;
            next()
        } else {
            if (userRoll == "user") {
                if (user.inv) {
                    let onlinePrice = user.inv.companies[0].onlinePayment;
                    let shipPrice = onlinePrice;
                } else {
                    let shipPrice = spl.userprice;
                }
            } else {
                let shipPrice = spl.marketerprice;
            }
            if (user.wallet < (shipPrice + weightPrice)) {
                return res.status(400).json({
                    msg: "Your wallet balance is not enough to make the shipment"
                })
            }
            res.locals.codAmount = 0;
            res.locals.totalShipPrice = shipPrice + weightPrice;
            next()
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({
            error: err.message
        })
    }
}
exports.imileCheck = async (req, res, next) => {
    try {
        const cod = req.body.cod; // change to number
        const userId = req.user.user.id;
        const userRoll = req.user.user.roll;
        const weight = req.body.weight;
        let shipmentValue = req.body.goodsValue; // new number must
        /*********************************************** */
        const imile = await Imile.findOne();
        const user = await User.findById(userId);
        /*********************************************** */
        if (weight <= 15) {
            let weightPrice = 0;
        } else {
            let weightPrice = (weight - 15) * imile.kgprice;
        }
        /*********************************************** */
        if (cod) {
            if (!shipmentValue) {
                shipmentValue = 0
            }
            if (userRoll == "user") {
                if (user.inv) {
                    let codPrice = user.inv.companies[3].cod;
                    let shipPrice = codPrice;
                } else {
                    let shipPrice = imile.codprice;
                }
            } else {
                if (cod > imile.maxcodmarkteer) {
                    return res.status(400).json({
                        msg: "cod price is grater than your limit"
                    })
                }
                if (cod < imile.mincodmarkteer) {
                    return res.status(400).json({
                        msg: "cod price is less than your limit"
                    })
                }
                let shipPrice = cod;
            }
            const codAmount = shipPrice + weightPrice + shipmentValue; // 10 + (25 - 15)22 + 100
            res.locals.codAmount = codAmount;
            res.locals.totalShipPrice = shipPrice + weightPrice;
            next()
        } else {
            if (userRoll == "user") {
                if (user.inv) {
                    let onlinePrice = user.inv.companies[3].onlinePayment;
                    let shipPrice = onlinePrice;
                } else {
                    let shipPrice = imile.userprice;
                }
            } else {
                let shipPrice = imile.marketerprice;
            }
            if (user.wallet < (shipPrice + weightPrice)) {
                return res.status(400).json({
                    msg: "Your wallet balance is not enough to make the shipment"
                })
            }
            res.locals.codAmount = 0;
            res.locals.totalShipPrice = shipPrice + weightPrice;
            next()
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({
            error: err.message
        })
    }
}
exports.jtCheck = async (req, res, next) => {
    try {
        const cod = req.body.cod; // change to number
        const userId = req.user.user.id;
        const userRoll = req.user.user.roll;
        const weight = req.body.weight;
        let shipmentValue = req.body.goodsValue; // new number must
        /*********************************************** */
        const jt = await Jt.findOne();
        const user = await User.findById(userId);
        /*********************************************** */
        if (weight <= 15) {
            let weightPrice = 0;
        } else {
            let weightPrice = (weight - 15) * jt.kgprice;
        }
        /*********************************************** */
        if (cod) {
            if (!shipmentValue) {
                shipmentValue = 0
            }
            if (userRoll == "user") {
                if (user.inv) {
                    let codPrice = user.inv.companies[3].cod;
                    let shipPrice = codPrice;
                } else {
                    let shipPrice = jt.codprice;
                }
            } else {
                if (cod > jt.maxcodmarkteer) {
                    return res.status(400).json({
                        msg: "cod price is grater than your limit"
                    })
                }
                if (cod < jt.mincodmarkteer) {
                    return res.status(400).json({
                        msg: "cod price is less than your limit"
                    })
                }
                let shipPrice = cod;
            }
            const codAmount = shipPrice + weightPrice + shipmentValue; // 10 + (25 - 15)22 + 100
            res.locals.codAmount = codAmount;
            res.locals.totalShipPrice = shipPrice + weightPrice;
            next()
        } else {
            if (userRoll == "user") {
                if (user.inv) {
                    let onlinePrice = user.inv.companies[3].onlinePayment;
                    let shipPrice = onlinePrice;
                } else {
                    let shipPrice = jt.userprice;
                }
            } else {
                let shipPrice = jt.marketerprice;
            }
            if (user.wallet < (shipPrice + weightPrice)) {
                return res.status(400).json({
                    msg: "Your wallet balance is not enough to make the shipment"
                })
            }
            res.locals.codAmount = 0;
            res.locals.totalShipPrice = shipPrice + weightPrice;
            next()
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({
            error: err.message
        })
    }
}
/**************************************************** */
exports.isCrProofed = (req, res, next) => {
    const userId = req.user.user.id;

    User.findById(userId)
        .then(u => {
            if (u.roll == "user" || u.isCrProofed == true) {
                return next()
            }
            return res.status(400).json({
                msg: "The commercial registry must be documented to make shipments to this company"
            })
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err.message
            })
        })
}