import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { products } from "@/lib/data";
import { CalendarIcon, Package, User, Plus, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DailyPurchase() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    productId: "",
    quantity: "",
    supplierName: "",
  });

  const selectedProduct = products.find((p) => p.id === formData.productId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Purchase Added",
      description: `Added ${formData.quantity} ${selectedProduct?.unit} of ${selectedProduct?.name}`,
    });
    setFormData({
      date: new Date().toISOString().split("T")[0],
      productId: "",
      quantity: "",
      supplierName: "",
    });
  };

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
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                  <div>
                    <p className="font-medium text-foreground">{selectedProduct.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Purchase Price: ₹{selectedProduct.purchasePrice} / {selectedProduct.unit}
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
                required
              />
              {selectedProduct && formData.quantity && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Total: ₹{(selectedProduct.purchasePrice * Number(formData.quantity)).toLocaleString()}
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
            <button type="submit" className="btn-primary w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Purchase Entry
            </button>
          </div>
        </form>

        {/* Recent Purchases */}
        <div className="mt-8">
          <h3 className="text-lg font-display font-semibold text-foreground mb-4">
            Today's Purchases
          </h3>
          <div className="space-y-3">
            {[
              { product: "Fresh Milk", quantity: 100, supplier: "Farm Fresh", amount: 4500 },
              { product: "Paneer", quantity: 25, supplier: "Paneer House", amount: 6250 },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg bg-card border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center">
                    <Check className="h-4 w-4 text-success" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{item.product}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} units • {item.supplier}
                    </p>
                  </div>
                </div>
                <span className="font-semibold text-foreground">₹{item.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
