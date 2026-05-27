export const getPayoutStatusLabel = (payoutStatus) => {
  if (!payoutStatus || payoutStatus === "held") {
    return { text: "Awaiting approval", className: "bg-amber-500/20 text-amber-300" };
  }
  switch (payoutStatus) {
    case "released":
      return { text: "Paid to seller", className: "bg-emerald-500/20 text-emerald-300" };
    case "failed":
      return { text: "Payout failed", className: "bg-red-500/20 text-red-300" };
    default:
      return { text: "Processing", className: "bg-zinc-500/20 text-zinc-300" };
  }
};
