const mongoose = require("mongoose")

const AddressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User Reference Is Mandatory"]
    },
    label: {
        type: String,
        default: "Home" // Home / Work / Other
    },
    lat: {
        type: Number,
        required: [true, "Latitude Is Mandatory"]
    },
    lng: {
        type: Number,
        required: [true, "Longitude Is Mandatory"]
    },
    address: {
        type: String,
        default: ""
    },
    state: {
        type: String,
        default: ""
    },
    city: {
        type: String,
        default: ""
    },
    pin: {
        type: String,
        default: ""
    },
    isDefault: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

const Address = mongoose.model("Address", AddressSchema)
module.exports = Address