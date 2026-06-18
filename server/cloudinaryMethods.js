const cloudinary = require("./cloudinary");

/**
 * Extract Cloudinary public_id from a full HTTPS URL.
 * e.g. https://res.cloudinary.com/cloud/image/upload/v123/portfolio/blog/abc.jpg
 *      → "portfolio/blog/abc"
 */
function getPublicId(url) {
    if (!url) return null;
    const parts       = url.split("/");
    const uploadIndex = parts.indexOf("upload");
    if (uploadIndex === -1) return null;
    // Skip version segment (v123)
    const pathParts = parts.slice(uploadIndex + 2);
    return pathParts.join("/").replace(/\.[^/.]+$/, ""); // remove extension
}

/**
 * Delete a file from Cloudinary by its full HTTPS URL.
 * Silently ignores missing/invalid URLs.
 */
async function deleteFromCloudinary(url) {
    const publicId = getPublicId(url);
    if (!publicId) return;
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (_) {}
}

module.exports = { getPublicId, deleteFromCloudinary };