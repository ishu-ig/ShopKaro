const mongoose = require("mongoose")

const ShopSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            unique: true,
            required: [true, "Resturent Name Is Mandatory"],
            trim: true
        },
        ownerName:{
            type: String,
            required: [true, "Owner Name Is Mandatory"],
        },
        email:{
            type: String,
            required: [true, "Email Is Mandatory"],
        },
        pic: {
            type: String,
            default:""
        },
        phone: {
            type: Number,
            required: [true, "Contact Number Is Mandatory"]
        },
        
        permanentLocation: {
            lat: { type: Number, default: null },
            lng: { type: Number, default: null },
            address: { type: String, default: "" },
            city: { type: String, default: "" },
            state: { type: String, default: "" },
            pin: { type: String, default: "" }
        },
        status: {
            type: Boolean,
            default: true
        },
        maincategory:[{
            type:mongoose.Schema.ObjectId,
            ref : "Maincategory"
        }],
        subcategory:[{
            type:mongoose.Schema.ObjectId,
            ref : "Subcategory"
        }],
        password:{
            type: String,
            required: [true, "Password Is Mandatory"]
        },
        role:{
            type: String
        },
        otp: {
            type: String,
            default: ""
        },
        active: {
            type: Boolean,
            default: true
        },

    },
    { timestamps: true }
)

const Shop = mongoose.model("Shop", ShopSchema)

module.exports = Shop