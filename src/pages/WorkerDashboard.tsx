import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Product, getProductImage } from "@/lib/data";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Check } from "lucide-react";
import { toast } from "sonner";

export default function WorkerDashboard() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [recentEntries, setRecentEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch products (without purchase price for workers)
      const { data: productsData } = await supabase
        .from("products")
        .select("id, name, unit, selling_price, image_url, current_stock, minimum_stock, is_active")
        .eq("is_active", true)
        .order("name");

      if (productsData) {
        setProducts(productsData as Product[]);
      }

      // Fetch today's entries by this worker
      if (user) {
        const { data: entriesData } = await supabase
          .from("selling_entries")
          .select(`
            id, quantity, created_at,
            products (id, name, unit)
          `)
          .eq("date", today)
          .eq("entered_by", user.id)
          .order("created_at", { ascending: false })
          .limit(10);

        if (entriesData) {
          setRecentEntries(entriesData);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (productId: string, quantity: string) => {
    setEntries({ ...entries, [productId]: quantity });
  };

  const handleSubmit = async (productId: string) => {
    if (!user || !entries[productId]) return;

    const product = products.find((p) => p.id === productId);
    if (!product) return;

    setSubmitting(productId);
    try {
      const { error } = await supabase.from("selling_entries").insert({
        product_id: productId,
        date: today,
        quantity: Number(entries[productId]),
        selling_price: product.selling_price,
        customer_type: "Daily",
        entered_by: user.id,
        is_future_order: false,
      });

      if (error) throw error;

      toast.success(`Added ${entries[productId]} ${product.unit} of ${product.name}`);
      setEntries({ ...entries, [productId]: "" });
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to add entry");
    } finally {
      setSubmitting(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Worker Dashboard" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Worker Dashboard"
      subtitle="Add daily product entries"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product, index) => (
          <div
            key={product.id}
            className="card-dashboard animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Product Image */}
            <div className="flex items-center gap-4 mb-4">
              <img
                src={getProductImage(product.name)}
                alt={product.name}
                className="h-20 w-20 rounded-xl object-cover"
              />
              <div>
                <h3 className="font-display font-semibold text-foreground">{product.name}</h3>
                <p className="text-sm text-muted-foreground">per {product.unit}</p>
                <span className="badge-fresh mt-1">Fresh</span>
              </div>
            </div>

            {/* Quantity Entry */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Quantity ({product.unit})
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={entries[product.id] || ""}
                    onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                    className="input-dairy flex-1"
                    placeholder="Enter quantity"
                    min="1"
                  />
                  <button
                    onClick={() => handleSubmit(product.id)}
                    disabled={!entries[product.id] || submitting === product.id}
                    className="btn-primary px-4 disabled:opacity-50"
                  >
                    {submitting === product.id ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground"></div>
                    ) : (
                      <Plus className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Entries */}
      <div className="mt-8">
        <h3 className="text-lg font-display font-semibold text-foreground mb-4">
          Today's Entries
        </h3>
        {recentEntries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-4 rounded-lg bg-card border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center">
                    <Check className="h-4 w-4 text-success" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{entry.products?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {entry.quantity} {entry.products?.unit} • {new Date(entry.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No entries recorded today</p>
        )}
      </div>
    </DashboardLayout>
  );
}
