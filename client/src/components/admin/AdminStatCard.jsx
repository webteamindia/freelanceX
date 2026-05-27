const AdminStatCard = ({
  label,
  value,
  sub,
  icon: Icon,
  accent = "text-primary",
  alert,
  onClick,
}) => (
  <div
    role={onClick ? "button" : undefined}
    tabIndex={onClick ? 0 : undefined}
    onClick={onClick}
    onKeyDown={(e) => onClick && e.key === "Enter" && onClick()}
    className={`relative overflow-hidden rounded-2xl border p-5 transition-all duration-200 ${
      alert
        ? "border-amber-500/40 bg-amber-500/5"
        : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700"
    } ${onClick ? "cursor-pointer hover:-translate-y-0.5" : ""}`}
  >
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          {label}
        </p>
        <p className={`mt-2 text-2xl font-outfit font-bold ${accent}`}>{value}</p>
        {sub && <p className="mt-1 text-xs text-zinc-500">{sub}</p>}
      </div>
      {Icon && (
        <div className={`shrink-0 rounded-xl bg-zinc-800/80 p-2.5 ${accent}`}>
          <Icon className="text-xl" />
        </div>
      )}
    </div>
  </div>
);

export default AdminStatCard;
