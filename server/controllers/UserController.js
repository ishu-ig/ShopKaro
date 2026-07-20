const mongoose = require("mongoose");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const twilio = require("twilio");

const { deleteFromCloudinary } = require("../cloudinaryMethods");

const {
    login,
    forgetPassword1,
    forgetPassword2,
    forgetPassword3,
    checkEmail,
    checkUsername
} = require("../Login_ForgetPassword");

const schema = require("../Password");

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);


// ======================================================
// ROLE CONFIG
// ======================================================

const ALLOWED_ROLES = ["Buyer", "Admin"];


// ======================================================
// GET JWT SECRET KEY ACCORDING TO ROLE
// ======================================================

function getJwtSecretKey(role) {
    switch (role) {
        case "Admin":
            return process.env.JWT_SECRET_KEY_ADMIN;

        default:
            return process.env.JWT_SECRET_KEY_BUYER;
    }
}


// ======================================================
// CREATE USER
// ======================================================

async function createRecord(req, res) {
    try {
        // Bug fix: `password` and `role` were referenced as bare
        // identifiers below (not destructured from anywhere), which
        // threw "ReferenceError: password is not defined" the first
        // time this ran — never a Mongoose validation error at all.
        const { password, role } = req.body;

        if (!password) {
            return res.status(400).send({
                result: "Fail",
                reason: {
                    password: "Password Is Mandatory"
                }
            });
        }
        const validationErrors = schema.validate(password, {
            list: true
        });

        if (validationErrors.length > 0) {

            const errorMessages = validationErrors.map((error) => {

                switch (error) {

                    case "min":
                        return "Password must be at least 8 characters long.";

                    case "max":
                        return "Password must not exceed 100 characters.";

                    case "uppercase":
                        return "Password must contain at least one uppercase letter.";

                    case "lowercase":
                        return "Password must contain at least one lowercase letter.";

                    case "digits":
                        return "Password must contain at least one digit.";

                    case "symbols":
                        return "Password must contain at least one special character.";

                    case "spaces":
                        return "Password should not contain spaces.";

                    case "oneOf":
                        return "This password is too common. Please choose another one.";

                    default:
                        return "Invalid password.";
                }
            });

            return res.status(400).send({
                result: "Fail",
                reason: {
                    password: errorMessages
                }
            });
        }

        const hash = await bcrypt.hash(password, 12);
        const data = new User({
            ...req.body,
            password: hash,
            role: ALLOWED_ROLES.includes(role)
                ? role
                : "Buyer",
        });
        if (req.file) {
            data.pic = req.file.path;
        }
        await data.save();
        // Never return hashed password
        const userResponse = data.toObject();
        delete userResponse.password;


        return res.status(201).send({
            result: "Done",
            message: "User Created Successfully",
            data: userResponse
        });

    } catch (error) {

        console.log("Create User Error:", error);

        if (req.file) {
            try {
                await deleteFromCloudinary(req.file.path);
            } catch (cloudinaryError) {
                console.log(
                    "Cloudinary cleanup failed:",
                    cloudinaryError
                );
            }
        }


        const errorMessage = {};

        if (
            error.code === 11000 &&
            error.keyPattern
        ) {

            if (error.keyPattern.username) {
                errorMessage.username =
                    "User with this Username Already Exists.";
            }

            if (error.keyPattern.email) {
                errorMessage.email =
                    "User with this Email Address Already Exists.";
            }

            if (error.keyPattern.phone) {
                errorMessage.phone =
                    "User with this Contact Number Already Exists.";
            }
        }

        if (error.keyValue?.username) {
            errorMessage.username =
                "User with this Username Already Exists.";
        }

        if (error.keyValue?.email) {
            errorMessage.email =
                "User with this Email Address Already Exists.";
        }

        if (error.keyValue?.phone) {
            errorMessage.phone =
                "User with this Contact Number Already Exists.";
        }
        if (error.errors?.name) {
            errorMessage.name =
                error.errors.name.message;
        }

        if (error.errors?.username) {
            errorMessage.username =
                error.errors.username.message;
        }

        if (error.errors?.email) {
            errorMessage.email =
                error.errors.email.message;
        }

        if (error.errors?.phone) {
            errorMessage.phone =
                error.errors.phone.message;
        }

        if (error.errors?.password) {
            errorMessage.password =
                error.errors.password.message;
        }

        if (error.errors?.role) {
            errorMessage.role =
                error.errors.role.message;
        }


        if (Object.keys(errorMessage).length > 0) {

            return res.status(400).send({
                result: "Fail",
                reason: errorMessage
            });
        }
        return res.status(500).send({
            result: "Fail",
            reason: "Internal Server Error"
        });
    }
}
async function getRecord(req, res) {
    try {

        const data = await User.find()
            .select("-password -validOtp -otp")
            .populate("addresses")
            .populate("defaultAddress")
            .sort({
                _id: -1
            });


        return res.send({
            result: "Done",
            count: data.length,
            data
        });

    } catch (error) {

        console.log("Get Users Error:", error);

        return res.status(500).send({
            result: "Fail",
            reason: "Internal Server Error"
        });
    }
}

async function getSingleRecord(req, res) {
    try {

        const data = await User.findById(
            req.params._id
        )
            .select("-password -validOtp -otp")
            .populate("addresses")
            .populate("defaultAddress");


        if (!data) {

            return res.status(404).send({
                result: "Fail",
                reason: "Record Not Found"
            });
        }


        return res.send({
            result: "Done",
            data
        });

    } catch (error) {

        console.log(
            "Get Single User Error:",
            error
        );

        return res.status(500).send({
            result: "Fail",
            reason: "Internal Server Error"
        });
    }
}
async function updateRecord(req, res) {
    try {
       const data = await User.findById(
            req.params._id
        );
        if (!data) {
            if (req.file) {
                try {
                    await deleteFromCloudinary(
                        req.file.path
                    );
                } catch (error) {
                    console.log(error);
                }
            }

            return res.status(404).send({
                result: "Fail",
                reason: "Record Not Found"
            });
        }
            data.name = req.body.name;
            data.username = req.body.username;
            data.email = req.body.email;
            data.phone = req.body.phone;
            data.active = req.body.active;
        
        let oldPic = null;

        if (req.file) {
            oldPic = data.pic;
            data.pic =
                req.file.path;
        }
        await data.save();
        if (
            req.file &&
            oldPic
        ) 
            try {
                await deleteFromCloudinary(
                    oldPic
                );

            } catch (error) {
                console.log(
                    "Old image delete failed:",
                    error
                );
            }

        const userResponse =
            data.toObject();

        return res.send({
            result: "Done",
            message:
                "User Updated Successfully",
            data: userResponse
        });

    } catch (error) {
        console.log(
            "Update User Error:",
            error
        );
        if (req.file) {

            try {

                await deleteFromCloudinary(
                    req.file.path
                );

            } catch (cloudinaryError) {

                console.log(
                    "Cloudinary cleanup failed:",
                    cloudinaryError
                );
            }
        }
        const errorMessage = {};
        if (error.keyValue?.username) {
            errorMessage.username =
                "User with this Username Already Exists";
        }
        if (error.keyValue?.email) {
            errorMessage.email =
                "User with this Email Address Already Exists";
        }
        if (error.keyValue?.phone) {
            errorMessage.phone =
                "User with this Contact Number Already Exists";
        }
        if (error.errors?.name) {
            errorMessage.name =
                error.errors.name.message;
        }
        if (error.errors?.username) {
            errorMessage.username =
                error.errors.username.message;
        }
        if (error.errors?.email) {
            errorMessage.email =
                error.errors.email.message;
        }
        if (error.errors?.phone) {
            errorMessage.phone =
                error.errors.phone.message;
        }
        if (error.errors?.role) {
            errorMessage.role =
                error.errors.role.message;
        }
        if (
            Object.keys(errorMessage).length
        ) {
            return res.status(400).send({
                result: "Fail",
                reason: errorMessage
            });
        }
        return res.status(500).send({
            result: "Fail",
            reason: "Internal Server Error"
        });
    }
}

async function deleteRecord(req, res) {
    try {

        if (
            !mongoose.Types.ObjectId.isValid(
                req.params._id
            )
        ) {

            return res.status(400).send({
                result: "Fail",
                reason: "Invalid User Id"
            });
        }


        const data = await User.findById(
            req.params._id
        );


        if (!data) {

            return res.status(404).send({
                result: "Fail",
                reason: "Record Not Found"
            });
        }


        if (data.pic) {

            try {

                await deleteFromCloudinary(
                    data.pic
                );

            } catch (error) {

                console.log(
                    "Cloudinary image delete failed:",
                    error
                );
            }
        }


        await data.deleteOne();


        return res.send({
            result: "Done",
            message:
                "User Deleted Successfully",
            data
        });

    } catch (error) {

        console.log(
            "Delete User Error:",
            error
        );


        return res.status(500).send({
            result: "Fail",
            reason: "Internal Server Error"
        });
    }
}


async function otpSend(req, res) {
    try {
        const { phone } = req.body;
        if (!phone) {

            return res.status(400).json({
                result: "Fail",
                reason:
                    "Phone Number Is Required"
            });
        }
        if (!/^\d{10}$/.test(phone)) {

            return res.status(400).json({
                result: "Fail",
                reason:
                    "Please Enter A Valid 10-Digit Phone Number"
            });
        }
        const data =
            await User.findOne({
                phone
            });
        if (!data) {

            return res.status(404).json({
                result: "Fail",
                reason:
                    "User Not Found"
            });
        }
        if (!data.active) {

            return res.status(403).json({
                result: "Fail",
                reason:
                    "Your Account Is Inactive"
            });
        }
        const otp =
            Math.floor(
                100000 +
                Math.random() * 900000
            ).toString();


        data.validOtp = otp;

        data.otpExpiresAt =
            new Date(
                Date.now() +
                5 * 60 * 1000
            );
        await data.save();
        await client.messages.create({
            body:
                `Your ${process.env.SITE_NAME || "application"} ` +
                `verification code is ${otp}. ` +
                `This code will expire in 5 minutes. ` +
                `Please do not share it with anyone.`,
            from:
                process.env.TWILIO_PHONE_NUMBER,
            to:
                `+91${phone}`
        });
        return res.status(200).json({
            result: "Done",
            message:
                "OTP Sent Successfully"
        });

    } catch (error) {

        console.log(
            "OTP Send Error:",
            error
        );
        return res.status(500).json({
            result: "Fail",
            reason:
                "Internal Server Error"
        });
    }
}

async function validateOtp(req, res) {
    try {

        const {
            phone,
            otp
        } = req.body;
        if (!phone || !otp) {
            return res.status(400).send({
                result: "Fail",
                reason:
                    "Phone Number And OTP Are Required"
            });
        }
        const data =
            await User.findOne({
                phone
            });
        if (!data) {
            return res.status(404).send({
                result: "Fail",
                reason:
                    "User Not Found"
            });
        }
        if (
            !data.otpExpiresAt ||
            data.otpExpiresAt <
            new Date()
        ) {

            data.validOtp = "";
            data.otpExpiresAt = null;

            await data.save();


            return res.status(400).send({
                result: "Fail",
                reason:
                    "OTP Has Expired"
            });
        }
        if (
            !data.validOtp ||
            data.validOtp !==
            String(otp)
        ) {
            return res.status(400).send({
                result: "Fail",
                reason:
                    "Invalid OTP"
            });
        }
        if (!data.active) {

            return res.status(403).send({
                result: "Fail",
                reason:
                    "Your Account Is Inactive"
            });
        }
        data.validOtp = "";
        data.otpExpiresAt = null;
        await data.save();
        const key =
            getJwtSecretKey(
                data.role
            );
        if (!key) {
            console.log(
                `JWT secret missing for role: ${data.role}`
            );
            return res.status(500).send({
                result: "Fail",
                reason:
                    "JWT Configuration Error"
            });
        }
        const token =
            jwt.sign(
                {
                    data: {
                        _id:
                            data._id,

                        name:
                            data.name,

                        username:
                            data.username,

                        email:
                            data.email,

                        phone:
                            data.phone,

                        role:
                            data.role
                    }
                },

                key,

                {
                    expiresIn:
                        "15d"
                }
            );


        const userResponse =
            data.toObject();
        delete userResponse.password;
        delete userResponse.validOtp;
        delete userResponse.otp;
        return res.send({
            result: "Done",
            message:
                "OTP Verified Successfully",
            data:
                userResponse,
            token
        });

    } catch (error) {

        console.log(
            "OTP Validation Error:",
            error
        );
        return res.status(500).send({
            result: "Fail",
            reason:
                "Internal Server Error"
        });
    }
}


module.exports = {

    createRecord,
    getRecord,
    getSingleRecord,
    updateRecord,
    deleteRecord,

    login: login(
        User,
        {
            getSecretKey:
                (user) =>
                    getJwtSecretKey(
                        user?.role
                    )
        }
    ),

    forgetPassword1:
        forgetPassword1(User),

    forgetPassword2:
        forgetPassword2(User),

    forgetPassword3:
        forgetPassword3(User),

    checkEmail:
        checkEmail(User),

    otpSend,
    validateOtp,
    checkUsername:checkUsername(User),
};