import { useNavigate, Link } from "react-router-dom";
import { BadgeCheck, Bed, Bookmark, Check, MapPin, Maximize2, ScanEye } from "lucide-react";
import { formatINR } from "@/lib/utils";
import { useSession } from "@/lib/session";

export function PropertyCard({ property, compact = false }) {
  const navigate = useNavigate();
  const { user, favourites, compareList, toggleFavourite, toggleCompare, hasLists } = useSession();
  const saved = favourites.includes(property.id);
  const compared = compareList.includes(property.id);

  async function onSave(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate("/?returnTo=" + encodeURIComponent(window.location.pathname));
      return;
    }
    if (!hasLists) {
      alert("Wishlist is available for buyers, NRIs and admins.");
      return;
    }
    try {
      await toggleFavourite(property.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not update wishlist");
    }
  }

  async function onCompare(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate("/?returnTo=" + encodeURIComponent(window.location.pathname));
      return;
    }
    if (!hasLists) {
      alert("Compare is available for buyers, NRIs and admins.");
      return;
    }
    try {
      await toggleCompare(property.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not update compare list");
    }
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-ink-100 bg-white shadow-soft transition-shadow hover:shadow-ring">
      <Link to={`/properties/${property.id}`} className="block">
        <div
          className="relative h-44 w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${property.imageUrl})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-ink-800">
            <BadgeCheck className="h-3 w-3 text-sage-700" /> Verified
          </div>
          <button
            type="button"
            onClick={onSave}
            className={`absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full transition-colors ${saved ? "bg-gold-500 text-white" : "bg-white/90 text-ink-700 hover:bg-white"}`}
            aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
            aria-pressed={saved}
          >
            <Bookmark className={`h-3.5 w-3.5 ${saved ? "fill-current" : ""}`} />
          </button>
          <div className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-ink-900/70 px-2 py-0.5 text-[11px] text-white">
            {property.bhk || property.category}
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-3.5">
        <Link to={`/properties/${property.id}`} className="block">
          <div className="flex items-center justify-between gap-2">
            <h4 className="line-clamp-1 text-[14px] font-semibold text-ink-900">{property.title}</h4>
            <span className="shrink-0 font-display text-[15px] text-ink-900">{formatINR(property.price)}</span>
          </div>
          <div className="mt-0.5 flex items-center gap-1 text-[12px] text-ink-500">
            <MapPin className="h-3 w-3 shrink-0" /> <span className="line-clamp-1">{property.location}</span>
          </div>
          {!compact && (
            <p className="mt-2 line-clamp-2 text-[12.5px] text-ink-600">{property.description}</p>
          )}
          <div className="mt-2.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[11.5px] text-ink-500">
            <span className="inline-flex items-center gap-1">
              <Maximize2 className="h-3 w-3" /> {property.areaSqft.toLocaleString("en-IN")} sqft
            </span>
            {property.bhk && (
              <span className="inline-flex items-center gap-1">
                <Bed className="h-3 w-3" /> {property.bhk}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <ScanEye className="h-3 w-3" /> {property.views.toLocaleString("en-IN")}
            </span>
          </div>
        </Link>
        <div className="mt-3 flex items-center gap-2">
          <Link
            to={`/properties/${property.id}`}
            className="btn-outline w-full justify-center !py-1.5 text-[12px] group-hover:border-ink-300"
          >
            View Details
          </Link>
          <button
            type="button"
            onClick={onCompare}
            className={`btn w-full justify-center !py-1.5 text-[12px] ${compared ? "bg-sage-700 text-white" : "btn-sage"}`}
            aria-pressed={compared}
          >
            {compared ? (
              <><Check className="h-3.5 w-3.5" /> In Compare</>
            ) : (
              "Add to Compare"
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
