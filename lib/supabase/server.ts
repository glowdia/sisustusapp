import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/supabase/database.types";
import { getSupabaseBrowserConfig } from "@/lib/supabase/config";

export async function createClient() {
  const { anonKey, url } = getSupabaseBrowserConfig();
  const cookieStore = await cookies();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet, headers) {
        try {
          cookiesToSet.forEach(({ name, options, value }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot set cookies. Middleware or Route Handlers
          // must handle auth-refresh writes when authentication is added.
        }

        void headers;
      },
    },
  });
}
