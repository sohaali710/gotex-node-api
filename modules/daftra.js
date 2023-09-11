const { default: axios } = require("axios");
const User = require("../model/user");
const invoiceCreate = async (c, staffId, notes, payment_method, payment_amount) => {
    try {
        const data = JSON.stringify({
            "Invoice": {
                "staff_id": staffId,
                "subscription_id": null,
                "client_id": c.id,
                "is_offline": true,
                "currency_code": "SAR",
                "client_business_name": c.business_name,
                "client_first_name": c.first_name,
                "client_last_name": c.last_name,
                "client_email": c.email,
                "client_address1": c.address1,
                "client_address2": c.address2,
                "client_postal_code": c.postal_code,
                "client_city": c.city,
                "client_state": c.state,
                "client_country_code": c.country_code,
                "date": new Date(),
                "draft": "0",
                "discount": 0,
                "discount_amount": 0,
                "deposit": 0,
                "deposit_type": 0,
                "notes": notes,
                "html_notes": null,
                "invoice_layout_id": 1,
                "estimate_id": 0,
                "shipping_options": "",
                "shipping_amount": null,
                "client_active_secondary_address": false,
                "client_secondary_name": "string",
                "client_secondary_address1": "string",
                "client_secondary_address2": "string",
                "client_secondary_city": "string",
                "client_secondary_state": "string",
                "client_secondary_postal_code": "string",
                "client_secondary_country_code": "string",
                "follow_up_status": null,
                "work_order_id": null,
                "requisition_delivery_status": null,
                "pos_shift_id": null,
                "qr_code_url": "https://yoursite.daftra.com/qr/?d64=QVE1TmIyaGhiV1ZrSUVGemFISmhaZ0lJTVRFMU16WTJRMUlERkRJd01qSXRNVEF0TWpoVU1EQTZNREU2TVRWYUJBRXdCUUV3",
                "invoice_html_url": "https://yoursite.daftra.com/invoices/preview/2621?hash=c06543fe13bd4850b521733687c53259",
                "invoice_pdf_url": "https://yoursite.daftra.com/invoices/view/2621.pdf?hash=c06543fe13bd4850b521733687c53259"
            },
            "InvoiceItem": [
                {
                }
            ],
            "Payment": [
                {
                    "payment_method": payment_method,
                    "amount": payment_amount,
                    "transaction_id": null,
                    "treasury_id": null,
                    "staff_id": staffId
                }
            ],
            "InvoiceCustomField": {},
            "Deposit": {},
            "InvoiceReminder": {},
            "Document": {},
            "DocumentTitle": {}
        });
        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `https://aljwadalmomez.daftra.com/api2/invoices`,
            headers: {
                'APIKEY': process.env.daftra_Key,
                'Content-Type': 'application/json'
            },
            data: data
        }
        const response = await axios(config)
        return response.data
    } catch (error) {
        console.log(error)
    }
}
const getClientById = async (id) => {
    try {
        const config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `https://aljwadalmomez.daftra.com/api2/clients/${id}`,
            headers: {
                'APIKEY': process.env.daftra_Key
            }
        }
        const response = await axios(config);
        return response.data
    } catch (error) {
        return error.response.data
    }
}
// exports.createInv = async (clientId, notes, next) => {
//     try {
//         const clientId = req.body.clientId;
//         const notes = req.body.description;
//         const user = await User.findById(req.user.user.id);
//         const response = await getClientById(clientId);
//         let payment_method;
//         let payment_amount = res.locals.totalShipPrice;
//         if (req.body.cod) {
//             payment_method = "cod";
//         } else {
//             payment_method = "cc"
//         }
//         if (response.code != 200) {
//             return res.status(response.code).json({
//                 msg: response
//             })
//         }
//         const client = response.data.Client;
//         const inovic = await invoiceCreate(client, user.daftraid, notes, payment_method, payment_amount);
//         console.log(inovic)
//     } catch (error) {
//         console.log(error)
//     }
// }
exports.CreateInvo = async (clintId, staffId, notes, payment_method, payment_amount) => {
    const clientRes = await getClientById(clintId);
    if (clientRes.code != 200) {
        return errorHandler(clientRes.message, clientRes.code)
    }
    const client = clientRes.data.Client;
    const invoiceRes = await invoiceCreate(client, staffId, notes, payment_method, payment_amount)
    return invoiceRes
}
//********************** */
const errorHandler = (data, status) => {
    let e = {
        msg: data,
        code: status
    }
    return e
}