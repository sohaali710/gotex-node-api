const axios = require("axios");
const qs = require("qs");
const cron = require('node-cron');
const User = require("../model/user");
const Spl = require("../model/companies/spl");
const SplOrders = require("../model/orders/splOrders");
// const Daftra = require("../modules/daftra");
//********************************************* */
exports.createNewOrder = async (req, res) => {
    const { receiverName, receiverMobile, SenderName, markterCode, SenderMobileNumber,
        ContentPrice, ContentDescription, Weight, pickUpDistrictID, pickUpAddress1,
        pickUpAddress2, deliveryDistrictID, deliveryAddress1, deliveryAddress2, Pieces,
        userId, cod } = req.body;

    const user = await User.findById(userId);
    const spl = await Spl.findOne();
    let ordersNum = await SplOrders.count();
    const totalShipPrice = res.locals.totalShipPrice;

    try {
        // let nameCode = markterCode ? `${SenderName} (${markterCode})` : nameCode = SenderName;

        if (cod) {
            var PaymentType = 2;
            var paytype = "cod";
            var TotalAmount = res.locals.codAmount;
        } else {
            var PaymentType = 1;
            var paytype = "cc";
            var TotalAmount = null;
        }

        const data = qs.stringify({
            "CRMAccountId": 31314344634,
            "BranchId": 0,
            "PickupType": 0,
            "RequestTypeId": 1,
            "CustomerName": receiverName,
            "CustomerMobileNumber": receiverMobile,
            "SenderName": SenderName,
            "SenderMobileNumber": SenderMobileNumber,
            "Items": [
                {
                    "ReferenceId": `${Date.now()} + Gotex`,
                    "PaymentType": PaymentType,
                    "ContentPrice": ContentPrice,
                    "ContentDescription": ContentDescription,
                    "Weight": Weight,
                    "TotalAmount": TotalAmount,
                    "SenderAddressDetail": {
                        "AddressTypeID": 6,
                        "LocationId": 21,
                        "DistrictID": pickUpDistrictID,
                        "AddressLine1": pickUpAddress1,
                        "AddressLine2": pickUpAddress2
                    },
                    "ReceiverAddressDetail": {
                        "AddressTypeID": 6,
                        "LocationId": 21,
                        "DistrictID": deliveryDistrictID,
                        "AddressLine1": deliveryAddress1,
                        "AddressLine2": deliveryAddress2
                    },
                    "PiecesCount": Pieces.length + 1,
                    "ItemPieces": Pieces
                }
            ]
        })

        var config = {
            method: 'post',
            url: 'https://gateway-minasapre.sp.com.sa/api/CreditSale/AddUPDSPickupDelivery',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `bearer ${spl.token}`
            },
            data: data
        };

        const response = await axios(config)

        if (response.data.Status != 1) {
            return res.status(400).json({ data: response.data })
        } else {
            // const invo = await Daftra.CreateInvo(daftraid, req.user.user.daftraid, description, BookingMode, totalShipPrice);
            const order = await SplOrders.create({
                user: user._id,
                company: "Spl",
                ordernumber: `${ordersNum + "/" + Date.now() + "gotex"}`,
                data: response.data,
                receiver: {
                    name: receiverName,
                    mobile: receiverMobile,
                    city: pickUpDistrictID,
                    AddressLine1: pickUpAddress1,
                    AddressLine2: pickUpAddress2
                },
                sender: {
                    name: SenderName,
                    mobile: SenderMobileNumber,
                    city: deliveryDistrictID,
                    AddressLine1: deliveryAddress1,
                    AddressLine2: deliveryAddress2
                },
                paytype: paytype,
                price: totalShipPrice,
                marktercode: markterCode,
                createdate: new Date()
                // inovicedaftra: invo
            })

            res.status(200).json({
                receiver: {
                    name: receiverName,
                    mobile: receiverMobile,
                    city: pickUpDistrictID,
                    AddressLine1: pickUpAddress1,
                    AddressLine2: pickUpAddress2
                },
                sender: {
                    name: SenderName,
                    mobile: SenderMobileNumber,
                    city: deliveryDistrictID,
                    AddressLine1: deliveryAddress1,
                    AddressLine2: deliveryAddress2
                },
                data: response.data
            })
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({
            error: err.message
        })
    }
}
exports.getToken = (req, res) => {
    const UserName = "extrAccount";
    const Password = process.env.spl_password;
    var data = qs.stringify({
        "grant_type": "password",
        "UserName": UserName,
        "Password": Password
    });
    console.log('**before')
    var config = {
        method: 'post',
        url: 'https://gateway-minasapre.sp.com.sa/token',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: data
    };

    axios(config)
        .then(response => {
            console.log('**after')
            console.log(response);
            Spl.findOne()
                .then(s => {
                    s.token = response.data.access_token;
                    return s.save()
                })
                .then(s => {
                    res.status(200).json({
                        msg: "token updated"
                    })
                })
        })
        .catch(err => {
            console.log(err)
        })
}

exports.edit = (req, res) => {
    const status = req.body.status;
    const userprice = req.body.userprice;
    const userCodPrice = req.body.userCodPrice;
    const marketerprice = req.body.marketerprice;
    const mincodmarkteer = req.body.mincodmarkteer;
    const maxcodmarkteer = req.body.maxcodmarkteer;
    const kgprice = req.body.kgprice;
    Spl.findOne()
        .then(a => {
            a.status = status;
            a.userprice = userprice;
            a.marketerprice = marketerprice;
            a.kgprice = kgprice;
            a.maxcodmarkteer = maxcodmarkteer;
            a.mincodmarkteer = mincodmarkteer;
            a.codprice = userCodPrice
            return a.save()
        })
        .then(a => {
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
exports.getUserOrders = async (req, res) => {
    const userId = req.body.userId;
    SplOrders.find({ user: userId })
        .then(o => {
            res.status(200).json({
                data: o
            })
        })
        .catch(err => {
            console.log(err.request)
        })
}
exports.getCountries = async (req, res) => {
    const spl = await Spl.findOne();
    var data = qs.stringify({
        'CountryID': null
    })
    var config = {
        method: 'post',
        url: 'https://gateway-minasapre.sp.com.sa/api/Location/GetCountries',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `bearer ${spl.token}`
        },
        data: data
    }
    axios(config)
        .then(response => {
            console.log(response)
            res.status(200).json({
                data: response.data
            })
        })
        .catch(err => {
            console.log(err)
        })
}
exports.getCities = async (req, res) => {
    const spl = await Spl.findOne();
    var data = qs.stringify({
        'language': "A"
    })
    var config = {
        method: 'post',
        url: 'https://gateway-minasapre.sp.com.sa/api/GIS/GetCitiesByRegion',
        headers: {
            'Authorization': `bearer ${spl.token}`
        },
        data: data
    }
    axios(config)
        .then(response => {
            res.status(200).json({
                data: response.data
            })
        })
        .catch(err => {
            console.log(err)
        })
}
exports.getDistrict = async (req, res) => {
    const spl = await Spl.findOne();
    var data = qs.stringify({
        'language': "A",
        "RegionId": null
    })
    var config = {
        method: 'post',
        url: 'https://gateway-minasapre.sp.com.sa/api/GIS/GetDistricts',
        headers: {
            'Authorization': `bearer ${spl.token}`
        },
        data: data
    }
    axios(config)
        .then(response => {
            res.status(200).json({
                data: response.data
            })
        })
        .catch(err => {
            console.log(err)
        })
}
/********************************** */
cron.schedule('0 0 * * *', async () => {
    const spl = await Spl.findOne();
    const UserName = "extrAccount";
    const Password = process.env.spl_password;
    try {
        var data = qs.stringify({
            'grant_type': 'password',
            'UserName': UserName,
            'Password': Password
        });
        var config = {
            method: 'post',
            url: 'https://gateway-minasapre.sp.com.sa/token',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: data
        };

        axios(config)
            .then(response => {
                // console.log(response.data.access_token);
                spl.token = response.data.access_token;
                return spl.save()
            })
            .catch(err => {
                console.log(err)
            })
    } catch (err) {
        console.log(err)
    }
})
// var job = new CronJob('00 00 00 * * *', async () => {
//     /*
//      * Runs every day
//      * at 00:00:00 AM.
//      */
//     const spl = await Spl.findOne();
//     const UserName = "extrAccount";
//     const Password = process.env.spl_password;
//     var data = qs.stringify({
//         'grant_type': 'password',
//         'UserName': UserName,
//         'Password': Password
//     });
//     var config = {
//         method: 'post',
//         url: 'https://gateway-minasapre.sp.com.sa/token',
//         headers: {
//             'Content-Type': 'application/x-www-form-urlencoded'
//         },
//         data: data
//     };

//     axios(config)
//         .then(response => {
//             // console.log(response.data.access_token);
//             spl.token = response.data.access_token;
//             return spl.save()
//         })
//         .catch(err => {
//             console.log(err)
//         })
// }, function () {
//     console.log("spl token updated")
// },
//     true /* Start the job right now */
// );
// job();