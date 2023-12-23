const mongoose = require("mongoose");

const orderSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    data: Object,
    amount: Number,
    code: String,
    status: String,
    created_at: Date
})
module.exports = mongoose.model("paymentOrder", orderSchema);