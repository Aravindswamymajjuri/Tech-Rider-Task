export function Sparkline({
  values,
  color = "#cea735",
  fill = "rgba(206,167,53,0.18)",
  height = 60,
  width = 220
}) {
  if (!values || !values.length) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = Math.max(1, max - min);
  const stepX = width / Math.max(1, values.length - 1);
  const points = values
    .map((v, i) => `${i * stepX},${height - ((v - min) / span) * (height - 10) - 5}`)
    .join(" ");
  const area = `M0,${height} L${points} L${width},${height} Z`;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="block w-full">
      <path d={area} fill={fill} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function BarChart({ values, labels, color = "#cea735", height = 160 }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex items-end gap-1.5" style={{ height }}>
      {values.map((v, i) => {
        const h = (v / max) * (height - 24);
        return (
          <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
            <div
              className="w-full rounded-md bar-grow"
              style={{ height: `${h}px`, backgroundColor: color, opacity: 0.85 }}
              title={`${v}`}
            />
            {labels && <div className="text-[10.5px] text-ink-400">{labels[i]}</div>}
          </div>
        );
      })}
    </div>
  );
}

export function Donut({ segments, size = 140, thickness = 18, centerLabel }) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const radius = (size - thickness) / 2;
  const circ = 2 * Math.PI * radius;
  let offset = 0;
  return (
    <div className="flex items-center gap-5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} stroke="#eef0f6" strokeWidth={thickness} fill="none" />
          {segments.map((s) => {
            const len = (s.value / total) * circ;
            const dasharray = `${len} ${circ - len}`;
            const el = (
              <circle
                key={s.label}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={s.color}
                strokeWidth={thickness}
                fill="none"
                strokeDasharray={dasharray}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
              />
            );
            offset += len;
            return el;
          })}
        </svg>
        {centerLabel && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="font-display text-2xl">{centerLabel.value}</div>
            <div className="text-[11px] text-ink-500">{centerLabel.label}</div>
          </div>
        )}
      </div>
      <ul className="space-y-1.5 text-[12.5px]">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: s.color }} />
            <span className="text-ink-700">{s.label}</span>
            <span className="ml-2 font-semibold text-ink-900">
              {Math.round((s.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
