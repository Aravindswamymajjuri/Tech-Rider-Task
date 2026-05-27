const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

export function apiUrl(path) {
  return `${API_BASE}${path}`;
}

async function request(path, init = {}) {
  const url = apiUrl(path);
  const res = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {})
    },
    ...init
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const message = (data && (data.error || data.message)) || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  // Auth
  login: (body) => request("/api/auth/login", { method: "POST", body: JSON.stringify(body) }),
  register: (body) => request("/api/auth/register", { method: "POST", body: JSON.stringify(body) }),
  logout: () => request("/api/auth/logout", { method: "POST" }),
  session: () => request("/api/auth/session"),

  // Server config (which OAuth providers are enabled)
  config: () => request("/api/config"),

  // Properties
  listProperties: (query) => {
    const qs = new URLSearchParams();
    if (query) for (const [k, v] of Object.entries(query)) if (v) qs.append(k, v);
    const path = `/api/properties${qs.toString() ? `?${qs.toString()}` : ""}`;
    return request(path);
  },
  getProperty: (id) => request(`/api/properties/${id}`),
  createProperty: (body) =>
    request("/api/properties", { method: "POST", body: JSON.stringify(body) }),
  stats: () => request("/api/properties/_meta/stats"),
  activity: (limit = 6) => request(`/api/properties/_meta/activity?limit=${limit}`),

  // Personal lists (buyer / nri / admin)
  me: () => request("/api/me"),
  updateProfile: (body) => request("/api/me", { method: "PATCH", body: JSON.stringify(body) }),
  updatePreferences: (body) => request("/api/me/preferences", { method: "PATCH", body: JSON.stringify(body) }),
  changePassword: (body) => request("/api/me/password", { method: "POST", body: JSON.stringify(body) }),
  myProperties: () => request("/api/me/properties"),
  favourites: () => request("/api/me/favourites"),
  addFavourite: (id) => request(`/api/me/favourites/${id}`, { method: "POST" }),
  removeFavourite: (id) => request(`/api/me/favourites/${id}`, { method: "DELETE" }),
  compareList: () => request("/api/me/compare"),
  addToCompare: (id) => request(`/api/me/compare/${id}`, { method: "POST" }),
  removeFromCompare: (id) => request(`/api/me/compare/${id}`, { method: "DELETE" }),
  clearCompare: () => request("/api/me/compare", { method: "DELETE" }),

  // Notifications
  notifications: (limit = 30) => request(`/api/me/notifications?limit=${limit}`),
  markNotificationRead: (id) => request(`/api/me/notifications/${id}/read`, { method: "PATCH" }),
  markAllNotificationsRead: () => request("/api/me/notifications/read-all", { method: "PATCH" }),
  deleteNotification: (id) => request(`/api/me/notifications/${id}`, { method: "DELETE" }),

  // Enquiries
  createEnquiry: (body) => request("/api/enquiries", { method: "POST", body: JSON.stringify(body) }),
  listEnquiries: (limit = 50) => request(`/api/enquiries?limit=${limit}`)
};
