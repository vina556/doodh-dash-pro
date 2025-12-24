import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getProductImage } from "@/lib/data";
import { supabase } from "@/integrations/supabase/client";
import { 
  Package, 
  ArrowLeft, 
  Phone, 
  MessageCircle, 
  Star, 
  Truck, 
  Shield, 
  Leaf,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface PublicProduct {
  id: string;
  name: string;
  unit: string;
  selling_price: number;
  image_url: string | null;
  quality: string;
}

// Product descriptions for each dairy product
const productDescriptions: Record<string, { description: string; benefits: string[]; storage: string }> = {
  "Milk": {
    description: "Our fresh milk is sourced daily from local dairy farms, ensuring the highest quality and freshness. Rich in calcium and essential nutrients, it's perfect for your daily consumption.",
    benefits: ["High in Calcium", "Rich in Protein", "Vitamin D Fortified", "Farm Fresh Daily"],
    storage: "Keep refrigerated at 4°C. Best consumed within 2-3 days of purchase."
  },
  "Fresh Milk": {
    description: "Pure, unprocessed milk straight from the farm. Our fresh milk retains all natural nutrients and has a rich, creamy taste that you'll love.",
    benefits: ["100% Natural", "No Preservatives", "Rich Creamy Taste", "Daily Fresh Supply"],
    storage: "Keep refrigerated at 4°C. Best consumed within 2-3 days of purchase."
  },
  "Paneer": {
    description: "Soft, fresh cottage cheese made from our pure milk. Perfect for Indian cuisine, our paneer is known for its smooth texture and mild flavor.",
    benefits: ["High Protein", "Low Carbs", "Calcium Rich", "Vegetarian Protein"],
    storage: "Keep refrigerated. Best consumed within 5-7 days. Can be frozen for longer storage."
  },
  "Butter": {
    description: "Creamy, golden butter churned from fresh cream. Our butter has a rich, natural flavor perfect for cooking, baking, or simply spreading on bread.",
    benefits: ["Pure Cream", "No Additives", "Rich Flavor", "Natural Color"],
    storage: "Keep refrigerated. Can be stored for up to 2 weeks at 4°C."
  },
  "Ghee": {
    description: "Pure clarified butter made using traditional methods. Our ghee has a rich aroma and is perfect for cooking, frying, and religious ceremonies.",
    benefits: ["High Smoke Point", "Ayurvedic Benefits", "Long Shelf Life", "Traditional Recipe"],
    storage: "Can be stored at room temperature for up to 3 months. No refrigeration needed."
  },
  "Pure Ghee": {
    description: "Premium quality ghee made from pure cow's milk. Handcrafted using age-old techniques for the authentic taste and aroma.",
    benefits: ["100% Pure", "Desi Cow Milk", "No Chemicals", "Traditional Method"],
    storage: "Can be stored at room temperature for up to 3 months. No refrigeration needed."
  },
  "Curd": {
    description: "Thick, creamy curd made fresh daily. Our dahi is probiotic-rich and perfect for consumption or making buttermilk and lassi.",
    benefits: ["Probiotic Rich", "Good for Digestion", "Cooling Effect", "Fresh Daily"],
    storage: "Keep refrigerated at 4°C. Best consumed within 3-4 days."
  },
  "Cream": {
    description: "Rich, thick cream skimmed from fresh milk. Perfect for making desserts, adding to curries, or whipping for special occasions.",
    benefits: ["Rich & Thick", "Perfect for Desserts", "No Stabilizers", "Fresh Quality"],
    storage: "Keep refrigerated. Best consumed within 5-7 days of purchase."
  },
  "Fresh Cream": {
    description: "Premium quality fresh cream with high fat content. Ideal for making butter at home, desserts, or adding richness to your dishes.",
    benefits: ["High Fat Content", "Multipurpose Use", "No Preservatives", "Whips Perfectly"],
    storage: "Keep refrigerated. Best consumed within 5-7 days of purchase."
  }
};

const defaultProductInfo = {
  description: "Premium quality dairy product sourced from local farms. Made with care and delivered fresh to ensure the best quality for our customers.",
  benefits: ["Fresh Quality", "Locally Sourced", "No Preservatives", "Daily Supply"],
  storage: "Keep refrigerated for best results. Check packaging for specific storage instructions."
};

export default function ProductDetail() {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<PublicProduct | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('public-products');
      
      if (error) throw error;
      
      const products = data?.products || [];
      const foundProduct = products.find((p: PublicProduct) => p.id === productId);
      setProduct(foundProduct || null);
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  const productInfo = product 
    ? productDescriptions[product.name] || defaultProductInfo 
    : defaultProductInfo;

  const handleWhatsAppOrder = () => {
    if (!product) return;
    const message = `Hi! I'm interested in ordering ${product.name} (₹${product.selling_price}/${product.unit}). Please share more details.`;
    window.open(`https://wa.me/919876543210?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleCallOrder = () => {
    window.open('tel:+919876543210', '_self');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <Link to="/" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Products</span>
            </Link>
          </div>
        </header>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-display font-bold text-foreground mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-8">The product you're looking for doesn't exist.</p>
          <Link to="/" className="btn-primary">
            View All Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span className="hidden sm:inline">Back to Products</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Package className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-foreground">Doodh Dairy</span>
          </div>
        </div>
      </header>

      {/* Product Detail */}
      <main className="container mx-auto px-4 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Image */}
          <div className="relative">
            <div className="aspect-square rounded-2xl overflow-hidden bg-muted shadow-lg">
              <img
                src={getProductImage(product.name)}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute top-4 left-4">
              <span className="badge-fresh text-sm px-3 py-1.5">Fresh</span>
            </div>
            <div className="absolute top-4 right-4">
              <div className="flex items-center gap-1 bg-card/90 backdrop-blur-sm rounded-full px-3 py-1.5">
                <Star className="h-4 w-4 text-warning fill-warning" />
                <span className="text-sm font-medium text-foreground">4.8</span>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-2">
                {product.name}
              </h1>
              <p className="text-muted-foreground">Premium Quality • {product.quality}</p>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-primary">₹{product.selling_price}</span>
              <span className="text-lg text-muted-foreground">per {product.unit}</span>
            </div>

            <p className="text-muted-foreground leading-relaxed">
              {productInfo.description}
            </p>

            {/* Benefits */}
            <div className="grid grid-cols-2 gap-3">
              {productInfo.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <Leaf className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm font-medium text-foreground">{benefit}</span>
                </div>
              ))}
            </div>

            {/* Storage Info */}
            <div className="p-4 rounded-xl bg-muted/50 border border-border">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Storage Instructions</h3>
                  <p className="text-sm text-muted-foreground">{productInfo.storage}</p>
                </div>
              </div>
            </div>

            {/* Order Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleWhatsAppOrder}
                className="flex-1 bg-[#25D366] hover:bg-[#20BA5A] text-white"
                size="lg"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Order via WhatsApp
              </Button>
              <Button 
                onClick={handleCallOrder}
                variant="outline"
                size="lg"
                className="flex-1"
              >
                <Phone className="h-5 w-5 mr-2" />
                Call to Order
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
              <div className="text-center">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <Truck className="h-5 w-5 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground">Free Delivery</p>
                <p className="text-sm font-medium text-foreground">Above ₹500</p>
              </div>
              <div className="text-center">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground">Quality</p>
                <p className="text-sm font-medium text-foreground">Guaranteed</p>
              </div>
              <div className="text-center">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <Leaf className="h-5 w-5 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground">100%</p>
                <p className="text-sm font-medium text-foreground">Natural</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-border mt-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Package className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-foreground">Doodh Dairy</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 Doodh Dairy. All rights reserved. Fresh & Pure Dairy Products.
          </p>
        </div>
      </footer>
    </div>
  );
}
