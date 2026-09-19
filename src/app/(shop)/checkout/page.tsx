"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { createClient } from "@/lib/supabase/client";
import { formatEGP } from "@/lib/utils";
import { createOrder } from "./actions";
import type { ShippingZone } from "@/lib/types";

export default function CheckoutPage() {
  const { lines, subtotal, clear } = useCart();
  const router = useRouter();

  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [governorate, setGovernorate] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [phone2, setPhone2] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("shipping_zones")
      .select("*")
      .eq("enabled", true)
      .order("governorate")
      .then(({ data }) => {
        if (data) {
          setZones(data as ShippingZone[]);
          if (data.length > 0) setGovernorate(data[0].governorate);
        }
      });
  }, []);

  const shippingCost = zones.find((z) => z.governorate === governorate)?.price ?? 0;
  const total = subtotal + shippingCost;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await createOrder({
      customerName,
      phone,
      phone2: phone2.trim() || undefined,
      governorate,
      address,
      notes,
      lines: lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
    });

    setSubmitting(false);

    if (!result.ok) {
      setError(result.error ?? "Something went wrong. Please try again.");
      return;
    }

    clear();
    router.push(`/order-confirmation/${result.orderId}`);
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <h1 className="font-display text-2xl italic text-navy">
          Your cart is empty
        </h1>
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
      <h1 className="font-display text-3xl italic text-navy">Checkout</h1>

      <div className="mt-10 grid gap-10 md:grid-cols-2">
        <form onSubmit={handleSubmit} className="grid gap-4">
          <Field label="Full name">
            <input
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Phone number">
            <input
              required
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Second phone number (optional)">
            <input
              type="tel"
              value={phone2}
              onChange={(e) => setPhone2(e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Governorate">
            <select
              required
              value={governorate}
              onChange={(e) => setGovernorate(e.target.value)}
              className="input"
            >
              {zones.map((z) => (
                <option key={z.id} value={z.governorate}>
                  {z.governorate} — {formatEGP(z.price)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Address">
            <textarea
              required
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Order notes (optional)">
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input"
            />
          </Field>

          {error && (
            <p className="rounded-card bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || zones.length === 0}
            className="mt-2 rounded-full bg-navy px-6 py-3 text-sm font-bold text-white transition hover:bg-navy/90 disabled:opacity-50"
          >
            {submitting ? "Placing order…" : "Place order"}
          </button>
        </form>

        <div className="h-fit rounded-card border border-line p-6">
          <div className="text-sm font-medium text-navy">Order summary</div>
          <div className="mt-4 space-y-2 text-sm">
            {lines.map((line) => (
              <div key={line.productId} className="flex justify-between">
                <span className="text-navy/70">
                  {line.name} × {line.quantity}
                </span>
                <span className="text-navy">
                  {formatEGP(line.price * line.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between text-navy/70">
              <span>Subtotal</span>
              <span>{formatEGP(subtotal)}</span>
            </div>
            <div className="flex justify-between text-navy/70">
              <span>Shipping</span>
              <span>{formatEGP(shippingCost)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-navy">
              <span>Total</span>
              <span>{formatEGP(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-medium text-navy">{label}</span>
      {children}
    </label>
  );
}
