import { Product } from "@/lib/data";
import { useAuth } from "@/contexts/AuthContext";

interface ProductCardProps {
  product: Product;
  showPurchasePrice?: boolean;
  showProfit?: boolean;
  onEdit?: () => void;
  variant?: "admin" | "worker" | "customer";
}

export function ProductCard({
  product,
  showPurchasePrice = false,
  showProfit = false,
  variant = "admin",
}: ProductCardProps) {
  const { role } = useAuth();
  const isLowStock = product.currentStock <= product.minStock;
  const profit = product.sellingPrice - product.purchasePrice;
  const canSeePurchasePrice = role === "admin" && showPurchasePrice;
  const canSeeProfit = role === "admin" && showProfit;

  return (
    <div className="card-product group">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Quality Badge */}
        <div className="absolute top-3 left-3">
          <span className={product.quality === "Fresh" ? "badge-fresh" : "badge-fresh"}>
            {product.quality}
          </span>
        </div>
        {/* Low Stock Badge */}
        {isLowStock && variant !== "customer" && (
          <div className="absolute top-3 right-3">
            <span className="badge-danger">Low Stock</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-display font-semibold text-foreground">{product.name}</h3>
        <p className="text-sm text-muted-foreground">per {product.unit}</p>

        <div className="mt-3 space-y-2">
          {/* Selling Price */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Selling Price</span>
            <span className="text-lg font-bold text-primary">₹{product.sellingPrice}</span>
          </div>

          {/* Purchase Price - Admin Only */}
          {canSeePurchasePrice && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Purchase Price</span>
              <span className="text-sm font-medium text-foreground">₹{product.purchasePrice}</span>
            </div>
          )}

          {/* Profit - Admin Only */}
          {canSeeProfit && (
            <div className="flex items-center justify-between border-t border-border pt-2">
              <span className="text-sm font-medium text-muted-foreground">Profit</span>
              <span className="text-sm font-bold text-success">₹{profit}</span>
            </div>
          )}

          {/* Stock Info - Not for Customers */}
          {variant !== "customer" && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Stock</span>
              <span className={`text-sm font-medium ${isLowStock ? "text-destructive" : "text-foreground"}`}>
                {product.currentStock} {product.unit}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
