import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AddToCart } from "@/components/AddToCart";
import {
  conditionLabel,
  formatEGP,
  slugifyCondition,
  toothTypeLabel,
} from "@/lib/utils";
import type { Product } from "@/lib/types";

export const revalidate = 0;

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", params.id)
    .single<Product>();

  if (!product) notFound();

  const images = product.image_urls.length > 0 ? product.image_urls : [null];

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
        <Link
          href={`/shop/${slugifyCondition(product.condition)}/${product.tooth_type}`}
          className="hover:text-navy"
        >
          {conditionLabel(product.condition)} · {toothTypeLabel(product.tooth_type)}
        </Link>
      </nav>

      <div className="mt-6 grid gap-12 md:grid-cols-2">
        <div className="grid gap-3">
          <div className="relative aspect-square overflow-hidden rounded-card border border-line bg-mist">
            {images[0] ? (
              <Image
                src={images[0]}
                alt={product.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-navy/30">
                No image available
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {images.slice(1).map((src, i) =>
                src ? (
                  <div
                    key={i}
                    className="relative aspect-square overflow-hidden rounded-card border border-line bg-mist"
                  >
                    <Image src={src} alt="" fill className="object-cover" />
                  </div>
                ) : null
              )}
            </div>
          )}
        </div>

        <div>
          <div className="text-xs uppercase tracking-wide text-navy/40">
            {product.sku}
          </div>
          <h1 className="mt-2 font-display text-3xl italic text-navy">
            {product.name}
          </h1>

          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-mist px-3 py-1 text-navy/70">
              {conditionLabel(product.condition)}
            </span>
            <span className="rounded-full bg-mist px-3 py-1 text-navy/70">
              {toothTypeLabel(product.tooth_type)}
            </span>
          </div>

          <div className="mt-6 text-2xl font-bold text-navy">
            {formatEGP(product.price)}
          </div>

          {product.description && (
            <p className="mt-5 max-w-prose text-sm leading-relaxed text-navy/70">
              {product.description}
            </p>
          )}

          {product.notes && (
            <p className="mt-3 max-w-prose text-xs italic text-navy/50">
              {product.notes}
            </p>
          )}

          <div className="mt-4 text-xs text-navy/50">
            {product.available && product.stock_quantity > 0
              ? `${product.stock_quantity} in stock`
              : "Currently unavailable"}
          </div>

          <div className="mt-8">
            <AddToCart product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}
