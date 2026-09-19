"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/CartProvider";
import { formatEGP } from "@/lib/utils";

export default function CartPage() {
  const { lines, updateQuantity, removeLine, subtotal } = useCart();

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <h1 className="font-display text-2xl italic text-navy">
          Your cart is empty
        </h1>
        <p className="mt-3 text-sm text-navy/60">
          Browse specimens by condition and tooth type to get started.
        </p>
        <Link
          href="/shop"
          className="mt-8 inline-block rounded-full bg-navy px-6 py-3 text-sm font-bold text-white hover:bg-navy/90"
        >
          Browse specimens
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-14">
      <h1 className="font-display text-3xl italic text-navy">Your cart</h1>

      <div className="mt-8 divide-y divide-line rounded-card border border-line">
        {lines.map((line) => (
          <div key={line.productId} className="flex items-center gap-4 p-4">
            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-card border border-line bg-mist">
              {line.imageUrl ? (
                <Image
                  src={line.imageUrl}
                  alt={line.name}
                  fill
                  className="object-cover"
                />
              ) : null}
            </div>
            <div className="flex-1">
              <div className="text-xs text-navy/40">{line.sku}</div>
              <div className="font-medium text-navy">{line.name}</div>
              <div className="text-sm text-navy/60">{formatEGP(line.price)}</div>
            </div>
            <div className="flex items-center rounded-full border border-line">
              <button
                type="button"
                aria-label="Decrease quantity"
                className="px-3 py-2 text-navy/60 hover:text-navy"
                onClick={() => updateQuantity(line.productId, line.quantity - 1)}
              >
                −
              </button>
              <span className="w-6 text-center text-sm">{line.quantity}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                className="px-3 py-2 text-navy/60 hover:text-navy"
                onClick={() => updateQuantity(line.productId, line.quantity + 1)}
              >
                +
              </button>
            </div>
            <div className="w-24 text-right text-sm font-medium text-navy">
              {formatEGP(line.price * line.quantity)}
            </div>
            <button
              type="button"
              onClick={() => removeLine(line.productId)}
              className="text-xs text-navy/40 hover:text-navy"
              aria-label={`Remove ${line.name}`}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <Link
          href="/shop"
          className="text-sm font-medium text-navy underline decoration-navy/30 underline-offset-4"
        >
          ← Continue browsing
        </Link>
        <div className="text-right">
          <div className="text-sm text-navy/60">Subtotal</div>
          <div className="text-xl font-bold text-navy">
            {formatEGP(subtotal)}
          </div>
        </div>
      </div>

      <Link
        href="/checkout"
        className="mt-6 block rounded-full bg-navy px-6 py-3 text-center text-sm font-bold text-white hover:bg-navy/90"
      >
        Proceed to checkout
      </Link>
    </div>
  );
}
