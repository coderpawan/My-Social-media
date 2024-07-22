const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  const transporter = await nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "pawan.kumarsahu.civ20@itbhu.ac.in",
      pass: "Pawan@2002",
    },
  });
  const info = await transporter.sendMail({
    from: "pawan.kumarsahu.civ20@itbhu.ac.in",
    to: `${options.email}`,
    subject: "Reset your password",
    text: `this is your reset link. Please click it to reset your password ${options.data.reset_url}`, // plain text body
  });

  console.log("Message sent: %s", info.messageId);
};

module.exports = sendEmail;
