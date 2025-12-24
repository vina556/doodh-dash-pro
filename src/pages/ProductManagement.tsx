import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ProductCard } from "@/components/ProductCard";
import { Product } from "@/lib/data";
import { supabase } from "@/integrations/supabase/client";
import { Plus } from "lucide-react";

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("name");

      if (error) throw error;
      setProducts(data as Product[]);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Product Management" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

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
