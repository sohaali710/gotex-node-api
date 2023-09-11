// const mongoose = require("mongoose");
// const ObjectID = mongoose.Schema.Types.ObjectId

// const clientSchema = mongoose.Schema({
//     name: String,
//     email: String,
//     mobile: String,
//     city: String,
//     address: String,
//     wallet: {
//         type: Number,
//         default: 0
//     },
//     receipts: [String],
//     user: {
//         type: ObjectID,
//         ref: 'User'
//     },
//     orders: [
//         {
//             company: String,
//             id: String
//         }
//     ]
// })
// module.exports = mongoose.model("Client", clientSchema);