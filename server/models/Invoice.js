const mongoose = require('mongoose')

const invoiceSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', required: true 
    },
    order: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Order', required: true 
    },
    invoiceNumber: { 
        type: String, 
        required: true, 
        unique: true 
    },
    date: { 
        type: Date, 
        default: Date.now 
    },
    // totalAmount: { 
    //     type: Number, 
    //     required: true 
    // }
})
const Invoice = new mongoose.model("Invoice",invoiceSchema)

module.exports = Invoice