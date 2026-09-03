const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const mailer = {
    resend,
    sendMail: async function (options, callback) {
        try {
            const sender =
                process.env.RESEND_FROM ||
                (process.env.MAIL_SENDER && process.env.SITE_NAME
                    ? `${process.env.SITE_NAME} <${process.env.MAIL_SENDER}>`
                    : process.env.MAIL_SENDER) ||
                "onboarding@resend.dev";

            const payload = {
                from: options.from || sender,
                to: Array.isArray(options.to) ? options.to : [options.to],
                subject: options.subject,
                html: options.html,
            };

            if (options.text) {
                payload.text = options.text;
            }

            const { data, error } = await resend.emails.send(payload);

            if (error) {
                if (callback) {
                    callback(new Error(error.message || JSON.stringify(error)));
                } else {
                    console.error("Resend email error:", error);
                }
                return { error };
            }

            if (callback) {
                callback(null, data);
            }
            return { data };
        } catch (err) {
            if (callback) {
                callback(err);
            } else {
                console.error("Resend email exception:", err);
            }
            return { error: err };
        }
    },
};

module.exports = mailer;