const mongoose = require("mongoose");

const saeeOrderSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    company: String,
    ordernumber: String,
    data: Object,
    paytype: String,
    price: Number,
    marktercode: String,
    createdate: String,
    inovicedaftra: Object
})

module.exports = mongoose.model("SaeeOrder", saeeOrderSchema);