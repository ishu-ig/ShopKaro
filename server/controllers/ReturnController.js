const Return = require("../models/Return");
const { deleteFromCloudinary } = require("../cloudinaryMethods");
const Razorpay = require("razorpay");

const RETURN_POPULATE = [
    {
        path: "product",
        select: "name brand discount variants shop",
        populate: [
            { path: "brand", select: "name" },
            { path: "shop", select: "name phone address city state pin email" },
        ],
    },
    { path: "user", select: "name username email phone address city state pin defaultAddress" },
    { path: "deliveryBoy", select: "name phone email username" },
    { path: "order" },
];

const RETURN_STATUSES = [
    "pending", "approved", "picked_up", "received",
    "rejected", "completed", "cancelled",
];

const ACTIVE_STATUSES = ["pending", "approved", "picked_up", "received", "completed"];

// Who may move a return from one status to another.
// Online "completed" happens only inside refundRecord.
// Admin received -> completed is the manual (COD / already refunded) path.
const ALLOWED_TRANSITIONS = {
    Admin: {
        pending: ["approved", "rejected", "cancelled"],
        approved: ["cancelled"],
        received: ["completed"],
    },
    DeliveryBoy: {
        approved: ["picked_up"],
        picked_up: ["received"],
    },
    Buyer: {
        pending: ["cancelled"],
    },
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

// Total of the returned item's line on the order, or null if not found
function lineTotalFor(order, productRef) {
    if (!order?.products || !Array.isArray(order.products)) return null;
    const targetId = idOf(productRef);
    if (!targetId) return null;
    const line = order.products.find((p) => idOf(p?.product) === targetId || idOf(p) === targetId);
    if (!line) return null;
    const t = Number(line.total ?? line.subtotal ?? line.amount);
    if (Number.isFinite(t) && t > 0) return t;
    const qty = Number(line.qty || 1);
    const unit = Number(line.variant?.finalPrice || line.product?.variants?.[0]?.finalPrice || 0);
    return unit > 0 ? unit * qty : null;
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
        reason: hasValidation ? errorMessage : "Internal Server Error",
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
        const userId = getUserId(req) || req.body.user;

        // One active return per product per order
        const exists = await Return.findOne({
            order: req.body.order,
            product: req.body.product,
            status: { $in: ACTIVE_STATUSES },
        });
        if (exists) {
            if (req.file) await safeDeleteImage(req.file.path);
            return res.status(409).send({
                result: "Fail",
                reason: "A return request already exists for this product.",
            });
        }

        const data = new Return({
            product: req.body.product,
            user: userId,
            order: req.body.order,
            reason: req.body.reason,
            status: "pending",
        });

        if (req.file) data.pics = req.file.path;

        await data.save();

        const finalData = await Return.findById(data._id).populate(RETURN_POPULATE);

        res.status(201).send({
            result: "Done",
            message: "Product return request submitted successfully",
            data: finalData,
        });
    } catch (error) {
        if (req.file) await safeDeleteImage(req.file.path);
        console.log(error);
        sendError(res, error);
    }
}

// ---------- READ ----------
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

        const dataObj = data.toObject();
        dataObj.itemTotal = lineTotalFor(data.order, data.product);

        if (data.order?.rppid && !data.refundId) {
            try {
                const payment = await razorpayClient().payments.fetch(data.order.rppid);
                if (payment) {
                    const originalAmount = payment.amount / 100;
                    const alreadyRefunded = (payment.amount_refunded || 0) / 100;
                    const remainingRefundable = Math.max(0, (payment.amount - (payment.amount_refunded || 0)) / 100);
                    dataObj.paymentDetails = {
                        rppid: payment.id,
                        originalAmount,
                        alreadyRefunded,
                        remainingRefundable,
                        paymentStatus: payment.status,
                        currency: payment.currency || "INR",
                    };
                    dataObj.maxRefundable = remainingRefundable;
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

                if (newStatus === "completed") {
                    if (role !== "Admin") {
                        return fail(403, "Only an admin can complete a return.");
                    }
                    if (data.refundId) {
                        return fail(400, "This return was already refunded online.");
                    }
                    if (!data.refundStatus) data.refundStatus = "manual";
                    if (!data.refundedAt) data.refundedAt = new Date();
                }

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
            data: finalData,
        });
    } catch (error) {
        if (req.file) await safeDeleteImage(req.file.path);
        console.log(error);
        sendError(res, error);
    }
}

// ---------- REFUND (Razorpay, admin only) ----------
async function refundRecord(req, res) {
    console.log("========== REFUND REQUEST ==========");
    console.log("Return ID:", req.params._id);
    console.log("User Role:", req.user?.role);
    console.log("Request Body:", req.body);
    console.log("Refund Amount:", req.body?.refundAmount);
    let claimed = false;
    let moneyMoved = false;
    let ret;
    let refund;

    try {
        if (getRole(req) !== "Admin") {
            return res.status(403).send({ result: "Fail", reason: "Only an admin can issue refunds." });
        }

        const amount = Number(req.body.refundAmount);
        if (!amount || amount <= 0) {
            return res.status(400).send({ result: "Fail", reason: "Enter a valid refund amount." });
        }

        // Atomically claim the return so a double click can't refund twice.
        ret = await Return.findOneAndUpdate(
            {
                _id: req.params._id,
                status: "received",
                refundId: { $in: ["", null] },
                refundStatus: { $in: ["", null] },
            },
            { $set: { refundStatus: "initiating" } },
            { new: true }
        ).populate("order");

        if (!ret) {
            return res.status(409).send({
                result: "Fail",
                reason: "Return not found, not yet received at the shop, or already refunded.",
            });
        }
        claimed = true;

        const order = ret.order;
        if (!order?.rppid) {
            throw { status: 400, reason: "No online payment found for this order." };
        }

        // Server-side cap: this item's total line on the order, else the order total
        const itemCap = lineTotalFor(order, ret.product);
        const maxEligible = itemCap ?? Number(order.total);
        if (maxEligible && amount > maxEligible) {
            throw {
                status: 400,
                reason: `Refund amount (₹${amount.toFixed(2)}) cannot exceed the product item total (₹${maxEligible.toFixed(2)}).`,
                maxRefundable: maxEligible
            };
        }

        const rp = razorpayClient();
        const payment = await rp.payments.fetch(order.rppid);
        if (!payment) {
            throw { status: 400, reason: "Payment record not found on Razorpay." };
        }

        if (payment.status === "authorized") {
            await rp.payments.capture(order.rppid, payment.amount, payment.currency || "INR");
        } else if (payment.status !== "captured") {
            throw {
                status: 400,
                reason: `Payment is in "${payment.status}" state. Only captured payments can be refunded.`,
            };
        }

        const requestedPaise = Math.round(amount * 100);
        const originalAmount = payment.amount / 100;
        const alreadyRefunded = (payment.amount_refunded || 0) / 100;
        const remainingPaise = payment.amount - (payment.amount_refunded || 0);
        const remainingRupees = remainingPaise / 100;

        if (requestedPaise > remainingPaise) {
            throw {
                status: 400,
                reason: `Amount exceeds the remaining refundable balance on Razorpay (₹${remainingRupees.toFixed(2)}). Original payment was ₹${originalAmount.toFixed(2)}, and ₹${alreadyRefunded.toFixed(2)} has already been refunded across previous transactions.`,
                maxRefundable: remainingRupees,
                paymentDetails: {
                    rppid: payment.id,
                    originalAmount,
                    alreadyRefunded,
                    remainingRefundable: remainingRupees,
                    itemTotal: maxEligible,
                    paymentStatus: payment.status
                }
            };
        }

        // Single full refund transaction (no partial batches or chunking)
        refund = await rp.payments.refund(order.rppid, {
            amount: requestedPaise,
            speed: "normal",
            notes: {
                returnId: String(ret._id),
                orderId: String(order._id),
                refundType: "Full product refund",
            },
        });
        moneyMoved = true; // from here on, NEVER release the claim

        try {
            ret.refundId = refund.id;
            ret.refundAmount = amount;
            ret.refundStatus = refund.status || "processed";
            ret.refundedAt = new Date();
            ret.status = "completed";
            ret.updatedAt = new Date();
            await ret.save();
        } catch (dbError) {
            console.error("CRITICAL: Razorpay refund succeeded but ret.save() failed:", dbError);
            await Return.updateOne(
                { _id: ret._id },
                {
                    $set: {
                        refundId: refund.id,
                        refundAmount: amount,
                        refundStatus: refund.status || "processed",
                        refundedAt: new Date(),
                        status: "completed",
                        updatedAt: new Date()
                    }
                }
            );
        }

        return res.send({
            result: "Done",
            message: `Full product refund of ₹${amount.toFixed(2)} processed successfully in one transaction`,
            data: ret,
            refund: {
                id: refund.id,
                amount: refund.amount / 100,
                status: refund.status
            }
        });
    } catch (error) {
        console.log("REFUND ERROR:", error);

        if (moneyMoved) {
            // Razorpay already refunded; keep the claim so it can't be repeated
            return res.status(500).send({
                result: "Fail",
                reason: `Refund ${refund?.id} was sent to Razorpay but saving failed. Do NOT retry; contact the developer.`,
            });
        }

        // Nothing was refunded: release the claim so the admin can retry
        if (claimed && ret) {
            await Return.updateOne(
                { _id: ret._id, refundId: { $in: ["", null] } },
                { $set: { refundStatus: "" } }
            ).catch((e) => console.error("Refund rollback failed:", e));
        }

        // Razorpay errors look like { statusCode, error: { description } }
        const reason = error.reason || error.error?.description || "Refund failed. Please try again.";
        const code = error.status || error.statusCode || 400;
        const body = { result: "Fail", reason };
        if (error.maxRefundable != null) body.maxRefundable = error.maxRefundable;
        if (error.paymentDetails != null) body.paymentDetails = error.paymentDetails;

        return res.status(code >= 400 && code < 600 ? code : 400).send(body);
    }
}

// ---------- REFUND ORDER (Create Razorpay Order for Refund Payment) ----------
async function refundOrder(req, res) {
    try {
        const instance = razorpayClient();
        const options = {
            amount: Math.round(Number(req.body.amount) * 100),
            currency: "INR",
            notes: {
                returnId: String(req.body.returnId || "")
            }
        };

        instance.orders.create(options, (error, order) => {
            if (error) {
                console.log("Razorpay refund order creation error:", error);
                return res.status(500).json({ result: "Fail", message: "Something Went Wrong creating refund order!" });
            }
            res.json({ result: "Done", data: order });
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ result: "Fail", message: "Internal Server Error!" });
    }
}

// ---------- VERIFY REFUND ORDER (Confirm Razorpay Payment & Mark Return Completed) ----------
async function verifyRefundOrder(req, res) {
    try {
        const ret = await Return.findById(req.body.returnId).populate(RETURN_POPULATE);
        if (!ret) {
            return res.status(404).send({ result: "Fail", reason: "Return Record Not Found" });
        }

        ret.refundId = req.body.razorpay_payment_id;
        ret.refundAmount = Number(req.body.amount) || ret.refundAmount;
        ret.refundStatus = "processed";
        ret.refundedAt = new Date();
        ret.status = "completed";
        ret.updatedAt = new Date();
        await ret.save();

        res.send({ result: "Done", message: "Refund Payment Successful", data: ret });
    } catch (error) {
        console.log(error);
        res.status(500).json({ result: "Fail", message: "Internal Server Error!" });
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
            data,
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
    refundOrder,
    verifyRefundOrder,
    deleteRecord,
};