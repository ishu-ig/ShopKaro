const mongoose = require("mongoose");
require("./Maincategory");
require("./Subcategory");
require("./Brand");
require("./Shop");
require("./User");

const VariantSchema = new mongoose.Schema(
  {
    color: {
      type: String,
      required: true,
    },
    size: {
      type: String,
      required: true,
    },
    stockQuantity: {
      type: Number,
      required: true,
      default: 0,
    },
    stock: {
      type: Boolean,
      default: true,
    },
    price: {
      type: Number,
      default: null, // Optional if variant has different price
    },
    finalPrice: {
      type: Number,
      required: true,
    },
    pic: [
      {
        type: String,
      },
    ],
    sku: {
      type: String,
      default: "",
    },
  },
  { _id: true }
);

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Product Name is Mandatory"],
  },
  maincategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Maincategory",
    required: true,
  },
  subcategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subcategory",
    required: true,
  },
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Brand",
    required: true,
  },
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shop"
  },
  description: {
    type: String,
    default: "",
  },
  discount: {
    type: Number,
    default: 0,
  },


  variants: [VariantSchema],

  active: {
    type: Boolean,
    default: true,
  },

  reviews: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      name: {
        type: String,
        default: "Anonymous",
      },
      rating: {
        type: Number,
        min: 1,
        max: 5,
        default: 5,
      },
      comment: {
        type: String,
        required: true,
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

module.exports = mongoose.model("Product", ProductSchema);