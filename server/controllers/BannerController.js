const Banner                          = require("../models/Banner");
const { deleteFromCloudinary }        = require("../cloudinaryMethods");

// ── Helpers ───────────────────────────────────────────────────────────────────
function extractValidationErrors(error) {
    const errorMessage = {};
    ["title", "pic", "link"].forEach(field => {
        if (error.errors?.[field]) {
            errorMessage[field] = error.errors[field].message;
        }
    });
    return errorMessage;
}

// ── CREATE ────────────────────────────────────────────────────────────────────
async function createRecord(req, res) {
    try {
        if (!req.file) {
            return res.status(400).send({ result: "Fail", reason: { pic: "Banner image is required" } });
        }

        const data = new Banner({
            title:  req.body.title,
            pic:    req.file.path,
            link:   req.body.link ?? null,
            active: req.body.active,
        });

        await data.save();
        res.status(201).send({ result: "Done", data });

    } catch (error) {
        if (req.file) await deleteFromCloudinary(req.file.path);

        const errorMessage = extractValidationErrors(error);
        if (Object.keys(errorMessage).length === 0) {
            console.error("Banner createRecord error:", error);
            return res.status(500).send({ result: "Fail", reason: "Internal Server Error" });
        }
        res.status(400).send({ result: "Fail", reason: errorMessage });
    }
}

// ── GET ALL ───────────────────────────────────────────────────────────────────
async function getRecord(req, res) {
    try {
        const filter = {};
        if (req.query.active !== undefined) filter.active = req.query.active === "true";

        const data = await Banner.find(filter).sort({ _id: -1 });
        res.send({ result: "Done", count: data.length, data });

    } catch (error) {
        console.error("Banner getRecord error:", error);
        res.status(500).send({ result: "Fail", reason: "Internal Server Error" });
    }
}

// ── GET SINGLE ────────────────────────────────────────────────────────────────
async function getSingleRecord(req, res) {
    try {
        const data = await Banner.findById(req.params._id);

        if (!data) {
            return res.status(404).send({ result: "Fail", reason: "Banner Not Found" });
        }

        res.send({ result: "Done", data });

    } catch (error) {
        console.error("Banner getSingleRecord error:", error);
        res.status(500).send({ result: "Fail", reason: "Internal Server Error" });
    }
}

// ── UPDATE ────────────────────────────────────────────────────────────────────
async function updateRecord(req, res) {
    try {
        const data = await Banner.findById(req.params._id);

        if (!data) {
            return res.status(404).send({ result: "Fail", reason: "Banner Not Found" });
        }

        data.title  = req.body.title  ?? data.title;
        data.link   = req.body.link   ?? data.link;
        data.active = req.body.active ?? data.active;

        if (req.file) {
            await deleteFromCloudinary(data.pic); // delete old Cloudinary image
            data.pic = req.file.path;
        }

        await data.save();
        res.send({ result: "Done", data });

    } catch (error) {
        if (req.file) await deleteFromCloudinary(req.file.path); // clean up new upload

        const errorMessage = extractValidationErrors(error);
        if (Object.keys(errorMessage).length === 0) {
            console.error("Banner updateRecord error:", error);
            return res.status(500).send({ result: "Fail", reason: "Internal Server Error" });
        }
        res.status(400).send({ result: "Fail", reason: errorMessage });
    }
}

// ── DELETE ────────────────────────────────────────────────────────────────────
async function deleteRecord(req, res) {
    try {
        const data = await Banner.findById(req.params._id);

        if (!data) {
            return res.status(404).send({ result: "Fail", reason: "Banner Not Found" });
        }

        await deleteFromCloudinary(data.pic); // delete stored image
        await data.deleteOne();
        res.send({ result: "Done", data });

    } catch (error) {
        console.error("Banner deleteRecord error:", error);
        res.status(500).send({ result: "Fail", reason: "Internal Server Error" });
    }
}

module.exports = { createRecord, getRecord, getSingleRecord, updateRecord, deleteRecord };