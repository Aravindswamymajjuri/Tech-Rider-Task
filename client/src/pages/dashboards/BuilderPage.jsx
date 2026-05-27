import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { api } from "@/lib/api";
import { BuilderDashboard } from "@/components/dashboards/BuilderDashboard";
import { useSession } from "@/lib/session";
import { PageSkeleton } from "@/components/PageSkeleton";

export default function BuilderPage() {
  const { user, loading } = useSession();
  const [properties, setProperties] = useState(null);
  const [enquiries, setEnquiries] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (loading || !user) return;
    let alive = true;
    api.myProperties()
      .then(async (d) => {
        if (!alive) return;
        setProperties(d.items);
        // Pull notifications for activity feed; admins also see all enquiries
        // here — but builders should only see enquiries on their own
        // properties. Filter client-side after fetching the activity feed.
        try {
          const n = await api.notifications(15);
          if (alive) setNotifications(n.items);
        } catch { /* ignore */ }
        // Derive enquiries from the admin endpoint when the user is admin,
        // otherwise rely on notifications (builder doesn't have list access).
        try {
          if (user.role === "admin") {
            const e = await api.listEnquiries(20);
            if (alive) setEnquiries(e.items);
          } else {
            // For builders, build a lightweight enquiry list from notifications
            // tagged enquiry_received. The full inbox endpoint is admin-only.
            const ids = new Set(d.items.map((p) => p.id));
            const propIndex = new Map(d.items.map((p) => [p.id, p]));
            const inferred = (await api.notifications(50)).items
              .filter((n) => n.type === "enquiry_received" && n.link)
              .map((n) => {
                const propId = n.link.split("/").pop();
                const prop = ids.has(propId) ? propIndex.get(propId) : null;
                const m = n.body.match(/^([^(]+)\s+\(([^)]+)\)\s*[—-]?\s*(.*)$/);
                const name = (m && m[1].trim()) || n.title;
                const email = (m && m[2].trim()) || "";
                const message = (m && m[3].trim()) || n.body;
                return {
                  id: n.id,
                  name,
                  email,
                  phone: "",
                  message,
                  propertyId: propId,
                  propertyTitle: prop?.title,
                  createdAt: n.createdAt,
                  source: "property"
                };
              })
              .filter((e) => e.propertyId && ids.has(e.propertyId));
            if (alive) setEnquiries(inferred);
          }
        } catch { /* ignore */ }
      })
      .catch((e) => alive && setErr(e.message));
    return () => { alive = false; };
  }, [loading, user]);

  if (loading) return <PageSkeleton />;
  if (!user) return <Navigate to="/" replace />;
  if (user.role !== "builder" && user.role !== "admin") {
    return <Navigate to={user.role === "buyer" ? "/dashboard/buyer" : "/dashboard/nri"} replace />;
  }
  if (err) return <PageSkeleton message={err} />;
  if (!properties) return <PageSkeleton message="Loading your portfolio…" />;

  return (
    <BuilderDashboard
      user={{ name: user.name, role: user.role }}
      properties={properties}
      enquiries={enquiries}
      notifications={notifications}
    />
  );
}
