import type { CSSProperties } from "react";

type BrandMarkProps = {
  compact?: boolean;
  className?: string;
  style?: CSSProperties;
};

export function BrandMark({ compact = false, className = "", style }: BrandMarkProps) {
  return (
    <span
      aria-label="Snooker Club"
      className={`brand-mark ${compact ? "brand-mark--compact" : ""} ${className}`.trim()}
      style={style}
    >
      <span aria-hidden="true">SN</span>
      <span className="brand-mark__balls" aria-hidden="true">
        <i data-brand-ball="true" />
        <i data-brand-ball="true" />
      </span>
      <span aria-hidden="true">KER</span>
      {!compact && <small aria-hidden="true">CLUB</small>}
    </span>
  );
}
