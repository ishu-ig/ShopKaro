const mongoose = require("mongoose");

const BannerSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Banner title is required"],
            trim: true,
        },
        pic: {
            type: String,
            required: [true, "Banner image is required"],
        },
        link: {
            type: String,
            trim: true,
            default: null,
        },
        active: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

const Banner = mongoose.model("Banner", BannerSchema);

module.exports = Banner;