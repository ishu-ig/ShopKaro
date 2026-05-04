const UserRouter = require("express").Router()
const { verifyBoth, verifyAdmin } = require("../middleware/authentication")
const { userUploader } = require("../middleware/fileuploader")
const {
    createRecord,
    adminCreateRecord,
    getRecord,
    getDeliveryBoys,
    getSingleRecord,
    updateRecord,
    deleteRecord,
    login,
    forgetPassword1,
    forgetPassword2,
    forgetPassword3,
} = require("../controllers/UserController")

// ── Public routes ─────────────────────────────────────────────────────────────
UserRouter.post("/login",            login)
UserRouter.post("/forgetPassword-1", forgetPassword1)
UserRouter.post("/forgetPassword-2", forgetPassword2)
UserRouter.post("/forgetPassword-3", forgetPassword3)
UserRouter.post("",                  createRecord)          // Buyer self-registration

// ── Admin routes ──────────────────────────────────────────────────────────────
UserRouter.post("/admin/create",     verifyAdmin, adminCreateRecord)   // create Admin / Super Admin / Delivery Boy
UserRouter.get("",                   verifyAdmin, getRecord)           // GET /api/user?role=Delivery Boy&active=true
UserRouter.get("/delivery-boys",     verifyAdmin, getDeliveryBoys)     // convenience: active delivery boys only
UserRouter.get("/:_id",              verifyBoth,  getSingleRecord)
UserRouter.put("/:_id",              verifyBoth,  userUploader.single("pic"), updateRecord)
UserRouter.delete("/:_id",           verifyAdmin, deleteRecord)

module.exports = UserRouter