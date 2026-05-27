# 1 Crore Property — MERN Stack

A full MERN (MongoDB + Express + React + Node.js) implementation of the 1 Crore
Property platform. Three customer portals (Builder / Buyer / NRI) plus a
separate Admin role, JWT-cookie auth, REST API, and a Vite + React + Tailwind
front-end that mirrors the original design exactly.

```
task/
├── server/   # Express + Mongoose API (port 4000)
└── client/   # Vite + React + React Router (port 5173)
```

## Prerequisites

- Node.js ≥ 18
- npm ≥ 9
- MongoDB is **optional**. If `MONGODB_URI` isn't set, the server boots an
  in-process `mongodb-memory-server` (downloads a MongoDB binary on first run,
  then caches it under `server/.mongo-binaries/`).

## Quick start

In two terminals (server first so the in-memory DB is ready before the client
opens):

```bash
# Terminal 1 — API
cd server
cp .env.example .env       # optional, but recommended (set JWT_SECRET)
npm install
npm run dev                # nodemon, watches src/

# Terminal 2 — UI
cd client
npm install
npm run dev                # Vite, http://localhost:5173
```

Open <http://localhost:5173>.

> Vite proxies every request beginning with `/api` to `http://localhost:4000`,
> so the front-end always talks to a same-origin URL and HTTP-only cookies
> work out of the box.

## Demo credentials

The seed runs automatically on first boot. All passwords share the format
`<role>@123`:

| Role    | Email               | Password      | Lands on              |
| ------- | ------------------- | ------------- | --------------------- |
| Admin   | admin@1crore.in     | `admin@123`   | `/dashboard/admin`    |
| Builder | builder@1crore.in   | `builder@123` | `/dashboard/builder`  |
| Buyer   | buyer@1crore.in     | `buyer@123`   | `/dashboard/buyer`    |
| NRI     | nri@1crore.in       | `nri@123`     | `/dashboard/nri`      |

**Admin vs Builder are separate dashboards.** Admin is the platform-wide
control plane (all listings, all users, all enquiries, all activity).
Builder/Developer is the seller cockpit (their own listings, their leads, their
analytics, their CRM).

### Admin login

The login card has three portal cards (Builder, Buyer, NRI). The admin user can
sign in through **any** of them — the backend bypasses the portal check for
admins and routes you to `/dashboard/admin`. There's also a one-click
"Fill admin credentials" link directly under the demo-credentials button.

## Environment variables (server)

| Variable        | Default                         | Notes                                          |
| --------------- | ------------------------------- | ---------------------------------------------- |
| `PORT`          | `4000`                          | API port                                       |
| `CLIENT_ORIGIN` | `http://localhost:5173`         | Allowed CORS origin (with credentials)         |
| `JWT_SECRET`    | `dev-secret-change-me`          | **Set this in production**                     |
| `MONGODB_URI`   | _(unset → in-memory MongoDB)_   | e.g. `mongodb://localhost:27017/onecrore`      |
| `NODE_ENV`      | _(unset)_                       | Set to `production` for `secure` cookies       |

## API reference

All API endpoints are mounted under `/api`. Auth is session-cookie based
(`1crore_session`, JWT, HTTP-only, 7-day expiry).

### Auth

| Method | Path                                | Description                                          |
| ------ | ----------------------------------- | ---------------------------------------------------- |
| POST   | `/api/auth/login`                   | `{ email, password, role? }` — sets cookie           |
| POST   | `/api/auth/register`                | `{ role, name, email, password, ... }`               |
| POST   | `/api/auth/logout`                  | Clears the session cookie                            |
| GET    | `/api/auth/logout`                  | Same as POST, plus redirects to home                 |
| GET    | `/api/auth/session`                 | Always 200; returns `null` if not signed in          |
| GET    | `/api/auth/google`                  | OAuth2 redirect to Google (503 + setup page if unset)|
| GET    | `/api/auth/google/callback`         | Code → token → user → session cookie → SPA redirect  |
| GET    | `/api/auth/microsoft[/callback]`    | Same for Microsoft Entra                             |
| GET    | `/api/config`                       | Returns which OAuth providers are enabled            |

### Properties

| Method | Path                                  | Description                                                |
| ------ | ------------------------------------- | ---------------------------------------------------------- |
| GET    | `/api/properties`                     | Query: `category, city, q, builderId, min, max`            |
| GET    | `/api/properties/:id`                 | Single property                                            |
| POST   | `/api/properties`                     | Builder/admin only — create a listing                      |
| GET    | `/api/properties/_meta/stats`         | Aggregated stats for dashboards                            |
| GET    | `/api/properties/_meta/activity?limit`| Activity feed (latest listings + signups)                  |

### Wishlist & compare (`buyer` / `nri` / `admin`)

| Method | Path                              | Description                              |
| ------ | --------------------------------- | ---------------------------------------- |
| GET    | `/api/me`                         | Session user + favourite / compare ids   |
| GET    | `/api/me/favourites`              | Wishlisted properties (hydrated)         |
| POST   | `/api/me/favourites/:propertyId`  | Add to wishlist                          |
| DELETE | `/api/me/favourites/:propertyId`  | Remove from wishlist                     |
| GET    | `/api/me/compare`                 | Compare-list properties (max 4)          |
| POST   | `/api/me/compare/:propertyId`     | Add to compare (409 if list is full)     |
| DELETE | `/api/me/compare/:propertyId`     | Remove from compare                      |
| DELETE | `/api/me/compare`                 | Clear the compare list                   |

### Enquiries

| Method | Path                  | Description                                              |
| ------ | --------------------- | -------------------------------------------------------- |
| POST   | `/api/enquiries`      | Anyone — contact form, property page, brochure request   |
| GET    | `/api/enquiries`      | Admin only — inbox of every submission                   |

## Enabling Google / Microsoft sign-in

The "Sign in with Google" / "Sign in with Microsoft" buttons on the login card
always render. They become active once you configure the provider:

1. **Google** — create an OAuth 2.0 Client ID at
   <https://console.cloud.google.com/apis/credentials>.
   Add this redirect URI:
   ```
   <API_ORIGIN>/api/auth/google/callback   (eg. http://localhost:5173/api/auth/google/callback in dev)
   ```
2. **Microsoft** — register an app at <https://entra.microsoft.com> →
   *App registrations*. Add the same callback URI under *Authentication*.
3. Set `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` (and / or `MICROSOFT_*`)
   in `server/.env` and restart `npm run dev`. The login card buttons now
   redirect through the real OAuth flow; new users land as `buyer` accounts.

If you click a button before configuring it, the server returns a friendly HTML
page with the exact env vars you need to set.

## Scripts

### Server

| Command          | Effect                                                |
| ---------------- | ----------------------------------------------------- |
| `npm run dev`    | Boot with nodemon                                     |
| `npm start`      | Plain `node src/index.js`                             |
| `npm run seed`   | Drop & re-seed the DB with demo users and properties  |

### Client

| Command          | Effect                                  |
| ---------------- | --------------------------------------- |
| `npm run dev`    | Vite dev server on `:5173`              |
| `npm run build`  | `vite build` → `client/dist/`           |
| `npm run preview`| Static preview of the built bundle      |

## Routes

| Front-end (`client`)                  | Notes                                              |
| ------------------------------------- | -------------------------------------------------- |
| `/`                                   | Hero + LoginCard (with real Google/Microsoft SSO)  |
| `/forgot-password`                    | Password reset request                             |
| `/register/builder \| buyer \| nri`   | Role-specific registration                         |
| `/about` `/resources` `/contact`      | Public marketing pages (sticky SiteHeader)         |
| `/properties`                         | Listings grid with filters                         |
| `/properties/:id`                     | Property detail page + working enquiry form        |
| `/dashboard/admin`                    | Platform admin — every listing, user, enquiry      |
| `/dashboard/builder`                  | Builder/Developer cockpit — my listings, my leads  |
| `/dashboard/buyer`                    | Buyer dashboard (Wish List · Compare · Saved · Views) |
| `/dashboard/nri`                      | NRI Terminal                                       |
| `/dashboard/settings`                 | Profile · Notifications · Security · Verification  |
| `/dashboard/notifications`            | Inbox with filters + mark-all-read                 |
| `/dashboard/wishlist`                 | Saved properties (buyer / NRI / admin)             |
| `/dashboard/compare`                  | Side-by-side comparison (max 4)                    |
| `/dashboard/properties/new`           | "Add Property" wizard (builder/admin)              |
| `/dashboard/properties/:id`           | Per-property metrics dashboard                     |
| `/legal/privacy`, `/legal/terms`      | Legal pages                                        |

Legacy URLs `/dashboard/buyer/property/{new,:id}` redirect to the new
role-neutral `/dashboard/properties/{new,:id}` paths.

## Tech stack

| Layer    | Library / Tool                                                                          |
| -------- | --------------------------------------------------------------------------------------- |
| Database | MongoDB (`mongoose` ODM, in-memory fallback via `mongodb-memory-server`)                |
| API      | Express 4, `cors`, `cookie-parser`, `morgan`, `bcryptjs`, `jsonwebtoken`                |
| Front    | React 18 (JavaScript, no TypeScript), React Router 6, Vite 5, Tailwind CSS 3, lucide-react |

## Project structure

```
server/
└── src/
    ├── index.js              # express bootstrap
    ├── db.js                 # mongoose + in-memory fallback
    ├── seed.js               # demo users + properties
    ├── models/
    │   ├── User.js
    │   └── Property.js
    ├── middleware/
    │   └── auth.js           # JWT cookie helpers + requireAuth/requireRole
    └── routes/
        ├── auth.js
        └── properties.js

client/
├── index.html                # Inter + Playfair Display preloaded
├── vite.config.js            # @/* alias + /api proxy
├── tailwind.config.js        # design tokens (ink / gold / sage / violet)
├── jsconfig.json             # editor IntelliSense for @/* alias
└── src/
    ├── main.jsx              # React Router + SessionProvider
    ├── App.jsx               # route table (incl. legacy URL redirects)
    ├── index.css             # tailwind + design tokens
    ├── lib/
    │   ├── api.js            # fetch wrapper
    │   ├── session.jsx       # session context (GET /api/auth/session)
    │   └── utils.js          # cn, formatINR, initials, dashboardPathFor…
    ├── components/           # all .jsx, ported 1:1 from the original UI
    │   ├── dashboards/{AdminDashboard,BuyerDashboard,NRITerminal,PropertyDashboard}.jsx
    │   ├── AddPropertyForm.jsx, AuthLayout.jsx, Brand.jsx, Footer.jsx,
    │   ├── FormField.jsx, LoginCard.jsx, PropertyCard.jsx,
    │   ├── PropertiesPage.jsx, PropertyDetail.jsx,
    │   ├── BuilderRegister.jsx, BuyerRegister.jsx, NRIRegister.jsx,
    │   └── DashboardShell.jsx, Sparkline.jsx, Stepper.jsx, PageSkeleton.jsx
    └── pages/                # React Router route components
```

## Going to production

1. Provision a real MongoDB (Atlas or self-hosted) and set `MONGODB_URI`.
2. Set a strong `JWT_SECRET` and `NODE_ENV=production` (enables `secure` cookies).
3. Build the client (`npm run build` in `client/`).
4. Serve `client/dist/` from any static host (or have Express serve it).
   Point `CLIENT_ORIGIN` at the public URL.
5. Reverse-proxy `/api/*` to the Express server.
