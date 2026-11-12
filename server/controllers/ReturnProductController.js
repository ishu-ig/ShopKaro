
const Return = require("../models/Return");

const RETURN_POPULATE = [
    {
        path: "product",
        select: "name brand discount variants"
    },
    {
        path: "user",
        select: "name username email phone"
    },
    {
        path: "order"
    }
];

// Allowed return statuses
const RETURN_STATUSES = [
    "pending",
    "approved",
    "rejected",
    "completed",
    "cancelled"
];

// CREATE RETURN REQUEST
async function createRecord(req, res) {
    try {
        let data = new Return({
            product: req.body.product,
            user: req.body.user,
            order: req.body.order,
            reason: req.body.reason,
            status: "pending"
        });

        await data.save();

        let finalData = await Return.findById(data._id)
            .populate(RETURN_POPULATE);

        res.status(201).send({
            result: "Done",
            message: "Product return request submitted successfully",
            data: finalData
        });

    } catch (error) {
        console.log(error);

        let errorMessage = {};

        error.errors?.product
            ? errorMessage.product = error.errors.product.message : null;

        error.errors?.user
            ? errorMessage.user = error.errors.user.message : null;

        error.errors?.order
            ? errorMessage.order = error.errors.order.message : null;

        error.errors?.reason
            ? errorMessage.reason = error.errors.reason.message : null;

        res.status(Object.keys(errorMessage).length ? 400 : 500).send({
            result: "Fail",
            reason: Object.keys(errorMessage).length
                ? errorMessage
                : "Internal Server Error"
        });
    }
}


// GET ALL RETURN REQUESTS (ADMIN)
async function getRecord(req, res) {
    try {
        let data = await Return.find()
            .sort({ createdAt: -1 })
            .populate(RETURN_POPULATE);

        res.send({
            result: "Done",
            count: data.length,
            data: data
        });

    } catch (error) {
        console.log(error);

        res.status(500).send({
            result: "Fail",
            reason: "Internal Server Error"
        });
    }
}


// GET USER RETURN REQUESTS
async function getUserRecord(req, res) {
    try {
        let data = await Return.find({
            user: req.params.userid
        })
            .sort({ createdAt: -1 })
            .populate(RETURN_POPULATE);

        res.send({
            result: "Done",
            count: data.length,
            data: data
        });

    } catch (error) {
        console.log(error);

        res.status(500).send({
            result: "Fail",
            reason: "Internal Server Error"
        });
    }
}


// GET SINGLE RETURN REQUEST
async function getSingleRecord(req, res) {
    try {
        let data = await Return.findById(req.params._id)
            .populate(RETURN_POPULATE);

        if (data) {
            res.send({
                result: "Done",
                data: data
            });
        } else {
            res.status(404).send({
                result: "Fail",
                reason: "Return Request Not Found"
            });
        }

    } catch (error) {
        console.log(error);

        res.status(500).send({
            result: "Fail",
            reason: "Internal Server Error"
        });
    }
}


// UPDATE RETURN REQUEST STATUS (ADMIN)
async function updateRecord(req, res) {
    try {
        let data = await Return.findById(req.params._id);

        if (!data) {
            return res.status(404).send({
                result: "Fail",
                reason: "Return Request Not Found"
            });
        }

        if (req.body.status) {
            const newStatus = req.body.status.toLowerCase();

            if (!RETURN_STATUSES.includes(newStatus)) {
                return res.status(400).send({
                    result: "Fail",
                    reason: `Invalid status. Allowed statuses: ${RETURN_STATUSES.join(", ")}`
                });
            }

            data.status = newStatus;
        }

        if (req.body.reason !== undefined) {
            data.reason = req.body.reason;
        }

        data.updatedAt = new Date();

        await data.save();

        let finalData = await Return.findById(data._id)
            .populate(RETURN_POPULATE);

        res.send({
            result: "Done",
            message: "Return request updated successfully",
            data: finalData
        });

    } catch (error) {
        console.log(error);

        res.status(500).send({
            result: "Fail",
            reason: "Internal Server Error"
        });
    }
}


// DELETE RETURN REQUEST
async function deleteRecord(req, res) {
    try {
        let data = await Return.findById(req.params._id);

        if (!data) {
            return res.status(404).send({
                result: "Fail",
                reason: "Return Request Not Found"
            });
        }

        await data.deleteOne();

        res.send({
            result: "Done",
            message: "Return request deleted successfully",
            data: data
        });

    } catch (error) {
        console.log(error);

        res.status(500).send({
            result: "Fail",
            reason: "Internal Server Error"
        });
    }
}


module.exports = {
    createRecord,
    getRecord,
    getSingleRecord,
    updateRecord,
    deleteRecord
};
