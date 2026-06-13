"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsSubmitting(false);

    if (signInError) {
      setError("Kirjautuminen epäonnistui. Tarkista sähköposti ja salasana.");
      return;
    }

    router.push("/projects");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium text-stone-800" htmlFor="email">
          Sähköposti
        </label>
        <input
          id="email"
          autoComplete="email"
          className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-stone-950 outline-none transition focus:border-stone-700"
          onChange={(event) => setEmail(event.target.value)}
          required
          type="email"
          value={email}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-stone-800" htmlFor="password">
          Salasana
        </label>
        <input
          id="password"
          autoComplete="current-password"
          className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-stone-950 outline-none transition focus:border-stone-700"
          onChange={(event) => setPassword(event.target.value)}
          required
          type="password"
          value={password}
        />
      </div>

      {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}

      <button
        className="w-full rounded-md bg-stone-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Kirjaudutaan..." : "Kirjaudu"}
      </button>
    </form>
  );
}
