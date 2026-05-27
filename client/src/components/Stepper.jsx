import { Check } from "lucide-react";

export function Stepper({ steps, current, tone = "gold" }) {
  return (
    <ol className="flex w-full items-center justify-between gap-2">
      {steps.map((label, i) => {
        const isDone = i < current;
        const isActive = i === current;
        return (
          <li key={label} className="flex flex-1 items-center">
            <div className="flex items-center gap-2.5">
              <span
                className={[
                  "grid h-8 w-8 place-items-center rounded-full text-[12.5px] font-semibold transition-colors",
                  isDone
                    ? tone === "gold"
                      ? "bg-gold-500 text-ink-900"
                      : "bg-sage-500 text-white"
                    : isActive
                      ? tone === "gold"
                        ? "bg-gold-100 text-gold-800 ring-2 ring-gold-400"
                        : "bg-sage-100 text-sage-800 ring-2 ring-sage-400"
                      : "bg-ink-100 text-ink-500"
                ].join(" ")}
              >
                {isDone ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <span
                className={[
                  "whitespace-nowrap text-[12.5px] font-medium",
                  isActive ? "text-ink-900" : isDone ? "text-ink-700" : "text-ink-400"
                ].join(" ")}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="mx-3 h-px flex-1 bg-gradient-to-r from-ink-200 to-ink-100" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
