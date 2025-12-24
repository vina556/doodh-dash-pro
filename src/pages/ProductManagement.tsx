import { DashboardLayout } from "@/components/DashboardLayout";
import { ProductCard } from "@/components/ProductCard";
import { products } from "@/lib/data";
import { Plus } from "lucide-react";

export default function ProductManagement() {
  return (
    <DashboardLayout
      title="Product Management"
      subtitle="Manage your dairy products inventory"
    >
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {products.length} products
          </span>
        </div>
        <button className="btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Add New Product
        </button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product, index) => (
          <div
            key={product.id}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <ProductCard
              product={product}
              showPurchasePrice={true}
              showProfit={true}
              variant="admin"
            />
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
