const mongoose = require("mongoose");
require("./Product");
require("./User");
require("./Checkout");
require("./DeliveryBoy");

const returnSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Checkout" },
    reason: { type: String, required: true },

    // Single image URL (optional). Supports legacy array values.
    pics: {
        type: String,
        default: "",
        set: (v) => (Array.isArray(v) ? v[0] || "" : v || ""),
    },

    // pending -> approved -> picked_up -> received -> completed (or rejected / cancelled)
    status: {
        type: String,
        enum: ["pending", "approved", "picked_up", "received", "rejected", "completed", "cancelled"],
        default: "pending",
    },

    // Delivery boys are stored in the User collection (role: "DeliveryBoy").
    // If you have a separate DeliveryBoy model, set ref back to "DeliveryBoy"
    // and add require("./DeliveryBoy"); at the top.
    deliveryBoy: { type: mongoose.Schema.Types.ObjectId, ref: "DeliveryBoy" },

    refundId: { type: String, default: "" },
    refundAmount: { type: Number },
    refundStatus: { type: String, default: "" }, // "" | initiating | pending | processed | failed | manual
    refundedAt: { type: Date },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Return", returnSchema);