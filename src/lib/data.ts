import milkImg from "@/assets/milk.png";
import paneerImg from "@/assets/paneer.png";
import butterImg from "@/assets/butter.png";
import gheeImg from "@/assets/ghee.png";
import curdImg from "@/assets/curd.png";
import creamImg from "@/assets/cream.png";

// Image mapping for products
export const productImages: Record<string, string> = {
  "Milk": milkImg,
  "Fresh Milk": milkImg,
  "Paneer": paneerImg,
  "Butter": butterImg,
  "Ghee": gheeImg,
  "Pure Ghee": gheeImg,
  "Curd": curdImg,
  "Cream": creamImg,
  "Fresh Cream": creamImg,
};

export interface Product {
  id: string;
  name: string;
  image_url: string | null;
  unit: "Litre" | "Kg" | "Packet";
  minimum_stock: number;
  current_stock: number;
  selling_price: number;
  purchase_price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PurchaseEntry {
  id: string;
  product_id: string;
  date: string;
  quantity: number;
  purchase_price: number;
  supplier_name: string | null;
  entered_by: string;
  created_at: string;
  products?: Product;
}

export interface SellingEntry {
  id: string;
  product_id: string;
  date: string;
  quantity: number;
  selling_price: number;
  customer_type: "Daily" | "Wedding" | "Party";
  delivery_date: string | null;
  entered_by: string;
  is_future_order: boolean;
  is_fulfilled: boolean;
  created_at: string;
  products?: Product;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  table_name: string;
  record_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

export interface DailySummary {
  id: string;
  summary_date: string;
  stock_summary: Record<string, unknown>;
  order_summary: Record<string, unknown>;
  summary_hash: string;
  created_at: string;
}

// Helper to get product image
export function getProductImage(name: string): string {
  return productImages[name] || "/placeholder.svg";
}

// Legacy type for backwards compatibility
export type UserRole = "founder" | "manager" | "worker" | "customer" | null;
