import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/types";
import { formatEGP } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const image = product.image_urls[0];

  return (
    <Link
      href={`/product/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-card border border-line bg-paper shadow-soft transition hover:border-navy/30"
    >
      <div className="relative aspect-square bg-mist">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(min-width: 768px) 25vw, 50vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-navy/30">
            No image
          </div>
        )}
        {!product.available || product.stock_quantity === 0 ? (
          <span className="absolute left-3 top-3 rounded-full bg-navy/90 px-3 py-1 text-xs text-white">
            Out of stock
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="text-xs text-navy/50">{product.sku}</div>
        <div className="mt-1 font-medium text-navy">{product.name}</div>
        <div className="mt-auto pt-3 text-sm font-bold text-navy">
          {formatEGP(product.price)}
        </div>
      </div>
    </Link>
  );
}
