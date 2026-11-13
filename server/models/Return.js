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

    // Single image URL (optional). Supports legacy array values gracefully.
    pics: {
        type: String,
        default: "",
        set: (v) => Array.isArray(v) ? (v[0] || "") : (v || "")
    },

    // pending -> approved -> picked_up -> received -> completed
    // (or rejected / cancelled)
    status: {
        type: String,
        enum: [
            "pending",
            "approved",
            "picked_up",
            "received",
            "rejected",
            "completed",
            "cancelled",
        ],
        default: "pending",
    },

    // Pickup delivery boy.
    // NOTE: change ref to "User" if your delivery boys are stored in the User
    // model (role: "DeliveryBoy"). Otherwise populate("deliveryBoy") will fail.
    deliveryBoy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DeliveryBoy",
    },

    // Refund details (filled by refundRecord)
    refundId: {
        type: String,
        default: "",
    },
    refundAmount: {
        type: Number,          // no default on purpose: the admin UI falls back to order.total
    },
    refundStatus: {
        type: String,
        default: "",           // "" | initiating | pending | processed | failed
    },
    refundedAt: {
        type: Date,
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