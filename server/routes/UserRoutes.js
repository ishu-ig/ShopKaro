const UserRouter = require("express").Router()
const {  verifyBoth, verifyAdmin } = require("../middleware/authentication")
const { userUploader } = require("../middleware/fileuploader")
const {
    createRecord,
    getRecord,
    getSingleRecord,
    updateRecord,
    deleteRecord,
    login,
    forgetPassword1,
    forgetPassword2,
    forgetPassword3,
} = require("../controllers/UserController")

UserRouter.post("", createRecord)
UserRouter.get("", verifyAdmin,  getRecord)
UserRouter.get("/:_id", verifyBoth, getSingleRecord)
UserRouter.put("/:_id", verifyBoth, userUploader.single("pic"), updateRecord)
UserRouter.delete("/:_id", verifyAdmin,  deleteRecord)
UserRouter.post("/login", login)
UserRouter.post("/forgetPassword-1", forgetPassword1)
UserRouter.post("/forgetPassword-2", forgetPassword2)
UserRouter.post("/forgetPassword-3", forgetPassword3)




module.exports = UserRouter