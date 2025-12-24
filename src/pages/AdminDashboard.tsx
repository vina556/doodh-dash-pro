import { DashboardLayout } from "@/components/DashboardLayout";
import { DashboardCard } from "@/components/DashboardCard";
import { products, sampleSales, samplePurchases } from "@/lib/data";
import {
  ShoppingCart,
  Receipt,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Calendar,
  Package,
} from "lucide-react";

export default function AdminDashboard() {
  // Calculate today's purchase summary
  const todayPurchases = samplePurchases.filter((p) => p.date === "2024-01-15");
  const totalPurchaseAmount = todayPurchases.reduce((acc, p) => {
    const product = products.find((prod) => prod.id === p.productId);
    return acc + (product?.purchasePrice || 0) * p.quantity;
  }, 0);

  // Calculate today's selling summary
  const todaySales = sampleSales.filter((s) => s.date === "2024-01-15");
  const totalSalesAmount = todaySales.reduce((acc, s) => {
    const product = products.find((prod) => prod.id === s.productId);
    return acc + (product?.sellingPrice || 0) * s.quantity;
  }, 0);

  // Calculate profit
  const totalProfit = totalSalesAmount - totalPurchaseAmount;

  // Low stock products
  const lowStockProducts = products.filter((p) => p.currentStock <= p.minStock);

  // Tomorrow's orders
  const futureOrders = sampleSales.filter((s) => s.deliveryDate > "2024-01-15");

  // Price changes (mock data)
  const priceChanges = [
    { product: "Fresh Milk", change: 5, isIncrease: true },
    { product: "Ghee", change: -10, isIncrease: false },
  ];

  return (
    <DashboardLayout title="Dashboard" subtitle="Overview of today's business">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard
          title="Today's Purchases"
          value={`₹${totalPurchaseAmount.toLocaleString()}`}
          icon={ShoppingCart}
          subtitle={`${todayPurchases.length} transactions`}
          trend={{ value: 12, isPositive: true }}
        />
        <DashboardCard
          title="Today's Sales"
          value={`₹${totalSalesAmount.toLocaleString()}`}
          icon={Receipt}
          subtitle={`${todaySales.length} orders`}
          trend={{ value: 8, isPositive: true }}
          variant="success"
        />
        <DashboardCard
          title="Today's Profit"
          value={`₹${totalProfit.toLocaleString()}`}
          icon={TrendingUp}
          subtitle="Net profit"
          variant={totalProfit > 0 ? "success" : "danger"}
        />
        <DashboardCard
          title="Low Stock Items"
          value={lowStockProducts.length}
          icon={AlertTriangle}
          subtitle="Need attention"
          variant={lowStockProducts.length > 0 ? "warning" : "default"}
        />
      </div>

      {/* Lower Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Low Stock Alerts */}
        <div className="lg:col-span-1 card-dashboard">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <h3 className="font-display font-semibold text-foreground">Low Stock Alerts</h3>
          </div>
          {lowStockProducts.length > 0 ? (
            <div className="space-y-3">
              {lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-warning/5 border border-warning/20"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{product.name}</p>
                    <p className="text-sm text-warning">
                      {product.currentStock} / {product.minStock} {product.unit}
                    </p>
                  </div>
                  <span className="badge-warning">Low</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">All products are well stocked</p>
          )}
        </div>

        {/* Tomorrow's Orders */}
        <div className="lg:col-span-1 card-dashboard">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-accent" />
            <h3 className="font-display font-semibold text-foreground">Upcoming Orders</h3>
          </div>
          {futureOrders.length > 0 ? (
            <div className="space-y-3">
              {futureOrders.map((order) => {
                const product = products.find((p) => p.id === order.productId);
                return (
                  <div
                    key={order.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-accent/5 border border-accent/20"
                  >
                    <img
                      src={product?.image}
                      alt={product?.name}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{product?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.quantity} {product?.unit} • {order.customerType}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-muted-foreground">Delivery</span>
                      <p className="text-sm font-medium text-accent">{order.deliveryDate}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No upcoming orders</p>
          )}
        </div>

        {/* Price Changes */}
        <div className="lg:col-span-1 card-dashboard">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="font-display font-semibold text-foreground">Price Alerts</h3>
          </div>
          <div className="space-y-3">
            {priceChanges.map((item, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  item.isIncrease
                    ? "bg-destructive/5 border border-destructive/20"
                    : "bg-success/5 border border-success/20"
                }`}
              >
                <div className="flex items-center gap-2">
                  {item.isIncrease ? (
                    <TrendingUp className="h-4 w-4 text-destructive" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-success" />
                  )}
                  <span className="font-medium text-foreground">{item.product}</span>
                </div>
                <span
                  className={`font-bold ${
                    item.isIncrease ? "text-destructive" : "text-success"
                  }`}
                >
                  {item.isIncrease ? "+" : ""}₹{item.change}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <a href="/admin/purchase" className="card-dashboard text-center hover:border-primary/40">
          <ShoppingCart className="h-8 w-8 mx-auto text-primary mb-2" />
          <p className="font-medium text-foreground">Add Purchase</p>
        </a>
        <a href="/admin/selling" className="card-dashboard text-center hover:border-primary/40">
          <Receipt className="h-8 w-8 mx-auto text-primary mb-2" />
          <p className="font-medium text-foreground">Add Sale</p>
        </a>
        <a href="/admin/products" className="card-dashboard text-center hover:border-primary/40">
          <Package className="h-8 w-8 mx-auto text-primary mb-2" />
          <p className="font-medium text-foreground">Manage Products</p>
        </a>
        <a href="/" className="card-dashboard text-center hover:border-primary/40">
          <Package className="h-8 w-8 mx-auto text-primary mb-2" />
          <p className="font-medium text-foreground">Customer View</p>
        </a>
      </div>
    </DashboardLayout>
  );
}
