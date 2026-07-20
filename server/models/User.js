const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
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
            default: "Buyer",
            enum: ["Buyer", "Admin"]   // lowercase d to match frontend
        },

        pic: {
            type: String,
            default: ""
        },

        // ── Saved addresses (customers) ────────────────────────────────────
        addresses: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Address"
        }],

        defaultAddress: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Address",
            default: null
        },

        // Phone verification OTP
        validOtp: {
            type: String,
            default: ""
        },

        // Phone OTP expiry time
        otpExpiresAt: {
            type: Date,
            default: null
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

const User = mongoose.model("User", UserSchema);

module.exports = User;