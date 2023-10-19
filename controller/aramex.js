// const aramex = require('aramex-api');
const axios = require("axios");
const User = require("../model/user");
const Aramex = require("../model/companies/aramex");
const AramexOrders = require("../model/orders/aramexOrders");


exports.createOrder = async (req, res) => {
    const { c_name, c_company, c_email, c_phone, c_line1, c_city, c_CellPhone, c_StateOrProvinceCode,
        p_name, p_company, p_email, p_phone, p_line1, p_city, p_CellPhone, p_StateOrProvinceCode,
        weight, pieces, desc, cod, userId } = req.body

    try {
        const user = await User.findById(userId);
        let ordersNum = await AramexOrders.count();
        const totalShipPrice = res.locals.totalShipPrice;

        if (cod) {
            var codAmount = res.locals.codAmount;
            // var PaymentType = "p";
            // var PaymentOptions = "ACCT"
            var paytype = 'cod'
        } else {
            var codAmount = 0;
            // var PaymentType = "P";
            // var PaymentOptions = "ACCT"
            var paytype = 'cc'
        }

        const shipmentDate = Date.now();
        var data = JSON.stringify({
            "Shipments": [
                {
                    "Reference1": "Shipment Reference",
                    "Reference2": null,
                    "Reference3": null,
                    "Shipper": {
                        "Reference1": "www.go-tex.net",
                        "Reference2": null,
                        "AccountNumber": process.env.AR_ACCOUNT,
                        "AccountEntity": "JED",
                        "PartyAddress": {
                            "Line1": p_line1,
                            "Line2": null,
                            "Line3": "",
                            "City": p_city,
                            "StateOrProvinceCode": p_StateOrProvinceCode,
                            "PostCode": "",
                            "CountryCode": "SA",
                            "Longitude": 0,
                            "Latitude": 0,
                            "BuildingNumber": null,
                            "BuildingName": null,
                            "Floor": null,
                            "Apartment": null,
                            "POBox": null,
                            "Description": null
                        },
                        "Contact": {
                            "Department": null,
                            "PersonName": p_name,
                            "Title": null,
                            "CompanyName": p_company,
                            "PhoneNumber1": p_phone,
                            "PhoneNumber1Ext": "",
                            "PhoneNumber2": "",
                            "PhoneNumber2Ext": "",
                            "FaxNumber": null,
                            "CellPhone": p_CellPhone,
                            "EmailAddress": p_email,
                            "Type": ""
                        }
                    },
                    "Consignee": {
                        "Reference1": null,
                        "Reference2": null,
                        "AccountNumber": process.env.AR_ACCOUNT,
                        "AccountEntity": "JED",
                        "PartyAddress": {
                            "Line1": c_line1,
                            "Line2": null,
                            "Line3": null,
                            "City": c_city,
                            "StateOrProvinceCode": c_StateOrProvinceCode,
                            "PostCode": "",
                            "CountryCode": "SA",
                            "Longitude": 0,
                            "Latitude": 0,
                            "BuildingNumber": null,
                            "BuildingName": null,
                            "Floor": null,
                            "Apartment": null,
                            "POBox": null,
                            "Description": null
                        },
                        "Contact": {
                            "Department": null,
                            "PersonName": c_name,
                            "Title": null,
                            "CompanyName": c_company,
                            "PhoneNumber1": c_phone,
                            "PhoneNumber1Ext": "",
                            "PhoneNumber2": "",
                            "PhoneNumber2Ext": "",
                            "FaxNumber": null,
                            "CellPhone": c_CellPhone,
                            "EmailAddress": c_email,
                            "Type": ""
                        }
                    },
                    "ThirdParty": {
                        "Reference1": "",
                        "Reference2": "",
                        "AccountNumber": process.env.AR_ACCOUNT,
                        "PartyAddress": {
                            "Line1": "",
                            "Line2": "",
                            "Line3": "",
                            "City": p_city,
                            "StateOrProvinceCode": "",
                            "PostCode": "",
                            "CountryCode": "SA",
                            "Longitude": 0,
                            "Latitude": 0,
                            "BuildingNumber": null,
                            "BuildingName": null,
                            "Floor": null,
                            "Apartment": null,
                            "POBox": null,
                            "Description": null
                        },
                        "Contact": {
                            "Department": "",
                            "PersonName": "gotex",
                            "Title": "",
                            "CompanyName": "",
                            "PhoneNumber1": "96656501313",
                            "PhoneNumber1Ext": "",
                            "PhoneNumber2": "",
                            "PhoneNumber2Ext": "",
                            "FaxNumber": "",
                            "CellPhone": "920013156",
                            "EmailAddress": "",
                            "Type": ""
                        }
                    },
                    "ShippingDateTime": `/Date(${shipmentDate}+0530)/`,
                    "Comments": null,
                    "PickupLocation": null,
                    "OperationsInstructions": null,
                    "AccountingInstrcutions": null,
                    "Details": {
                        "Dimensions": null,
                        "ActualWeight": {
                            "Unit": "KG",
                            "Value": weight
                        },
                        "ChargeableWeight": {
                            "Unit": "KG",
                            "Value": weight
                        },
                        "DescriptionOfGoods": desc,
                        "GoodsOriginCountry": "SA",
                        "NumberOfPieces": pieces,
                        "ProductGroup": "DOM",
                        "ProductType": "CDS",
                        "PaymentType": 3,
                        "PaymentOptions": "",
                        "CustomsValueAmount": {
                            "CurrencyCode": "SAR",
                            "Value": 0
                        },
                        "CashOnDeliveryAmount": {
                            "CurrencyCode": "SAR",
                            "Value": codAmount
                        },
                        "InsuranceAmount": {
                            "CurrencyCode": "SAR",
                            "Value": 0
                        },
                        "CashAdditionalAmount": {
                            "CurrencyCode": "SAR",
                            "Value": 0
                        },
                        "CashAdditionalAmountDescription": null,
                        "CollectAmount": {
                            "CurrencyCode": "SAR",
                            "Value": 0
                        },
                        "Services": "",
                        "Items": null,
                        "DeliveryInstructions": null,
                        "AdditionalProperties": null,
                        "ContainsDangerousGoods": false
                    },
                    "Attachments": null,
                    "ForeignHAWB": null,
                    "TransportType ": 0,
                    "PickupGUID": null,
                    "Number": null,
                    "ScheduledDelivery": null
                }
            ],
            "LabelInfo": {
                "ReportID": 9729,
                "ReportType": "URL"
            },
            "ClientInfo": {
                "UserName": process.env.AR_USERNAME,
                "Password": process.env.AR_PASSWORD,
                "Version": "v1.0",
                "AccountNumber": process.env.AR_ACCOUNT,
                "AccountPin": process.env.AR_PIN,
                "AccountEntity": "JED",
                "AccountCountryCode": "SA",
                "Source": 24
            }
        });

        var config = {
            method: 'post',
            url: 'https://ws.aramex.net/ShippingAPI.V2/Shipping/Service_1_0.svc/json/CreateShipments',
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };
        const response = await axios(config)

        const order = await AramexOrders.create({
            user: userId,
            company: "aramex",
            ordernumber: ordersNum + 2,
            data: response.data,
            paytype,
            price: totalShipPrice,
            createdate: new Date()
        })

        if (response.data.HasErrors) {
            order.status = 'failed'
            await order.save()
            return res.status(400).json({ msg: response.data })
        }

        if (!cod) {
            user.wallet = user.wallet - totalShipPrice;
            await user.save()
        }
        res.status(200).json({ msg: "order created successfully", data: order })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            error: err.message
        })
    }
}
exports.getSticker = async (req, res) => {
    const orderId = req.params.id;

    try {
        const order = await AramexOrders.findById(orderId)
        if (!order) {
            return res.status(400).json({ msg: 'Order not found' })
        }

        const url = order.data.Shipments[0].ShipmentLabel.LabelURL;
        return res.status(200).redirect(url)
    } catch (err) {
        console.log(err)
        res.status(500).json({
            error: err.message
        })
    }
}
exports.createPickup = async (req, res) => {
    const {
        p_name, p_company, p_email, p_phone, p_line1, p_city, p_CellPhone, p_StateOrProvinceCode,
        weight, pieces, desc, cod, userId } = req.body

    try {
        const user = await User.findById(userId);
        let ordersNum = await AramexOrders.count();
        const totalShipPrice = res.locals.totalShipPrice;

        if (cod) {
            var codAmount = res.locals.codAmount;
            // var PaymentType = "p";
            // var PaymentOptions = "ACCT"
            var paytype = 'cod'
        } else {
            var codAmount = 0;
            // var PaymentType = "P";
            // var PaymentOptions = "ACCT"
            var paytype = 'cc'
        }

        const pickupDate = Date.now();
        var data = JSON.stringify({
            "ClientInfo": {
                "UserName": process.env.AR_USERNAME,
                "Password": process.env.AR_PASSWORD,
                "Version": "v1.0",
                "AccountNumber": process.env.AR_ACCOUNT,
                "AccountPin": process.env.AR_PIN,
                "AccountEntity": "JED",
                "AccountCountryCode": "SA",
                "Source": 24,
                "PreferredLanguageCode": null
            },
            "Pickup": {
                "PickupAddress": {
                    "Line1": p_line1,
                    "Line2": null,
                    "Line3": "",
                    "City": p_city,
                    "StateOrProvinceCode": p_StateOrProvinceCode,
                    "PostCode": "",
                    "CountryCode": "SA",
                    "Longitude": 0,
                    "Latitude": 0,
                    "BuildingNumber": null,
                    "BuildingName": null,
                    "Floor": null,
                    "Apartme nt": null,
                    "POBox": null,
                    "Description": null
                },
                "PickupContact": {
                    "Department": "",
                    "PersonName": p_name,
                    "Title": null,
                    "CompanyName": p_company,
                    "PhoneNumber1": p_phone,
                    "PhoneNumber1Ext": null,
                    "PhoneNumber2": null,
                    "PhoneNumber2Ext": null,
                    "FaxNumber": null,
                    "CellPhone": p_CellPhone,
                    "EmailAddress": p_email,
                    "Type": null
                },
                "PickupLocation": p_city,
                "PickupDate": `/Date(${pickupDate}+0530)/`,
                "ReadyTime": "",
                "LastPickupTime": "",
                "ClosingTime": "",
                "Comments": desc,
                "Reference1": "001",
                "Reference2": "",
                "Vehicle": "",
                "Shipments": null,
                "PickupItems": [{
                    "ProductGroup": "DOM",
                    "ProductType": "ONP",
                    "NumberOfShipments": 1,
                    "PackageType": "Box",
                    "Payment": "P",
                    "ShipmentWeight": {
                        "Unit": "KG",
                        "Value": weight
                    },
                    "ShipmentVolume": null,
                    "NumberOfPieces": pieces,
                    "CashAmount": codAmount,
                    "ExtraCharges": null,
                    "ShipmentDimensions": {
                        "Length": 0,
                        "Width": 0,
                        "Height": 0,
                        "Unit": ""
                    },
                    "Comments": desc
                }],
                "Status": "Ready",
                "ExistingShipments": null,
                "Branch": "",
                "RouteCode": ""
            },
            "Transaction": {
                "Reference1": "",
                "Reference2": "",
                "Reference3": "",
                "Reference4": "",
                "Reference5": ""
            }
        });

        var config = {
            method: 'post',
            url: 'https://ws.dev.aramex.net/ShippingAPI.V2/Shipping/Service_1_0.svc/json/CreatePickup',
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };
        const response = await axios(config)
        console.log('************')
        console.log(response.data)
        const order = await AramexOrders.create({
            user: userId,
            company: "aramex",
            ordernumber: ordersNum + 2,
            data: response.data,
            paytype,
            price: totalShipPrice,
            createdate: new Date()
        })

        if (response.data.HasErrors) {
            order.status = 'failed'
            await order.save()
            return res.status(400).json({ msg: response.data })
        }

        if (!cod) {
            user.wallet = user.wallet - totalShipPrice;
            await user.save()
        }
        res.status(200).json({ msg: "order created successfully", data: order })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            error: err.message
        })
    }
}
exports.cancelOrder = async (req, res) => {
    let { orderId, userId } = req.body;
    try {
        const order = await AramexOrders.findById(orderId);
        if (!order || order.user != userId) {
            return res.status(400).json({
                err: "order not found"
            })
        }

        const shipmentDate = Date.now();
        var data = JSON.stringify({
            "ClientInfo": {
                "UserName": process.env.AR_USERNAME,
                "Password": process.env.AR_PASSWORD,
                "Version": "v1.0",
                "AccountNumber": process.env.AR_ACCOUNT,
                "AccountPin": process.env.AR_PIN,
                "AccountEntity": "JED",
                "AccountCountryCode": "SA",
                "Source": 24,
                "PreferredLanguageCode": null
            },
            "Comments": "Test",
            "PickupGUID": "", // TODO
            "Transaction": {
                "Reference1": "",
                "Reference2": "",
                "Reference3": "",
                "Reference4": "",
                "Reference5": ""
            }
        });

        var config = {
            method: 'post',
            url: 'https://ws.aramex.net/ShippingAPI.V2/Shipping/Service_1_0.svc/json/CreateShipments',
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };
        const response = await axios(config)

        if (response.data.HasErrors) {
            return res.status(400).json({ msg: response.data })
        }

        order.status = 'canceled'
        await order.save()
        res.status(200).json({ msg: "order canceled successfully" })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            error: err.message
        })
    }
}

exports.getCities = async (req, res) => {
    try {
        var data = JSON.stringify({
            "ClientInfo": {
                "UserName": process.env.AR_USERNAME,
                "Password": process.env.AR_PASSWORD,
                "Version": "v1.0",
                "AccountNumber": process.env.AR_ACCOUNT,
                "AccountPin": process.env.AR_PIN,
                "AccountEntity": "JED",
                "AccountCountryCode": "SA",
                "Source": 24
            },
            "CountryCode": "SA",
            "NameStartsWith": "",
            "State": "",
            "Transaction": {
                "Reference1": "",
                "Reference2": "",
                "Reference3": "",
                "Reference4": "",
                "Reference5": ""
            }
        });

        var config = {
            method: 'post',
            url: 'https://ws.aramex.net/ShippingAPI.V2/Location/Service_1_0.svc/json/FetchCities',
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };
        const order = await axios(config)
        const response = await axios(config)
        if (response.data.HasErrors) {
            return res.status(400).json({ msg: response.data })
        }

        res.status(200).json({ data: response.data })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            error: err.message
        })
    }
}
exports.getUserOrders = async (req, res) => {
    const userId = req.body.userId;
    try {
        const orders = await AramexOrders.find({ user: userId, status: { $ne: "failed" } })
        res.status(200).json({ data: orders })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            error: err.message
        })
    }
}

exports.edit = async (req, res) => {
    const { status, userprice, userCodPrice, kgprice } = req.body

    try {
        const aramex = await Aramex.findOne()

        aramex.status = status;
        aramex.userprice = userprice;
        aramex.kgprice = kgprice;
        aramex.codprice = userCodPrice
        await aramex.save()

        res.status(200).json({ msg: "ok" })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            msg: err.message
        })
    }
}

// exports.createOrder = async (req, res) => {
//     try {
//         clientInfo = new aramex.ClientInfo({
//             // UserName: process.env.AR_USERNAME,
//             // Password: process.env.AR_PASSWORD,
//             // Version: 'v2.0',
//             // AccountNumber: process.env.AR_ACCOUNT,
//             // AccountPin: process.env.AR_PIN,
//             // AccountEntity: 'JED',
//             // AccountCountryCode: 'SA'
//         });

//         aramex.Aramex.setClientInfo(clientInfo);

//         aramex.Aramex.setConsignee(new aramex.Consignee());

//         aramex.Aramex.setShipper(new aramex.Shipper());

//         aramex.Aramex.setThirdParty(new aramex.ThirdParty());

//         aramex.Aramex.setDetails(1);

//         aramex.Aramex.setDimension();

//         aramex.Aramex.setWeight();

//         //Creating shipment

//         let result = await aramex.Aramex.createShipment([
//             {
//                 PackageType: 'Box',
//                 Quantity: 2,
//                 Weight: {
//                     Value: 0.5,
//                     Unit: 'Kg'
//                 },
//                 Comments: 'Docs',
//                 Reference: ''
//             }
//         ]);
//         res.json({
//             result: result
//         })
//     } catch (error) {
//         console.log(error)
//     }

// }