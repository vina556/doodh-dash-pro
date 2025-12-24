import milkImg from "@/assets/milk.png";
import paneerImg from "@/assets/paneer.png";
import butterImg from "@/assets/butter.png";
import gheeImg from "@/assets/ghee.png";
import curdImg from "@/assets/curd.png";
import creamImg from "@/assets/cream.png";

export interface Product {
  id: string;
  name: string;
  image: string;
  unit: "Litre" | "Kg" | "Packet";
  minStock: number;
  currentStock: number;
  sellingPrice: number;
  purchasePrice: number;
  quality: "Fresh" | "Pure";
}

export const products: Product[] = [
  {
    id: "1",
    name: "Fresh Milk",
    image: milkImg,
    unit: "Litre",
    minStock: 50,
    currentStock: 120,
    sellingPrice: 60,
    purchasePrice: 45,
    quality: "Fresh",
  },
  {
    id: "2",
    name: "Paneer",
    image: paneerImg,
    unit: "Kg",
    minStock: 20,
    currentStock: 15,
    sellingPrice: 320,
    purchasePrice: 250,
    quality: "Fresh",
  },
  {
    id: "3",
    name: "Butter",
    image: butterImg,
    unit: "Kg",
    minStock: 15,
    currentStock: 25,
    sellingPrice: 520,
    purchasePrice: 420,
    quality: "Pure",
  },
  {
    id: "4",
    name: "Pure Ghee",
    image: gheeImg,
    unit: "Kg",
    minStock: 10,
    currentStock: 8,
    sellingPrice: 650,
    purchasePrice: 520,
    quality: "Pure",
  },
  {
    id: "5",
    name: "Curd",
    image: curdImg,
    unit: "Kg",
    minStock: 30,
    currentStock: 45,
    sellingPrice: 80,
    purchasePrice: 55,
    quality: "Fresh",
  },
  {
    id: "6",
    name: "Fresh Cream",
    image: creamImg,
    unit: "Litre",
    minStock: 10,
    currentStock: 12,
    sellingPrice: 280,
    purchasePrice: 200,
    quality: "Fresh",
  },
];

export interface DailyPurchase {
  id: string;
  date: string;
  productId: string;
  quantity: number;
  supplierName: string;
}

export interface DailySale {
  id: string;
  date: string;
  productId: string;
  quantity: number;
  customerType: "Daily" | "Wedding" | "Party";
  deliveryDate: string;
}

export const samplePurchases: DailyPurchase[] = [
  { id: "p1", date: "2024-01-15", productId: "1", quantity: 100, supplierName: "Farm Fresh Dairy" },
  { id: "p2", date: "2024-01-15", productId: "2", quantity: 25, supplierName: "Paneer House" },
  { id: "p3", date: "2024-01-15", productId: "4", quantity: 15, supplierName: "Ghee Traders" },
];

export const sampleSales: DailySale[] = [
  { id: "s1", date: "2024-01-15", productId: "1", quantity: 80, customerType: "Daily", deliveryDate: "2024-01-15" },
  { id: "s2", date: "2024-01-15", productId: "2", quantity: 10, customerType: "Wedding", deliveryDate: "2024-01-20" },
  { id: "s3", date: "2024-01-15", productId: "5", quantity: 20, customerType: "Party", deliveryDate: "2024-01-18" },
];

export type UserRole = "admin" | "manager" | "worker" | null;
