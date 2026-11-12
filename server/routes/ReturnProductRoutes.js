
const express = require("express");
const ReturnProductRouter = express.Router();
const { verifyBoth } = require("../middleware/authentication")

const {
    createRecord,
    getRecord,
    getSingleRecord,
    updateRecord,
    deleteRecord
} = require("../controllers/ReturnProductController");

ReturnProductRouter.post("", verifyBoth, createRecord)
ReturnProductRouter.get("", getRecord)
ReturnProductRouter.get("/:_id", getSingleRecord)
ReturnProductRouter.put("/:_id", verifyBoth, updateRecord)
ReturnProductRouter.delete("/:_id", verifyBoth, deleteRecord)

module.exports = ReturnProductRouter;
