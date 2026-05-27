import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { api } from "@/lib/api";
import { NRITerminal } from "@/components/dashboards/NRITerminal";
import { useSession } from "@/lib/session";
import { PageSkeleton } from "@/components/PageSkeleton";

export default function NRIPage() {
  const { user, loading } = useSession();
  const [properties, setProperties] = useState(null);
  const [stats, setStats] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (loading || !user) return;
    let alive = true;
    Promise.all([api.listProperties(), api.stats()])
      .then(([p, s]) => {
        if (!alive) return;
        setProperties(p.items);
        setStats(s);
      })
      .catch((e) => alive && setErr(e.message));
    return () => { alive = false; };
  }, [loading, user]);

  if (loading) return <PageSkeleton message="Loading dashboard…" />;
  if (!user) return <Navigate to="/" replace />;
  if (user.role === "admin") return <Navigate to="/dashboard/admin" replace />;
  if (user.role === "builder") return <Navigate to="/dashboard/builder" replace />;
  if (user.role === "buyer") return <Navigate to="/dashboard/buyer" replace />;
  if (err) return <PageSkeleton message={err} />;
  if (!properties || !stats) return <PageSkeleton message="Loading dashboard…" />;

  return (
    <NRITerminal
      user={{ name: user.name, role: user.role }}
      properties={properties}
      stats={stats}
    />
  );
}
