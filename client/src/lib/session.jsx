import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "./api";

const Ctx = createContext(null);

const FEATURE_ROLES = new Set(["buyer", "nri", "admin"]);

export function SessionProvider({ children }) {
  const [user, setUser] = useState(null);
  const [favourites, setFavourites] = useState([]);
  const [compareList, setCompareList] = useState([]);
  const [loading, setLoading] = useState(true);

  const hasLists = user && FEATURE_ROLES.has(user.role);

  const refresh = useCallback(async () => {
    try {
      const { user } = await api.session();
      setUser(user);
      if (user && FEATURE_ROLES.has(user.role)) {
        try {
          const me = await api.me();
          setFavourites(me.user.favourites || []);
          setCompareList(me.user.compareList || []);
        } catch {
          setFavourites([]);
          setCompareList([]);
        }
      } else {
        setFavourites([]);
        setCompareList([]);
      }
    } catch {
      setUser(null);
      setFavourites([]);
      setCompareList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggleFavourite = useCallback(
    async (propertyId) => {
      if (!hasLists) {
        window.location.assign("/");
        return;
      }
      const isOn = favourites.includes(propertyId);
      // Optimistic update.
      setFavourites((cur) =>
        isOn ? cur.filter((x) => x !== propertyId) : [...cur, propertyId]
      );
      try {
        const res = isOn
          ? await api.removeFavourite(propertyId)
          : await api.addFavourite(propertyId);
        setFavourites(res.favourites || []);
      } catch (err) {
        // Roll back on failure.
        setFavourites((cur) =>
          isOn ? [...cur, propertyId] : cur.filter((x) => x !== propertyId)
        );
        throw err;
      }
    },
    [favourites, hasLists]
  );

  const toggleCompare = useCallback(
    async (propertyId) => {
      if (!hasLists) {
        window.location.assign("/");
        return;
      }
      const isOn = compareList.includes(propertyId);
      setCompareList((cur) =>
        isOn ? cur.filter((x) => x !== propertyId) : [...cur, propertyId]
      );
      try {
        const res = isOn
          ? await api.removeFromCompare(propertyId)
          : await api.addToCompare(propertyId);
        setCompareList(res.compareList || []);
      } catch (err) {
        setCompareList((cur) =>
          isOn ? [...cur, propertyId] : cur.filter((x) => x !== propertyId)
        );
        throw err;
      }
    },
    [compareList, hasLists]
  );

  return (
    <Ctx.Provider
      value={{
        user,
        loading,
        favourites,
        compareList,
        refresh,
        setUser,
        toggleFavourite,
        toggleCompare,
        hasLists
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useSession() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useSession must be used inside SessionProvider");
  return v;
}
