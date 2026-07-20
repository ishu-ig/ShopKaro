const UserRouter = require("express").Router();

const { userUploader } = require("../middleware/fileuploader");
const {
    verifyAdmin,
    verifyBoth,
    verifyThree
} = require("../middleware/authentication")

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
    otpSend,
    validateOtp,
    checkEmail,
    checkUsername,
} = require("../controllers/UserController");

// Public routes
UserRouter.post("/", createRecord);
UserRouter.post("/login", login);

UserRouter.post("/forgetPassword-1", forgetPassword1);
UserRouter.post("/forgetPassword-2", forgetPassword2);
UserRouter.post("/forgetPassword-3", forgetPassword3);

UserRouter.post("/otpSend", otpSend);
UserRouter.post("/validateOtp", validateOtp);

UserRouter.get("/check-username", checkUsername);
UserRouter.get("/check-email", checkEmail);

// Protected routes
UserRouter.get("/",  getRecord);
UserRouter.get("/:_id",  getSingleRecord);

UserRouter.put(
    "/:_id",
    
    userUploader.single("pic"),
    updateRecord
);

UserRouter.delete("/:_id", deleteRecord);

module.exports = UserRouter;