import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verify user is authenticated and has admin/manager role
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.log('Authentication failed:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin or manager
    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleError || !roleData || !['founder', 'manager'].includes(roleData.role)) {
      console.log('Access denied for user:', user.id, 'Role:', roleData?.role);
      return new Response(
        JSON.stringify({ error: 'Access denied. Admin or Manager role required.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0];

    console.log(`Processing ${action} report for date: ${date}`);

    let responseData;

    switch (action) {
      case 'daily-profit':
        responseData = await getDailyProfit(supabaseClient, date);
        break;
      case 'monthly-profit':
        const month = url.searchParams.get('month') || new Date().toISOString().slice(0, 7);
        responseData = await getMonthlyProfit(supabaseClient, month);
        break;
      case 'purchase-summary':
        responseData = await getPurchaseSummary(supabaseClient, date);
        break;
      case 'selling-summary':
        responseData = await getSellingSummary(supabaseClient, date);
        break;
      case 'worker-activity':
        const workerId = url.searchParams.get('worker_id');
        responseData = await getWorkerActivity(supabaseClient, date, workerId);
        break;
      case 'generate-hash':
        responseData = await generateDailyHash(supabaseClient, date);
        break;
      case 'low-stock':
        responseData = await getLowStock(supabaseClient);
        break;
      case 'future-orders':
        const targetDate = url.searchParams.get('target_date') || getTomorrowDate();
        responseData = await getFutureOrders(supabaseClient, targetDate);
        break;
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action. Valid actions: daily-profit, monthly-profit, purchase-summary, selling-summary, worker-activity, generate-hash, low-stock, future-orders' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    console.log(`${action} completed successfully`);
    return new Response(
      JSON.stringify(responseData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing request:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function getTomorrowDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}

async function getDailyProfit(supabase: any, date: string) {
  // Get all purchases for the date
  const { data: purchases, error: purchaseError } = await supabase
    .from('purchase_entries')
    .select('quantity, purchase_price, product_id')
    .eq('date', date);

  if (purchaseError) throw purchaseError;

  // Get all sales for the date
  const { data: sales, error: salesError } = await supabase
    .from('selling_entries')
    .select('quantity, selling_price, product_id')
    .eq('date', date)
    .eq('is_future_order', false);

  if (salesError) throw salesError;

  const totalPurchase = purchases?.reduce((sum: number, p: any) => sum + (p.quantity * p.purchase_price), 0) || 0;
  const totalSales = sales?.reduce((sum: number, s: any) => sum + (s.quantity * s.selling_price), 0) || 0;
  const profit = totalSales - totalPurchase;

  return {
    date,
    total_purchase: totalPurchase,
    total_sales: totalSales,
    profit,
    purchase_entries: purchases?.length || 0,
    sales_entries: sales?.length || 0,
  };
}

async function getMonthlyProfit(supabase: any, month: string) {
  const startDate = `${month}-01`;
  const endDate = new Date(parseInt(month.split('-')[0]), parseInt(month.split('-')[1]), 0)
    .toISOString().split('T')[0];

  const { data: purchases, error: purchaseError } = await supabase
    .from('purchase_entries')
    .select('quantity, purchase_price, date')
    .gte('date', startDate)
    .lte('date', endDate);

  if (purchaseError) throw purchaseError;

  const { data: sales, error: salesError } = await supabase
    .from('selling_entries')
    .select('quantity, selling_price, date')
    .gte('date', startDate)
    .lte('date', endDate)
    .eq('is_future_order', false);

  if (salesError) throw salesError;

  const totalPurchase = purchases?.reduce((sum: number, p: any) => sum + (p.quantity * p.purchase_price), 0) || 0;
  const totalSales = sales?.reduce((sum: number, s: any) => sum + (s.quantity * s.selling_price), 0) || 0;
  const profit = totalSales - totalPurchase;

  // Group by date
  const dailyData: Record<string, { purchase: number; sales: number }> = {};
  purchases?.forEach((p: any) => {
    if (!dailyData[p.date]) dailyData[p.date] = { purchase: 0, sales: 0 };
    dailyData[p.date].purchase += p.quantity * p.purchase_price;
  });
  sales?.forEach((s: any) => {
    if (!dailyData[s.date]) dailyData[s.date] = { purchase: 0, sales: 0 };
    dailyData[s.date].sales += s.quantity * s.selling_price;
  });

  return {
    month,
    total_purchase: totalPurchase,
    total_sales: totalSales,
    profit,
    daily_breakdown: Object.entries(dailyData).map(([date, data]) => ({
      date,
      purchase: data.purchase,
      sales: data.sales,
      profit: data.sales - data.purchase,
    })).sort((a, b) => a.date.localeCompare(b.date)),
  };
}

async function getPurchaseSummary(supabase: any, date: string) {
  const { data, error } = await supabase
    .from('purchase_entries')
    .select(`
      id, quantity, purchase_price, supplier_name, created_at,
      products (id, name, unit),
      profiles:entered_by (full_name)
    `)
    .eq('date', date)
    .order('created_at', { ascending: false });

  if (error) throw error;

  const total = data?.reduce((sum: number, p: any) => sum + (p.quantity * p.purchase_price), 0) || 0;

  return {
    date,
    entries: data || [],
    total_amount: total,
    total_entries: data?.length || 0,
  };
}

async function getSellingSummary(supabase: any, date: string) {
  const { data, error } = await supabase
    .from('selling_entries')
    .select(`
      id, quantity, selling_price, customer_type, delivery_date, is_future_order, is_fulfilled, created_at,
      products (id, name, unit),
      profiles:entered_by (full_name)
    `)
    .eq('date', date)
    .order('created_at', { ascending: false });

  if (error) throw error;

  const total = data?.reduce((sum: number, s: any) => sum + (s.quantity * s.selling_price), 0) || 0;
  const byCustomerType = data?.reduce((acc: Record<string, number>, s: any) => {
    acc[s.customer_type] = (acc[s.customer_type] || 0) + (s.quantity * s.selling_price);
    return acc;
  }, {});

  return {
    date,
    entries: data || [],
    total_amount: total,
    total_entries: data?.length || 0,
    by_customer_type: byCustomerType || {},
  };
}

async function getWorkerActivity(supabase: any, date: string, workerId?: string | null) {
  let query = supabase
    .from('activity_logs')
    .select(`
      id, action, table_name, details, created_at,
      profiles:user_id (full_name)
    `)
    .gte('created_at', `${date}T00:00:00`)
    .lte('created_at', `${date}T23:59:59`)
    .order('created_at', { ascending: false });

  if (workerId) {
    query = query.eq('user_id', workerId);
  }

  const { data, error } = await query;
  if (error) throw error;

  return {
    date,
    activities: data || [],
    total_activities: data?.length || 0,
  };
}

async function generateDailyHash(supabase: any, date: string) {
  // Get stock summary (without confidential data)
  const { data: products, error: productError } = await supabase
    .from('products')
    .select('id, name, current_stock, unit')
    .eq('is_active', true);

  if (productError) throw productError;

  // Get order summary (without prices)
  const { data: orders, error: orderError } = await supabase
    .from('selling_entries')
    .select('product_id, quantity, customer_type')
    .eq('date', date);

  if (orderError) throw orderError;

  const stockSummary = products?.map((p: any) => ({
    product_id: p.id,
    name: p.name,
    stock: p.current_stock,
    unit: p.unit,
  })) || [];

  const orderSummary = orders?.reduce((acc: Record<string, any>, o: any) => {
    if (!acc[o.product_id]) {
      acc[o.product_id] = { total_quantity: 0, by_type: {} };
    }
    acc[o.product_id].total_quantity += o.quantity;
    acc[o.product_id].by_type[o.customer_type] = 
      (acc[o.product_id].by_type[o.customer_type] || 0) + o.quantity;
    return acc;
  }, {}) || {};

  // Create hash of summaries using SHA-256
  const dataToHash = JSON.stringify({
    date,
    stock: stockSummary,
    orders: orderSummary,
    timestamp: new Date().toISOString(),
  });

  const encoder = new TextEncoder();
  const data = encoder.encode(dataToHash);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  // Store in database
  const { error: insertError } = await supabase
    .from('daily_summaries')
    .upsert({
      summary_date: date,
      stock_summary: stockSummary,
      order_summary: orderSummary,
      summary_hash: hashHex,
    }, { onConflict: 'summary_date' });

  if (insertError) throw insertError;

  console.log(`Generated hash for ${date}: ${hashHex}`);

  return {
    date,
    hash: hashHex,
    stock_summary: stockSummary,
    order_summary: orderSummary,
    message: 'Summary hash generated and stored. Ready for blockchain submission.',
  };
}

async function getLowStock(supabase: any) {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, current_stock, minimum_stock, unit')
    .eq('is_active', true);

  if (error) throw error;

  const lowStockItems = data?.filter((p: any) => p.current_stock <= p.minimum_stock) || [];

  return {
    low_stock_items: lowStockItems,
    total_alerts: lowStockItems.length,
  };
}

async function getFutureOrders(supabase: any, targetDate: string) {
  const { data, error } = await supabase
    .from('selling_entries')
    .select(`
      id, quantity, customer_type, delivery_date, is_fulfilled,
      products (id, name, unit, selling_price)
    `)
    .eq('delivery_date', targetDate)
    .eq('is_future_order', true)
    .eq('is_fulfilled', false);

  if (error) throw error;

  // Group by product
  const byProduct = data?.reduce((acc: Record<string, any>, o: any) => {
    const productId = o.products.id;
    if (!acc[productId]) {
      acc[productId] = {
        product: o.products,
        total_quantity: 0,
        orders: [],
      };
    }
    acc[productId].total_quantity += o.quantity;
    acc[productId].orders.push({
      id: o.id,
      quantity: o.quantity,
      customer_type: o.customer_type,
    });
    return acc;
  }, {}) || {};

  return {
    target_date: targetDate,
    orders: data || [],
    by_product: Object.values(byProduct),
    total_orders: data?.length || 0,
  };
}
