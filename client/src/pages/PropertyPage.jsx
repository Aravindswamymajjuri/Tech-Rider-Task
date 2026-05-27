import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "@/lib/api";
import { PropertyDetail } from "@/components/PropertyDetail";
import { useSession } from "@/lib/session";
import { PageSkeleton } from "@/components/PageSkeleton";

export default function PropertyPage() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [err, setErr] = useState(null);
  const { user } = useSession();

  useEffect(() => {
    if (!id) return;
    let alive = true;
    setProperty(null);
    api.getProperty(id).then(({ property }) => {
      if (!alive) return;
      setProperty(property);
      return api.listProperties({ category: property.category });
    }).then((res) => {
      if (alive && res) {
        setSimilar(res.items.filter((p) => p.id !== id).slice(0, 4));
      }
    }).catch((e) => { if (alive) setErr(e.message); });
    return () => { alive = false; };
  }, [id]);

  if (err) return <PageSkeleton message={err} />;
  if (!property) return <PageSkeleton message="Loading property…" />;

  return <PropertyDetail property={property} sessionUser={user} similar={similar} />;
}
