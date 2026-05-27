import axios from "axios";
import { useState } from "react";
import { useCookies } from "react-cookie";
import { toast } from "react-toastify";
import { releasePayoutRoute } from "../../utils/constants";

const ReleasePayoutButton = ({ order, onReleased }) => {
  const [cookies] = useCookies();
  const [loading, setLoading] = useState(false);

  if (!order || order.payoutStatus === "released") {
    return null;
  }

  const status = order.payoutStatus || "held";
  if (status !== "held" && status !== "failed") {
    return null;
  }

  const handleRelease = async () => {
    const confirmed = window.confirm(
      "Release payment to the seller? This sends their earnings to their PayPal account and cannot be undone."
    );
    if (!confirmed) return;

    try {
      setLoading(true);
      const { data } = await axios.post(
        releasePayoutRoute(order.id),
        {},
        {
          headers: { Authorization: `Bearer ${cookies.jwt}` },
        }
      );
      toast.success(data.message || "Payment released to seller.");
      onReleased?.(data.order);
    } catch (err) {
      const msg =
        err.response?.data?.message || "Could not release payment. Try again or contact support.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (order.payoutStatus === "failed") {
    return (
      <button
        type="button"
        onClick={handleRelease}
        disabled={loading}
        className="text-xs px-3 py-1 rounded-full bg-red-500/20 text-red-300 hover:bg-red-500/30 disabled:opacity-50"
      >
        {loading ? "Retrying…" : "Retry payout"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleRelease}
      disabled={loading}
      className="text-xs px-3 py-1 rounded-full bg-primary/20 text-primary hover:bg-primary/30 disabled:opacity-50 font-medium"
    >
      {loading ? "Releasing…" : "Approve & pay seller"}
    </button>
  );
};

export default ReleasePayoutButton;
