import { MaturityLabel, MATURITY_COLOR, MATURITY_EMOJI } from "@/types";

export default function MaturityBadge({ label }: { label: string }) {
  const l = label as MaturityLabel;
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold capitalize"
      style={{ backgroundColor: MATURITY_COLOR[l] + "22", color: MATURITY_COLOR[l] }}
    >
      {MATURITY_EMOJI[l]} {label}
    </span>
  );
}
