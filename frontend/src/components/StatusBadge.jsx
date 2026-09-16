const STYLES = {
  pending:   { bg: "bg-brick-soft", text: "text-brick", dot: "bg-brick", label: "Pending" },
  preparing: { bg: "bg-[#FCF1DA]", text: "text-gold-deep", dot: "bg-gold", label: "Preparing" },
  ready:     { bg: "bg-leaf-soft", text: "text-leaf", dot: "bg-leaf", label: "Ready" },
  served:    { bg: "bg-[#EFEAF1]", text: "text-plum", dot: "bg-plum", label: "Served" },
  paid:      { bg: "bg-[#EAF3EC]", text: "text-leaf", dot: "bg-leaf", label: "Paid" },
  cancelled: { bg: "bg-ivory-dim", text: "text-ink-soft", dot: "bg-ink-soft", label: "Cancelled" },
};

export default function StatusBadge({ status }) {
  const s = STYLES[status] || STYLES.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${s.bg} ${s.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}
