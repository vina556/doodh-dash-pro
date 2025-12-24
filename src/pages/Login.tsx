import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/lib/data";
import { Package, User, UserCog, Users } from "lucide-react";

export default function Login() {
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const roles = [
    {
      role: "admin" as const,
      title: "Admin",
      description: "Full access to all features",
      icon: UserCog,
      color: "bg-primary",
    },
    {
      role: "manager" as const,
      title: "Manager",
      description: "Manage products and orders",
      icon: User,
      color: "bg-accent",
    },
    {
      role: "worker" as const,
      title: "Worker",
      description: "View products and entry",
      icon: Users,
      color: "bg-success",
    },
  ];

  const handleLogin = () => {
    if (selectedRole) {
      login(selectedRole);
      if (selectedRole === "worker") {
        navigate("/worker");
      } else {
        navigate("/admin");
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary mb-4">
            <Package className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground">Doodh Dairy</h1>
          <p className="text-muted-foreground mt-2">Fresh & Pure Dairy Products</p>
        </div>

        {/* Login Card */}
        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm animate-fade-in delay-100">
          <h2 className="text-xl font-display font-semibold text-foreground mb-2">
            Welcome Back
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Select your role to continue
          </p>

          {/* Role Selection */}
          <div className="space-y-3 mb-6">
            {roles.map((item) => (
              <button
                key={item.role}
                onClick={() => setSelectedRole(item.role)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 ${
                  selectedRole === item.role
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                }`}
              >
                <div className={`h-12 w-12 rounded-xl ${item.color} flex items-center justify-center`}>
                  <item.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-foreground">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                {selectedRole === item.role && (
                  <div className="ml-auto h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                    <svg className="h-3 w-3 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            disabled={!selectedRole}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue to Dashboard
          </button>

          {/* Customer Link */}
          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground mb-3">Looking to buy dairy products?</p>
            <button
              onClick={() => navigate("/")}
              className="btn-secondary w-full"
            >
              View Products
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
