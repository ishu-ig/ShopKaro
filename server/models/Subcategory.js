const mongoose = require("mongoose")
require("./Maincategory")

const SubcategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Subcategory Name is Mendatory"]
    },
    pic: {
        type: String,
        required: [true, "Subcategory Pic is Mendatory"]
    },
    maincategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Maincategory",
        required: [true, "Maincategory is Mendatory"]
    },
    active: {
        type: Boolean,
        default: true
    },
})

SubcategorySchema.index({ name: 1, maincategory: 1 }, { unique: true })

const Subcategory = new mongoose.model("Subcategory", SubcategorySchema)

module.exports = Subcategory