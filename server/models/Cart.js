const mongoose = require("mongoose")

const CartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    variant: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    qty: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    }
});
const Cart = new mongoose.model("Cart", CartSchema)

module.exports = Cart