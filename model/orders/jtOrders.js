const mongoose = require("mongoose");

const jtOrderSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    company: String,
    ordernumber: Number,
    data: Object,
    paytype: String,
    price: Number,
    codPrice: Number,
    marktercode: String,
    createdate: String,
    inovicedaftra: Object,
    status: {
        type: String,
        enum: ['failed', 'pending', 'accepted', 'canceled'],
        default: 'pending'
    }
})

module.exports = mongoose.model("JtOrder", jtOrderSchema);