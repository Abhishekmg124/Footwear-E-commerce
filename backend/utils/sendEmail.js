const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text, pdfBuffer, fileName) => {
const transporter = nodemailer.createTransport({
    service: "gmail",
    secure: true,
    port: 465,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
        attachments: [
            {
                filename: fileName,
                content: pdfBuffer,
                contentType: "application/pdf"
            }
        ]
    });
};

module.exports = sendEmail;