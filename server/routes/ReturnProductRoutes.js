const express = require("express");
const ReturnProductRouter = express.Router();
const { verifyBoth, verifyThree, verifyFour } = require("../middleware/authentication");

const { returnUploader } = require("../middleware/fileuploader");

const {
    createRecord,
    getRecord,
    getUserRecord,
    getSingleRecord,
    updateRecord,
    refundRecord,
    deleteRecord
} = require("../controllers/ReturnController");

// Online refund through Razorpay (admin only)
// MUST be registered BEFORE POST "" — otherwise POST /refund/:_id is swallowed by the generic create route
ReturnProductRouter.post("/refund/:_id", verifyThree, refundRecord)

// Create a return request (optional image in the "pics" field)
ReturnProductRouter.post("", verifyThree, returnUploader.single("pics"), createRecord)

// All returns (admin list / delivery boy assigned / buyer returns)
ReturnProductRouter.get("", verifyFour, getRecord)

// A user's own returns. Must stay ABOVE "/:_id" or "user" is read as an id.
ReturnProductRouter.get("/user/:userid", verifyFour, getUserRecord)

ReturnProductRouter.get("/:_id", verifyFour, getSingleRecord)

// Update status / reason / delivery boy / replace image (verifyFour = Buyer+Admin+Shop+DeliveryBoy)
ReturnProductRouter.put("/:_id", verifyFour, returnUploader.single("pics"), updateRecord)

ReturnProductRouter.delete("/:_id", verifyThree, deleteRecord)

module.exports = ReturnProductRouter;
