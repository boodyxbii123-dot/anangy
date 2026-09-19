import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client. Bypasses Row Level Security.
 *
 * SERVER-SIDE USE ONLY — never import this file from a Client
 * Component or expose SUPABASE_SERVICE_ROLE_KEY to the browser.
 *
 * Used for exactly two things in this app:
 *  1. Checkout (src/app/checkout/actions.ts) — an anonymous customer
 *     needs to create an order, but we don't want a public INSERT
 *     policy on `orders`/`order_items`. The server action re-validates
 *     every price and stock level against the database before writing,
 *     so the service role here is safe: it never trusts client input.
 *  2. Admin API routes that need to do multi-table writes (e.g.
 *     decrementing stock when an order is confirmed) after the route
 *     has already confirmed the caller is an authenticated admin.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
