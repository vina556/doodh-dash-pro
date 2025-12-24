import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Package, User, UserCog, Users, Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const signupSchema = loginSchema.extend({
  fullName: z.string().trim().min(2, { message: "Name must be at least 2 characters" }),
});

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { signIn, signUp, loading, role } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  if (!loading && role) {
    if (role === "worker") {
      navigate("/worker");
    } else {
      navigate("/admin");
    }
  }

  const validateForm = () => {
    const schema = isSignUp ? signupSchema : loginSchema;
    const data = isSignUp 
      ? { email, password, fullName }
      : { email, password };
    
    const result = schema.safeParse(data);
    
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          newErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(newErrors);
      return false;
    }
    
    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("This email is already registered. Please sign in.");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Account created! You can now sign in.");
          setIsSignUp(false);
          setPassword("");
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Invalid email or password");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Welcome back!");
        }
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const roles = [
    {
      title: "Founder",
      description: "Full access to all features including profit",
      icon: UserCog,
      color: "bg-primary",
    },
    {
      title: "Manager",
      description: "Manage products, purchases and sales",
      icon: User,
      color: "bg-accent",
    },
    {
      title: "Worker",
      description: "Entry only - no price visibility",
      icon: Users,
      color: "bg-success",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

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
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            {isSignUp ? "Sign up to get started" : "Sign in to continue"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                      errors.fullName ? "border-destructive" : "border-border"
                    } bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all`}
                  />
                </div>
                {errors.fullName && (
                  <p className="text-sm text-destructive mt-1">{errors.fullName}</p>
                )}
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                    errors.email ? "border-destructive" : "border-border"
                  } bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all`}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className={`w-full pl-10 pr-12 py-3 rounded-xl border ${
                    errors.password ? "border-destructive" : "border-border"
                  } bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive mt-1">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground"></div>
              ) : (
                isSignUp ? "Create Account" : "Sign In"
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrors({});
              }}
              className="text-sm text-primary hover:underline"
            >
              {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
            </button>
          </div>

          {/* Role Info */}
          {!isSignUp && (
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground mb-4 text-center">User Roles</p>
              <div className="space-y-2">
                {roles.map((item) => (
                  <div
                    key={item.title}
                    className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
                  >
                    <div className={`h-8 w-8 rounded-lg ${item.color} flex items-center justify-center`}>
                      <item.icon className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-foreground">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customer Link */}
          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground mb-3">Looking to buy dairy products?</p>
            <button
              onClick={() => navigate("/")}
              className="btn-secondary w-full flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              View Products
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
