import { Link } from "react-router-dom";
import { Brand } from "@/components/Brand";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-ink-50 text-ink-900">
      <header className="border-b border-ink-100 bg-white"><div className="container py-4"><Brand /></div></header>
      <main className="container flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <span className="font-display text-7xl text-gold-500">404</span>
        <h1 className="font-display text-2xl">This page took the wrong turn</h1>
        <p className="max-w-md text-[13.5px] text-ink-500">
          The property you're looking for has either been sold, moved, or never existed. Let's get you back to discovering homes you'll love.
        </p>
        <Link to="/properties" className="btn-gold">Browse Properties</Link>
      </main>
    </div>
  );
}
