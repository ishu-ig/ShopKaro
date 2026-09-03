const Shop = require("../models/Shop")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { deleteFromCloudinary } = require("../cloudinaryMethods");
const { login, forgetPassword1, forgetPassword2, forgetPassword3, checkEmail } = require("../Login_ForgetPassword")
const mailer = require("../mailer/index")
const { welcomeShopTemplate } = require("../mailer/templates")

const schema = require("../Password")

// ── Shared helper: extract Mongoose validation messages ───────────────────────
// NOTE: field list trimmed to only what's actually on ShopSchema. The old
// list included seatAvailable/reservationPrice/discount/finalPrice/rating/
// openTime/closeTime — none of those exist on this schema anymore.
function extractValidationErrors(error) {
    const fields = [
        "name", "ownerName", "email", "pic", "phone", "permanentLocation"
    ]
    const errorMessage = {}
    if (error.keyValue) errorMessage.name = "Shop Already Exists"
    fields.forEach(field => {
        if (error.errors?.[field]) {
            errorMessage[field] = error.errors[field].message
        }
    })
    return errorMessage
}

// ── Shared helper: strip sensitive fields before sending a record back ────────
function sanitizeShop(doc) {
    if (!doc) return doc
    const plain = typeof doc.toObject === "function" ? doc.toObject() : doc
    delete plain.password
    delete plain.otp
    return plain
}

function sendWelcomeEmail({ email, ownerName, name, plainPassword }) {
    mailer.sendMail({
        from: process.env.MAIL_SENDER,
        to: email,
        subject: `Your Shop Account Is Ready - ${process.env.SITE_NAME || "ShopKaro"}`,
        html: welcomeShopTemplate({
            ownerName,
            shopName: name,
            email,
            plainPassword
        }),
    }, (error) => {
        if (error) console.log("Error sending shop welcome email:", error);
    });
}

// ── CREATE ────────────────────────────────────────────────────────────────────
async function createRecord(req, res) {
    try {
        // Check password
        if (!req.body.password) {
            return res.status(400).send({
                result: "Fail",
                reason: {
                    password: "Password Is Mandatory"
                }
            });
        }

        // Validate password
        const validationErrors = schema.validate(req.body.password, {
            list: true
        });

        if (validationErrors.length > 0) {
            const messages = {
                min: "Password must be at least 8 characters long.",
                max: "Password must not exceed 100 characters.",
                uppercase: "Password must contain at least one uppercase letter.",
                lowercase: "Password must contain at least one lowercase letter.",
                digits: "Password must contain at least one digit.",
                symbols: "Password must contain at least one special character.",
                spaces: "Password should not contain spaces.",
                oneOf: "This password is too common. Please choose another one."
            };

            return res.status(400).send({
                result: "Fail",
                reason: validationErrors.map(
                    error => messages[error] || "Invalid password."
                )
            });
        }

        // Keep the plaintext password so we can email it — never stored,
        // never sent back in any API response, only used for the one-time
        // welcome email below.
        const plainPassword = req.body.password;

        // Hash password
        const hash = await bcrypt.hash(req.body.password, 12);

        // ── Parse JSON-stringified fields ──────────────────────────────────
        // This route goes through multer (multipart/form-data), so every
        // field in req.body arrives as a plain string — including ones the
        // client JSON.stringify()'d on purpose (arrays / nested objects).
        // Handing those raw strings straight to `new Shop(...)` throws
        // a Mongoose CastError — array-of-ObjectId fields and the nested
        // permanentLocation subdocument can't cast a raw string — which is
        // what was causing the 400. Parse them the same way updateRecord
        // already does further down in this file.
        let maincategory = req.body.maincategory;
        if (typeof maincategory === "string") {
            try { maincategory = JSON.parse(maincategory); }
            catch { maincategory = maincategory ? [maincategory] : []; }
        }

        let subcategory = req.body.subcategory;
        if (typeof subcategory === "string") {
            try { subcategory = JSON.parse(subcategory); }
            catch { subcategory = subcategory ? [subcategory] : []; }
        }

        let permanentLocation = req.body.permanentLocation;
        if (typeof permanentLocation === "string") {
            try { permanentLocation = JSON.parse(permanentLocation); }
            catch { permanentLocation = undefined; }
        }

        const data = new Shop({
            ...req.body,
            maincategory: Array.isArray(maincategory) ? maincategory : (maincategory ? [maincategory] : []),
            subcategory: Array.isArray(subcategory) ? subcategory : (subcategory ? [subcategory] : []),
            ...(permanentLocation ? { permanentLocation } : {}),
            password: hash,
            role: "Shop"
        });

        // Save uploaded image
        if (req.file) {
            data.pic = req.file.path;
        }

        await data.save();

        let finalData = await Shop.findById(data._id)
            .populate("maincategory", ["name", "pic", "active"])
            .populate("subcategory", ["name", "pic", "active"])

        // Never send password/otp back
        const responseData = sanitizeShop(finalData);

        // Email the owner their login credentials (non-blocking).
        sendWelcomeEmail({
            email: data.email,
            ownerName: data.ownerName,
            name: data.name,
            plainPassword
        });

        return res.status(201).send({
            result: "Done",
            data: responseData
        });

    } catch (error) {
        // Delete uploaded image if database save fails
        if (req.file) {
            try {
                await deleteFromCloudinary(req.file.path);
            } catch (cloudinaryError) {
                console.error(
                    "Cloudinary cleanup error:",
                    cloudinaryError
                );
            }
        }

        const errorMessage = {};

        // Duplicate fields
        if (error.code === 11000) {
            if (error.keyValue?.name)
                errorMessage.name = "Shop with this Name Already Exists.";

            if (error.keyValue?.email)
                errorMessage.email = "Shop with this Email Already Exists.";

            if (error.keyValue?.phone)
                errorMessage.phone = "Shop with this Contact Number Already Exists.";
        }

        // Mongoose validation errors
        if (error.errors) {
            Object.keys(error.errors).forEach(field => {
                errorMessage[field] = error.errors[field].message;
            });
        }

        if (Object.keys(errorMessage).length > 0) {
            return res.status(400).send({
                result: "Fail",
                reason: errorMessage
            });
        }

        console.error("Shop createRecord error:", error);

        return res.status(500).send({
            result: "Fail",
            reason: "Internal Server Error"
        });
    }
}

// ── GET ALL ───────────────────────────────────────────────────────────────────
async function getRecord(req, res) {
    try {
        let data = await Shop.find().sort({ _id: -1 })
            .populate("maincategory", ["name", "pic", "active"])
            .populate("subcategory", ["name", "pic", "active"])
            .select("-password -otp")

        res.send({ result: "Done", count: data.length, data })

    } catch (error) {
        console.error("getRecord error:", error)
        res.status(500).send({ result: "Fail", reason: "Internal Server Error" })
    }
}

// ── GET SINGLE ────────────────────────────────────────────────────────────────
// NOTE: dropped `.populate("reviews.user", ...)` — ShopSchema has no
// `reviews` field, so that populate call would silently no-op at best and
// was only ever meaningful when this model still carried a reviews array.
//
// NOTE: also dropped the nested `subcategory.maincategory` populate —
// Subcategory schema has no `maincategory` field, so that nested populate
// threw StrictPopulateError on every call to this endpoint.
async function getSingleRecord(req, res) {
    try {
        let data = await Shop.findById(req.params._id)
            .select("-password -otp")
            .populate("maincategory", ["name", "pic", "active"])
            .populate("subcategory", ["name", "pic", "active"])

        if (!data) {
            return res.status(404).send({ result: "Fail", reason: "Record Not Found" })
        }
        res.send({ result: "Done", data })

    } catch (error) {
        console.error("getSingleRecord error:", error)
        res.status(500).send({ result: "Fail", reason: "Internal Server Error" })
    }
}

// ── UPDATE (admin — full update with optional pic) ────────────────────────────
//
// Rewritten from a fetch-mutate-save() pattern to findByIdAndUpdate($set).
// Why: `.save()` re-validates the ENTIRE document, including required
// fields (password/email/ownerName) that this endpoint never touches. If
// any existing record is missing one of those (legacy data, or a prior
// buggy update — see the empty-string issue below), every future edit to
// that record would fail with "Password Is Mandatory" etc., even though
// the edit had nothing to do with those fields. findByIdAndUpdate + $set
// only validates the paths actually being written.
//
// Also guards against blanking required string fields: Mongoose's String
// `required` validator rejects "" as well as null/undefined, so a naive
// `req.body.ownerName ?? data.ownerName` will happily overwrite a valid
// value with an empty string if the client sends one (e.g. a form field
// that wasn't populated). We only apply an incoming value for those
// fields when it's a non-empty string.
//
// NOTE: dropped seatAvailable/reservationPrice/discount/finalPrice/
// openTime/closeTime/isOpen/isreservation — none of those exist on
// ShopSchema. `status` and `active` both exist on the schema and are
// kept, since they're distinct fields there.
async function updateRecord(req, res) {
    try {
        let data = await Shop.findById(req.params._id);

        if (!data) {
            return res.status(404).send({
                result: "Fail",
                reason: "Record Not Found"
            });
        }

        const update = {};

        // ---------- Required string fields: never accept a blank overwrite ----------
        const nonEmptyString = (v) => typeof v === "string" && v.trim() !== "";

        if (nonEmptyString(req.body.name)) update.name = req.body.name;
        if (nonEmptyString(req.body.ownerName)) update.ownerName = req.body.ownerName;
        if (nonEmptyString(req.body.email)) update.email = req.body.email;

        // ---------- Everything else: fine to accept as-is when provided ----------
        if (req.body.phone !== undefined) update.phone = req.body.phone;
        if (req.body.status !== undefined) update.status = req.body.status;
        if (req.body.active !== undefined) update.active = req.body.active;

        // ---------- Maincategory ----------
        if (req.body.maincategory !== undefined) {
            let ids = req.body.maincategory;

            if (typeof ids === "string") {
                try {
                    ids = JSON.parse(ids);
                } catch {
                    ids = [ids];
                }
            }

            update.maincategory = Array.isArray(ids) ? ids : [ids];
        }

        // ---------- Subcategory ----------
        if (req.body.subcategory !== undefined) {
            let ids = req.body.subcategory;

            if (typeof ids === "string") {
                try {
                    ids = JSON.parse(ids);
                } catch {
                    ids = [ids];
                }
            }

            update.subcategory = Array.isArray(ids) ? ids : [ids];
        }

        // ---------- Permanent Location (merge with existing, same as before) ----------
        if (req.body.permanentLocation) {
            let location = req.body.permanentLocation;

            if (typeof location === "string") {
                location = JSON.parse(location);
            }

            update.permanentLocation = {
                ...data.permanentLocation.toObject(),
                ...location
            };
        }

        // ---------- Image ----------
        if (req.file) {
            const oldPic = data.pic;
            update.pic = req.file.path;

            if (oldPic) {
                try {
                    await deleteFromCloudinary(oldPic);
                } catch (err) {
                    console.log("Old image delete failed:", err);
                }
            }
        }

        const updatedDoc = await Shop.findByIdAndUpdate(
            req.params._id,
            { $set: update },
            { new: true, runValidators: true, context: "query" }
        );

        const finalData = await Shop.findById(updatedDoc._id)
            .populate("maincategory", ["name", "pic", "active"])
            .populate("subcategory", ["name", "pic", "active"])
            .select("-password -otp");

        res.send({
            result: "Done",
            data: finalData
        });

    } catch (error) {

        if (req.file) {
            await deleteFromCloudinary(req.file.path);
        }

        console.error(error);

        // Surface real validation errors (e.g. someone did send an
        // invalid phone/email) instead of always answering 500.
        if (error.errors) {
            const errorMessage = {};
            Object.keys(error.errors).forEach(field => {
                errorMessage[field] = error.errors[field].message;
            });
            return res.status(400).send({ result: "Fail", reason: errorMessage });
        }

        res.status(500).send({
            result: "Fail",
            reason: "Internal Server Error"
        });
    }
}

// ── DELETE ────────────────────────────────────────────────────────────────────
async function deleteRecord(req, res) {
    try {
        let data = await Shop.findById(req.params._id)
            .populate("maincategory", ["name", "pic", "active"])
            .populate("subcategory", ["name", "pic", "active"])

        if (!data) {
            return res.status(404).send({ result: "Fail", reason: "Record Not Found" })
        }

        if (data.pic) await deleteFromCloudinary(data.pic);
        await data.deleteOne()
        res.send({ result: "Done", data: sanitizeShop(data) })

    } catch (error) {
        console.error("deleteRecord error:", error)
        res.status(500).send({ result: "Fail", reason: "Internal Server Error" })
    }
}

module.exports = {
    createRecord,
    getRecord,
    getSingleRecord,
    updateRecord,
    deleteRecord,
    login: login(Shop, { getSecretKey: () => process.env.JWT_SECRET_KEY_SHOP }),
    forgetPassword1: forgetPassword1(Shop),
    forgetPassword2: forgetPassword2(Shop),
    forgetPassword3: forgetPassword3(Shop),
    checkEmail: checkEmail(Shop)
}