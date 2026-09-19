"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "./CartProvider";
import type { Product } from "@/lib/types";

export function AddToCart({ product }: { product: Product }) {
  const { addLine } = useCart();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const outOfStock = !product.available || product.stock_quantity === 0;

  function handleAdd() {
    addLine({
      productId: product.id,
      name: product.name,
      sku: product.sku,
      price: product.price,
      quantity,
      imageUrl: product.image_urls[0] ?? null,
      stockQuantity: product.stock_quantity,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  if (outOfStock) {
    return (
      <button
        disabled
        className="w-full cursor-not-allowed rounded-full bg-navy/20 px-6 py-3 text-sm font-medium text-navy/50"
      >
        Out of stock
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="flex items-center rounded-full border border-line">
        <button
          type="button"
          aria-label="Decrease quantity"
          className="px-4 py-3 text-navy/60 hover:text-navy"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
        >
          −
        </button>
        <span className="w-8 text-center text-sm font-medium text-navy">
          {quantity}
        </span>
        <button
          type="button"
          aria-label="Increase quantity"
          className="px-4 py-3 text-navy/60 hover:text-navy"
          onClick={() =>
            setQuantity((q) => Math.min(product.stock_quantity, q + 1))
          }
        >
          +
        </button>
      </div>
      <button
        type="button"
        onClick={handleAdd}
        className="flex-1 rounded-full bg-navy px-6 py-3 text-sm font-bold text-white transition hover:bg-navy/90"
      >
        {added ? "Added ✓" : "Add to cart"}
      </button>
      <button
        type="button"
        onClick={() => {
          handleAdd();
          router.push("/cart");
        }}
        className="flex-1 rounded-full border border-navy px-6 py-3 text-sm font-medium text-navy transition hover:bg-navy hover:text-white"
      >
        Buy now
      </button>
    </div>
  );
}
