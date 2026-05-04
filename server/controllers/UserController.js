const User = require("../models/User")
const fs = require("fs")
const mailer = require("../mailer/index")
const passwordValidator = require('password-validator')
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

// ── Password policy ───────────────────────────────────────────────────────────
const schema = new passwordValidator()
schema
    .is().min(8)
    .is().max(100)
    .has().uppercase(1)
    .has().lowercase(1)
    .has().digits(1)
    .has().not().spaces()
    .is().not().oneOf(['Passw0rd', 'Password123'])

// ── Helpers ───────────────────────────────────────────────────────────────────
function buildErrorMessage(error) {
    let msg = {}
    error.keyValue?.username  && (msg.username = "User with this Username already exists")
    error.keyValue?.email     && (msg.email    = "User with this Email Address already exists")
    error.errors?.name        && (msg.name     = error.errors.name.message)
    error.errors?.username    && (msg.username = error.errors.username.message)
    error.errors?.email       && (msg.email    = error.errors.email.message)
    error.errors?.phone       && (msg.phone    = error.errors.phone.message)
    error.errors?.password    && (msg.password = error.errors.password.message)
    return msg
}

// ── Public: Buyer self-registration ──────────────────────────────────────────
async function createRecord(req, res) {
    if (!schema.validate(req.body.password)) {
        return res.status(400).send({
            result: "Fail",
            reason: "Invalid Password. Must contain at least 1 uppercase, 1 lowercase, 1 digit, no spaces, and be 8–100 characters long."
        })
    }

    bcrypt.hash(req.body.password, 12, async (error, hash) => {
        if (error) return res.status(500).send({ result: "Fail", reason: "Internal Server Error" })

        try {
            let data = new User(req.body)
            data.role     = "Buyer"      // public registration is always Buyer
            data.password = hash
            await data.save()
            res.send({ result: "Done", data })
        } catch (error) {
            try { fs.unlinkSync(req.file.path) } catch (_) {}
            const errorMessage = buildErrorMessage(error)
            if (Object.keys(errorMessage).length === 0)
                return res.status(500).send({ result: "Fail", reason: "Internal Server Error" })
            res.status(400).send({ result: "Fail", reason: errorMessage })
        }
    })
}

// ── Admin: create any role (Admin / Super Admin / Delivery Boy) ───────────────
async function adminCreateRecord(req, res) {
    if (!schema.validate(req.body.password)) {
        return res.status(400).send({
            result: "Fail",
            reason: "Invalid Password. Must contain at least 1 uppercase, 1 lowercase, 1 digit, no spaces, and be 8–100 characters long."
        })
    }

    const allowedRoles = ["Admin", "Super Admin", "Delivery Boy"]
    if (!allowedRoles.includes(req.body.role)) {
        return res.status(400).send({ result: "Fail", reason: "Invalid role specified." })
    }

    bcrypt.hash(req.body.password, 12, async (error, hash) => {
        if (error) return res.status(500).send({ result: "Fail", reason: "Internal Server Error" })

        try {
            let data = new User(req.body)
            data.password = hash

            // Delivery Boy extra fields
            if (req.body.role === "Delivery Boy") {
                data.vehicleNumber = req.body.vehicleNumber || ""
                data.vehicleType   = req.body.vehicleType   || ""
            }

            await data.save()
            res.send({ result: "Done", data })
        } catch (error) {
            try { fs.unlinkSync(req.file?.path) } catch (_) {}
            const errorMessage = buildErrorMessage(error)
            if (Object.keys(errorMessage).length === 0)
                return res.status(500).send({ result: "Fail", reason: "Internal Server Error" })
            res.status(400).send({ result: "Fail", reason: errorMessage })
        }
    })
}

// ── GET all users (optionally filter by role) ─────────────────────────────────
// GET /api/user          → all users
// GET /api/user?role=Delivery Boy  → only delivery boys
async function getRecord(req, res) {
    try {
        let filter = {}
        if (req.query.role) filter.role = req.query.role
        if (req.query.active !== undefined) filter.active = req.query.active === "true"

        let data = await User.find(filter).sort({ _id: -1 })
        res.send({ result: "Done", count: data.length, data })
    } catch (error) {
        res.status(500).send({ result: "Fail", reason: "Internal Server Error" })
    }
}

// ── GET delivery boys only (convenience endpoint) ─────────────────────────────
async function getDeliveryBoys(req, res) {
    try {
        let data = await User
            .find({ role: "Delivery Boy", active: true })
            .select("name phone vehicleNumber vehicleType currentOrders totalDeliveries")
            .sort({ name: 1 })
        res.send({ result: "Done", count: data.length, data })
    } catch (error) {
        res.status(500).send({ result: "Fail", reason: "Internal Server Error" })
    }
}

// ── GET single user ───────────────────────────────────────────────────────────
async function getSingleRecord(req, res) {
    try {
        let data = await User.findOne({ _id: req.params._id })
        if (data) res.send({ result: "Done", data })
        else       res.status(404).send({ result: "Fail", reason: "Record Not Found" })
    } catch (error) {
        res.status(500).send({ result: "Fail", reason: "Internal Server Error" })
    }
}

// ── UPDATE user ───────────────────────────────────────────────────────────────
async function updateRecord(req, res) {
    try {
        let data = await User.findOne({ _id: req.params._id })
        if (!data) return res.status(404).send({ result: "Fail", reason: "Record Not Found" })

        data.name    = req.body.name    ?? data.name
        data.username= req.body.username?? data.username
        data.email   = req.body.email   ?? data.email
        data.phone   = req.body.phone   ?? data.phone
        data.address = req.body.address ?? data.address
        data.pin     = req.body.pin     ?? data.pin
        data.city    = req.body.city    ?? data.city
        data.state   = req.body.state   ?? data.state
        data.active  = req.body.active  ?? data.active

        // Allow role update only by admin routes (middleware should guard this)
        if (req.body.role) data.role = req.body.role

        // Delivery Boy specific fields
        if (data.role === "Delivery Boy") {
            data.vehicleNumber = req.body.vehicleNumber ?? data.vehicleNumber
            data.vehicleType   = req.body.vehicleType   ?? data.vehicleType
        }

        if (await data.save() && req.file) {
            try { fs.unlinkSync(data.pic) } catch (_) {}
            data.pic = req.file.path
            await data.save()
        }

        res.send({ result: "Done", data })
    } catch (error) {
        try { fs.unlinkSync(req.file?.path) } catch (_) {}
        const errorMessage = buildErrorMessage(error)
        if (Object.keys(errorMessage).length === 0)
            return res.status(500).send({ result: "Fail", reason: "Internal Server Error" })
        res.status(400).send({ result: "Fail", reason: errorMessage })
    }
}

// ── DELETE user ───────────────────────────────────────────────────────────────
async function deleteRecord(req, res) {
    try {
        let data = await User.findOne({ _id: req.params._id })
        if (!data) return res.status(404).send({ result: "Fail", reason: "Record Not Found" })

        try { fs.unlinkSync(data.pic) } catch (_) {}
        await data.deleteOne()
        res.send({ result: "Done", data })
    } catch (error) {
        res.status(500).send({ result: "Fail", reason: "Internal Server Error" })
    }
}

// ── LOGIN ─────────────────────────────────────────────────────────────────────
async function login(req, res) {
    try {
        let data = await User.findOne({
            $or: [{ username: req.body.username }, { email: req.body.username }]
        })

        if (!data) return res.status(401).send({ result: "Fail", reason: "Invalid Username or Password" })

        if (!data.active) return res.status(403).send({ result: "Fail", reason: "Your account has been deactivated. Please contact admin." })

        const passwordMatch = await bcrypt.compare(req.body.password, data.password)
        if (!passwordMatch) return res.status(401).send({ result: "Fail", reason: "Invalid Username or Password" })

        const isBuyer      = data.role === "Buyer"
        const isDeliveryBoy= data.role === "Delivery Boy"
        let key = isBuyer
            ? process.env.JWT_SECRET_KEY_BUYER
            : isDeliveryBoy
                ? process.env.JWT_SECRET_KEY_DELIVERY
                : process.env.JWT_SECRET_KEY_ADMIN

        jwt.sign({ data }, key, { expiresIn: "15 Days" }, (error, token) => {
            if (error) return res.status(500).send({ result: "Fail", reason: "Internal Server Error" })
            res.send({ result: "Done", data, token })
        })
    } catch (error) {
        res.status(500).send({ result: "Fail", reason: "Internal Server Error" })
    }
}

// ── FORGET PASSWORD steps ─────────────────────────────────────────────────────
async function forgetPassword1(req, res) {
    try {
        let data = await User.findOne({
            $or: [{ username: req.body.username }, { email: req.body.username }]
        })
        if (!data) return res.status(404).send({ result: "Fail", reason: "User Not Found" })

        let otp = Number(Number(Math.random().toString().slice(2, 8)).toString().padEnd(6, 1))
        data.otp = otp
        await data.save()

        mailer.sendMail({
            from: process.env.MAIL_SENDER,
            to: data.email,
            subject: `OTP for Password Reset : Team ${process.env.SITE_NAME}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
                    <h2 style="text-align: center; color: #333;">Password Reset Request</h2>
                    <p>Hello <strong>${data.name}</strong>,</p>
                    <p>You have requested a password reset.</p>
                    <div style="text-align: center; font-size: 18px; font-weight: bold; padding: 10px; background-color: #f3f3f3; border-radius: 5px;">
                        Your OTP: <span style="color: #d32f2f; font-size: 22px;">${data.otp}</span>
                    </div>
                    <p style="color: #d32f2f; text-align: center; font-size: 14px;">Please do not share this OTP with anyone.</p>
                    <p>This OTP is valid for a limited time.</p>
                    <p>Regards,<br/><strong>Team ${process.env.SITE_NAME}</strong></p>
                </div>
            `
        }, (error) => { if (error) console.log(error) })

        res.send({ result: "Done", message: "OTP has been sent to your registered email address." })
    } catch (error) {
        console.log(error)
        res.status(500).send({ result: "Fail", reason: "Internal Server Error" })
    }
}

async function forgetPassword2(req, res) {
    try {
        let data = await User.findOne({
            $or: [{ username: req.body.username }, { email: req.body.username }]
        })
        if (!data) return res.status(401).send({ result: "Fail", reason: "Unauthorized Activity" })
        if (data.otp == req.body.otp) res.send({ result: "Done" })
        else res.status(400).send({ result: "Fail", reason: "Invalid OTP" })
    } catch (error) {
        res.status(500).send({ result: "Fail", reason: "Internal Server Error" })
    }
}

async function forgetPassword3(req, res) {
    try {
        let data = await User.findOne({
            $or: [{ username: req.body.username }, { email: req.body.username }]
        })
        if (!data) return res.status(401).send({ result: "Fail", reason: "Unauthorized Activity" })

        if (!schema.validate(req.body.password)) {
            return res.status(400).send({
                result: "Fail",
                reason: "Invalid Password. Must contain at least 1 uppercase, 1 lowercase, 1 digit, no spaces, and be 8–100 characters long."
            })
        }

        bcrypt.hash(req.body.password, 12, async (error, hash) => {
            if (error) return res.status(500).send({ result: "Fail", reason: "Internal Server Error" })
            data.password = hash
            data.otp      = "-234567"   // invalidate OTP after use
            await data.save()
            res.send({ result: "Done", message: "Password has been reset successfully." })
        })
    } catch (error) {
        res.status(500).send({ result: "Fail", reason: "Internal Server Error" })
    }
}

module.exports = {
    createRecord,
    adminCreateRecord,
    getRecord,
    getDeliveryBoys,
    getSingleRecord,
    updateRecord,
    deleteRecord,
    login,
    forgetPassword1,
    forgetPassword2,
    forgetPassword3
}