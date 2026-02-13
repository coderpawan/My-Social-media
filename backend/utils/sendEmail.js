const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  const transporter = await nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,  // Use Gmail App Password, not regular password
    },
  });
  const info = await transporter.sendMail({
    from: process.env.SMTP_EMAIL,
    to: `${options.email}`,
    subject: "Reset your password",
    text: `this is your reset link. Please click it to reset your password ${options.data.reset_url}`, // plain text body
  });

  console.log("Message sent: %s", info.messageId);
};

module.exports = sendEmail;
