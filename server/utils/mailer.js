import nodemailer from "nodemailer";

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM,
} = process.env;

let transporter;

if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS && SMTP_FROM) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
} else {
  console.warn(
    "SMTP environment variables are not fully configured. Emails will not be sent."
  );
}

export const sendMail = async ({ to, subject, text, html }) => {
  if (!transporter) {
    console.warn("sendMail called but transporter is not configured.");
    return;
  }

  await transporter.sendMail({
    from: SMTP_FROM,
    to,
    subject,
    text,
    html,
  });
};

