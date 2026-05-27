import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Building, Check, CheckCheck, Mail, Sparkles, UserPlus } from "lucide-react";
import { api } from "@/lib/api";
import { relativeTime } from "@/lib/utils";

const ICONS = {
  mail: Mail,
  building: Building,
  check: Check,
  sparkles: Sparkles,
  "user-plus": UserPlus,
  bell: Bell
};

export function NotificationsBell({ tone = "gold" }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef(null);

  async function load() {
    try {
      const d = await api.notifications(20);
      setItems(d.items);
      setUnread(d.unread);
    } catch {
      /* silent — user may not be logged in */
    }
  }

  useEffect(() => {
    load();
    const i = setInterval(load, 45_000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    if (!open) return;
    function down(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", down);
    return () => document.removeEventListener("mousedown", down);
  }, [open]);

  async function markAll() {
    try {
      await api.markAllNotificationsRead();
      setItems((cur) => cur.map((n) => ({ ...n, read: true })));
      setUnread(0);
    } catch {
      /* ignore */
    }
  }

  async function markOne(n) {
    if (n.read) return;
    setItems((cur) => cur.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
    setUnread((u) => Math.max(0, u - 1));
    try { await api.markNotificationRead(n.id); } catch { /* ignore */ }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative grid h-9 w-9 place-items-center rounded-full text-ink-600 hover:bg-ink-50"
        aria-label={`Notifications ${unread ? `(${unread} unread)` : ""}`}
        aria-expanded={open}
      >
        <Bell className="h-4 w-4" />
        {unread > 0 ? (
          <span className={`absolute -right-0.5 -top-0.5 grid h-4 min-w-[16px] place-items-center rounded-full px-1 text-[9px] font-bold text-white ${tone === "gold" ? "bg-gold-500" : "bg-sage-500"}`}>
            {unread > 9 ? "9+" : unread}
          </span>
        ) : (
          <span className={`absolute right-1 top-1 h-2 w-2 rounded-full ${tone === "gold" ? "bg-gold-500" : "bg-sage-500"} opacity-0`} />
        )}
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full z-40 mt-2 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-xl border border-ink-100 bg-white shadow-ring">
          <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
            <div>
              <div className="text-[13px] font-semibold text-ink-900">Notifications</div>
              <div className="text-[11.5px] text-ink-500">{unread} unread · {items.length} total</div>
            </div>
            <button type="button" onClick={markAll} disabled={!unread} className="inline-flex items-center gap-1 text-[12px] font-medium text-gold-700 hover:underline disabled:cursor-not-allowed disabled:opacity-50">
              <CheckCheck className="h-3.5 w-3.5" /> Mark all read
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {items.length === 0 && (
              <div className="px-4 py-8 text-center text-[13px] text-ink-500">
                You're all caught up.
              </div>
            )}
            {items.map((n) => {
              const Icon = ICONS[n.icon] || Bell;
              const content = (
                <div className={`flex gap-3 px-4 py-3 transition-colors hover:bg-ink-50 ${!n.read ? "bg-gold-50/40" : ""}`}>
                  <span className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full ${!n.read ? "bg-gold-100 text-gold-800" : "bg-ink-100 text-ink-700"}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className={`text-[13px] ${!n.read ? "font-semibold text-ink-900" : "text-ink-800"}`}>{n.title}</div>
                      {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gold-500" />}
                    </div>
                    {n.body && <div className="mt-0.5 line-clamp-2 text-[12px] text-ink-600">{n.body}</div>}
                    <div className="mt-1 text-[11px] text-ink-400">{relativeTime(n.createdAt)}</div>
                  </div>
                </div>
              );
              return n.link ? (
                <Link key={n.id} to={n.link} onClick={() => markOne(n)} className="block">
                  {content}
                </Link>
              ) : (
                <button key={n.id} type="button" onClick={() => markOne(n)} className="block w-full text-left">
                  {content}
                </button>
              );
            })}
          </div>

          <Link
            to="/dashboard/notifications"
            className="block border-t border-ink-100 px-4 py-2.5 text-center text-[12.5px] font-medium text-gold-700 hover:bg-ink-50"
          >
            See all notifications
          </Link>
        </div>
      )}
    </div>
  );
}
