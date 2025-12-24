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
    console.log('Fetching public products...');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Fetch products with only public fields (no purchase price, no confidential data)
    const { data: products, error } = await supabaseClient
      .from('products')
      .select('id, name, unit, selling_price, image_url, is_active')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching products:', error);
      throw error;
    }

    console.log(`Fetched ${products?.length || 0} products`);

    // Return only safe, public data
    const publicProducts = products?.map(p => ({
      id: p.id,
      name: p.name,
      unit: p.unit,
      selling_price: p.selling_price,
      image_url: p.image_url,
      quality: 'Fresh & Pure', // Quality badge
    })) || [];

    return new Response(
      JSON.stringify({
        products: publicProducts,
        total: publicProducts.length,
        contact: {
          business: 'Doodh Dairy',
          message: 'For wedding & party bulk orders, please contact us!',
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
