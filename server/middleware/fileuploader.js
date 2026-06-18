const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../cloudinary");

function createUploader(folder) {
    const storage = new CloudinaryStorage({
        cloudinary,
        params: async (req, file) => {
            const cleanName = file.originalname
                .replace(/\s+/g, "_")
                .replace(/[()]/g, "")
                .replace(/[^a-zA-Z0-9._-]/g, "");

            const isPdf = file.mimetype === "application/pdf";

            return {
                folder: `ShopKaro/${folder}`,
                public_id: `${Date.now()}_${cleanName.split(".")[0]}`,
                resource_type: isPdf ? "raw" : "image",
                format: isPdf ? "pdf" : undefined
            };
        }
    });

    return multer({
        storage,
        limits: {
            fileSize: 10 * 1024 * 1024 // 10 MB
        },
        fileFilter: (req, file, cb) => {
            const allowedTypes = [
                "image/jpeg",
                "image/jpg",
                "image/png",
                "image/webp",
                "application/pdf"
            ];

            if (allowedTypes.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(new Error("Only JPG, JPEG, PNG, WEBP and PDF files are allowed"));
            }
        }
    });
}

module.exports = {
    maincategoryUploader: createUploader("maincategory"),
    subcategoryUploader: createUploader("subcategory"),
    brandUploader: createUploader("brand"),
    testimonialUploader: createUploader("testimonial"),
    productUploader: createUploader("product"),
    userUploader: createUploader("user")
};