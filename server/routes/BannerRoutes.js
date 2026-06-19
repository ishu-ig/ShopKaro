const BannerRouter = require("express").Router()
const { bannerUploader } = require("../middleware/fileuploader")
const { verifyAdmin } = require("../middleware/authentication")
const {
    createRecord,
    getRecord,
    getSingleRecord,
    updateRecord,
    deleteRecord,
} = require("../controllers/BannerController")

BannerRouter.post("", verifyAdmin, bannerUploader.single("pic"), createRecord)
BannerRouter.get("", getRecord)
BannerRouter.get("/:_id",  getSingleRecord)
BannerRouter.put("/:_id", verifyAdmin, bannerUploader.single("pic"), updateRecord)
BannerRouter.delete("/:_id", verifyAdmin, deleteRecord)


module.exports = BannerRouter