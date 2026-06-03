import { requestOrderRefund, processRefundAsAdmin } from "../services/refundService.js";

export const buyerRequestRefund = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    const result = await requestOrderRefund(orderId, req.userId, reason);

    if (!result.ok) {
      return res.status(400).json({ message: result.error });
    }

    return res.status(200).json({
      message: "Refund request submitted. Our team will review it.",
      order: result.order,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error." });
  }
};

export const adminProcessRefund = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { action, note } = req.body;

    if (!action) {
      return res.status(400).json({ message: "action is required (approve|reject)" });
    }

    const result = await processRefundAsAdmin(orderId, { action, note });

    if (!result.ok) {
      return res.status(400).json({ message: result.error });
    }

    return res.status(200).json({
      message: `Refund ${action === "approve" ? "approved" : "rejected"}.`,
      order: result.order,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error." });
  }
};
