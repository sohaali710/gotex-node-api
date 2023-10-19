const User = require("../model/user");

exports.checkCompany = (CompanyModel) => {
    return (
        async (req, res, next) => {
            let { userId, cod, weight, shipmentValue } = req.body
            const userRolle = "user"

            try {
                const company = await CompanyModel.findOne();
                const user = await User.findById(userId)
                if (!user) {
                    return res.status(400).json({ msg: "error this user doesn't exist" })
                }

                let weightPrice = weight <= 15 ? 0 : (weight - 15) * company.kgprice;

                if (cod) {
                    if (!shipmentValue) shipmentValue = 0;

                    if (userRolle == "user") {
                        if (user.inv) {
                            var codPrice = user.inv.companies[1].cod;
                            var shipPrice = codPrice;
                        } else {
                            var shipPrice = company.codprice;
                        }
                    } else {
                        var shipPrice = cod;
                        if (cod > company.maxcodmarkteer) {
                            return res.status(400).json({ msg: "cod price is greater than your limit" })
                        }
                        if (cod < company.mincodmarkteer) {
                            return res.status(400).json({ msg: "cod price is less than your limit" })
                        }
                    }
                    res.locals.codAmount = shipPrice + weightPrice + shipmentValue; // 10 + (25 - 15)22 + 100
                    res.locals.totalShipPrice = shipPrice + weightPrice;

                    next()
                } else {
                    if (userRolle == "user") {
                        if (user.inv) {
                            var onlinePrice = user.inv.companies[1].onlinePayment;
                            var shipPrice = onlinePrice;
                        } else {
                            var shipPrice = company.userprice;
                        }
                    } else {
                        var shipPrice = company.marketerprice;
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
    )
}

exports.isCrProofed = (req, res, next) => {
    const userId = req.body.userId

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