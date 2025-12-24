import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { DashboardCard } from "@/components/DashboardCard";
import { Product, getProductImage } from "@/lib/data";
import { supabase } from "@/integrations/supabase/client";
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
  const [products, setProducts] = useState<Product[]>([]);
  const [todayPurchases, setTodayPurchases] = useState<number>(0);
  const [todaySales, setTodaySales] = useState<number>(0);
  const [purchaseCount, setPurchaseCount] = useState<number>(0);
  const [salesCount, setSalesCount] = useState<number>(0);
  const [futureOrders, setFutureOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch products
      const { data: productsData } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true);
      
      if (productsData) {
        setProducts(productsData as Product[]);
      }

      // Fetch today's purchases
      const { data: purchasesData } = await supabase
        .from("purchase_entries")
        .select("quantity, purchase_price")
        .eq("date", today);

      if (purchasesData) {
        const total = purchasesData.reduce((sum, p) => sum + (p.quantity * p.purchase_price), 0);
        setTodayPurchases(total);
        setPurchaseCount(purchasesData.length);
      }

      // Fetch today's sales
      const { data: salesData } = await supabase
        .from("selling_entries")
        .select("quantity, selling_price")
        .eq("date", today)
        .eq("is_future_order", false);

      if (salesData) {
        const total = salesData.reduce((sum, s) => sum + (s.quantity * s.selling_price), 0);
        setTodaySales(total);
        setSalesCount(salesData.length);
      }

      // Fetch future orders
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split("T")[0];

      const { data: ordersData } = await supabase
        .from("selling_entries")
        .select(`
          id, quantity, customer_type, delivery_date,
          products (id, name, unit)
        `)
        .eq("is_future_order", true)
        .eq("is_fulfilled", false)
        .gte("delivery_date", today)
        .order("delivery_date", { ascending: true })
        .limit(5);

      if (ordersData) {
        setFutureOrders(ordersData);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalProfit = todaySales - todayPurchases;
  const lowStockProducts = products.filter((p) => p.current_stock <= p.minimum_stock);

  // Price changes (mock data for now - can be fetched from price_history later)
  const priceChanges = [
    { product: "Fresh Milk", change: 5, isIncrease: true },
    { product: "Ghee", change: -10, isIncrease: false },
  ];

  if (loading) {
    return (
      <DashboardLayout title="Dashboard" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard" subtitle="Overview of today's business">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard
          title="Today's Purchases"
          value={`₹${todayPurchases.toLocaleString()}`}
          icon={ShoppingCart}
          subtitle={`${purchaseCount} transactions`}
          trend={{ value: 12, isPositive: true }}
        />
        <DashboardCard
          title="Today's Sales"
          value={`₹${todaySales.toLocaleString()}`}
          icon={Receipt}
          subtitle={`${salesCount} orders`}
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
                    src={getProductImage(product.name)}
                    alt={product.name}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{product.name}</p>
                    <p className="text-sm text-warning">
                      {product.current_stock} / {product.minimum_stock} {product.unit}
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
              {futureOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-accent/5 border border-accent/20"
                >
                  <img
                    src={getProductImage(order.products?.name || "")}
                    alt={order.products?.name}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{order.products?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.quantity} {order.products?.unit} • {order.customer_type}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground">Delivery</span>
                    <p className="text-sm font-medium text-accent">{order.delivery_date}</p>
                  </div>
                </div>
              ))}
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
