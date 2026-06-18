const Testimonial = require("../models/Testimonial")
const { deleteFromCloudinary }        = require("../cloudinaryMethods");

async function createRecord(req, res) {
    try {
        let data = new Testimonial(req.body)
        if (req.file) {
            data.pic = req.file.path
        }
        await data.save()
        res.send({
            result: "Done",
            data: data
        })
    } catch (error) {

        if (req.file) await deleteFromCloudinary(req.file.path);

        let errorMessage = {}
        error.errors?.name ? errorMessage.name = error.errors.name.message : null
        error.errors?.message ? errorMessage.message = error.errors.message.message : null
        error.errors?.pic ? errorMessage.pic = error.errors.pic.message : null

        if (Object.values(errorMessage).length === 0) {
            res.status(500).send({
                result: "Fail",
                reason: "Internal Server Error"
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
        let data = await Testimonial.find().sort({ _id: -1 })
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
        let data = await Testimonial.findOne({ _id: req.params._id })
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

// ✅ Correct
async function updateRecord(req, res) {
    try {
        let data = await Testimonial.findById(req.params._id);

        if (!data) {
            return res.status(404).send({ result: "Fail", reason: "Record Not Found" });
        }

        const oldPic = data.pic;

        data.name    = req.body.name    ?? data.name;
        data.message = req.body.message ?? data.message;
        data.active  = req.body.active  ?? data.active;

        if (req.file) {
            data.pic = req.file.path;
        }

        await data.save();

        if (req.file && oldPic) {
            await deleteFromCloudinary(oldPic);  // delete OLD pic after save
        }

        res.send({ result: "Done", data });

    } catch (error) {
        if (req.file) await deleteFromCloudinary(req.file.path);
        res.status(500).send({ result: "Fail", reason: "Internal Server Error" });
    }
}

async function deleteRecord(req, res) {
    try {
        let data = await Testimonial.findById(req.params._id);

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