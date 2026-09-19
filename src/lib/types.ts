export type ToothCondition = "sound" | "semi_sound" | "caries";
export type ToothType = "anterior" | "premolar" | "molar";
export type OrderStatus =
  | "new"
  | "confirmed"
  | "preparing"
  | "shipped"
  | "delivered"
  | "cancelled";

export const CONDITIONS: { value: ToothCondition; label: string }[] = [
  { value: "sound", label: "Sound" },
  { value: "semi_sound", label: "Semi Sound" },
  { value: "caries", label: "Caries" },
];

export const TOOTH_TYPES: { value: ToothType; label: string }[] = [
  { value: "anterior", label: "Anterior" },
  { value: "premolar", label: "Premolar" },
  { value: "molar", label: "Molar" },
];

export const ORDER_STATUSES: OrderStatus[] = [
  "new",
  "confirmed",
  "preparing",
  "shipped",
  "delivered",
  "cancelled",
];

export interface Category {
  id: string;
  condition: ToothCondition;
  tooth_type: ToothType;
  label: string;
  description: string | null;
  sort_order: number;
  enabled: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  condition: ToothCondition;
  tooth_type: ToothType;
  description: string | null;
  notes: string | null;
  stock_quantity: number;
  available: boolean;
  image_urls: string[];
  created_at: string;
  updated_at: string;
}

export interface ShippingZone {
  id: string;
  governorate: string;
  price: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  sku: string;
  unit_price: number;
  quantity: number;
  line_total: number;
}

export interface Order {
  id: string;
  customer_name: string;
  phone: string;
  phone2: string | null;
  governorate: string;
  address: string;
  shipping_zone_id: string | null;
  shipping_cost: number;
  subtotal: number;
  total: number;
  status: OrderStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

/** Shape of a line item as held client-side in the cart before checkout. */
export interface CartLine {
  productId: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
  stockQuantity: number;
}
