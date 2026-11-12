const mongoose = require("mongoose");
require("./Product");
require("./User");
require("./Checkout");

const returnSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Checkout",
    },
    reason: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        default: "pending",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Return", returnSchema);