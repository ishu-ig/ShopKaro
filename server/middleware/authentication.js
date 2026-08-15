const jwt = require("jsonwebtoken");

function getToken(req) {
    const authorization = req.headers.authorization;

    if (!authorization || authorization === "null" || authorization === "undefined") return null;

    return authorization.startsWith("Bearer ")
        ? authorization.split(" ")[1]
        : authorization;
}

function verifyWithSecrets(getSecrets) {
    return (req, res, next) => {
        const token = getToken(req);

        if (!token) {
            return res.status(401).send({
                result: "Fail",
                reason: "You Are Not Authorized to Access This API"
            });
        }

        const secretsList = (Array.isArray(getSecrets) ? getSecrets : [getSecrets])
            .map((s) => (typeof s === "function" ? s() : s))
            .filter(Boolean);

        let expired = false;

        for (const secret of secretsList) {
            try {
                const decoded = jwt.verify(token, secret);
                req.user = decoded.data;
                return next();
            } catch (error) {
                if (error.name === "TokenExpiredError") {
                    expired = true;
                }
            }
        }

        return res.status(expired ? 498 : 401).send({
            result: "Fail",
            reason: expired
                ? "Token Expired. Please Login Again"
                : "You Are Not Authorized to Access This API"
        });
    };
}

const verifyAdmin = verifyWithSecrets([
    () => process.env.JWT_SECRET_KEY_ADMIN
]);

const verifyShop = verifyWithSecrets([
    () => process.env.JWT_SECRET_KEY_SHOP
]);

const verifyBuyer = verifyWithSecrets([
    () => process.env.JWT_SECRET_KEY_BUYER
]);

const verifyDeliveryBoy = verifyWithSecrets([
    () => process.env.JWT_SECRET_KEY_DELIVERYBOY
]);

// Buyer/DeliveryBoy + Admin
const verifyBoth = verifyWithSecrets([
    () => process.env.JWT_SECRET_KEY_SHOP,
    () => process.env.JWT_SECRET_KEY_ADMIN
]);

// Buyer/DeliveryBoy + Admin + Restaurant
const verifyThree = verifyWithSecrets([
    () => process.env.JWT_SECRET_KEY_BUYER,
    () => process.env.JWT_SECRET_KEY_ADMIN,
    () => process.env.JWT_SECRET_KEY_SHOP
]);

const verifyFour = verifyWithSecrets([
    () => process.env.JWT_SECRET_KEY_DELIVERYBOY,
    () => process.env.JWT_SECRET_KEY_ADMIN,
    () => process.env.JWT_SECRET_KEY_SHOP,
    () => process.env.JWT_SECRET_KEY_BUYER,
]);

const verifyTwoDelivery = verifyWithSecrets([
    () => process.env.JWT_SECRET_KEY_DELIVERYBOY,
    () => process.env.JWT_SECRET_KEY_ADMIN,
    () => process.env.JWT_SECRET_KEY_SHOP,
    () => process.env.JWT_SECRET_KEY_BUYER,
]);

module.exports = {
    verifyAdmin,
    verifyShop,
    verifyBuyer,
    verifyBoth,
    verifyThree,
    verifyFour,
    verifyDeliveryBoy,
    verifyTwoDelivery
};