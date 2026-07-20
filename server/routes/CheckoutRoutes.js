const CheckoutRouter = require("express").Router()
const { verifyFour } = require("../middleware/authentication")
const {
    createRecord,
    getRecord,
    getUserRecord,
    getSingleRecord,
    updateRecord,
    deleteRecord,
    order,
    verifyOrder,
    verifyDelivery,
} = require("../controllers/CheckoutController")

CheckoutRouter.post("",verifyFour, createRecord)
CheckoutRouter.get("",verifyFour, getRecord)
CheckoutRouter.get("/user/:userid",verifyFour, getUserRecord)
CheckoutRouter.get("/single/:_id", getSingleRecord)
CheckoutRouter.put("/:_id", verifyFour, updateRecord)
CheckoutRouter.delete("/:_id",verifyFour, deleteRecord)
CheckoutRouter.post("/order",verifyFour, order)
CheckoutRouter.post("/verify",verifyFour, verifyOrder)
CheckoutRouter.put("/verify-delivery/:_id", verifyFour, verifyDelivery)



module.exports = CheckoutRouter