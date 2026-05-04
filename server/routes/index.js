const Router = require("express").Router()
const path = require("path")
const express = require("express")

const BrandRouter = require("./BrandRoutes")
const MaincategoryRouter = require("./MaincategoryRoutes")
const SubcategoryRouter = require("./SubcategoryRoutes")
const TestimonialRouter = require("./TestimonialRoutes")
const ProductRouter = require("./ProductRoutes")
const UserRouter = require("./UserRoutes")
const CartRouter = require("./CartRoutes")
const WishlistRouter = require("./WishlistRoutes")
const CheckoutRouter = require("./CheckoutRoutes")
const NewsletterRouter = require("./NewsletterRoutes")
const ContactUsRouter = require("./ContactUsRoutes")
const InvoiceRouter = require("./InvoiceRoutes")

Router.use("/maincategory", MaincategoryRouter)
Router.use("/subcategory", SubcategoryRouter)
Router.use("/brand", BrandRouter)
Router.use("/testimonial", TestimonialRouter)
Router.use("/product", ProductRouter)
Router.use("/user", UserRouter)
Router.use("/cart", CartRouter)
Router.use("/wishlist", WishlistRouter)
Router.use("/checkout", CheckoutRouter)
Router.use("/newsletter", NewsletterRouter)
Router.use("/contactus", ContactUsRouter)
Router.use("/invoice", InvoiceRouter)

// ── Serve generated PDF invoices as static files ──────────────────────────────
// Access via: GET /invoices/INV-YYYYMMDD-XXXX.pdf
Router.use("/invoices", express.static(path.join(__dirname, "../public/invoices")))

module.exports = Router