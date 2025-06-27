const ContactUs = require("../models/ContactUs")
const mailer = require("../mailer/index")

async function createRecord(req, res) {
    try {
        let data = new ContactUs(req.body)
        await data.save()
        mailer.sendMail({
            from: process.env.MAIL_SENDER,
            to: data.email,
            subject: "Your Query Submission - " + process.env.SITE_NAME,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
                    <h2 style="color: #333;">Hello,</h2>
                    <p style="color: #555;">
                        Thank you for reaching out to us. Here are the details of your query:
                    </p>
                    <table style="border-collapse: collapse; width: 100%;">
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Subject:</strong></td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${data.subject}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Message:</strong></td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${data.message}</td>
                        </tr>
                    </table>
                    <p style="color: #555;">
                        We will get back to you as soon as possible. If you need immediate assistance, visit our
                        <a href="${process.env.SERVER}/contact" style="color: #007bff;">Contact Page</a>.
                    </p>
                    <p style="color: #555;">Best Regards, <br> Team ${process.env.SITE_NAME}</p>
                </div>
            `,
        }, (error) => {
            if (error) console.log(error);
        })

        res.send({
            result: "Done",
            data: data,
            message: "Thanks to Share Your Query With Us. Our Team Will Contact You Soon!!!"
        })
    } catch (error) {
        let errorMessage = {}
        error.errors?.name ? errorMessage.name = error.errors.name.message : null
        error.errors?.email ? errorMessage.email = error.errors.email.message : null
        error.errors?.phone ? errorMessage.phone = error.errors.phone.message : null
        error.errors?.subject ? errorMessage.subject = error.errors.subject.message : null
        error.errors?.message ? errorMessage.message = error.errors.message.message : null

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
        let data = await ContactUs.find().sort({ _id: -1 })
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
        let data = await ContactUs.findOne({ _id: req.params._id })
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
        let data = await ContactUs.findOne({ _id: req.params._id })
        if (data) {
            data.active = req.body.active ?? data.active
            await data.save()
            if (data.active === false) {
                mailer.sendMail({
                    from: process.env.MAIL_SENDER,
                    to: data.email,
                    subject: `Query Resolved - Team ${process.env.SITE_NAME}`,
                    html: `
                                    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
                                        <h2 style="color: #28a745;">Hello,</h2>
                                        <p style="color: #555;">
                                            We are happy to inform you that your query has been resolved. If you need any further assistance, feel free to contact us again.
                                        </p>
                                        <p style="color: #555;">
                                            <a href="${process.env.SERVER}/contact" style="color: #007bff;">Click here</a> to submit a new query if required.
                                        </p>
                                        <p style="color: #555;">Best Regards, <br> Team ${process.env.SITE_NAME}</p>
                                    </div>
                                `,
                }, (error) => {
                    if (error) console.log(error);
                });

            }

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

async function deleteRecord(req, res) {
    try {
        let data = await ContactUs.findOne({ _id: req.params._id })
        if (data && data.active === false) {
            await data.deleteOne()
            res.send({
                result: "Done",
                data: data
            })
        }
        else if (data?.active) {
            res.status(400).send({
                result: "Fail",
                reason: "Unable to Delete Record. Query Has Not Been Resolved"
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

module.exports = {
    createRecord: createRecord,
    getRecord: getRecord,
    getSingleRecord: getSingleRecord,
    updateRecord: updateRecord,
    deleteRecord: deleteRecord
}