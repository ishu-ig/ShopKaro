const express = require("express");
const ReturnProductRouter = express.Router();
const { verifyBoth, verifyThree, verifyFour } = require("../middleware/authentication");

// TODO: point this at the same multer + Cloudinary uploader your other
// image routes use (the one that sets req.file.path to the Cloudinary URL)
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

// Create a return request (optional image in the "pics" field)
ReturnProductRouter.post("", verifyThree, returnUploader.single("pics"), createRecord)

// All returns (admin list)
ReturnProductRouter.get("", getRecord)

// A user's own returns. Must stay ABOVE "/:_id" or "user" is read as an id.
ReturnProductRouter.get("/user/:userid", verifyThree, getUserRecord)

ReturnProductRouter.get("/:_id", getSingleRecord)

// Update status / reason / delivery boy / replace image (verifyFour = Buyer+Admin+Shop+DeliveryBoy)
ReturnProductRouter.put("/:_id", verifyFour, returnUploader.single("pics"), updateRecord)

// Online refund through Razorpay (admin only)
ReturnProductRouter.post("/refund/:_id", verifyThree, refundRecord)

ReturnProductRouter.delete("/:_id", verifyThree, deleteRecord)

module.exports = ReturnProductRouter;