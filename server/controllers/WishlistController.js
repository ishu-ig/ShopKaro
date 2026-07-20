const Wishlist = require("../models/Wishlist")

// Wishlist.variant is a bare ObjectId with no `ref` (it points at a
// subdocument embedded in Product.variants, not its own collection), so
// Mongoose can't populate it directly. Resolve it manually the same way
// the Cart controller does: look the id up inside the populated product's
// variants array and swap the id out for the full variant object.
function resolveVariant(wishlistDoc) {
    if (!wishlistDoc) return wishlistDoc;
    const obj = wishlistDoc.toObject ? wishlistDoc.toObject() : wishlistDoc;
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
    }
};

async function createRecord(req, res) {
    try {
        let data = new Wishlist(req.body)
        await data.save()
        let finalData = await Wishlist.findOne({ _id: data._id })
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
        error.errors?.variant ? errorMessage.variant = error.errors.variant.message : null

        if (Object.values(errorMessage).length === 0) {
            console.error("Wishlist createRecord error:", error);
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
        let data = await Wishlist.find({ user: req.params.userid }).sort({ _id: -1 })
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
        let data = await Wishlist.findOne({ _id: req.params._id })
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

async function deleteRecord(req, res) {
    try {
        let data = await Wishlist.findOne({ _id: req.params._id })
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
    deleteRecord: deleteRecord
}