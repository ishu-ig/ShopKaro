const Subcategory = require("../models/Subcategory")
const Maincategory = require("../models/Maincategory")
const { deleteFromCloudinary } = require("../cloudinaryMethods");

async function createRecord(req, res) {
    try {
        let data = new Subcategory(req.body)
        if (req.file) {
            data.pic = req.file.path
        }
        await data.save()
        await data.populate("maincategory", "name pic active")   // populate after save
        res.send({
            result: "Done",
            data: data
        })
    } catch (error) {

        if (req.file) await deleteFromCloudinary(req.file.path);

        let errorMessage = {}
        error.keyValue ? errorMessage.name = "Subcategory With This Name Already Exist in This Main Category" : null
        error.errors?.name ? errorMessage.name = error.errors.name.message : null
        error.errors?.maincategory ? errorMessage.maincategory = error.errors.maincategory.message : null
        error.errors?.pic ? errorMessage.pic = error.errors.pic.message : null

        if (Object.values(errorMessage).length === 0) {
            res.status(500).send({
                result: "Fail",
                reason: error.message || "Internal Server Error"
            })
        }
        else {
            res.status(400).send({
                result: "Fail",
                reason: errorMessage
            })
        }
    }
}

async function getRecord(req, res) {
    try {
        // Optional filter: GET /subcategory?maincategory=<id>
        const filter = {}
        if (req.query.maincategory) filter.maincategory = req.query.maincategory

        let data = await Subcategory.find(filter)
            .populate("maincategory", "name pic active")
            .sort({ _id: -1 })

        res.send({
            result: "Done",
            count: data.length,
            data: data
        })
    } catch (error) {
        // console.log(error)
        res.status(500).send({
            result: "Fail",
            reason: "Internal Server Error"
        })
    }
}

async function getSingleRecord(req, res) {
    try {
        let data = await Subcategory.findOne({ _id: req.params._id })
            .populate("maincategory", "name pic active")

        if (data)
            res.send({
                result: "Done",
                data: data
            })
        else
            res.status(404).send({
                result: "Fail",
                reason: "Record Not Found"
            })
    } catch (error) {
        // console.log(error)
        res.status(500).send({
            result: "Fail",
            reason: "Internal Server Error"
        })
    }
}

async function updateRecord(req, res) {
    try {
        let data = await Subcategory.findOne({ _id: req.params._id });

        if (!data) {
            return res.status(404).send({
                result: "Fail",
                reason: "Record Not Found"
            });
        }

        const oldPic = data.pic;

        if (req.body.name) data.name = req.body.name;
        if (req.body.maincategory && req.body.maincategory !== "undefined" && req.body.maincategory !== "") {
            data.maincategory = req.body.maincategory;
        }
        if (req.body.active !== undefined) {
            data.active = req.body.active === true || req.body.active === "true" || req.body.active === "1" || req.body.active === 1;
        }

        if (req.file) {
            data.pic = req.file.path;
        }

        await data.save();
        await data.populate("maincategory", "name pic active");   // populate after save

        // Delete old image after successful save
        if (req.file && oldPic) {
            await deleteFromCloudinary(oldPic);
        }

        res.send({
            result: "Done",
            data
        });

    } catch (error) {

        if (req.file) {
            await deleteFromCloudinary(req.file.path);
        }

        let errorMessage = {};

        if (error.keyValue)
            errorMessage.name = "Subcategory With This Name Already Exist in This Main Category";
        if (error.errors?.name)
            errorMessage.name = error.errors.name.message;
        if (error.errors?.maincategory)
            errorMessage.maincategory = error.errors.maincategory.message;
        if (error.errors?.pic)
            errorMessage.pic = error.errors.pic.message;

        res.status(Object.keys(errorMessage).length ? 400 : 500).send({
            result: "Fail",
            reason: Object.keys(errorMessage).length
                ? errorMessage
                : (error.message || "Internal Server Error")
        });
    }
}

async function deleteRecord(req, res) {
    try {
        let data = await Subcategory.findOne({ _id: req.params._id });

        if (!data) {
            return res.status(404).send({
                result: "Fail",
                reason: "Record Not Found"
            });
        }

        if (data.pic) {
            await deleteFromCloudinary(data.pic);
        }

        await data.deleteOne();

        res.send({
            result: "Done",
            data
        });

    } catch (error) {
        res.status(500).send({
            result: "Fail",
            reason: "Internal Server Error"
        });
    }
}

module.exports = {
    createRecord: createRecord,
    getRecord: getRecord,
    getSingleRecord: getSingleRecord,
    updateRecord: updateRecord,
    deleteRecord: deleteRecord
}