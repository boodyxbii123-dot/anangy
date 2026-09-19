"use server";

import { createAdminClient } from "@/lib/supabase/admin";

interface CheckoutInput {
  customerName: string;
  phone: string;
  phone2?: string;
  governorate: string;
  address: string;
  notes?: string;
  lines: { productId: string; quantity: number }[];
}

interface CheckoutResult {
  ok: boolean;
  orderId?: string;
  error?: string;
}

/**
 * Creates an order from a shopping cart.
 *
 * Runs with the service-role client (bypasses RLS) because checkout is
 * anonymous and we deliberately do not expose a public INSERT policy
 * on orders/order_items. Safety instead comes from never trusting the
 * client's numbers: price, availability, stock, and the shipping cost
 * are all re-read from the database here before anything is written.
 */
export async function createOrder(input: CheckoutInput): Promise<CheckoutResult> {
  if (!input.customerName.trim() || !input.phone.trim() || !input.address.trim()) {
    return { ok: false, error: "Please fill in your name, phone, and address." };
  }
  if (input.lines.length === 0) {
    return { ok: false, error: "Your cart is empty." };
  }

  const supabase = createAdminClient();

  const { data: zone, error: zoneError } = await supabase
    .from("shipping_zones")
    .select("*")
    .eq("governorate", input.governorate)
    .eq("enabled", true)
    .maybeSingle();

  if (zoneError || !zone) {
    return { ok: false, error: "Please choose a valid delivery governorate." };
  }

  const productIds = input.lines.map((l) => l.productId);
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("*")
    .in("id", productIds);

  if (productsError || !products) {
    return { ok: false, error: "Could not verify products. Please try again." };
  }

  const orderItems: {
    product_id: string;
    product_name: string;
    sku: string;
    unit_price: number;
    quantity: number;
    line_total: number;
  }[] = [];

  for (const line of input.lines) {
    const product = products.find((p) => p.id === line.productId);
    if (!product) {
      return { ok: false, error: "One of the items in your cart no longer exists." };
    }
    if (!product.available) {
      return { ok: false, error: `${product.name} is no longer available.` };
    }
    if (product.stock_quantity < line.quantity) {
      return {
        ok: false,
        error: `Only ${product.stock_quantity} left of ${product.name}.`,
      };
    }
    orderItems.push({
      product_id: product.id,
      product_name: product.name,
      sku: product.sku,
      unit_price: product.price,
      quantity: line.quantity,
      line_total: product.price * line.quantity,
    });
  }

  const subtotal = orderItems.reduce((sum, i) => sum + i.line_total, 0);
  const shippingCost = zone.price;
  const total = subtotal + shippingCost;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_name: input.customerName.trim(),
      phone: input.phone.trim(),
      phone2: input.phone2?.trim() || null,
      governorate: input.governorate,
      address: input.address.trim(),
      shipping_zone_id: zone.id,
      shipping_cost: shippingCost,
      subtotal,
      total,
      status: "new",
      notes: input.notes?.trim() || null,
    })
    .select()
    .single();

  if (orderError || !order) {
    // Temporary: surface the real database error so we can see exactly
    // what's failing, instead of this generic message hiding it.
    console.error("createOrder insert failed:", orderError);
    return {
      ok: false,
      error: orderError
        ? `Could not create your order: ${orderError.message}`
        : "Could not create your order. Please try again.",
    };
  }

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems.map((item) => ({ ...item, order_id: order.id })));

  if (itemsError) {
    // Temporary: surface the real database error, same as above.
    console.error("createOrder order_items insert failed:", itemsError);
    return {
      ok: false,
      error: `Could not save order items: ${itemsError.message}`,
    };
  }

  // Decrement stock for each purchased product.
  for (const item of orderItems) {
    const product = products.find((p) => p.id === item.product_id)!;
    await supabase
      .from("products")
      .update({ stock_quantity: product.stock_quantity - item.quantity })
      .eq("id", item.product_id);
  }

  return { ok: true, orderId: order.id };
}
