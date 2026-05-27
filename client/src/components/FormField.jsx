import { cn } from "@/lib/utils";

export function Label({ children, required }) {
  return (
    <label className="field-label">
      {children}
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>
  );
}

export function TextField({ label, required, className, ...rest }) {
  return (
    <div className={cn("w-full", className)}>
      {label && <Label required={required}>{label}</Label>}
      <div className="field">
        <input required={required} {...rest} />
      </div>
    </div>
  );
}

export function SelectField({ label, children, required, className, ...rest }) {
  return (
    <div className={cn("w-full", className)}>
      {label && <Label required={required}>{label}</Label>}
      <div className="field">
        <select required={required} {...rest}>
          {children}
        </select>
      </div>
    </div>
  );
}

export function TextArea({ label, required, className, ...rest }) {
  return (
    <div className={cn("w-full", className)}>
      {label && <Label required={required}>{label}</Label>}
      <div className="field !items-start py-2.5">
        <textarea rows={3} required={required} {...rest} />
      </div>
    </div>
  );
}

export function UploadField({ label, hint }) {
  return (
    <div className="w-full">
      <Label>{label}</Label>
      <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-ink-200 bg-ink-50/60 px-3 py-4 text-[12px] text-ink-500 transition-colors hover:border-gold-400 hover:bg-gold-50/40">
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
          <path d="M12 16V4m0 0l-4 4m4-4l4 4M4 20h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-ink-700">Upload {label}</span>
        <span className="text-[11px] text-ink-400">{hint || "PNG / JPG / PDF, max 5 MB"}</span>
        <input type="file" className="hidden" />
      </label>
    </div>
  );
}
