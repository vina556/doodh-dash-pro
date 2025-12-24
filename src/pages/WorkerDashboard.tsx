import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { products } from "@/lib/data";
import { Package, Plus, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function WorkerDashboard() {
  const { toast } = useToast();
  const [entries, setEntries] = useState<{ [key: string]: string }>({});

  const handleQuantityChange = (productId: string, quantity: string) => {
    setEntries({ ...entries, [productId]: quantity });
  };

  const handleSubmit = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (entries[productId] && product) {
      toast({
        title: "Entry Recorded",
        description: `Added ${entries[productId]} ${product.unit} of ${product.name}`,
      });
      setEntries({ ...entries, [productId]: "" });
    }
  };

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
                src={product.image}
                alt={product.name}
                className="h-20 w-20 rounded-xl object-cover"
              />
              <div>
                <h3 className="font-display font-semibold text-foreground">{product.name}</h3>
                <p className="text-sm text-muted-foreground">per {product.unit}</p>
                <span className={product.quality === "Fresh" ? "badge-fresh mt-1" : "badge-fresh mt-1"}>
                  {product.quality}
                </span>
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
                    disabled={!entries[product.id]}
                    className="btn-primary px-4 disabled:opacity-50"
                  >
                    <Plus className="h-5 w-5" />
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { product: "Fresh Milk", quantity: 50, time: "10:30 AM" },
            { product: "Curd", quantity: 20, time: "11:15 AM" },
            { product: "Paneer", quantity: 10, time: "12:00 PM" },
          ].map((entry, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 rounded-lg bg-card border border-border"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center">
                  <Check className="h-4 w-4 text-success" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{entry.product}</p>
                  <p className="text-sm text-muted-foreground">
                    {entry.quantity} units • {entry.time}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
