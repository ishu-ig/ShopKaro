const mongoose = require("mongoose");
const Product = require("../models/Product");
const { deleteFromCloudinary } = require("../cloudinaryMethods");

async function createRecord(req, res) {
    try {
        // Pull variants out of req.body separately — do NOT let it flow into
        // `new Product(req.body)` as a raw string, and do NOT assign the
        // parsed-but-still-plain array straight onto data.variants before
        // we've read imageCount off it.
        const { variants, ...rest } = req.body;
        if (rest.shop === "" || rest.shop === "null" || rest.shop === "undefined") {
            delete rest.shop;
        }

        let data = new Product(rest);

        let rawVariants = [];
        if (variants) {
            rawVariants = typeof variants === "string" ? JSON.parse(variants) : variants;
        }

        // Attach uploaded files to their variant HERE, while these are still
        // plain JS objects. `imageCount` is a frontend-only helper field —
        // it does not exist on VariantSchema, so the moment this array gets
        // assigned to data.variants, Mongoose casts each entry into a
        // subdocument and silently drops any field not in the schema
        // (imageCount included). Reading it after that point always
        // returns undefined -> 0 -> empty pic array for every variant.
        let imageIndex = 0;
        const variantsWithImages = rawVariants.map((variant) => {
            const imageCount = Number(variant.imageCount || 0);
            const pic = (req.files || [])
                .slice(imageIndex, imageIndex + imageCount)
                .map(file => file.path);

            imageIndex += imageCount;

            const { imageCount: _drop, ...variantFields } = variant; // strip helper field
            return { ...variantFields, pic };
        });

        data.variants = variantsWithImages;

        await data.save()
        let finalData = await Product.findOne({ _id: data._id })
            .populate({
                path: "maincategory",
                select: "name pic active"
            })
            .populate({
                path: "subcategory",
                select: "name pic active"
            })
            .populate({
                path: "brand",
                select: "name pic active"
            })
            .populate({
                path: "reviews.user",
                select: "name username email pic"
            })
            .populate({
                path: "shop",
                select: `name ownerName email phone permanentLocation status active maincategory subcategory`,
                populate: [
                    {
                        path: "maincategory",
                        select: "name pic active"
                    },
                    {
                        path: "subcategory",
                        select: "name pic active"
                    }
                ]
            })
        res.send({
            result: "Done",
            data: finalData
        })
    } catch (error) {

        if (req.files) {
            await Promise.all(
                req.files.map(file => deleteFromCloudinary(file.path))
            );
        }

        let errorMessage = {}
        error.errors?.name ? errorMessage.name = error.errors.name.message : null
        error.errors?.maincategory ? errorMessage.maincategory = error.errors.maincategory.message : null
        error.errors?.subcategory ? errorMessage.subcategory = error.errors.subcategory.message : null
        error.errors?.brand ? errorMessage.brand = error.errors.brand.message : null
        error.errors?.shop ? errorMessage.shop = error.errors.shop.message : null
        error.errors?.discount ? errorMessage.discount = error.errors.discount.message : null
        error.errors?.variants ? errorMessage.variants = error.errors.variants.message : null


        if (Object.values(errorMessage).length === 0) {
            console.error("Product createRecord error:", error);
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
        let data = await Product.find()
            .sort({ _id: -1 })
            .populate("maincategory", "name pic active")
            .populate("subcategory", "name pic active")
            .populate("brand", "name pic active")
            .populate("reviews.user", "name username email pic")
            .populate({
                path: "shop",
                select: `name ownerName email phone permanentLocation status active maincategory subcategory`,
                populate: [
                    {
                        path: "maincategory",
                        select: "name pic active"
                    },
                    {
                        path: "subcategory",
                        select: "name pic active"
                    }
                ]
            })

        res.send({
            result: "Done",
            count: data.length,
            data: data
        });
    } catch (error) {
        res.status(500).send({
            result: "Fail",
            reason: "Internal Server Error"
        });
    }
}


async function getSingleRecord(req, res) {
    try {
        let data = await Product.findOne({ _id: req.params._id })
            .populate("maincategory", "name pic active")
            .populate("subcategory", "name pic active")
            .populate("brand", "name pic active")
            .populate("reviews.user", "name username email pic")
            .populate({
                path: "shop",
                select: `name ownerName email phone permanentLocation status active maincategory subcategory`,
                populate: [
                    {
                        path: "maincategory",
                        select: "name pic active"
                    },
                    {
                        path: "subcategory",
                        select: "name pic active"
                    }
                ]
            })

        if (data) {
            res.send({
                result: "Done",
                data: data
            });
        } else {
            res.status(404).send({
                result: "Fail",
                reason: "Record Not Found"
            });
        }
    } catch (error) {
        res.status(500).send({
            result: "Fail",
            reason: "Internal Server Error"
        });
    }
}

async function updateRecord(req, res) {
    try {
        let data = await Product.findById(req.params._id);

        if (!data) {
            return res.status(404).send({
                result: "Fail",
                reason: "Record Not Found"
            });
        }

        // Snapshot every image URL currently on the product BEFORE we touch
        // anything (safely check both legacy root `pic` and `variants.pic`).
        const oldImages = [
            ...(Array.isArray(data.pic) ? data.pic : []),
            ...((data.variants || []).flatMap(variant => (variant && variant.pic) ? variant.pic : []))
        ];

        if (req.body.name) data.name = req.body.name;
        if (req.body.maincategory) data.maincategory = req.body.maincategory;
        if (req.body.subcategory) data.subcategory = req.body.subcategory;
        if (req.body.brand) data.brand = req.body.brand;

        // Handle shop safely: if explicitly passed as empty or null, unset it (undefined)
        // rather than assigning "" which throws a Mongoose ObjectId CastError.
        if (req.body.shop !== undefined) {
            if (req.body.shop && req.body.shop !== "" && req.body.shop !== "null" && req.body.shop !== "undefined") {
                data.shop = req.body.shop;
            } else {
                data.shop = undefined;
            }
        }

        if (req.body.discount !== undefined && req.body.discount !== "") {
            data.discount = Number(req.body.discount) || 0;
        }
        if (req.body.description !== undefined) {
            data.description = req.body.description;
        }
        if (req.body.active !== undefined) {
            data.active = req.body.active === "true" || req.body.active === true || req.body.active === "1" || req.body.active === 1;
        }
        if (req.body.isreturnAble !== undefined) {
            data.isreturnAble = req.body.isreturnAble === "true" || req.body.isreturnAble === true || req.body.isreturnAble === "1" || req.body.isreturnAble === 1;
        }
        if (req.body.returnDuration !== undefined && req.body.returnDuration !== "") {
            data.returnDuration = Number(req.body.returnDuration) || 0;
        }
        if (req.body.warranty !== undefined) {
            data.warranty = req.body.warranty;
        }

        // Tracks every image URL that will exist on the product AFTER this
        // update — used below to figure out what's now orphaned.
        let newImages = oldImages;

        // Parse variants if received as JSON string
        if (req.body.variants) {
            let rawVariants = typeof req.body.variants === "string"
                ? JSON.parse(req.body.variants)
                : req.body.variants;

            let imageIndex = 0;
            newImages = [];
            const variantsWithImages = (rawVariants || []).map((variant) => {
                const imageCount = Number(variant.imageCount || 0);
                const keptPic = Array.isArray(variant.pic) ? variant.pic : [];

                let uploadedPic = [];
                if (imageCount > 0 && req.files && req.files.length) {
                    uploadedPic = req.files
                        .slice(imageIndex, imageIndex + imageCount)
                        .map(file => file.path);
                }
                imageIndex += imageCount;

                const pic = [...keptPic, ...uploadedPic]; // previous (kept) + new, side by side
                newImages.push(...pic);

                const { imageCount: _drop, ...variantFields } = variant;
                // If variant has an invalid _id or empty string, delete it so Mongoose assigns a new valid ObjectId
                if (variantFields._id && !mongoose.isValidObjectId(variantFields._id)) {
                    delete variantFields._id;
                }
                return { ...variantFields, pic };
            });

            data.variants = variantsWithImages;
        }

        await data.save();

        // Clean up Cloudinary: anything that was on the product before but
        // is not present anywhere in the saved result is either an image the
        // user explicitly removed, or belonged to a variant that was removed
        // entirely — either way it's now orphaned and safe to delete.
        const staleImages = oldImages.filter(img => !newImages.includes(img));
        if (staleImages.length) {
            const results = await Promise.allSettled(
                staleImages.map(pic => deleteFromCloudinary(pic))
            );
            results.forEach((r, i) => {
                if (r.status === "rejected") {
                    console.error("Failed to delete stale Cloudinary image:", staleImages[i], r.reason);
                }
            });
        }

        const finalData = await Product.findById(data._id)
            .populate("maincategory", "name pic active")
            .populate("subcategory", "name pic active")
            .populate("brand", "name pic active")
            .populate("reviews.user", "name username email pic")
            .populate({
                path: "shop",
                select: `name ownerName email phone permanentLocation status active maincategory subcategory`,
                populate: [
                    {
                        path: "maincategory",
                        select: "name pic active"
                    },
                    {
                        path: "subcategory",
                        select: "name pic active"
                    }
                ]
            })

        res.send({
            result: "Done",
            data: finalData
        });

    } catch (error) {
        console.error("Product updateRecord error:", error);

        if (req.files && req.files.length) {
            await Promise.all(
                req.files.map(file => deleteFromCloudinary(file.path))
            );
        }

        let errorMessage = {};
        if (error.errors) {
            Object.keys(error.errors).forEach(key => {
                errorMessage[key] = error.errors[key].message;
            });
            return res.status(400).send({
                result: "Fail",
                reason: errorMessage
            });
        }

        res.status(500).send({
            result: "Fail",
            reason: error.message || "Internal Server Error"
        });
    }
}

async function deleteRecord(req, res) {
    try {
        let data = await Product.findById(req.params._id);

        if (!data) {
            return res.status(404).send({
                result: "Fail",
                reason: "Record Not Found"
            });
        }

        // Delete all variant images from Cloudinary
        const allImages = data.variants.flatMap(variant => variant.pic || []);

        if (allImages.length) {
            await Promise.all(
                allImages.map(pic => deleteFromCloudinary(pic))
            );
        }

        await data.deleteOne();

        res.send({
            result: "Done",
            data
        });

    } catch (error) {
        console.log(error);
        res.status(500).send({
            result: "Fail",
            reason: "Internal Server Error"
        });
    }
}

async function addReview(req, res) {
    try {
        const { rating, comment } = req.body;

        if (!comment || comment.trim() === "") {
            return res.status(400).send({
                result: "Fail",
                reason: "Comment is required"
            });
        }

        let data = await Product.findById(req.params._id);

        if (!data) {
            return res.status(404).send({
                result: "Fail",
                reason: "Product Not Found"
            });
        }

        const alreadyReviewed = data.reviews.find(
            r => r.user?.toString() === req.body.user
        );

        if (alreadyReviewed) {
            return res.status(400).send({
                result: "Fail",
                reason: "You have already reviewed this product"
            });
        }

        data.reviews.push({
            user: req.body.user,
            name: req.body.name || "Anonymous",
            rating: Number(rating) || 5,
            comment: comment.trim(),
            date: new Date()
        });

        await data.save();

        const finalData = await Product.findById(data._id)
            .populate("reviews.user", "name username email pic");

        res.send({
            result: "Done",
            data: finalData.reviews
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
    createRecord: createRecord,
    getRecord: getRecord,
    getSingleRecord: getSingleRecord,
    updateRecord: updateRecord,
    deleteRecord: deleteRecord,
    addReview: addReview
}