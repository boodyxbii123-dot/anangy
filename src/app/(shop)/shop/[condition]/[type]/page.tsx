import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/ProductCard";
import {
  conditionLabel,
  toothTypeLabel,
  unslugifyCondition,
} from "@/lib/utils";
import type { Product, ToothType } from "@/lib/types";

export const revalidate = 0;

const VALID_TYPES: ToothType[] = ["anterior", "premolar", "molar"];

export default async function ProductListingPage({
  params,
}: {
  params: { condition: string; type: string };
}) {
  const condition = unslugifyCondition(params.condition);
  const type = params.type as ToothType;
  if (!condition || !VALID_TYPES.includes(type)) notFound();

  const supabase = createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("condition", condition)
    .eq("tooth_type", type)
    .eq("available", true)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <nav className="text-sm text-navy/50">
        <Link href="/" className="hover:text-navy">
          Home
        </Link>{" "}
        /{" "}
        <Link href="/shop" className="hover:text-navy">
          Shop
        </Link>{" "}
        /{" "}
        <Link href={`/shop/${params.condition}`} className="hover:text-navy">
          {conditionLabel(condition)}
        </Link>{" "}
        / {toothTypeLabel(type)}
      </nav>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-3xl italic text-navy">
          {conditionLabel(condition)} — {toothTypeLabel(type)}
        </h1>
        <Link
          href={`/shop/${params.condition}`}
          className="text-sm font-medium text-navy underline decoration-navy/30 underline-offset-4"
        >
          ← Change tooth type
        </Link>
      </div>

      {products && products.length > 0 ? (
        <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
          {(products as Product[]).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="mt-14 rounded-card border border-dashed border-line p-10 text-center text-sm text-navy/50">
          No specimens are currently listed in this category. Check back
          soon, or add one from the admin dashboard.
        </div>
      )}
    </div>
  );
}
