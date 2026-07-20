const ShopRouter = require("express").Router();

const { shopUploader } = require("../middleware/fileuploader");

const {
    verifyBoth
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
    checkEmail
} = require("../controllers/ShopController");


// ── Authentication / Static Routes ────────────────────────────────────────────

ShopRouter.post("/login", login);

ShopRouter.post("/forgetPassword-1", forgetPassword1);
ShopRouter.post("/forgetPassword-2", forgetPassword2);
ShopRouter.post("/forgetPassword-3", forgetPassword3);

ShopRouter.get("/check-email", checkEmail);



ShopRouter.post(
    "/",
    shopUploader.single("pic"),
    createRecord
);

ShopRouter.get("/", verifyBoth, getRecord);


// ── Dynamic ID Routes — KEEP LAST ─────────────────────────────────────────────

ShopRouter.get(
    "/:_id",
    verifyBoth,
    getSingleRecord
);

ShopRouter.put(
    "/:_id",
    verifyBoth,
    shopUploader.single("pic"),
    updateRecord
);

ShopRouter.delete(
    "/:_id",
    verifyBoth,
    deleteRecord
);

module.exports = ShopRouter;