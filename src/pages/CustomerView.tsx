import { products } from "@/lib/data";
import { Link } from "react-router-dom";
import { Package, Phone, MapPin, Clock, ChevronRight, Sparkles, PartyPopper } from "lucide-react";

export default function CustomerView() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
              <Package className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <span className="font-display font-bold text-foreground text-lg">Doodh Dairy</span>
              <p className="text-xs text-muted-foreground">Fresh & Pure</p>
            </div>
          </div>
          <Link to="/login" className="btn-primary text-sm">
            Staff Login
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              Farm Fresh Quality
            </div>
            <h1 className="text-4xl lg:text-6xl font-display font-bold text-foreground mb-6">
              Pure Dairy Products
              <br />
              <span className="gradient-text">Delivered Fresh</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Experience the finest quality dairy products from Doodh Dairy. From fresh milk to pure ghee, we deliver goodness to your doorstep.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#products" className="btn-primary">
                View Products
                <ChevronRight className="h-4 w-4 ml-2" />
              </a>
              <a href="#contact" className="btn-secondary">
                Bulk Orders
              </a>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />
      </section>

      {/* Products Section */}
      <section id="products" className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-4">
              Our Products
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Premium quality dairy products sourced from local farms
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, index) => (
              <div
                key={product.id}
                className="card-product animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="badge-fresh">{product.quality}</span>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-5">
                  <h3 className="text-lg font-display font-semibold text-foreground">
                    {product.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">per {product.unit}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">
                      ₹{product.sellingPrice}
                    </span>
                    <span className="text-sm text-muted-foreground">/{product.unit}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Wedding & Party Orders Section */}
      <section id="contact" className="py-16 lg:py-24 bg-gradient-to-br from-secondary via-background to-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="card-dashboard p-8 lg:p-12">
              <div className="flex flex-col lg:flex-row items-center gap-8">
                <div className="flex-1 text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-warning/10 text-warning text-sm font-medium mb-4">
                    <PartyPopper className="h-4 w-4" />
                    Bulk Orders Available
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-display font-bold text-foreground mb-4">
                    Wedding & Party Orders
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Planning a big event? We supply bulk quantities for weddings, parties, and special occasions. Fresh dairy products delivered on time.
                  </p>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-center gap-3">
                      <div className="h-6 w-6 rounded-full bg-success/10 flex items-center justify-center">
                        <svg className="h-3 w-3 text-success" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      Bulk discounts on large orders
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="h-6 w-6 rounded-full bg-success/10 flex items-center justify-center">
                        <svg className="h-3 w-3 text-success" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      Free delivery for orders above ₹5000
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="h-6 w-6 rounded-full bg-success/10 flex items-center justify-center">
                        <svg className="h-3 w-3 text-success" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      Advance booking for events
                    </li>
                  </ul>
                </div>

                <div className="w-full lg:w-auto">
                  <div className="bg-card rounded-xl p-6 border border-border space-y-4">
                    <h3 className="font-display font-semibold text-foreground text-center">
                      Contact Us
                    </h3>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Phone className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium text-foreground">+91 98765 43210</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <MapPin className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Address</p>
                        <p className="font-medium text-foreground">Main Market Road</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Clock className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Hours</p>
                        <p className="font-medium text-foreground">6 AM - 9 PM</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
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
