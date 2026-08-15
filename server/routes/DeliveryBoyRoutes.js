const DeliveryBoyRouter = require("express").Router();

const { deliveryBoyUploader } = require("../middleware/fileuploader");
const {
    verifyAdmin,
    verifyBoth,
    verifyThree,
    verifyTwoDelivery
} = require("../middleware/authentication");

const {
    createRecord,
    getRecord,
    updateRecord,
    getSingleRecord,
    deleteRecord,
    login,
    forgetPassword1,
    forgetPassword2,
    forgetPassword3,
    checkEmail,
    checkUsername,
} = require("../controllers/DeliveryController");

// Public routes
DeliveryBoyRouter.post("/", deliveryBoyUploader.single("pic"), createRecord);
DeliveryBoyRouter.post("/login", login);

DeliveryBoyRouter.post("/forgetPassword-1", forgetPassword1);
DeliveryBoyRouter.post("/forgetPassword-2", forgetPassword2);
DeliveryBoyRouter.post("/forgetPassword-3", forgetPassword3);


DeliveryBoyRouter.get("/check-username", checkUsername);
DeliveryBoyRouter.get("/check-email", checkEmail);

// Data routes
DeliveryBoyRouter.get("/", getRecord);
DeliveryBoyRouter.get("/:_id", getSingleRecord);

DeliveryBoyRouter.put("/:_id", verifyTwoDelivery, deliveryBoyUploader.single("pic"), updateRecord);
DeliveryBoyRouter.delete("/:_id", verifyTwoDelivery, deleteRecord);

module.exports = DeliveryBoyRouter;