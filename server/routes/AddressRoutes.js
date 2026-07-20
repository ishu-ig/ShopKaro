const AddressRouter = require("express").Router()

const { verifyAdmin, verifyThree } = require("../middleware/authentication")
const {
    createRecord,
    getRecord,
    getUserAddress,
    getSingleRecord,
    updateRecord,
    deleteRecord,
} = require("../controllers/AddressController")

AddressRouter.post("", createRecord)
AddressRouter.get("", getRecord)
AddressRouter.get("/user/:userId", getUserAddress) // NEW: list a single user's saved addresses
AddressRouter.get("/:_id", getSingleRecord)
AddressRouter.put("/:_id", verifyThree, updateRecord)
AddressRouter.delete("/:_id", verifyThree, deleteRecord)


module.exports = AddressRouter