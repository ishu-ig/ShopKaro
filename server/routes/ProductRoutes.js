const ProductRouter = require("express").Router()
const { productUploader } = require("../middleware/fileuploader")
const { verifyAdmin, verifyBoth } = require("../middleware/authentication")
const {
    createRecord,
    getRecord,
    getSingleRecord,
    updateRecord,
    deleteRecord,
    addReview,
} = require("../controllers/ProductController")

ProductRouter.post("", verifyAdmin, productUploader.array("pic"), createRecord)
ProductRouter.get("", getRecord)
ProductRouter.get("/:_id", getSingleRecord)
ProductRouter.put("/:_id", verifyAdmin, productUploader.array("pic"), updateRecord)
ProductRouter.delete("/:_id", verifyAdmin, deleteRecord)
ProductRouter.post("/:_id/review", verifyBoth, addReview)

module.exports = ProductRouter