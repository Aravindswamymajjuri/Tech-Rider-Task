import { Link } from "react-router-dom";
import { Brand } from "./Brand";
import { Facebook, Instagram, Linkedin, Twitter, Phone, Mail, Globe } from "lucide-react";

export function Footer({ variant = "light" }) {
  const dark = variant === "dark";
  const socials = [
    { Icon: Facebook, label: "facebook", url: "https://facebook.com/" },
    { Icon: Instagram, label: "instagram", url: "https://instagram.com/" },
    { Icon: Linkedin, label: "linkedin", url: "https://linkedin.com/" },
    { Icon: Twitter, label: "twitter", url: "https://twitter.com/" }
  ];
  return (
    <footer
      className={
        dark
          ? "border-t border-white/10 bg-ink-950 text-ink-200"
          : "border-t border-ink-100 bg-white text-ink-700"
      }
    >
      <div className="container flex flex-col items-center justify-between gap-4 py-5 md:flex-row">
        <Brand inverted={dark} />
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px]">
          <span className="inline-flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5" /> +91 98765 43210
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5" /> info@1croreproperties.com
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5" /> www.1croreproperties.com
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-[12px] uppercase tracking-widest text-ink-400 md:inline">
            Follow Us
          </span>
          {socials.map(({ Icon, label, url }) => (
            <a
              key={label}
              href={url}
              target="_blank"
              rel="noreferrer"
              aria-label={label}
              className="text-current transition-opacity hover:opacity-70"
            >
              <Icon className="h-4 w-4" />
            </a>
          ))}
        </div>
      </div>
      <div
        className={
          dark
            ? "border-t border-white/5 py-3 text-center text-[11px] text-ink-400"
            : "border-t border-ink-100 py-3 text-center text-[11px] text-ink-500"
        }
      >
        © 2026 1 Crore Property. All rights reserved. ·
        <Link to="/legal/privacy" className="ml-2 hover:underline">Privacy Policy</Link>
        <span className="mx-1.5">·</span>
        <Link to="/legal/terms" className="hover:underline">Terms & Conditions</Link>
      </div>
    </footer>
  );
}
