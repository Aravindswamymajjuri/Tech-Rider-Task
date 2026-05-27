import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Bell, Building, Check, CheckCheck, Mail, Sparkles, Trash2, UserPlus } from "lucide-react";
import { DashboardShell, NavLink } from "@/components/DashboardShell";
import { PageSkeleton } from "@/components/PageSkeleton";
import { api } from "@/lib/api";
import { useSession } from "@/lib/session";
import { dashboardPathFor, relativeTime } from "@/lib/utils";

const ICONS = { mail: Mail, building: Building, check: Check, sparkles: Sparkles, "user-plus": UserPlus, bell: Bell };

export default function NotificationsPage() {
  const { user, loading } = useSession();
  const [items, setItems] = useState(null);
  const [unread, setUnread] = useState(0);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState("all");

  async function load() {
    const d = await api.notifications(100);
    setItems(d.items);
    setUnread(d.unread);
  }

  useEffect(() => {
    if (loading || !user) return;
    load().catch(() => setItems([]));
  }, [loading, user]);

  async function markAll() {
    setBusy(true);
    try { await api.markAllNotificationsRead(); await load(); } finally { setBusy(false); }
  }

  async function markOne(n) {
    if (n.read) return;
    setItems((cur) => cur.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
    setUnread((u) => Math.max(0, u - 1));
    try { await api.markNotificationRead(n.id); } catch { /* ignore */ }
  }

  async function remove(n) {
    setItems((cur) => cur.filter((x) => x.id !== n.id));
    if (!n.read) setUnread((u) => Math.max(0, u - 1));
    try { await api.deleteNotification(n.id); } catch { /* ignore */ }
  }

  if (loading) return <PageSkeleton />;
  if (!user) return <Navigate to="/" replace />;
  const tone = user.role === "buyer" ? "sage" : "gold";

  const filtered = items?.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "read") return n.read;
    return true;
  });

  return (
    <DashboardShell
      user={{ name: user.name, role: user.role }}
      tone={tone}
      title="Notifications"
      subtitle="Real-time updates across your enquiries, listings and account."
      nav={
        <>
          <NavLink to={dashboardPathFor(user.role)}>Dashboard</NavLink>
          <NavLink to="/dashboard/notifications">Notifications</NavLink>
          <NavLink to="/dashboard/settings">Settings</NavLink>
        </>
      }
    >
      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 px-5 py-4">
          <div className="flex items-center gap-2">
            {["all", "unread", "read"].map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setFilter(k)}
                className={`rounded-full px-3 py-1 text-[12.5px] font-medium capitalize transition-colors ${filter === k ? "bg-ink-900 text-white" : "bg-ink-50 text-ink-700 hover:bg-ink-100"}`}
              >
                {k}{k === "unread" && unread > 0 ? ` (${unread})` : ""}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={markAll}
            disabled={busy || !unread}
            className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-gold-700 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCheck className="h-3.5 w-3.5" /> Mark all read
          </button>
        </div>

        {!items && <div className="p-8 text-center text-[13px] text-ink-500">Loading…</div>}

        {filtered && filtered.length === 0 && (
          <div className="p-12 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-ink-100 text-ink-500">
              <Bell className="h-5 w-5" />
            </span>
            <h3 className="mt-3 font-display text-lg">You're all caught up</h3>
            <p className="mt-1 text-[13px] text-ink-500">Nothing to show in this view.</p>
          </div>
        )}

        {filtered && filtered.length > 0 && (
          <ul className="divide-y divide-ink-100">
            {filtered.map((n) => {
              const Icon = ICONS[n.icon] || Bell;
              const inner = (
                <div className={`flex gap-4 px-5 py-4 transition-colors hover:bg-ink-50 ${!n.read ? "bg-gold-50/30" : ""}`}>
                  <span className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full ${!n.read ? "bg-gold-100 text-gold-800" : "bg-ink-100 text-ink-700"}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className={`text-[14px] ${!n.read ? "font-semibold text-ink-900" : "text-ink-800"}`}>{n.title}</div>
                      <span className="text-[11.5px] text-ink-400">{relativeTime(n.createdAt)}</span>
                    </div>
                    {n.body && <div className="mt-1 text-[12.5px] text-ink-600">{n.body}</div>}
                  </div>
                  <div className="flex shrink-0 items-start gap-1">
                    {!n.read && (
                      <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); markOne(n); }}
                        className="grid h-7 w-7 place-items-center rounded-md text-ink-500 hover:bg-ink-100 hover:text-ink-900"
                        title="Mark as read"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); remove(n); }}
                      className="grid h-7 w-7 place-items-center rounded-md text-ink-400 hover:bg-red-50 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
              return (
                <li key={n.id}>
                  {n.link ? (
                    <Link to={n.link} onClick={() => markOne(n)}>{inner}</Link>
                  ) : (
                    <button type="button" onClick={() => markOne(n)} className="block w-full text-left">{inner}</button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </DashboardShell>
  );
}
