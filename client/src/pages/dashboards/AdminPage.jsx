import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { api } from "@/lib/api";
import { AdminDashboard } from "@/components/dashboards/AdminDashboard";
import { useSession } from "@/lib/session";
import { PageSkeleton } from "@/components/PageSkeleton";

export default function AdminPage() {
  const { user, loading } = useSession();
  const [properties, setProperties] = useState(null);
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (loading || !user) return;
    let alive = true;
    Promise.all([api.listProperties(), api.stats(), api.activity(6)])
      .then(([p, s, a]) => {
        if (!alive) return;
        setProperties(p.items);
        setStats(s);
        setActivities(a.items);
      })
      .catch((e) => alive && setErr(e.message));
    if (user.role === "admin") {
      api.listEnquiries(10).then((d) => alive && setEnquiries(d.items)).catch(() => {});
    }
    return () => { alive = false; };
  }, [loading, user]);

  if (loading) return <PageSkeleton message="Loading dashboard…" />;
  if (!user) return <Navigate to="/" replace />;
  if (user.role === "builder") return <Navigate to="/dashboard/builder" replace />;
  if (user.role !== "admin") {
    return <Navigate to={user.role === "buyer" ? "/dashboard/buyer" : "/dashboard/nri"} replace />;
  }
  if (err) return <PageSkeleton message={err} />;
  if (!properties || !stats) return <PageSkeleton message="Loading dashboard…" />;

  return (
    <AdminDashboard
      user={{ name: user.name, role: user.role }}
      properties={properties}
      stats={stats}
      activities={activities}
      enquiries={enquiries}
    />
  );
}
