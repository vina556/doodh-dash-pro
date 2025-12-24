import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Product, getProductImage } from "@/lib/data";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { CalendarIcon, Package, Users, Plus, Check } from "lucide-react";
import { toast } from "sonner";

export default function DailySelling() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    productId: "",
    quantity: "",
    customerType: "Daily" as "Daily" | "Wedding" | "Party",
    deliveryDate: new Date().toISOString().split("T")[0],
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

      // Fetch today's sales
      const { data: salesData } = await supabase
        .from("selling_entries")
        .select(`
          id, quantity, selling_price, customer_type, created_at,
          products (id, name, unit)
        `)
        .eq("date", today)
        .order("created_at", { ascending: false })
        .limit(10);

      if (salesData) {
        setRecentSales(salesData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectedProduct = products.find((p) => p.id === formData.productId);
  const isFutureOrder = formData.customerType !== "Daily" && formData.deliveryDate > today;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate stock
    if (selectedProduct && !isFutureOrder && Number(formData.quantity) > selectedProduct.current_stock) {
      toast.error(`Insufficient stock. Available: ${selectedProduct.current_stock} ${selectedProduct.unit}`);
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("selling_entries").insert({
        product_id: formData.productId,
        date: formData.date,
        quantity: Number(formData.quantity),
        selling_price: selectedProduct?.selling_price || 0,
        customer_type: formData.customerType,
        delivery_date: formData.customerType !== "Daily" ? formData.deliveryDate : null,
        entered_by: user.id,
        is_future_order: isFutureOrder,
      });

      if (error) throw error;

      toast.success(`Sold ${formData.quantity} ${selectedProduct?.unit} of ${selectedProduct?.name}`);
      
      setFormData({
        date: new Date().toISOString().split("T")[0],
        productId: "",
        quantity: "",
        customerType: "Daily",
        deliveryDate: new Date().toISOString().split("T")[0],
      });

      // Refresh data
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to record sale");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Daily Selling Entry" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Daily Selling Entry"
      subtitle="Record today's sales and orders"
    >
      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="card-dashboard">
          <div className="space-y-6">
            {/* Date Field */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <CalendarIcon className="inline h-4 w-4 mr-2" />
                Sale Date
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
                    {product.name} ({product.unit}) - Stock: {product.current_stock}
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
                    <p className="text-sm text-muted-foreground">
                      Selling Price: ₹{selectedProduct.selling_price} / {selectedProduct.unit}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Available: {selectedProduct.current_stock} {selectedProduct.unit}
                    </p>
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
                max={isFutureOrder ? undefined : selectedProduct?.current_stock}
                required
              />
              {selectedProduct && formData.quantity && (
                <p className="mt-2 text-sm text-success font-medium">
                  Total: ₹{(selectedProduct.selling_price * Number(formData.quantity)).toLocaleString()}
                </p>
              )}
            </div>

            {/* Customer Type */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <Users className="inline h-4 w-4 mr-2" />
                Customer Type
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(["Daily", "Wedding", "Party"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, customerType: type })}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.customerType === type
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <span className="font-medium text-foreground">{type}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Delivery Date (for future orders) */}
            {formData.customerType !== "Daily" && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  <CalendarIcon className="inline h-4 w-4 mr-2" />
                  Delivery Date
                </label>
                <input
                  type="date"
                  value={formData.deliveryDate}
                  onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                  className="input-dairy"
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
                {isFutureOrder && (
                  <p className="mt-2 text-sm text-accent">
                    This will be recorded as a future order (stock won't be deducted now)
                  </p>
                )}
              </div>
            )}

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
                  Record Sale
                </>
              )}
            </button>
          </div>
        </form>

        {/* Recent Sales */}
        <div className="mt-8">
          <h3 className="text-lg font-display font-semibold text-foreground mb-4">
            Today's Sales
          </h3>
          {recentSales.length > 0 ? (
            <div className="space-y-3">
              {recentSales.map((item) => (
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
                        {item.quantity} {item.products?.unit} • {item.customer_type}
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold text-success">
                    ₹{(item.quantity * item.selling_price).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No sales recorded today</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
