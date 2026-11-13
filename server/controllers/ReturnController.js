const Return = require("../models/Return");
const { deleteFromCloudinary } = require("../cloudinaryMethods");
const Razorpay = require("razorpay");

const RETURN_POPULATE = [
    { path: "product", select: "name brand discount variants" },
    { path: "user", select: "name username email phone address city state pin defaultAddress" },
    { path: "deliveryBoy", select: "name phone email" },
    { path: "order" }
];

const RETURN_STATUSES = [
    "pending", "approved", "picked_up", "received",
    "rejected", "completed", "cancelled"
];

// Who may move a return from one status to another.
// "completed" for online payments happens only inside refundRecord.
// Admin received -> completed is the manual (COD) path and is checked separately below.
const ALLOWED_TRANSITIONS = {
    Admin: {
        pending: ["approved", "rejected", "cancelled"],
        approved: ["cancelled"],
        received: ["completed"]
    },
    DeliveryBoy: {
        approved: ["picked_up"],
        picked_up: ["received"]
    },
    Buyer: {
        pending: ["cancelled"]
    }
};

// ---------- helpers ----------

// Adjust these two if your auth middleware sets the user differently
const getRole = (req) => req.user?.role;
const getUserId = (req) => String(req.user?._id || req.user?.id || "");

const idOf = (ref) => String(ref?._id || ref || "");

function razorpayClient() {
    return new Razorpay({
        key_id: process.env.RPKEYID,
        key_secret: process.env.RPSECRETKEY,
    });
}

async function safeDeleteImage(path) {
    if (!path) return;
    try {
        await deleteFromCloudinary(path);
    } catch (cloudinaryError) {
        console.error("Cloudinary cleanup error:", cloudinaryError);
    }
}

function getValidationErrors(error) {
    const errorMessage = {};
    ["product", "user", "order", "reason", "status", "pics"].forEach((field) => {
        if (error.errors?.[field]) errorMessage[field] = error.errors[field].message;
    });
    return errorMessage;
}

function sendError(res, error) {
    const errorMessage = getValidationErrors(error);
    const hasValidation = Object.keys(errorMessage).length > 0;
    res.status(hasValidation ? 400 : 500).send({
        result: "Fail",
        reason: hasValidation ? errorMessage : "Internal Server Error"
    });
}

// Can this requester view this return?
function canView(req, ret) {
    const role = getRole(req);
    if (role === "Admin") return true;
    if (role === "DeliveryBoy") return idOf(ret.deliveryBoy) === getUserId(req);
    if (role === "Buyer") return idOf(ret.user) === getUserId(req);
    return false;
}

// ---------- CREATE ----------
async function createRecord(req, res) {
    try {
        const data = new Return({
            product: req.body.product,
            user: req.body.user,
            order: req.body.order,
            reason: req.body.reason,
            status: "pending"
        });

        if (req.file) data.pics = req.file.path;

        await data.save();

        const finalData = await Return.findById(data._id).populate(RETURN_POPULATE);

        res.status(201).send({
            result: "Done",
            message: "Product return request submitted successfully",
            data: finalData
        });
    } catch (error) {
        if (req.file) await safeDeleteImage(req.file.path);
        console.log(error);
        sendError(res, error);
    }
}

// ---------- READ ----------

// Admin: all returns. Delivery boy: assigned returns. Buyer: user's returns.
async function getRecord(req, res) {
    try {
        const role = getRole(req);
        let filter;

        if (role === "Admin") filter = {};
        else if (role === "DeliveryBoy") filter = { deliveryBoy: getUserId(req) };
        else if (role === "Buyer") filter = { user: getUserId(req) };
        else return res.status(403).send({ result: "Fail", reason: "Forbidden" });

        const data = await Return.find(filter)
            .sort({ createdAt: -1 })
            .populate(RETURN_POPULATE);

        res.send({ result: "Done", count: data.length, data });
    } catch (error) {
        console.log(error);
        res.status(500).send({ result: "Fail", reason: "Internal Server Error" });
    }
}

async function getUserRecord(req, res) {
    try {
        if (getRole(req) !== "Admin" && req.params.userid !== getUserId(req)) {
            return res.status(403).send({ result: "Fail", reason: "Forbidden" });
        }

        const data = await Return.find({ user: req.params.userid })
            .sort({ createdAt: -1 })
            .populate(RETURN_POPULATE);

        res.send({ result: "Done", count: data.length, data });
    } catch (error) {
        console.log(error);
        res.status(500).send({ result: "Fail", reason: "Internal Server Error" });
    }
}

async function getSingleRecord(req, res) {
    try {
        const data = await Return.findById(req.params._id).populate(RETURN_POPULATE);

        if (!data) {
            return res.status(404).send({ result: "Fail", reason: "Return Request Not Found" });
        }
        if (!canView(req, data)) {
            return res.status(403).send({ result: "Fail", reason: "Forbidden" });
        }

        let dataObj = data.toObject();
        if (data.order?.rppid && !data.refundId) {
            try {
                const payment = await razorpayClient().payments.fetch(data.order.rppid);
                if (payment) {
                    const rem = (payment.amount - (payment.amount_refunded || 0)) / 100;
                    dataObj.maxRefundable = Math.max(0, rem);
                }
            } catch (e) {
                console.log("Error checking refundable amount:", e.message);
            }
        }

        res.send({ result: "Done", data: dataObj });
    } catch (error) {
        console.log(error);
        res.status(500).send({ result: "Fail", reason: "Internal Server Error" });
    }
}

// ---------- UPDATE ----------
async function updateRecord(req, res) {
    // Every early exit removes the freshly uploaded image
    const fail = async (code, reason) => {
        if (req.file) await safeDeleteImage(req.file.path);
        return res.status(code).send({ result: "Fail", reason });
    };

    try {
        const role = getRole(req);
        const data = await Return.findById(req.params._id);

        if (!data) return fail(404, "Return Request Not Found");
        if (!canView(req, data)) return fail(403, "Forbidden");

        // ----- status -----
        if (req.body.status) {
            const newStatus = String(req.body.status).toLowerCase();

            if (!RETURN_STATUSES.includes(newStatus)) {
                return fail(400, `Invalid status. Allowed statuses: ${RETURN_STATUSES.join(", ")}`);
            }

            // Staying on the same status is fine for the admin (e.g. changing the delivery boy)
            const isNoop = newStatus === data.status;
            if (!isNoop) {
                const allowed = ALLOWED_TRANSITIONS[role]?.[data.status] || [];
                if (!allowed.includes(newStatus)) {
                    return fail(403, "This status change is not allowed.");
                }

                // If setting completed manually, only Admin is allowed
                if (newStatus === "completed") {
                    if (role !== "Admin") {
                        return fail(403, "Only an admin can complete a return.");
                    }
                    if (!data.refundStatus) data.refundStatus = "manual";
                    if (!data.refundedAt) data.refundedAt = new Date();
                }

                // Approval needs a delivery boy
                if (newStatus === "approved" && !req.body.deliveryBoy && !data.deliveryBoy) {
                    return fail(400, "Assign a delivery boy before approving.");
                }
            } else if (role !== "Admin") {
                return fail(403, "This status change is not allowed.");
            }

            data.status = newStatus;
        }

        // ----- delivery boy (admin only) -----
        if (req.body.deliveryBoy) {
            if (role !== "Admin") return fail(403, "Only an admin can assign a delivery boy.");
            if (["picked_up", "received", "completed"].includes(data.status)) {
                return fail(400, "Pickup is already in progress; the delivery boy can't be changed.");
            }
            data.deliveryBoy = req.body.deliveryBoy;
        }

        // ----- reason / image (admin, or the customer while still pending) -----
        const touchesContent = req.body.reason !== undefined || req.file;
        if (touchesContent) {
            const ownerEditing = role === "Buyer" && data.status === "pending";
            if (role !== "Admin" && !ownerEditing) {
                return fail(403, "You can't edit this return.");
            }
        }

        if (req.body.reason !== undefined) data.reason = req.body.reason;

        let oldPic = null;
        if (req.file) {
            oldPic = data.pics;
            data.pics = req.file.path;
        }

        data.updatedAt = new Date();
        await data.save();

        // Delete the old image only after the new one is saved
        if (oldPic) await safeDeleteImage(oldPic);

        const finalData = await Return.findById(data._id).populate(RETURN_POPULATE);

        res.send({
            result: "Done",
            message: "Return request updated successfully",
            data: finalData
        });
    } catch (error) {
        if (req.file) await safeDeleteImage(req.file.path);
        console.log(error);
        sendError(res, error);
    }
}

// ---------- REFUND (Razorpay, admin only) ----------
async function refundRecord(req, res) {
    let claimed = false;
    let ret;

    try {
        if (getRole(req) !== "Admin") {
            return res.status(403).send({ result: "Fail", reason: "Only an admin can issue refunds." });
        }

        const amount = Number(req.body.refundAmount);
        if (!amount || amount <= 0) {
            return res.status(400).send({ result: "Fail", reason: "Enter a valid refund amount." });
        }

        // Atomically claim the return so a double click can't refund twice.
        // $in [""/null] also matches older documents that don't have these fields.
        ret = await Return.findOneAndUpdate(
            {
                _id: req.params._id,
                status: "received",
                refundId: { $in: ["", null] },
                refundStatus: { $in: ["", null] }
            },
            { $set: { refundStatus: "initiating" } },
            { new: true }
        ).populate("order");

        if (!ret) {
            return res.status(409).send({
                result: "Fail",
                reason: "Return not found, not yet received at the shop, or already refunded."
            });
        }
        claimed = true;

        const order = ret.order;
        if (!order?.rppid) {
            throw { status: 400, reason: "No online payment found for this order." };
        }

        // Don't exceed the order total, counting refunds on other returns of the same order
        const others = await Return.find({
            order: order._id,
            _id: { $ne: ret._id },
            refundId: { $nin: ["", null] }
        });
        const alreadyRefunded = others.reduce((sum, r) => sum + (r.refundAmount || 0), 0);
        const maxRefundable = Math.max(Number(order.total) - alreadyRefunded, 0);

        if (amount > maxRefundable) {
            throw {
                status: 400,
                reason: `Refund cannot exceed ₹${maxRefundable}.`,
                maxRefundable
            };
        }

        const refund = await razorpayClient().payments.refund(order.rppid, {
            amount: Math.round(amount * 100), // paise
            speed: "normal",
            notes: { returnId: String(ret._id), orderId: String(order._id) }
        });

        ret.refundId = refund.id;
        ret.refundAmount = amount;
        ret.refundStatus = refund.status || "pending";
        ret.refundedAt = new Date();
        ret.status = "completed";
        ret.updatedAt = new Date();
        await ret.save();

        return res.send({ result: "Done", message: "Refund initiated", data: ret });

    } catch (error) {
        console.log(error);

        // Release the claim so the admin can retry (nothing was refunded)
        if (claimed && ret) {
            try {
                await Return.updateOne(
                    { _id: ret._id, refundId: { $in: ["", null] } },
                    { $set: { refundStatus: "" } }
                );
            } catch (rollbackError) {
                console.error("Refund rollback failed:", rollbackError);
            }
        }

        // Razorpay errors look like { statusCode, error: { description } }
        let reason = error.reason || error.error?.description || "Refund failed. Please try again.";
        if (reason === "invalid request sent") {
            reason = "Razorpay rejected the refund: This payment has exceeded the maximum limit of partial refunds on the gateway (or is already refunded). Please complete this return using the 'Mark Completed (Manual)' button.";
        }
        const code = error.status || error.statusCode || 400;
        const body = { result: "Fail", reason };
        if (error.maxRefundable != null) body.maxRefundable = error.maxRefundable;

        return res.status(code >= 400 && code < 600 ? code : 400).send(body);
    }
}

// ---------- DELETE ----------
async function deleteRecord(req, res) {
    try {
        if (getRole(req) !== "Admin") {
            return res.status(403).send({ result: "Fail", reason: "Forbidden" });
        }

        const data = await Return.findById(req.params._id);

        if (!data) {
            return res.status(404).send({ result: "Fail", reason: "Return Request Not Found" });
        }

        await data.deleteOne();
        await safeDeleteImage(data.pics);

        res.send({
            result: "Done",
            message: "Return request deleted successfully",
            data
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({ result: "Fail", reason: "Internal Server Error" });
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