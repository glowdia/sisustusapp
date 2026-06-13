"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/database.types";
import { getSupabaseBrowserConfig } from "@/lib/supabase/config";

export function createClient() {
  const { anonKey, url } = getSupabaseBrowserConfig();

  return createBrowserClient<Database>(url, anonKey);
}
