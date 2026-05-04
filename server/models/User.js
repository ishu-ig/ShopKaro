const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Full Name is Mandatory"],
        trim: true
    },
    username: {
        type: String,
        unique: true,
        required: [true, "User Name is Mandatory"],
        trim: true,
        lowercase: true
    },
    email: {
        type: String,
        unique: true,
        required: [true, "Email Address is Mandatory"],
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: [true, "Phone Number is Mandatory"],
        trim: true
    },
    password: {
        type: String,
        required: [true, "Password is Mandatory"]
    },
    role: {
        type: String,
        enum: ["Buyer", "Admin", "Super Admin", "Delivery Boy"],
        default: "Buyer"
    },
    address: {
        type: String,
        default: ""
    },
    pin: {
        type: String,
        default: ""
    },
    city: {
        type: String,
        default: ""
    },
    state: {
        type: String,
        default: ""
    },
    otp: {
        type: String,
        default: "-234567"
    },
    pic: {
        type: String,
        default: ""
    },
    active: {
        type: Boolean,
        default: true
    },

    // ── Delivery Boy specific fields ──────────────────────────────
    vehicleNumber: {
        type: String,
        default: ""          // e.g. "UP14 AB 1234"
    },
    vehicleType: {
        type: String,
        enum: ["Bike", "Scooter", "Bicycle", "Van", ""],
        default: ""
    },
    currentOrders: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Checkout"  // orders currently assigned
        }
    ],
    totalDeliveries: {
        type: Number,
        default: 0           // lifetime delivery count
    }
}, { timestamps: true })

const User = new mongoose.model("User", UserSchema)

module.exports = User