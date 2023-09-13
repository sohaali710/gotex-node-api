const mongoose = require("mongoose");

const imileClientSchema = mongoose.Schema({
    companyName: String,
    contacts: String,
    country: {
        type: String,
        default: "KSA"
    },
    city: String,
    area: String,
    address: String,
    phone: String,
    email: String,
    backupPhone: String,
    attentions: String,
    defaultOption: {
        type: String,
        default: "0"
    }
})
module.exports = mongoose.model("ImileClient", imileClientSchema);