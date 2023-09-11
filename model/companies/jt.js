const mongoose = require("mongoose");

const jtSchema = mongoose.Schema({
    name: {
        type: String,
        default: "jt"
    },
    userprice: {
        type: Number,
        default: 22,
    },
    marketerprice: {
        type: Number,
        default: 22,
    },
    kgprice: {
        type: Number,
        default: 22,
    },
    status: {
        type: Boolean,
        default: false,
    },
    codprice: {
        type: Number,
        default: 10
    },
    mincodmarkteer: {
        type: Number,
        default: 10
    },
    maxcodmarkteer: {
        type: Number,
        default: 10
    },
    token: {
        type: String
    }
})
module.exports = mongoose.model("Jt", jtSchema);