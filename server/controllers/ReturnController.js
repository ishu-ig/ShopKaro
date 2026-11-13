const Return = require("../models/Return");
const { deleteFromCloudinary } = require("../cloudinaryMethods");
const Razorpay = require("razorpay");

const RETURN_POPULATE = [
    {
        path: "product",
        select: "name brand discount variants"
    },
    {
        path: "user",
        select: "name username email phone address city state pin defaultAddress"
    },
    {
        path: "deliveryBoy",
        select: "name phone email"
    },
    {
        path: "order"
    }
];

// Allowed return statuses
const RETURN_STATUSES = [
    "pending",
    "approved",
    "picked_up",   // set by the delivery boy
    "received",    // set by the delivery boy once handed to the shop
    "rejected",
    "completed",
    "cancelled"
];

// HELPER: delete an image from Cloudinary without ever throwing
async function safeDeleteImage(path) {
    if (!path) return;
    try {
        await deleteFromCloudinary(path);
    } catch (cloudinaryError) {
        console.error("Cloudinary cleanup error:", cloudinaryError);
    }
}

// HELPER: build validation error object from a mongoose error
function getValidationErrors(error) {
    let errorMessage = {};

    error.errors?.product
        ? errorMessage.product = error.errors.product.message : null;

    error.errors?.user
        ? errorMessage.user = error.errors.user.message : null;

    error.errors?.order
        ? errorMessage.order = error.errors.order.message : null;

    error.errors?.reason
        ? errorMessage.reason = error.errors.reason.message : null;

    error.errors?.status
        ? errorMessage.status = error.errors.status.message : null;

    error.errors?.pics
        ? errorMessage.pics = error.errors.pics.message : null;

    return errorMessage;
}


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

        if (req.file) {
            data.pics = req.file.path;
        }

        await data.save();

        let finalData = await Return.findById(data._id)
            .populate(RETURN_POPULATE);

        res.status(201).send({
            result: "Done",
            message: "Product return request submitted successfully",
            data: finalData
        });

    } catch (error) {
        // Remove the freshly uploaded image, since the record was not saved
        if (req.file) {
            await safeDeleteImage(req.file.path);
        }

        console.log(error);

        let errorMessage = getValidationErrors(error);

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
            let dataObj = data.toObject();
            if (data.order?.rppid && !data.refundId) {
                try {
                    const instance = new Razorpay({
                        key_id: process.env.RPKEYID,
                        key_secret: process.env.RPSECRETKEY,
                    });
                    const payment = await instance.payments.fetch(data.order.rppid);
                    if (payment) {
                        const rem = (payment.amount - (payment.amount_refunded || 0)) / 100;
                        dataObj.maxRefundable = Math.max(0, rem);
                    }
                } catch (e) {
                    console.log("Error checking refundable amount:", e.message);
                }
            }
            res.send({
                result: "Done",
                data: dataObj
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


// UPDATE RETURN REQUEST (STATUS / REASON / IMAGE)
async function updateRecord(req, res) {
    try {
        let data = await Return.findById(req.params._id);

        if (!data) {
            // Nothing to attach the upload to, so remove it
            if (req.file) {
                await safeDeleteImage(req.file.path);
            }

            return res.status(404).send({
                result: "Fail",
                reason: "Return Request Not Found"
            });
        }

        if (req.body.status) {
            const newStatus = req.body.status.toLowerCase();

            if (!RETURN_STATUSES.includes(newStatus)) {
                if (req.file) {
                    await safeDeleteImage(req.file.path);
                }

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

        // Assign / change the delivery boy who will pick the item up
        if (req.body.deliveryBoy) {
            data.deliveryBoy = req.body.deliveryBoy;
        }

        // Replace the image if a new one was uploaded
        let oldPic = null;
        if (req.file) {
            oldPic = data.pics;
            data.pics = req.file.path;
        }

        data.updatedAt = new Date();

        await data.save();

        // Only delete the old image once the new one is safely saved
        if (oldPic) {
            await safeDeleteImage(oldPic);
        }

        let finalData = await Return.findById(data._id)
            .populate(RETURN_POPULATE);

        res.send({
            result: "Done",
            message: "Return request updated successfully",
            data: finalData
        });

    } catch (error) {
        // Save failed, so the new upload is orphaned; the old image is untouched
        if (req.file) {
            await safeDeleteImage(req.file.path);
        }

        console.log(error);

        let errorMessage = getValidationErrors(error);

        res.status(Object.keys(errorMessage).length ? 400 : 500).send({
            result: "Fail",
            reason: Object.keys(errorMessage).length
                ? errorMessage
                : "Internal Server Error"
        });
    }
}


// REFUND MONEY ONLINE VIA RAZORPAY (ADMIN)
// body: { refundAmount: <rupees> }
async function refundRecord(req, res) {
    try {
        let data = await Return.findById(req.params._id)
            .populate("order");

        if (!data) {
            return res.status(404).send({
                result: "Fail",
                reason: "Return Request Not Found"
            });
        }

        // Refund only after the shop has received the item back
        if (data.status !== "received") {
            return res.status(400).send({
                result: "Fail",
                reason: "Refund is possible only after the returned item is received at the shop"
            });
        }

        // Prevent double refunds
        if (data.refundId) {
            return res.status(400).send({
                result: "Fail",
                reason: "Refund already initiated for this return request"
            });
        }

        // Online refund needs the Razorpay payment id saved in verifyOrder
        const paymentId = data.order?.rppid;
        if (!paymentId) {
            return res.status(400).send({
                result: "Fail",
                reason: "No online payment found for this order. Refund it manually (e.g. COD)"
            });
        }

        const refundAmount = Number(req.body.refundAmount);
        if (!refundAmount || refundAmount <= 0) {
            return res.status(400).send({
                result: "Fail",
                reason: "A valid refundAmount (in rupees) is required"
            });
        }

        const instance = new Razorpay({
            key_id: process.env.RPKEYID,
            key_secret: process.env.RPSECRETKEY,
        });

        // Fetch current payment status from Razorpay
        const payment = await instance.payments.fetch(paymentId);

        // Payment must be captured before it can be refunded.
        // In test mode (or if auto-capture is off) it may still be "authorized" — capture it first.
        if (payment.status === "authorized") {
            await instance.payments.capture(paymentId, payment.amount, payment.currency || "INR");
        } else if (payment.status !== "captured") {
            return res.status(400).send({
                result: "Fail",
                reason: `Cannot refund — payment is in "${payment.status}" state. Only captured payments can be refunded.`
            });
        }

        // Check remaining refundable amount (in paise)
        const alreadyRefunded = payment.amount_refunded || 0;
        const maxRefundablePaise = payment.amount - alreadyRefunded;
        const requestedPaise = Math.round(refundAmount * 100);

        if (requestedPaise > maxRefundablePaise) {
            const maxRupees = (maxRefundablePaise / 100).toFixed(2);
            return res.status(400).send({
                result: "Fail",
                reason: `Refund amount ₹${refundAmount} exceeds the remaining refundable amount of ₹${maxRupees}.`,
                maxRefundable: Number(maxRupees)
            });
        }

        // Razorpay (especially in test mode / netbanking) caps single refunds at ₹5,000 (500,000 paise).
        // If the requested refund is larger, process it in chunks so Razorpay doesn't reject with "invalid request sent".
        let remainingToRefundPaise = requestedPaise;
        let lastRefund = null;
        const refundIds = [];

        while (remainingToRefundPaise > 0) {
            const chunk = Math.min(remainingToRefundPaise, 500000);
            lastRefund = await instance.payments.refund(paymentId, {
                amount: chunk,
                speed: "normal",
                notes: {
                    returnId: String(data._id),
                    reason: data.reason || ""
                }
            });
            if (lastRefund?.id) {
                refundIds.push(lastRefund.id);
            }
            remainingToRefundPaise -= chunk;
        }

        data.refundId = refundIds.join(", ") || lastRefund?.id;
        data.refundAmount = refundAmount;
        data.refundStatus = lastRefund?.status || "processed";
        data.refundedAt = new Date();
        data.status = "completed";
        data.updatedAt = new Date();

        await data.save();

        let finalData = await Return.findById(data._id)
            .populate(RETURN_POPULATE);

        res.send({
            result: "Done",
            message: "Refund initiated successfully",
            data: finalData
        });

    } catch (error) {
        console.log("Razorpay refund error:", error);

        // Friendly error messages for common Razorpay errors
        if (error?.error?.description) {
            let desc = error.error.description;
            if (desc === "invalid request sent") {
                desc = "Razorpay cannot process further refunds on this payment (maximum number of partial refunds reached or payment balance exhausted). You can complete this return manually using 'Mark as Refunded & Complete'.";
            }
            return res.status(400).send({
                result: "Fail",
                reason: desc
            });
        }

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

        // Remove the image from Cloudinary along with the record
        await safeDeleteImage(data.pics);

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
    getUserRecord,
    getSingleRecord,
    updateRecord,
    refundRecord,
    deleteRecord
};