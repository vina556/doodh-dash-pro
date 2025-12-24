import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Product, getProductImage } from "@/lib/data";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { CalendarIcon, Package, User, Plus, Check } from "lucide-react";
import { toast } from "sonner";

export default function DailyPurchase() {
  const { user, isAdminOrManager } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [recentPurchases, setRecentPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    productId: "",
    quantity: "",
    supplierName: "",
  });

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch products
      const { data: productsData } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (productsData) {
        setProducts(productsData as Product[]);
      }

      // Fetch today's purchases
      const { data: purchasesData } = await supabase
        .from("purchase_entries")
        .select(`
          id, quantity, purchase_price, supplier_name, created_at,
          products (id, name, unit)
        `)
        .eq("date", today)
        .order("created_at", { ascending: false })
        .limit(10);

      if (purchasesData) {
        setRecentPurchases(purchasesData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectedProduct = products.find((p) => p.id === formData.productId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.from("purchase_entries").insert({
        product_id: formData.productId,
        date: formData.date,
        quantity: Number(formData.quantity),
        purchase_price: selectedProduct?.purchase_price || 0,
        supplier_name: formData.supplierName,
        entered_by: user.id,
      });

      if (error) throw error;

      toast.success(`Added ${formData.quantity} ${selectedProduct?.unit} of ${selectedProduct?.name}`);
      
      setFormData({
        date: new Date().toISOString().split("T")[0],
        productId: "",
        quantity: "",
        supplierName: "",
      });

      // Refresh data
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to add purchase");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Daily Purchase Entry" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Daily Purchase Entry"
      subtitle="Record today's product purchases"
    >
      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="card-dashboard">
          <div className="space-y-6">
            {/* Date Field */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <CalendarIcon className="inline h-4 w-4 mr-2" />
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="input-dairy"
                required
              />
            </div>

            {/* Product Selection */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <Package className="inline h-4 w-4 mr-2" />
                Product
              </label>
              <select
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                className="input-dairy"
                required
              >
                <option value="">Select a product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.unit})
                  </option>
                ))}
              </select>

              {/* Product Preview */}
              {selectedProduct && (
                <div className="mt-3 flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                  <img
                    src={getProductImage(selectedProduct.name)}
                    alt={selectedProduct.name}
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                  <div>
                    <p className="font-medium text-foreground">{selectedProduct.name}</p>
                    {isAdminOrManager && (
                      <p className="text-sm text-muted-foreground">
                        Purchase Price: ₹{selectedProduct.purchase_price} / {selectedProduct.unit}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Quantity {selectedProduct && `(${selectedProduct.unit})`}
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="input-dairy"
                placeholder="Enter quantity"
                min="1"
                required
              />
              {isAdminOrManager && selectedProduct && formData.quantity && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Total: ₹{(selectedProduct.purchase_price * Number(formData.quantity)).toLocaleString()}
                </p>
              )}
            </div>

            {/* Supplier Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <User className="inline h-4 w-4 mr-2" />
                Supplier Name
              </label>
              <input
                type="text"
                value={formData.supplierName}
                onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                className="input-dairy"
                placeholder="Enter supplier name"
                required
              />
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="btn-primary w-full"
              disabled={submitting}
            >
              {submitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground"></div>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Purchase Entry
                </>
              )}
            </button>
          </div>
        </form>

        {/* Recent Purchases */}
        <div className="mt-8">
          <h3 className="text-lg font-display font-semibold text-foreground mb-4">
            Today's Purchases
          </h3>
          {recentPurchases.length > 0 ? (
            <div className="space-y-3">
              {recentPurchases.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-card border border-border"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center">
                      <Check className="h-4 w-4 text-success" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{item.products?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} {item.products?.unit} • {item.supplier_name}
                      </p>
                    </div>
                  </div>
                  {isAdminOrManager && (
                    <span className="font-semibold text-foreground">
                      ₹{(item.quantity * item.purchase_price).toLocaleString()}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No purchases recorded today</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
