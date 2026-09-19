import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatEGP } from "@/lib/utils";
import type { Order, OrderItem } from "@/lib/types";

export const revalidate = 0;

export default async function OrderConfirmationPage({
  params,
}: {
  params: { id: string };
}) {
  // The confirmation page needs to read back an order that was just
  // placed anonymously. There is no public SELECT policy on `orders`
  // (see supabase/schema.sql), so this route reads it with the
  // service-role client — safe because the order id is an
  // unguessable UUID handed to the browser right after checkout,
  // and nothing here is derived from client-supplied input.
  const supabase = createAdminClient();
  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", params.id)
    .single<Order & { order_items: OrderItem[] }>();

  if (!order) notFound();

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-navy text-white">
        ✓
      </div>
      <h1 className="mt-6 font-display text-3xl italic text-navy">
        Order received
      </h1>
      <p className="mt-2 text-sm text-navy/60">
        Thank you, {order.customer_name}. We'll confirm your order by phone
        shortly.
      </p>

      <div className="mt-10 rounded-card border border-line p-6 text-left">
        <div className="flex justify-between text-sm text-navy/50">
          <span>Order ID</span>
          <span className="font-mono">{order.id.slice(0, 8)}</span>
        </div>
        <div className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
          {order.order_items.map((item) => (
            <div key={item.id} className="flex justify-between">
              <span className="text-navy/70">
                {item.product_name} × {item.quantity}
              </span>
              <span className="text-navy">{formatEGP(item.line_total)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-1 border-t border-line pt-4 text-sm">
          <div className="flex justify-between text-navy/70">
            <span>Subtotal</span>
            <span>{formatEGP(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-navy/70">
            <span>Shipping ({order.governorate})</span>
            <span>{formatEGP(order.shipping_cost)}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-navy">
            <span>Total</span>
            <span>{formatEGP(order.total)}</span>
          </div>
        </div>
      </div>

      <Link
        href="/shop"
        className="mt-10 inline-block rounded-full bg-navy px-6 py-3 text-sm font-bold text-white hover:bg-navy/90"
      >
        Continue browsing
      </Link>
    </div>
  );
}
