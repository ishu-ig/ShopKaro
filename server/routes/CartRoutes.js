const CartRouter = require("express").Router()
const { verifyThree } = require("../middleware/authentication")
const {
    createRecord,
    getRecord,
    getSingleRecord,
    updateRecord,
    deleteRecord,
} = require("../controllers/CartController")

CartRouter.post("",verifyThree, createRecord)
CartRouter.get("/:userid",verifyThree, getRecord)
CartRouter.get("/single/:_id",verifyThree, getSingleRecord)
CartRouter.put("/:_id",verifyThree, updateRecord)
CartRouter.delete("/:_id",verifyThree, deleteRecord)


module.exports = CartRouter