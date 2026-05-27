export const formatMoney = (n) =>
  `$${Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const shortId = (id) => (id ? id.slice(-8).toUpperCase() : "—");

export const filterByQuery = (items, query, keys) => {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter((item) =>
    keys.some((key) => {
      const val = key.split(".").reduce((o, k) => o?.[k], item);
      return String(val ?? "")
        .toLowerCase()
        .includes(q);
    })
  );
};

export const PAYOUT_BADGE = {
  held: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  released: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  failed: "bg-red-500/15 text-red-300 border-red-500/30",
};
