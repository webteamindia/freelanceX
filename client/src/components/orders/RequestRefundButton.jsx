import axios from "axios";
import { useState } from "react";
import { useCookies } from "react-cookie";
import { toast } from "react-toastify";
import { requestRefundRoute } from "../../utils/constants";

const RequestRefundButton = ({ order, onUpdated }) => {
  const [cookies] = useCookies();
  const [loading, setLoading] = useState(false);

  if (!order?.isCompleted) return null;
  if (order.payoutStatus === "released") {
    return (
      <span className="text-xs text-zinc-500">Paid to seller — contact support</span>
    );
  }
  if (order.refundStatus && order.refundStatus !== "none" && order.refundStatus !== "rejected") {
    return (
      <span className="text-xs text-amber-400 capitalize">
        Refund: {order.refundStatus}
      </span>
    );
  }

  const handleRequest = async () => {
    const reason = window.prompt(
      "Why are you requesting a refund? (optional details)"
    );
    if (reason === null) return;

    try {
      setLoading(true);
      const { data } = await axios.post(
        requestRefundRoute(order.id),
        { reason: reason || "Buyer requested refund" },
        { headers: { Authorization: `Bearer ${cookies.jwt}` } }
      );
      toast.success(data.message || "Refund requested");
      onUpdated?.();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not request refund");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleRequest}
      disabled={loading}
      className="text-xs px-2.5 py-1 rounded-full border border-zinc-600 text-zinc-300 hover:bg-zinc-800 disabled:opacity-50"
    >
      {loading ? "Requesting…" : "Request refund"}
    </button>
  );
};

export default RequestRefundButton;
