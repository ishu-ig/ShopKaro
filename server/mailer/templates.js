/**
 * Premium Responsive Email Templates for ShopKaro
 */

const getSiteName = () => process.env.SITE_NAME || "ShopKaro";
const getServerUrl = () => process.env.SERVER || "https://shopkaro.com";

/**
 * Base email layout wrapper
 */
function baseEmailTemplate({ title, badgeText, badgeColor = "#4f46e5", badgeBg = "#eef2ff", content, previewText = "" }) {
    const siteName = getSiteName();
    const currentYear = new Date().getFullYear();

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title || siteName}</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <style>
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
        body { margin: 0; padding: 0; width: 100% !important; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; -webkit-font-smoothing: antialiased;">
    ${previewText ? `<div style="display: none; font-size: 1px; color: #f1f5f9; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">${previewText}</div>` : ""}
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9; table-layout: fixed;">
        <tr>
            <td align="center" style="padding: 36px 16px;">
                <!-- Main Container -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0;">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0a2540 100%); padding: 32px 36px; text-align: center;">
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center">
                                        <div style="font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; margin-bottom: 6px;">
                                            <span style="color: #6366f1;">🛍️</span> ${siteName}
                                        </div>
                                        ${badgeText ? `
                                        <div style="display: inline-block; padding: 4px 12px; background-color: ${badgeBg}; color: ${badgeColor}; font-size: 12px; font-weight: 700; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px;">
                                            ${badgeText}
                                        </div>
                                        ` : ""}
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                        <td style="padding: 36px 36px 28px 36px; color: #334155; font-size: 15px; line-height: 1.6;">
                            ${content}
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 36px; text-align: center;">
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center" style="font-size: 13px; color: #64748b; line-height: 1.5;">
                                        <p style="margin: 0 0 8px 0; font-weight: 600; color: #475569;">
                                            ${siteName} &bull; Your Trusted Shopping Destination
                                        </p>
                                        <p style="margin: 0 0 12px 0;">
                                            Need help? Reach us anytime at <a href="${getServerUrl()}/contact" style="color: #4f46e5; text-decoration: underline;">Support Center</a>.
                                        </p>
                                        <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                                            &copy; ${currentYear} ${siteName}. All rights reserved.<br>
                                            This is an automated system notification.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `.trim();
}

/**
 * 1. Password Reset OTP Email Template
 */
function passwordResetOtpTemplate({ name, otp }) {
    const content = `
        <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #0f172a;">Password Reset Request</h2>
        <p style="margin: 0 0 16px 0; color: #475569;">
            Hello <strong>${name || "User"}</strong>,
        </p>
        <p style="margin: 0 0 24px 0; color: #475569;">
            We received a request to reset the password for your account. Use the one-time verification code below to complete the reset process:
        </p>

        <!-- OTP Card -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
            <tr>
                <td align="center" style="background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 20px 24px;">
                    <div style="font-size: 12px; font-weight: 600; text-transform: uppercase; color: #64748b; letter-spacing: 1px; margin-bottom: 8px;">
                        Your One-Time Password
                    </div>
                    <div style="font-size: 36px; font-weight: 800; color: #0f172a; letter-spacing: 8px; font-family: 'SFMono-Regular', Consolas, 'Courier New', monospace;">
                        ${otp}
                    </div>
                    <div style="margin-top: 8px; font-size: 12px; color: #dc2626; font-weight: 600;">
                        ⏱ Valid for 10 minutes only
                    </div>
                </td>
            </tr>
        </table>

        <!-- Security Note -->
        <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 6px; padding: 12px 16px; margin-bottom: 20px;">
            <p style="margin: 0; font-size: 13px; color: #991b1b; line-height: 1.5;">
                <strong>Security Alert:</strong> Never share this OTP with anyone, including ${getSiteName()} staff. If you did not make this request, you can safely ignore this email.
            </p>
        </div>
    `;

    return baseEmailTemplate({
        title: `Reset Your Password - ${getSiteName()}`,
        badgeText: "Security Verification",
        badgeColor: "#dc2626",
        badgeBg: "#fee2e2",
        previewText: `Your OTP is ${otp}. Valid for 10 minutes.`,
        content
    });
}

/**
 * 2. Delivery OTP Email Template (For Customer confirmation)
 */
function deliveryOtpTemplate({ otp, ttlMinutes = 10 }) {
    const content = `
        <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #0f172a;">Order Arrival & Delivery PIN</h2>
        <p style="margin: 0 0 16px 0; color: #475569;">
            Hello,
        </p>
        <p style="margin: 0 0 24px 0; color: #475569;">
            Your delivery partner has arrived with your order! Please share the secure delivery PIN below with the agent to verify receipt:
        </p>

        <!-- Delivery PIN Card -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
            <tr>
                <td align="center" style="background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%); border: 2px solid #a7f3d0; border-radius: 12px; padding: 22px 24px;">
                    <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #065f46; letter-spacing: 1px; margin-bottom: 8px;">
                        Delivery Confirmation Code
                    </div>
                    <div style="font-size: 38px; font-weight: 800; color: #047857; letter-spacing: 8px; font-family: 'SFMono-Regular', Consolas, 'Courier New', monospace;">
                        ${otp}
                    </div>
                    <div style="margin-top: 8px; font-size: 12px; color: #047857; font-weight: 600;">
                        ⏱ Expires in ${ttlMinutes} minutes
                    </div>
                </td>
            </tr>
        </table>

        <div style="background-color: #f0f9ff; border-left: 4px solid #0284c7; border-radius: 6px; padding: 12px 16px; margin-bottom: 20px;">
            <p style="margin: 0; font-size: 13px; color: #0369a1; line-height: 1.5;">
                💡 <strong>Important:</strong> Only share this code once you have physically received and inspected your package.
            </p>
        </div>
    `;

    return baseEmailTemplate({
        title: `Delivery Confirmation Code - ${getSiteName()}`,
        badgeText: "Delivery Hand-off",
        badgeColor: "#059669",
        badgeBg: "#d1fae5",
        previewText: `Your delivery PIN is ${otp}. Share with delivery agent.`,
        content
    });
}

/**
 * 3. Order Status Update Email Template
 */
function orderStatusTemplate({ customerName, orderId, orderStatus, statusMessage }) {
    const statusLower = (orderStatus || "").toLowerCase();
    let badgeColor = "#2563eb";
    let badgeBg = "#dbeafe";
    let icon = "📦";

    if (statusLower.includes("delivered")) {
        badgeColor = "#059669";
        badgeBg = "#d1fae5";
        icon = "✅";
    } else if (statusLower.includes("out for delivery")) {
        badgeColor = "#d97706";
        badgeBg = "#fef3c7";
        icon = "🚚";
    } else if (statusLower.includes("shipped")) {
        badgeColor = "#7c3aed";
        badgeBg = "#ede9fe";
        icon = "✈️";
    } else if (statusLower.includes("packed")) {
        badgeColor = "#0891b2";
        badgeBg = "#cffafe";
        icon = "🎁";
    }

    const content = `
        <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #0f172a;">${icon} Order Status Update</h2>
        <p style="margin: 0 0 16px 0; color: #475569;">
            Hello <strong>${customerName || "Valued Customer"}</strong>,
        </p>
        <p style="margin: 0 0 24px 0; color: #475569;">
            There is a new update on your order with <strong>${getSiteName()}</strong>.
        </p>

        <!-- Status Card -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 24px; overflow: hidden;">
            <tr>
                <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; background-color: #f1f5f9;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                            <td style="font-size: 13px; font-weight: 600; color: #475569;">Order Status:</td>
                            <td align="right">
                                <span style="display: inline-block; padding: 4px 12px; background-color: ${badgeBg}; color: ${badgeColor}; font-size: 12px; font-weight: 700; border-radius: 9999px; text-transform: uppercase;">
                                    ${orderStatus || "Updated"}
                                </span>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td style="padding: 20px; color: #334155; font-size: 15px; line-height: 1.6;">
                    ${statusMessage || `Your order status has been updated to: <strong>${orderStatus}</strong>.`}
                </td>
            </tr>
        </table>

        <!-- Action Button -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 16px;">
            <tr>
                <td align="center">
                    <a href="${getServerUrl()}" target="_blank" style="display: inline-block; background-color: #0f172a; color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600; letter-spacing: 0.2px;">
                        Track Order on ${getSiteName()}
                    </a>
                </td>
            </tr>
        </table>
    `;

    return baseEmailTemplate({
        title: `Order Status Update - ${getSiteName()}`,
        badgeText: orderStatus || "Order Update",
        badgeColor,
        badgeBg,
        previewText: `${statusMessage || `Your order is now ${orderStatus}`}`,
        content
    });
}

/**
 * 4. Order Delivered Celebration Template
 */
function orderDeliveredTemplate({ customerName }) {
    const content = `
        <div style="text-align: center; margin-bottom: 20px;">
            <div style="font-size: 48px; margin-bottom: 12px;">🎉</div>
            <h2 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 700; color: #047857;">Order Delivered Successfully!</h2>
            <p style="margin: 0; color: #64748b; font-size: 14px;">Thank you for shopping with ${getSiteName()}</p>
        </div>

        <p style="margin: 0 0 16px 0; color: #475569;">
            Hello <strong>${customerName || "Customer"}</strong>,
        </p>
        <p style="margin: 0 0 24px 0; color: #475569; line-height: 1.6;">
            Your package has been successfully delivered. We hope you love your new purchase! If you have any feedback, questions, or issues, our support team is always here for you.
        </p>

        <!-- CTA Box -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: center;">
            <tr>
                <td>
                    <p style="margin: 0 0 14px 0; font-size: 14px; font-weight: 600; color: #166534;">
                        Enjoying your products? Explore more great deals!
                    </p>
                    <a href="${getServerUrl()}" target="_blank" style="display: inline-block; background-color: #059669; color: #ffffff; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 600;">
                        Continue Shopping &rarr;
                    </a>
                </td>
            </tr>
        </table>
    `;

    return baseEmailTemplate({
        title: `Order Delivered - ${getSiteName()}`,
        badgeText: "Delivered",
        badgeColor: "#047857",
        badgeBg: "#d1fae5",
        previewText: `Your order has been delivered successfully! Thank you for choosing ${getSiteName()}.`,
        content
    });
}

/**
 * 5. Contact Query Received Template
 */
function contactQueryReceivedTemplate({ subject, message }) {
    const content = `
        <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #0f172a;">We Received Your Message</h2>
        <p style="margin: 0 0 16px 0; color: #475569;">
            Hello,
        </p>
        <p style="margin: 0 0 24px 0; color: #475569;">
            Thank you for contacting <strong>${getSiteName()} Support</strong>. We have logged your query and our team will get back to you shortly.
        </p>

        <!-- Query Details Card -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 24px;">
            <tr>
                <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; font-weight: 600; font-size: 13px; color: #475569; width: 28%;">
                    Subject
                </td>
                <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-size: 14px;">
                    ${subject || "General Inquiry"}
                </td>
            </tr>
            <tr>
                <td style="padding: 14px 18px; font-weight: 600; font-size: 13px; color: #475569; vertical-align: top;">
                    Message
                </td>
                <td style="padding: 14px 18px; color: #334155; font-size: 14px; line-height: 1.5;">
                    ${message || ""}
                </td>
            </tr>
        </table>

        <p style="margin: 0; font-size: 13px; color: #64748b;">
            Our typical response time is within 24 hours on business days.
        </p>
    `;

    return baseEmailTemplate({
        title: `Query Received - ${getSiteName()}`,
        badgeText: "Support Ticket",
        badgeColor: "#2563eb",
        badgeBg: "#dbeafe",
        previewText: `We received your query regarding "${subject}".`,
        content
    });
}

/**
 * 6. Contact Query Resolved Template
 */
function contactQueryResolvedTemplate() {
    const content = `
        <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #047857;">Query Marked as Resolved</h2>
        <p style="margin: 0 0 16px 0; color: #475569;">
            Hello,
        </p>
        <p style="margin: 0 0 24px 0; color: #475569; line-height: 1.6;">
            We are pleased to inform you that your support query has been resolved by our team. If you require further assistance or have another question, please feel free to reach out.
        </p>

        <!-- CTA Box -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 16px;">
            <tr>
                <td align="center">
                    <a href="${getServerUrl()}/contact" target="_blank" style="display: inline-block; background-color: #0f172a; color: #ffffff; padding: 12px 26px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600;">
                        Submit New Query &rarr;
                    </a>
                </td>
            </tr>
        </table>
    `;

    return baseEmailTemplate({
        title: `Query Resolved - ${getSiteName()}`,
        badgeText: "Query Resolved",
        badgeColor: "#059669",
        badgeBg: "#d1fae5",
        previewText: `Your support ticket on ${getSiteName()} has been resolved.`,
        content
    });
}

/**
 * 7. Shop Partner Welcome & Credentials Template
 */
function welcomeShopTemplate({ ownerName, shopName, email, plainPassword }) {
    const content = `
        <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #0f172a;">Welcome to the Partner Network!</h2>
        <p style="margin: 0 0 16px 0; color: #475569;">
            Hello <strong>${ownerName || "Partner"}</strong>,
        </p>
        <p style="margin: 0 0 24px 0; color: #475569;">
            Your shop "<strong>${shopName}</strong>" has been officially registered on <strong>${getSiteName()}</strong>. You can now manage your inventory, orders, and sales through your partner dashboard.
        </p>

        <!-- Credentials Card -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 24px;">
            <tr>
                <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; font-weight: 600; font-size: 13px; color: #475569; width: 30%;">
                    Login Email
                </td>
                <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-weight: 600; font-size: 14px;">
                    ${email}
                </td>
            </tr>
            <tr>
                <td style="padding: 14px 18px; font-weight: 600; font-size: 13px; color: #475569;">
                    Temporary Password
                </td>
                <td style="padding: 14px 18px; color: #4f46e5; font-weight: 700; font-size: 15px; font-family: 'SFMono-Regular', Consolas, monospace;">
                    ${plainPassword}
                </td>
            </tr>
        </table>

        <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 6px; padding: 12px 16px; margin-bottom: 24px;">
            <p style="margin: 0; font-size: 13px; color: #b45309; line-height: 1.5;">
                🔒 <strong>Security Tip:</strong> Please log in and change your temporary password as soon as possible.
            </p>
        </div>

        <!-- Action Button -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 16px;">
            <tr>
                <td align="center">
                    <a href="${getServerUrl()}/shop/login" target="_blank" style="display: inline-block; background-color: #4f46e5; color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600;">
                        Log In to Shop Dashboard
                    </a>
                </td>
            </tr>
        </table>
    `;

    return baseEmailTemplate({
        title: `Shop Account Ready - ${getSiteName()}`,
        badgeText: "Partner Onboarding",
        badgeColor: "#7c3aed",
        badgeBg: "#ede9fe",
        previewText: `Welcome ${shopName}! Your merchant account credentials inside.`,
        content
    });
}

module.exports = {
    baseEmailTemplate,
    passwordResetOtpTemplate,
    deliveryOtpTemplate,
    orderStatusTemplate,
    orderDeliveredTemplate,
    contactQueryReceivedTemplate,
    contactQueryResolvedTemplate,
    welcomeShopTemplate,
};
