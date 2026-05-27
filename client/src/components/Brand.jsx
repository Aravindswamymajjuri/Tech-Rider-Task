import { Link } from "react-router-dom";

export function Brand({ inverted = false }) {
  const fg = inverted ? "text-white" : "text-ink-900";
  const stroke = inverted ? "#E9DFC6" : "#0c1530";
  const accent = "#cea735";

  return (
    <Link to="/" className="inline-flex items-center gap-2.5 select-none">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-md">
        <svg viewBox="0 0 48 48" fill="none" className="h-10 w-10" aria-hidden>
          <path
            d="M8 40 L8 18 L14 13 L14 40 Z"
            stroke={stroke}
            strokeWidth="1.8"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M14 22 L24 14 L34 22 L34 40 L14 40 Z"
            stroke={stroke}
            strokeWidth="1.8"
            strokeLinejoin="round"
            fill="none"
          />
          <circle cx="24" cy="11" r="1.6" fill={accent} />
          <path d="M22 14 L26 14" stroke={accent} strokeWidth="1.4" />
        </svg>
      </span>
      <span className={`font-display text-[15px] leading-none tracking-[0.18em] ${fg}`}>
        <span className="font-semibold">1 CRORE</span>
        <br />
        <span className="text-[10px] tracking-[0.4em] text-ink-400">PROPERTY</span>
      </span>
    </Link>
  );
}
