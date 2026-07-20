const Address = require("../models/Address");
const User = require("../models/User");

// ── Helpers ───────────────────────────────────────────────────────────────────
function extractValidationErrors(error) {
    const errorMessage = {};

    ["user", "label", "lat", "lng", "address", "state", "city", "pin"]
        .forEach(field => {
            if (error.errors?.[field]) {
                errorMessage[field] = error.errors[field].message;
            }
        });

    return errorMessage;
}

// ── CREATE ────────────────────────────────────────────────────────────────────
async function createRecord(req, res) {
    try {
        const isDefault =
            req.body.isDefault === true ||
            req.body.isDefault === "true";

        // Remove previous default address
        if (isDefault) {
            await Address.updateMany(
                { user: req.body.user },
                { $set: { isDefault: false } }
            );
        }

        const data = new Address({
            ...req.body,
            isDefault
        });

        await data.save();

        // Add address reference to User
        const update = {
            $addToSet: { addresses: data._id }
        };

        // Set as user's default address
        if (isDefault) {
            update.$set = {
                defaultAddress: data._id
            };
        }

        await User.findByIdAndUpdate(data.user, update);

        res.status(201).send({
            result: "Done",
            data
        });

    } catch (error) {
        const errorMessage = extractValidationErrors(error);

        if (!Object.keys(errorMessage).length) {
            console.error("Address createRecord error:", error);

            return res.status(500).send({
                result: "Fail",
                reason: "Internal Server Error"
            });
        }

        res.status(400).send({
            result: "Fail",
            reason: errorMessage
        });
    }
}

// ── GET ALL ───────────────────────────────────────────────────────────────────
async function getRecord(req, res) {
    try {
        const data = await Address.find()
            .populate("user", "name email phone")
            .sort({ _id: -1 });

        res.send({
            result: "Done",
            count: data.length,
            data
        });

    } catch (error) {
        console.error(error);

        res.status(500).send({
            result: "Fail",
            reason: "Internal Server Error"
        });
    }
}

// ── GET USER ADDRESSES ────────────────────────────────────────────────────────
async function getUserAddress(req, res) {
    try {
        const data = await Address.find({
            user: req.params.userId
        }).sort({
            isDefault: -1,
            createdAt: -1
        });

        res.send({
            result: "Done",
            count: data.length,
            data
        });

    } catch (error) {
        console.error(error);

        res.status(500).send({
            result: "Fail",
            reason: "Internal Server Error"
        });
    }
}

// ── GET SINGLE ────────────────────────────────────────────────────────────────
async function getSingleRecord(req, res) {
    try {
        const data = await Address.findById(req.params._id)
            .populate("user", "name email phone");

        if (!data) {
            return res.status(404).send({
                result: "Fail",
                reason: "Address Not Found"
            });
        }

        res.send({
            result: "Done",
            data
        });

    } catch (error) {
        console.error(error);

        res.status(500).send({
            result: "Fail",
            reason: "Internal Server Error"
        });
    }
}

// ── UPDATE ────────────────────────────────────────────────────────────────────
async function updateRecord(req, res) {
    try {
        const data = await Address.findById(req.params._id);

        if (!data) {
            return res.status(404).send({
                result: "Fail",
                reason: "Address Not Found"
            });
        }

        const isDefault =
            req.body.isDefault === true ||
            req.body.isDefault === "true";

        // Set this address as default
        if (isDefault) {
            await Address.updateMany(
                {
                    user: data.user,
                    _id: { $ne: data._id }
                },
                {
                    $set: { isDefault: false }
                }
            );

            await User.findByIdAndUpdate(data.user, {
                defaultAddress: data._id
            });
        }

        data.label = req.body.label ?? data.label;
        data.lat = req.body.lat ?? data.lat;
        data.lng = req.body.lng ?? data.lng;
        data.address = req.body.address ?? data.address;
        data.state = req.body.state ?? data.state;
        data.city = req.body.city ?? data.city;
        data.pin = req.body.pin ?? data.pin;

        if (req.body.isDefault !== undefined) {
            data.isDefault = isDefault;
        }

        await data.save();

        res.send({
            result: "Done",
            data
        });

    } catch (error) {
        const errorMessage = extractValidationErrors(error);

        if (!Object.keys(errorMessage).length) {
            console.error(error);

            return res.status(500).send({
                result: "Fail",
                reason: "Internal Server Error"
            });
        }

        res.status(400).send({
            result: "Fail",
            reason: errorMessage
        });
    }
}

// ── DELETE ────────────────────────────────────────────────────────────────────
async function deleteRecord(req, res) {
    try {
        const data = await Address.findById(req.params._id);

        if (!data) {
            return res.status(404).send({
                result: "Fail",
                reason: "Address Not Found"
            });
        }

        // Remove address reference from User
        await User.findByIdAndUpdate(data.user, {
            $pull: {
                addresses: data._id
            }
        });

        // If deleting default address
        if (data.isDefault) {
            await User.findByIdAndUpdate(data.user, {
                defaultAddress: null
            });
        }

        await data.deleteOne();

        res.send({
            result: "Done",
            data
        });

    } catch (error) {
        console.error(error);

        res.status(500).send({
            result: "Fail",
            reason: "Internal Server Error"
        });
    }
}

module.exports = {
    createRecord,
    getRecord,
    getUserAddress,
    getSingleRecord,
    updateRecord,
    deleteRecord
};