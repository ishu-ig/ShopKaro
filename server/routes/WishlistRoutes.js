const WishlistRouter = require("express").Router()
const { verifyThree } = require("../middleware/authentication")
const {
    createRecord,
    getRecord,
    getSingleRecord,
    deleteRecord,
} = require("../controllers/WishlistController")

WishlistRouter.post("", verifyThree, createRecord)
WishlistRouter.get("/:userid", verifyThree, getRecord)
WishlistRouter.get("/single/:_id", verifyThree, getSingleRecord)
WishlistRouter.delete("/:_id", verifyThree, deleteRecord)


module.exports = WishlistRouter