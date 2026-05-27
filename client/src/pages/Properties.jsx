import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";
import { PropertiesPage } from "@/components/PropertiesPage";
import { useSession } from "@/lib/session";
import { PageSkeleton } from "@/components/PageSkeleton";

export default function Properties() {
  const [params] = useSearchParams();
  const category = params.get("category") ?? undefined;
  const city = params.get("city") ?? undefined;
  const q = params.get("q") ?? undefined;
  const [items, setItems] = useState(null);
  const [err, setErr] = useState(null);
  const { user } = useSession();

  useEffect(() => {
    let alive = true;
    setItems(null);
    api
      .listProperties({ category, city, q })
      .then((d) => { if (alive) setItems(d.items); })
      .catch((e) => { if (alive) setErr(e.message); });
    return () => { alive = false; };
  }, [category, city, q]);

  if (err) return <PageSkeleton message={err} />;
  if (!items) return <PageSkeleton message="Loading properties…" />;

  return (
    <PropertiesPage
      items={items}
      sessionUser={user}
      filterCategory={category || "all"}
    />
  );
}
