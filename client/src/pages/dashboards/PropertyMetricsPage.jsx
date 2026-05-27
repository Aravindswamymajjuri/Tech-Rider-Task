import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { api } from "@/lib/api";
import { PropertyDashboard } from "@/components/dashboards/PropertyDashboard";
import { useSession } from "@/lib/session";
import { PageSkeleton } from "@/components/PageSkeleton";

export default function PropertyMetricsPage() {
  const { id } = useParams();
  const { user, loading } = useSession();
  const [property, setProperty] = useState(null);
  const [leads, setLeads] = useState([]);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (!id) return;
    let alive = true;
    api.getProperty(id).then((d) => {
      if (alive) setProperty(d.property);
    }).catch((e) => alive && setErr(e.message));

    api.activity(8).then((d) => {
      if (!alive) return;
      const sources = ["Search", "Referral", "Brochure", "NRI Terminal"];
      const statuses = ["New", "Contacted", "Visited", "Negotiating", "New"];
      setLeads(
        d.items
          .filter((a) => !a.what.includes("listed"))
          .slice(0, 5)
          .map((a, i) => ({
            name: a.who,
            email: `${a.who.toLowerCase().replace(/\s+/g, ".")}@example.com`,
            source: sources[i % sources.length],
            status: statuses[i % statuses.length]
          }))
      );
    }).catch(() => { /* leads optional */ });
    return () => { alive = false; };
  }, [id]);

  if (loading) return <PageSkeleton />;
  if (!user) return <Navigate to="/" replace />;
  // Per-property metrics are a seller view — restrict to builder/admin.
  if (user.role !== "builder" && user.role !== "admin") {
    return <Navigate to={user.role === "buyer" ? "/dashboard/buyer" : "/dashboard/nri"} replace />;
  }
  if (err) return <PageSkeleton message={err} />;
  if (!property) return <PageSkeleton message="Loading property…" />;

  return (
    <PropertyDashboard
      user={{ name: user.name, role: user.role }}
      property={property}
      leads={leads}
    />
  );
}
