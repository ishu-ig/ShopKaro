const Checkout = require("../models/Checkout")
const User = require("../models/User")
const Address = require("../models/Address")
const DeliveryBoy = require("../models/DeliveryBoy")
const Product = require("../models/Product")
const Brand = require("../models/Brand")
const Shop = require("../models/Shop")
const mailer = require("../mailer/index")
const { deliveryOtpTemplate, orderStatusTemplate, orderDeliveredTemplate } = require("../mailer/templates")
const Razorpay = require("razorpay")

const PRODUCT_POPULATE = {
    path: "products.product",
    select: "name brand discount variants shop",
    populate: [
        { path: "brand", select: "name" },
        { path: "shop", select: "name phone address city state pin" }
    ]
};

const DELIVERY_OTP_LENGTH = 6;
const DELIVERY_OTP_TTL_MINUTES = 10;

function generateDeliveryOtp() {
    // 6-digit numeric OTP, always DELIVERY_OTP_LENGTH digits (zero-padded)
    const max = 10 ** DELIVERY_OTP_LENGTH;
    return String(Math.floor(Math.random() * max)).padStart(DELIVERY_OTP_LENGTH, "0");
}

function sendDeliveryOtpEmail(toEmail, otp) {
    mailer.sendMail({
        
        to: toEmail,
        subject: `Delivery Confirmation PIN - ${process.env.SITE_NAME || "ShopKaro"}`,
        html: deliveryOtpTemplate({ otp, ttlMinutes: DELIVERY_OTP_TTL_MINUTES }),
    }, (error) => {
        if (error) console.log("Error sending delivery OTP email:", error);
    });
}

async function order(req, res) {
    try {
        const instance = new Razorpay({
            key_id: process.env.RPKEYID,
            key_secret: process.env.RPSECRETKEY,
        });

        const options = {
            amount: req.body.amount * 100,
            currency: "INR"
        };

        instance.orders.create(options, (error, order) => {
            if (error) {
                console.log(error);
                return res.status(500).json({ message: "Something Went Wrong!" });
            }
            res.json({ data: order });
        });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error!" });
        console.log(error);
    }
}

async function verifyOrder(req, res) {
    try {
        var check = await Checkout.findOne({ _id: req.body.checkid })
        check.rppid = req.body.razorpay_payment_id
        check.paymentStatus = "Done"
        check.paymentMode = "Net Banking"
        await check.save()
        res.send({ result: "Done", message: "Payment SuccessFull" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error!" });
    }
}
async function createRecord(req, res) {
    try {
        let data = new Checkout(req.body)

        // Compute expected delivery: COD gets +6 days, prepaid gets +4 days
        const deliveryDays = (req.body.paymentMode === "COD") ? 6 : 4
        const expectedDelivery = new Date()
        expectedDelivery.setDate(expectedDelivery.getDate() + deliveryDays)
        data.expectedDelivery = expectedDelivery

        await data.save()
        let finalData = await Checkout.findOne({ _id: data._id })
            .populate({
                path: "user",
                select: "name username email phone defaultAddress",
                populate: {
                    path: "defaultAddress",
                    select: "address city state pin lat lng"
                }
            })
            .populate("deliveryBoy", ["name", "username", "email", "phone", "permanentLocation"])
            .populate(PRODUCT_POPULATE)

        res.send({
            result: "Done",
            data: finalData
        })
    } catch (error) {
        console.log(error)
        let errorMessage = {}
        error.errors?.user ? errorMessage.user = error.errors.user.message : null
        error.errors?.subtotal ? errorMessage.subtotal = error.errors.subtotal.message : null
        error.errors?.shipping ? errorMessage.shipping = error.errors.shipping.message : null
        error.errors?.total ? errorMessage.total = error.errors.total.message : null

        if (Object.values(errorMessage).length === 0) {
            res.status(500).send({
                result: "Fail",
                reason: "Internal Server Error"
            })
        }
        else {
            res.status(400).send({
                result: "Fail",
                reason: errorMessage
            })
        }
    }
}
async function getRecord(req, res) {
    try {
        let data = await Checkout.find().sort({ _id: -1 })
            .populate({
                path: "user",
                select: "name username email phone defaultAddress",
                populate: {
                    path: "defaultAddress",
                    select: "address city state pin lat lng"
                }
            })
            .populate("deliveryBoy", ["name", "username", "email", "phone", "permanentLocation"])
            .populate(PRODUCT_POPULATE)
        res.send({
            result: "Done",
            count: data.length,
            data: data
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            result: "Fail",
            reason: "Internal Server Error"
        })
    }
}

async function getUserRecord(req, res) {
    try {
        let data = await Checkout.find({ user: req.params.userid }).sort({ _id: -1 })
            .populate({
                path: "user",
                select: "name username email phone defaultAddress",
                populate: {
                    path: "defaultAddress",
                    select: "address city state pin lat lng"
                }
            })
            .populate("deliveryBoy", ["name", "username", "email", "phone", "permanentLocation"])
            .populate(PRODUCT_POPULATE)
        res.send({
            result: "Done",
            count: data.length,
            data: data
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            result: "Fail",
            reason: "Internal Server Error"
        })
    }
}


async function getSingleRecord(req, res) {
    try {
        let data = await Checkout.findOne({ _id: req.params._id })
            .populate({
                path: "user",
                select: "name username email phone defaultAddress",
                populate: {
                    path: "defaultAddress",
                    select: "address city state pin lat lng"
                }
            })
            .populate("deliveryBoy", ["name", "username", "email", "phone", "permanentLocation"])
            .populate(PRODUCT_POPULATE)
        if (data)
            res.send({
                result: "Done",
                data: data
            })
        else
            res.status(404).send({
                result: "Fail",
                reason: "Record Not Found"
            })
    } catch (error) {
        // console.log(error)
        res.status(500).send({
            result: "Fail",
            reason: "Internal Server Error"
        })
    }
}

async function updateRecord(req, res) {
    try {
        let data = await Checkout.findOne({ _id: req.params._id })
            .populate("user", ["email"])
        if (data) {
            let previousOrderStatus = data.orderStatus

            // When a DeliveryBoy requests OTP confirmation (from DeliveryConfirm page),
            // we email the customer an OTP and hold the order at "Out for Delivery"
            // until verifyDelivery confirms that code.
            // When an Admin or Shop manager updates the order to "Delivered", they have
            // administrative authority to mark it delivered directly without an OTP gate.
            const requestingDelivered =
                req.body.orderStatus && req.body.orderStatus.toLowerCase() === "delivered"
            const isDeliveryBoy =
                req.user?.role === "DeliveryBoy" || req.body.requestOtp === true

            const shouldHoldForOtp = requestingDelivered && isDeliveryBoy

            data.orderStatus = (req.body.orderStatus && !shouldHoldForOtp)
                ? req.body.orderStatus
                : data.orderStatus
            data.paymentMode = req.body.paymentMode ?? data.paymentMode
            data.paymentStatus = req.body.paymentStatus ?? data.paymentStatus
            data.deliveryBoy = req.body.deliveryBoy ?? data.deliveryBoy
            data.rppid = req.body.rppid ?? data.rppid

            if (shouldHoldForOtp) {
                if (!data.user?.email) {
                    return res.status(400).send({
                        result: "Fail",
                        reason: "Cannot send delivery OTP: customer email not found"
                    })
                }
                data.deliveryOtp = generateDeliveryOtp()
                data.deliveryOtpExpiry = new Date(Date.now() + DELIVERY_OTP_TTL_MINUTES * 60 * 1000)
            } else if (requestingDelivered && !shouldHoldForOtp) {
                // Admin or Shop directly marked Delivered — clear any pending delivery OTP
                data.deliveryOtp = undefined
                data.deliveryOtpExpiry = undefined
                if (data.paymentMode === "COD" && req.body.paymentStatus === "Done") {
                    data.paymentStatus = "Done"
                }
            }

            await data.save()

            let finalData = await Checkout.findOne({ _id: data._id })
                .populate({
                    path: "user",
                    select: "name username email phone defaultAddress",
                    populate: {
                        path: "defaultAddress",
                        select: "address city state pin lat lng"
                    }
                })
                .populate("deliveryBoy", ["name", "username", "email", "phone", "permanentLocation"])
                .populate(PRODUCT_POPULATE)

            if (shouldHoldForOtp) {
                sendDeliveryOtpEmail(finalData.user.email, data.deliveryOtp)
            }
            else if (requestingDelivered && !shouldHoldForOtp) {
                if (previousOrderStatus !== "Delivered") {
                    mailer.sendMail({
                        
                        to: finalData.user.email,
                        subject: `Order Delivered Successfully 🎉 - ${process.env.SITE_NAME || "ShopKaro"}`,
                        html: orderDeliveredTemplate({
                            customerName: finalData.user?.name,
                            orderId: finalData._id
                        }),
                    }, (error) => {
                        if (error) console.log("Error sending email:", error);
                    });
                }
            }
            else if (req.body.orderStatus && req.body.orderStatus !== previousOrderStatus) {
                let statusMessage = "";

                // Customize email message based on the order status
                switch (req.body.orderStatus.toLowerCase()) {
                    case "order is placed":
                    case "ordered":
                    case "placed":
                        statusMessage = "Your order has been placed successfully and is being processed.";
                        break;
                    case "order is packed":
                    case "packed":
                    case "processing":
                    case "order is under process":
                        statusMessage = "Your order has been packed and is ready to be shipped.";
                        break;
                    case "shipped":
                        statusMessage = "Your order has been shipped. It will reach you soon!";
                        break;
                    case "out for delivery":
                        statusMessage = "Your order is out for delivery. Please be ready to receive it.";
                        break;
                    case "cancelled":
                        statusMessage = "Your order has been cancelled.";
                        break;
                    default:
                        statusMessage = `Your order status has been updated to: ${req.body.orderStatus}.`;
                        break;
                }
                mailer.sendMail({
                    
                    to: finalData.user.email,
                    subject: `Order Status: ${req.body.orderStatus} - ${process.env.SITE_NAME || "ShopKaro"}`,
                    html: orderStatusTemplate({
                        customerName: finalData.user?.name,
                        orderId: finalData._id,
                        orderStatus: req.body.orderStatus,
                        statusMessage
                    }),
                }, (error) => {
                    if (error) console.log("Error sending email:", error);
                    // else console.log("Order status update email sent successfully.");
                });

            }
            res.send({
                result: "Done",
                data: finalData,
                otpRequested: shouldHoldForOtp || undefined
            })
        }
        else
            res.status(404).send({
                result: "Fail",
                reason: "Record Not Found"
            })
    } catch (error) {
        console.log(error)

        res.status(500).send({
            result: "Fail",
            reason: "Internal Server Error"
        })
    }
}

async function verifyDelivery(req, res) {
    try {
        let data = await Checkout.findOne({ _id: req.params._id })
            .populate("user", ["email"])
        if (!data) {
            return res.status(404).send({
                result: "Fail",
                reason: "Record Not Found"
            })
        }

        if (!data.deliveryOtp || !data.deliveryOtpExpiry) {
            return res.status(400).send({
                result: "Fail",
                reason: "No delivery confirmation is pending for this order"
            })
        }

        if (data.deliveryOtpExpiry < new Date()) {
            return res.status(400).send({
                result: "Fail",
                reason: "OTP has expired. Please request a new one."
            })
        }

        if (req.body.otp === undefined || req.body.otp === null || req.body.otp === "") {
            console.log("verifyDelivery: no otp received in request body — check that express.json() (or equivalent body parser) runs before this route. req.body:", req.body)
            return res.status(400).send({
                result: "Fail",
                reason: "OTP is required"
            })
        }

        const submittedOtp = String(req.body.otp).trim()
        const storedOtp = String(data.deliveryOtp).trim()

        if (submittedOtp !== storedOtp) {
            console.log(`verifyDelivery: OTP mismatch for order ${data._id} — submitted="${submittedOtp}" stored="${storedOtp}"`)
            return res.status(400).send({
                result: "Fail",
                reason: "Invalid OTP"
            })
        }

        let previousOrderStatus = data.orderStatus
        data.orderStatus = "Delivered"
        data.deliveryOtp = undefined
        data.deliveryOtpExpiry = undefined
        await data.save()

        let finalData = await Checkout.findOne({ _id: data._id })
            .populate({
                path: "user",
                select: "name username email phone defaultAddress",
                populate: {
                    path: "defaultAddress",
                    select: "address city state pin lat lng"
                }
            })
            .populate("deliveryBoy", ["name", "username", "email", "phone", "permanentLocation"])
            .populate(PRODUCT_POPULATE)

        if (previousOrderStatus !== "Delivered") {
            mailer.sendMail({
                
                to: finalData.user.email,
                subject: `Order Delivered Successfully 🎉 - ${process.env.SITE_NAME || "ShopKaro"}`,
                html: orderDeliveredTemplate({
                    customerName: finalData.user?.name,
                    orderId: finalData._id
                }),
            }, (error) => {
                if (error) console.log("Error sending email:", error);
            });
        }

        res.send({
            result: "Done",
            data: finalData
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            result: "Fail",
            reason: "Internal Server Error"
        })
    }
}

async function deleteRecord(req, res) {
    try {
        let data = await Checkout.findOne({ _id: req.params._id })
        if (data) {
            await data.deleteOne()
            res.send({
                result: "Done",
                data: data
            })
        }
        else
            res.status(404).send({
                result: "Fail",
                reason: "Record Not Found"
            })
    } catch (error) {
        // console.log(error)
        res.status(500).send({
            result: "Fail",
            reason: "Internal Server Error"
        })
    }
}

module.exports = {
    createRecord: createRecord,
    getRecord: getRecord,
    getUserRecord: getUserRecord,
    getSingleRecord: getSingleRecord,
    updateRecord: updateRecord,
    deleteRecord: deleteRecord,
    order: order,
    verifyOrder: verifyOrder,
    verifyDelivery: verifyDelivery
}