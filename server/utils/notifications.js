import prisma from "../prisma/client.js";
import { sendMail } from "./mailer.js";

const appName = () => process.env.PAYPAL_BRAND_NAME || "ffiver";
const appUrl = () =>
  (process.env.PUBLIC_URL || "http://localhost:3000").split(",")[0].trim();

async function userWantsNotification(userId, type) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      notifyOrderEmails: true,
      notifyMessageEmails: true,
    },
  });
  if (!user) return false;
  if (type === "order") return user.notifyOrderEmails !== false;
  if (type === "message") return user.notifyMessageEmails !== false;
  return true;
}

export async function notifyOrderPaid(order) {
  const sellerId = order.gig?.createdBy?.id;
  const sellerEmail = order.gig?.createdBy?.email;
  if (!sellerEmail || !sellerId) return;
  if (!(await userWantsNotification(sellerId, "order"))) return;

  const buyerName =
    order.buyer?.fullName || order.buyer?.username || "A buyer";
  const gigTitle = order.gig?.title || "your gig";
  const ordersUrl = `${appUrl()}/seller/orders`;

  await sendMail({
    to: sellerEmail,
    subject: `New order on ${appName()}: ${gigTitle}`,
    text: `${buyerName} paid for "${gigTitle}". Funds are held until they approve delivery.\n\nView orders: ${ordersUrl}`,
    html: `<p><strong>${buyerName}</strong> paid for <strong>${gigTitle}</strong>.</p>
           <p>Payment is held until the buyer approves delivery.</p>
           <p><a href="${ordersUrl}">View your orders</a></p>`,
  });
}

export async function notifyPayoutReleased(order, sellerEmail) {
  if (!sellerEmail) return;
  const sellerId = order.gig?.createdBy?.id;
  if (sellerId && !(await userWantsNotification(sellerId, "order"))) return;

  const gigTitle = order.gig?.title || "your order";
  const amount = order.sellerEarningsAmount ?? order.price;

  await sendMail({
    to: sellerEmail,
    subject: `Payout sent — ${appName()}`,
    text: `Your earnings of $${Number(amount).toFixed(2)} for "${gigTitle}" were sent to your PayPal account.`,
    html: `<p>Your earnings of <strong>$${Number(amount).toFixed(2)}</strong> for <strong>${gigTitle}</strong> were sent to your PayPal account.</p>`,
  });
}

export async function notifyNewMessage({ receiverId, to, fromName, orderId, preview }) {
  if (!to || !receiverId) return;
  if (!(await userWantsNotification(receiverId, "message"))) return;

  const url = `${appUrl()}/seller/orders/messages/${orderId}`;

  await sendMail({
    to,
    subject: `New message on ${appName()}`,
    text: `${fromName} sent a message about an order:\n\n"${preview}"\n\nReply: ${url}`,
    html: `<p><strong>${fromName}</strong> sent a message:</p>
           <p>${preview}</p>
           <p><a href="${url}">Open conversation</a></p>`,
  });
}

export async function notifyRefundUpdate({ to, subject, body }) {
  if (!to) return;
  await sendMail({ to, subject, text: body, html: `<p>${body}</p>` });
}
