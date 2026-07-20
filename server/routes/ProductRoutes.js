const ProductRouter = require("express").Router()
const { productUploader } = require("../middleware/fileuploader")
const { verifyAdmin, verifyBoth, verifyThree, verifyFour } = require("../middleware/authentication")
const {
    createRecord,
    getRecord,
    getSingleRecord,
    updateRecord,
    deleteRecord,
    addReview,
} = require("../controllers/ProductController")

ProductRouter.post("",verifyBoth,  productUploader.array("pic"), createRecord)
ProductRouter.get("", getRecord)
ProductRouter.get("/:_id", getSingleRecord)
ProductRouter.put("/:_id", verifyBoth, productUploader.array("pic"), updateRecord)
ProductRouter.delete("/:_id", verifyBoth, deleteRecord)
ProductRouter.post("/:_id/review", verifyFour, addReview)

module.exports = ProductRouter