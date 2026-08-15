const mongoose = require("mongoose");
const DeliveryBoy = require("../models/DeliveryBoy");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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

async function createRecord(req, res) {
    try {
        // Get password from request body
        const { password } = req.body;    
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

        let permanentLocation = req.body.permanentLocation;
        if (typeof permanentLocation === "string") {
            try {
                permanentLocation = JSON.parse(permanentLocation);
            } catch (e) {}
        }

        const data = new DeliveryBoy({
            ...req.body,
            permanentLocation: permanentLocation || undefined,
            password: hash,
            role: "DeliveryBoy"
        });

      
        if (req.file) {
            data.pic = req.file.path;
        }
        await data.save();
        const deliveryBoyResponse = data.toObject();
        delete deliveryBoyResponse.password;

        return res.status(201).send({
            result: "Done",
            message: "DeliveryBoy Created Successfully",
            data: deliveryBoyResponse
        });

    } catch (error) {
        console.log("Create DeliveryBoy Error:", error);
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
        if (error.code === 11000 && error.keyValue) {
            if (error.keyValue.username) {
                errorMessage.username = "Username Already Exists";
            }

            if (error.keyValue.email) {
                errorMessage.email = "Email Address Already Exists";
            }

            if (error.keyValue.phone) {
                errorMessage.phone = "Phone Number Already Exists";
            }
        }
        if (error.errors?.name) {
            errorMessage.name = error.errors.name.message;
        }

        if (error.errors?.username) {
            errorMessage.username = error.errors.username.message;
        }

        if (error.errors?.email) {
            errorMessage.email = error.errors.email.message;
        }

        if (error.errors?.phone) {
            errorMessage.phone = error.errors.phone.message;
        }

        if (error.errors?.password) {
            errorMessage.password = error.errors.password.message;
        }

        if (error.errors?.pic) {
            errorMessage.pic = error.errors.pic.message;
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
async function getSingleRecord(req, res) {
    try {
        const { _id } = req.params;

       
        if (!mongoose.Types.ObjectId.isValid(_id)) {
            return res.status(400).send({
                result: "Fail",
                reason: "Invalid DeliveryBoy Id"
            });
        }

        
        const data = await DeliveryBoy.findById(_id)
            .select("-password -otp");

       
        if (!data) {
            return res.status(404).send({
                result: "Fail",
                reason: "DeliveryBoy Not Found"
            });
        }

        return res.status(200).send({
            result: "Done",
            data
        });

    } catch (error) {
        console.log(
            "Get Single DeliveryBoy Error:",
            error
        );

        return res.status(500).send({
            result: "Fail",
            reason: "Internal Server Error"
        });
    }
}


async function getRecord(req, res) {
    try {
       
        const data = await DeliveryBoy.find()
        .select("-password -otp")  
            .sort({
                _id: -1
            });

        return res.status(200).send({
            result: "Done",
            count: data.length,
            data
        });

    } catch (error) {
        console.log(
            "Get DeliveryBoys Error:",
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
        let data = await DeliveryBoy.findOne({
            _id: req.params._id
        });

        if (data) {
            // Basic fields
            data.name = req.body.name ?? data.name;
            data.username = req.body.username ?? data.username;
            data.email = req.body.email ?? data.email;
            data.phone = req.body.phone ?? data.phone;
            data.active = req.body.active ?? data.active;
            data.isaccept = req.body.isaccept ?? data.isaccept;
            data.isfree = req.body.isfree ?? data.isfree;

            // Permanent Location
            if (req.body.permanentLocation) {
                let permanentLocation =
                    req.body.permanentLocation;

                // Required when using FormData
                if (typeof permanentLocation === "string") {
                    permanentLocation =
                        JSON.parse(permanentLocation);
                }

                data.permanentLocation = {
                    ...data.permanentLocation.toObject(),
                    ...permanentLocation
                };
            }

            // Store old image
            const oldPic = data.pic;

            // Set new image
            if (req.file) {
                data.pic = req.file.path;
            }

            // Save updated record
            await data.save();

            // Delete old image only after successful save
            if (req.file && oldPic) {
                try {
                    await deleteFromCloudinary(oldPic);
                } catch (error) {
                    console.log(
                        "Old image delete failed:",
                        error
                    );
                }
            }

            // Remove sensitive data from response
            const deliveryBoyResponse =
                data.toObject();

            delete deliveryBoyResponse.password;
            delete deliveryBoyResponse.otp;

            res.send({
                result: "Done",
                message:
                    "DeliveryBoy Updated Successfully",
                data: deliveryBoyResponse
            });
        } else {
            // Delete newly uploaded image if record not found
            if (req.file) {
                await deleteFromCloudinary(
                    req.file.path
                );
            }

            res.status(404).send({
                result: "Fail",
                reason: "Record Not Found"
            });
        }

    } catch (error) {
        console.log(
            "Update DeliveryBoy Error:",
            error
        );

        // Delete newly uploaded image if update failed
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

        let errorMessage = {};

        // Duplicate username
        if (error.keyValue?.username) {
            errorMessage.username =
                "Username Already Exists";
        }

        // Duplicate email
        if (error.keyValue?.email) {
            errorMessage.email =
                "Email Address Already Exists";
        }

        // Duplicate phone
        if (error.keyValue?.phone) {
            errorMessage.phone =
                "Contact Number Already Exists";
        }

        // Mongoose validation errors
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

        if (
            Object.values(errorMessage).length === 0
        ) {
            res.status(500).send({
                result: "Fail",
                reason: "Internal Server Error"
            });
        } else {
            res.status(400).send({
                result: "Fail",
                reason: errorMessage
            });
        }
    }
}

async function deleteRecord(req, res) {
    try {
        const { _id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(_id)) {
            return res.status(400).send({
                result: "Fail",
                reason: "Invalid DeliveryBoy Id"
            });
        }

        const data = await DeliveryBoy.findById(_id);

        if (!data) {
            return res.status(404).send({
                result: "Fail",
                reason: "DeliveryBoy Not Found"
            });
        }

        await data.deleteOne();

        if (data.pic) {
            try {
                await deleteFromCloudinary(data.pic);
            } catch (cloudinaryError) {
                console.log("Cloudinary image delete failed:", cloudinaryError);
            }
        }

        const deliveryBoyResponse = data.toObject();
        delete deliveryBoyResponse.password;
        delete deliveryBoyResponse.otp;

        return res.status(200).send({
            result: "Done",
            message: "DeliveryBoy Deleted Successfully",
            data: deliveryBoyResponse
        });
    } catch (error) {
        console.log("Delete DeliveryBoy Error:", error);
        return res.status(500).send({
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
    deleteRecord,
login: login(DeliveryBoy, {
    getSecretKey: () => process.env.JWT_SECRET_KEY_DELIVERYBOY
}),
    forgetPassword1:forgetPassword1(DeliveryBoy),
    forgetPassword2:forgetPassword2(DeliveryBoy),
    forgetPassword3:forgetPassword3(DeliveryBoy),
    checkEmail:checkEmail(DeliveryBoy),
    checkUsername:checkUsername(DeliveryBoy),
};