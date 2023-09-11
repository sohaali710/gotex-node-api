const mongoose = require("mongoose");

const splOrderSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    company: String,
    ordernumber: String,
    data: Object,
    paytype: String,
    price: Number,
    marktercode: String,
    createdate: String,
    inovicedaftra: Object,

    sender: Object,
    receiver: Object
})

module.exports = mongoose.model("splOrder", splOrderSchema);