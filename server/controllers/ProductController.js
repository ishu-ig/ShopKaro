const Product = require("../models/Product")
const { deleteFromCloudinary } = require("../cloudinaryMethods");

async function createRecord(req, res) {
    try {
        // Pull variants out of req.body separately — do NOT let it flow into
        // `new Product(req.body)` as a raw string, and do NOT assign the
        // parsed-but-still-plain array straight onto data.variants before
        // we've read imageCount off it.
        const { variants, ...rest } = req.body;

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
        // anything. This is the "before" picture we diff against once the
        // save succeeds, so we know exactly which Cloudinary files became
        // orphaned — whether the user removed one image from a variant,
        // or removed an entire variant outright.
        const oldImages = data.variants.flatMap(variant => variant.pic || []);

        data.name = req.body.name ?? data.name;
        data.maincategory = req.body.maincategory ?? data.maincategory;
        data.subcategory = req.body.subcategory ?? data.subcategory;
        data.brand = req.body.brand ?? data.brand;
        // FIX: shop was previously never re-assigned here, so changing a
        // product's shop from the update form silently had no effect —
        // the product kept its original shop forever even though the
        // frontend submitted the new one.
        data.shop = req.body.shop ?? data.shop;
        data.discount = req.body.discount ?? data.discount;
        data.description = req.body.description ?? data.description;
        data.active = req.body.active ?? data.active;

        // Tracks every image URL that will exist on the product AFTER this
        // update — used below to figure out what's now orphaned.
        let newImages = oldImages;

        // Parse variants if received as JSON string
        if (req.body.variants) {
            let rawVariants = typeof req.body.variants === "string"
                ? JSON.parse(req.body.variants)
                : req.body.variants;

            // Same imageCount-stripping issue as createRecord: read it off
            // the plain objects BEFORE assigning to data.variants triggers
            // Mongoose subdocument casting.
            //
            // IMPORTANT: `variant.pic` here is whatever existing image URLs
            // the frontend chose to KEEP for this variant (the user may have
            // removed some via the "x" button). Newly uploaded files must be
            // APPENDED onto that kept list, never used to replace it —
            // otherwise every kept "previous" image silently disappears the
            // moment the user also uploads a new one for that variant.
            let imageIndex = 0;
            newImages = [];
            const variantsWithImages = rawVariants.map((variant) => {
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
        console.log(error);

        if (req.files && req.files.length) {
            await Promise.all(
                req.files.map(file => deleteFromCloudinary(file.path))
            );
        }

        res.status(500).send({
            result: "Fail",
            reason: "Internal Server Error"
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