import nodemailer from 'nodemailer';
const EMAIL_PASS = process.env.EMAIL_PASS as string;
const EMAIL_USER = process.env.EMAIL_USER as string;

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
    },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
    const mailOptions = {
        from: `Mero app <${EMAIL_USER}>`,
        to,
        subject,
        html,
    };
    await transporter.sendMail(mailOptions);
}