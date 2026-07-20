const mongoose = require("mongoose");

const DeliveryBoySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Full Name Is Mandatory"],
            trim: true
        },

        username: {
            type: String,
            unique: true,
            required: [true, "Username Is Mandatory"],
            trim: true
        },

        email: {
            type: String,
            unique: true,
            required: [true, "Email Address Is Mandatory"],
            trim: true,
            lowercase: true
        },

        phone: {
            type: String,
            required: [true, "Contact Number Is Mandatory"],
            unique: true,
            sparse: true,
            match: [/^\d{10}$/, "Phone number must be a valid 10-digit number"]
        },

        password: {
            type: String,
            required: [true, "Password Is Mandatory"]
        },

        // Option A: update the enum to match what the frontend now sends
        role: {
            type: String,
            default: "DeliveryBoy"
        },

        pic: {
            type: String,
            default: ""
        },


        permanentLocation: {
            lat: { type: Number, default: null },
            lng: { type: Number, default: null },
            address: { type: String, default: "" },
            city: { type: String, default: "" },
            state: { type: String, default: "" },
            pin: { type: String, default: "" }
        },

        // Password reset OTP
        otp: {
            type: String,
            default: ""
        },
        active: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

const DeliveryBoy = mongoose.model("DeliveryBoy", DeliveryBoySchema);

module.exports = DeliveryBoy;