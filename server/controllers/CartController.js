const Cart = require("../models/Cart")

function resolveVariant(cartDoc) {
    if (!cartDoc) return cartDoc;
    const obj = cartDoc.toObject ? cartDoc.toObject() : cartDoc;
    const variantId = obj.variant?.toString();
    const matched = obj.product?.variants?.find(
        (v) => v._id.toString() === variantId
    );
    if (matched) obj.variant = matched;
    return obj;
}

const PRODUCT_POPULATE = {
    path: "product",
    select: "name brand discount variants shop",
    populate: {
        path: "brand",
        select: "name"
    },
    populate: {
        path: "shop",
        select: "name"
    }
};

async function createRecord(req, res) {
    try {
        let data = new Cart(req.body)
        await data.save()
        let finalData = await Cart.findOne({ _id: data._id })
            .populate("user", ["name", "username"])
            .populate(PRODUCT_POPULATE)
        res.send({
            result: "Done",
            data: resolveVariant(finalData)
        })
    } catch (error) {

        let errorMessage = {}
        error.errors?.user ? errorMessage.user = error.errors.user.message : null
        error.errors?.product ? errorMessage.product = error.errors.product.message : null
        error.errors?.qty ? errorMessage.qty = error.errors.qty.message : null
        error.errors?.variant ? errorMessage.variant = error.errors.variant.message : null
        error.errors?.total ? errorMessage.total = error.errors.total.message : null

        if (Object.values(errorMessage).length === 0) {
            console.error("Cart createRecord error:", error);
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
        let data = await Cart.find({ user: req.params.userid }).sort({ _id: -1 })
            .populate("user", ["name", "username"])
            .populate(PRODUCT_POPULATE)
        res.send({
            result: "Done",
            count: data.length,
            data: data.map(resolveVariant)
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
        let data = await Cart.findOne({ _id: req.params._id })
            .populate("user", ["name", "username"])
            .populate(PRODUCT_POPULATE)
        if (data)
            res.send({
                result: "Done",
                data: resolveVariant(data)
            })
        else
            res.status(404).send({
                result: "Fail",
                reason: "Record Not Found"
            })
    } catch (error) {
        res.status(500).send({
            result: "Fail",
            reason: "Internal Server Error"
        })
    }
}

async function updateRecord(req, res) {
    try {
        let data = await Cart.findOne({ _id: req.params._id })
        if (data) {
            data.qty = req.body.qty ?? data.qty
            data.total = req.body.total ?? data.total
            await data.save()

            let finalData = await Cart.findOne({ _id: data._id })
                .populate("user", ["name", "username"])
                .populate(PRODUCT_POPULATE)

            res.send({
                result: "Done",
                data: resolveVariant(finalData)
            })
        }
        else
            res.status(404).send({
                result: "Fail",
                reason: "Record Not Found"
            })
    } catch (error) {
        res.status(500).send({
            result: "Fail",
            reason: "Internal Server Error"
        })
    }
}

async function deleteRecord(req, res) {
    try {
        let data = await Cart.findOne({ _id: req.params._id })
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
        res.status(500).send({
            result: "Fail",
            reason: "Internal Server Error"
        })
    }
}

module.exports = {
    createRecord: createRecord,
    getRecord: getRecord,
    getSingleRecord: getSingleRecord,
    updateRecord: updateRecord,
    deleteRecord: deleteRecord
}