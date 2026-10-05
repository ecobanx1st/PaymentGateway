const ejs = require("ejs");
const path = require("path");
const nodemailer = require("nodemailer");

/**
 * Sends an email by rendering an EJS template and sending it via Nodemailer.
 * @param {Object} options - email options
 * @param {string} options.to - recipient email address
 * @param {string} options.subject - email subject
 * @param {string} options.template - template name (e.g. "welcome", "otp", "forgotPassword", "verification")
 * @param {Object} [options.data] - data passed to the template
 */
const sendEmail = async ({ to, subject, template, data = {} }) => {
    const html = await ejs.renderFile(
        path.join(__dirname, "../../views", `${template}.ejs`),
        {
            ...data,
            email: to,
        }
    );

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_PORT === "465", // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USERNAME,
            pass: process.env.SMTP_PASSWORD,
        },
        tls: {
            rejectUnauthorized: false,
        },
    });

    await transporter.sendMail({
        from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_ADDRESS}>`,
        to,
        subject,
        html,
    });
};

module.exports = { sendEmail };
