const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  const transporter = await nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "pawan9749568594@gmail.com",
      pass: "Pawan@2002",
    },
  });
  console.log(options.email, options.data.reset_url);
  const info = await transporter.sendMail({
    from: "pawan9749568594@gmail.com",
    to: `${options.email}`,
    subject: "Reset your password",
    text: `this is your reset link. Please click it to reset your password ${options.data.reset_url}`, // plain text body
  });

  console.log("Message sent: %s", info.messageId);
};

module.exports = sendEmail;
