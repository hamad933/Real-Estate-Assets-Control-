type PropertyVisualProps = {
  compact?: boolean;
  label?: string;
};

export function PropertyVisual({
  compact = false,
  label = "تصوير تمثيلي لعقار سكني"
}: PropertyVisualProps) {
  return (
    <svg
      className={compact ? "property-visual property-visual--compact" : "property-visual"}
      viewBox="0 0 900 520"
      role="img"
      aria-label={label}
    >
      <defs>
        <linearGradient id="sky" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#f7efe2" />
          <stop offset="58%" stopColor="#e7dfd2" />
          <stop offset="100%" stopColor="#c7d1ce" />
        </linearGradient>
        <linearGradient id="glass" x1="0" x2="1">
          <stop offset="0%" stopColor="#2e4652" />
          <stop offset="100%" stopColor="#54717b" />
        </linearGradient>
      </defs>
      <rect width="900" height="520" rx="30" fill="url(#sky)" />
      <circle cx="760" cy="92" r="46" fill="#f5c97c" opacity="0.72" />
      <path d="M0 390 C145 350 230 420 365 382 C495 346 620 404 900 350 V520 H0Z" fill="#8f9e83" opacity="0.55" />
      <path d="M0 424 C180 382 280 442 480 414 C640 392 764 420 900 392 V520 H0Z" fill="#6d7d68" opacity="0.46" />
      <rect x="205" y="160" width="462" height="246" rx="9" fill="#eee7dc" />
      <rect x="252" y="112" width="310" height="94" rx="7" fill="#f6f1e9" />
      <rect x="278" y="140" width="90" height="66" fill="url(#glass)" />
      <rect x="394" y="140" width="140" height="66" fill="url(#glass)" />
      <rect x="245" y="220" width="128" height="91" fill="url(#glass)" />
      <rect x="400" y="220" width="220" height="91" fill="url(#glass)" />
      <rect x="245" y="328" width="128" height="78" fill="#253b46" />
      <rect x="400" y="328" width="220" height="78" fill="url(#glass)" />
      <rect x="164" y="188" width="60" height="218" rx="6" fill="#d9c7b0" />
      <rect x="646" y="188" width="58" height="218" rx="6" fill="#d6c1a4" />
      <path d="M158 405 H716" stroke="#263e49" strokeWidth="8" opacity="0.72" />
      <g opacity="0.92">
        <rect x="102" y="287" width="8" height="128" rx="4" fill="#526454" />
        <circle cx="106" cy="272" r="38" fill="#75876f" />
        <circle cx="80" cy="295" r="29" fill="#657a62" />
        <rect x="760" y="302" width="8" height="116" rx="4" fill="#526454" />
        <circle cx="764" cy="284" r="34" fill="#7b8b73" />
      </g>
      <path d="M124 442 C305 417 536 428 812 410" stroke="#d8c3a1" strokeWidth="18" strokeLinecap="round" opacity="0.85" />
    </svg>
  );
}
