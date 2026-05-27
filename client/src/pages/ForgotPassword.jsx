import { useState } from "react";
import { Link } from "react-router-dom";
import { Brand } from "@/components/Brand";
import { Footer } from "@/components/Footer";
import { ArrowLeft, Mail, ShieldCheck } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  function submit(e) {
    e.preventDefault();
    // Demo: no email transport configured. Show a deterministic confirmation
    // and prompt the user to use their demo credentials.
    setSent(true);
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-ink-950 text-white">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(140deg, rgba(7,13,34,.86) 0%, rgba(7,13,34,.6) 45%, rgba(7,13,34,.85) 100%), url('https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=2000&q=70')"
        }}
      />
      <header className="container py-5"><Brand inverted /></header>
      <main className="container grid place-items-center pb-16 pt-4">
        <div className="card w-full max-w-md bg-white/95 p-6 text-ink-900 shadow-ring backdrop-blur sm:p-8">
          <Link to="/" className="inline-flex items-center gap-1.5 text-[12.5px] text-ink-500 hover:text-ink-900">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to login
          </Link>
          <h1 className="mt-3 font-display text-2xl">Reset your password</h1>
          <p className="mt-1 text-[13px] text-ink-500">
            Enter the email address associated with your account and we'll send you a
            link to reset your password.
          </p>

          {sent ? (
            <div className="mt-5 rounded-lg border border-sage-200 bg-sage-50 p-4 text-[13px] text-sage-900">
              <div className="flex items-center gap-2 font-semibold"><ShieldCheck className="h-4 w-4" /> Check your inbox</div>
              <p className="mt-1 text-[12.5px] text-sage-800">
                If <strong>{email}</strong> matches an account, you'll receive a reset
                link within a few minutes. In this demo build, no real email is sent —
                use the demo credentials on the <Link to="/" className="font-medium underline">login page</Link>.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-5 space-y-3">
              <div className="field">
                <Mail className="h-4 w-4 text-ink-400" />
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-gold w-full">Send reset link</button>
            </form>
          )}
        </div>
      </main>
      <Footer variant="dark" />
    </div>
  );
}
