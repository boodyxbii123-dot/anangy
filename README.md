# asnangy.

The public e-commerce storefront for selling extracted tooth specimens for
dental education and training. Built with Next.js (App Router),
TypeScript, Tailwind CSS, and Supabase.

The admin dashboard now lives in its own separate project
(`asnangy-admin/`) and talks to the same Supabase project as this
storefront. See that project's README for setup.

## Architecture at a glance

```
src/
  app/
    (shop)/              → public storefront (route group, no URL prefix)
      page.tsx            Home
      shop/page.tsx        Choose condition
      shop/[condition]/    Choose tooth type
      shop/[condition]/[type]/   Product listing
      product/[id]/        Product detail
      cart/                Cart (client-side, localStorage)
      checkout/            Checkout form + server action
      order-confirmation/[id]/
      about/
      layout.tsx           Wraps the above in Header + Footer + CartProvider
  components/              Shared storefront UI
  lib/
    types.ts               Shared TypeScript types
    utils.ts                Formatting helpers
    supabase/
      client.ts             Browser Supabase client (anon key)
      server.ts              Server Component / Server Action client (anon key, cookie-based session)
      admin.ts                Service-role client — server-only, bypasses RLS (used by checkout)
supabase/
  schema.sql                 Full database schema + Row Level Security policies
  seed.sql                    Sample categories, products, and shipping zones
```

Nothing in the frontend hardcodes product data, prices, SKUs, shipping
prices, or inventory — all of it is read from Supabase at request time.

## 1. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run `supabase/schema.sql`, then `supabase/seed.sql`
   (the seed is optional but useful for development).
3. Create a Storage bucket named `products` (Storage → New bucket → make it
   public) for product images.
4. Copy your project URL and anon key from Project Settings → API into
   `.env.local` (copy `.env.example` first):

   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```

   `SUPABASE_SERVICE_ROLE_KEY` is server-only — it is never imported by any
   client component and must never be committed or exposed to the browser.

   Use these **same three values** in `asnangy-admin/.env.local` too — both
   projects point at the same Supabase project, so data (products,
   categories, orders...) stays in sync between the storefront and the
   dashboard automatically.

## 2. Install and run

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` for the storefront. To manage products,
categories, orders, inventory, and shipping, run the separate
`asnangy-admin` project alongside this one (see its README) — by default
it runs on `http://localhost:3001`.

## 3. Uploading product images

From the admin dashboard's product form (in the separate `asnangy-admin`
project), you can now either upload image files straight from your
device — they're pushed to the `products` Storage bucket automatically —
or paste a public Supabase Storage URL. Either way ends up in the same
`products.image_urls` array, so nothing else needs to change.

## Brand assets

`public/logo.png` is the "asnangy." wordmark, rendered via
`src/components/Logo.tsx`. The favicon and Apple touch icon
(`src/app/icon.png`, `src/app/apple-icon.png`) use the "a." mark.

## Design tokens

| Token | Value |
|---|---|
| Primary (navy) | `#051D41` |
| Background | `#FFFFFF` |
| Secondary surfaces | `#F6F7F9` (mist), `#E7E9EE` (borders) |
| Display type | Fraunces (italic, for headings) — swap in Mirano once you have licensed font files, see `src/app/globals.css` |
| Body type | IBM Plex Sans |

## What's deliberately out of scope for this pass

- Image upload widget in the admin form (URLs are pasted in for now).
- Payment gateway integration — checkout currently creates a
  cash-on-delivery-style order for the admin to confirm by phone.
- Automated tests.
