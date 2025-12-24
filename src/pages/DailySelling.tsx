import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { products } from "@/lib/data";
import { CalendarIcon, Package, Users, Plus, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DailySelling() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    productId: "",
    quantity: "",
    customerType: "Daily" as "Daily" | "Wedding" | "Party",
    deliveryDate: new Date().toISOString().split("T")[0],
  });

  const selectedProduct = products.find((p) => p.id === formData.productId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Sale Recorded",
      description: `Sold ${formData.quantity} ${selectedProduct?.unit} of ${selectedProduct?.name}`,
    });
    setFormData({
      date: new Date().toISOString().split("T")[0],
      productId: "",
      quantity: "",
      customerType: "Daily",
      deliveryDate: new Date().toISOString().split("T")[0],
    });
  };

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
                    {product.name} ({product.unit}) - Stock: {product.currentStock}
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
                      Selling Price: ₹{selectedProduct.sellingPrice} / {selectedProduct.unit}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Available: {selectedProduct.currentStock} {selectedProduct.unit}
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
                max={selectedProduct?.currentStock}
                required
              />
              {selectedProduct && formData.quantity && (
                <p className="mt-2 text-sm text-success font-medium">
                  Total: ₹{(selectedProduct.sellingPrice * Number(formData.quantity)).toLocaleString()}
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
              </div>
            )}

            {/* Submit Button */}
            <button type="submit" className="btn-primary w-full">
              <Plus className="h-4 w-4 mr-2" />
              Record Sale
            </button>
          </div>
        </form>

        {/* Recent Sales */}
        <div className="mt-8">
          <h3 className="text-lg font-display font-semibold text-foreground mb-4">
            Today's Sales
          </h3>
          <div className="space-y-3">
            {[
              { product: "Fresh Milk", quantity: 80, type: "Daily", amount: 4800 },
              { product: "Paneer", quantity: 10, type: "Wedding", amount: 3200 },
              { product: "Curd", quantity: 20, type: "Party", amount: 1600 },
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
                      {item.quantity} units • {item.type}
                    </p>
                  </div>
                </div>
                <span className="font-semibold text-success">₹{item.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
