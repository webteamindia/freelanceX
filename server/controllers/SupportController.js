import prisma from "../prisma/client.js";
import { sendMail } from "../utils/mailer.js";

export const createSupportTicket = async (req, res, next) => {
  try {
    const { email, subject, message } = req.body;

    if (!email || !subject || !message) {
      return res
        .status(400)
        .json({ message: "Email, subject and message are required." });
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        email,
        subject,
        message,
      },
    });

    const supportEmail = process.env.SUPPORT_EMAIL || process.env.SMTP_FROM;

    if (supportEmail) {
      await sendMail({
        to: supportEmail,
        subject: `ffiver support: ${subject}`,
        text: `New support request from ${email}\n\n${message}\n\nTicket ID: ${ticket.id}`,
        html: `<p>New support request from <strong>${email}</strong></p>
               <p><strong>Subject:</strong> ${subject}</p>
               <p><strong>Message:</strong></p>
               <p>${message}</p>
               <p>Ticket ID: ${ticket.id}</p>`,
      });
    }

    return res
      .status(200)
      .json({ message: "Support request submitted successfully." });
  } catch (err) {
    next(err);
  }
};

