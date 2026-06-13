import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f3ed] px-5 py-10">
      <section className="w-full max-w-md rounded-lg border border-stone-200 bg-white p-8 shadow-sm">
        <div className="mb-8 space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-stone-500">
            Sisustusapp
          </p>
          <h1 className="text-3xl font-semibold text-stone-950">Kirjaudu sisään</h1>
          <p className="text-sm leading-6 text-stone-600">
            Käytä Supabaseen luotua käyttäjätunnusta.
          </p>
        </div>

        <LoginForm />

        <div className="mt-6 border-t border-stone-200 pt-5">
          <Link className="text-sm font-medium text-stone-700 hover:text-stone-950" href="/demo">
            Avaa nykyinen moodboard-demo ilman kirjautumista
          </Link>
        </div>
      </section>
    </main>
  );
}
