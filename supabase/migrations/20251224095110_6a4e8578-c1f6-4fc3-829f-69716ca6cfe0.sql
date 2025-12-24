-- Create role enum
CREATE TYPE public.app_role AS ENUM ('founder', 'manager', 'worker', 'customer');

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'worker',
  UNIQUE (user_id, role)
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  unit TEXT NOT NULL CHECK (unit IN ('Litre', 'Kg', 'Packet')),
  minimum_stock NUMERIC NOT NULL DEFAULT 0,
  current_stock NUMERIC NOT NULL DEFAULT 0,
  purchase_price NUMERIC NOT NULL,
  selling_price NUMERIC NOT NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create purchase_entries table
CREATE TABLE public.purchase_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  quantity NUMERIC NOT NULL,
  purchase_price NUMERIC NOT NULL,
  supplier_name TEXT,
  entered_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create selling_entries table
CREATE TABLE public.selling_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  quantity NUMERIC NOT NULL,
  selling_price NUMERIC NOT NULL,
  customer_type TEXT NOT NULL CHECK (customer_type IN ('Daily', 'Wedding', 'Party')),
  delivery_date DATE,
  entered_by UUID REFERENCES auth.users(id) NOT NULL,
  is_future_order BOOLEAN DEFAULT false,
  is_fulfilled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create activity_logs table
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create price_history table
CREATE TABLE public.price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  old_purchase_price NUMERIC,
  new_purchase_price NUMERIC,
  old_selling_price NUMERIC,
  new_selling_price NUMERIC,
  changed_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create daily_summaries table (for blockchain-ready hashing)
CREATE TABLE public.daily_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  summary_date DATE NOT NULL UNIQUE,
  stock_summary JSONB NOT NULL,
  order_summary JSONB NOT NULL,
  summary_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.selling_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_summaries ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to check if user is founder or manager
CREATE OR REPLACE FUNCTION public.is_admin_or_manager(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('founder', 'manager')
  )
$$;

-- Function to check if user is authenticated staff
CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('founder', 'manager', 'worker')
  )
$$;

-- RLS Policies for user_roles
CREATE POLICY "Founders can manage all roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'founder'));

CREATE POLICY "Users can view own role" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for profiles
CREATE POLICY "Founders can manage all profiles" ON public.profiles
  FOR ALL USING (public.has_role(auth.uid(), 'founder'));

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for products
CREATE POLICY "Public can view products" ON public.products
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage products" ON public.products
  FOR ALL USING (public.is_admin_or_manager(auth.uid()));

-- RLS Policies for purchase_entries
CREATE POLICY "Staff can insert purchases" ON public.purchase_entries
  FOR INSERT WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Admins can view all purchases" ON public.purchase_entries
  FOR SELECT USING (public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Workers can view own purchases" ON public.purchase_entries
  FOR SELECT USING (auth.uid() = entered_by AND public.has_role(auth.uid(), 'worker'));

-- RLS Policies for selling_entries
CREATE POLICY "Staff can insert sales" ON public.selling_entries
  FOR INSERT WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Admins can view all sales" ON public.selling_entries
  FOR SELECT USING (public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Workers can view own sales" ON public.selling_entries
  FOR SELECT USING (auth.uid() = entered_by AND public.has_role(auth.uid(), 'worker'));

-- RLS Policies for activity_logs
CREATE POLICY "Admins can view all logs" ON public.activity_logs
  FOR SELECT USING (public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Staff can insert logs" ON public.activity_logs
  FOR INSERT WITH CHECK (public.is_staff(auth.uid()));

-- RLS Policies for price_history
CREATE POLICY "Admins can manage price history" ON public.price_history
  FOR ALL USING (public.is_admin_or_manager(auth.uid()));

-- RLS Policies for daily_summaries
CREATE POLICY "Admins can manage summaries" ON public.daily_summaries
  FOR ALL USING (public.is_admin_or_manager(auth.uid()));

-- Trigger to update stock on purchase
CREATE OR REPLACE FUNCTION public.update_stock_on_purchase()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.products
  SET current_stock = current_stock + NEW.quantity,
      updated_at = now()
  WHERE id = NEW.product_id;
  
  INSERT INTO public.activity_logs (user_id, action, table_name, record_id, details)
  VALUES (NEW.entered_by, 'PURCHASE', 'purchase_entries', NEW.id, 
    jsonb_build_object('product_id', NEW.product_id, 'quantity', NEW.quantity));
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_purchase_entry
  AFTER INSERT ON public.purchase_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_stock_on_purchase();

-- Trigger to update stock on sale
CREATE OR REPLACE FUNCTION public.update_stock_on_sale()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_future_order = false THEN
    UPDATE public.products
    SET current_stock = current_stock - NEW.quantity,
        updated_at = now()
    WHERE id = NEW.product_id;
  END IF;
  
  INSERT INTO public.activity_logs (user_id, action, table_name, record_id, details)
  VALUES (NEW.entered_by, 'SALE', 'selling_entries', NEW.id, 
    jsonb_build_object('product_id', NEW.product_id, 'quantity', NEW.quantity, 'customer_type', NEW.customer_type));
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_selling_entry
  AFTER INSERT ON public.selling_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_stock_on_sale();

-- Trigger to track price changes
CREATE OR REPLACE FUNCTION public.track_price_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.purchase_price != NEW.purchase_price OR OLD.selling_price != NEW.selling_price THEN
    INSERT INTO public.price_history (product_id, old_purchase_price, new_purchase_price, old_selling_price, new_selling_price, changed_by)
    VALUES (NEW.id, OLD.purchase_price, NEW.purchase_price, OLD.selling_price, NEW.selling_price, auth.uid());
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_product_price_change
  AFTER UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.track_price_changes();

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'New User'));
  
  -- Assign default worker role (can be changed by founder later)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'worker');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to get low stock products
CREATE OR REPLACE FUNCTION public.get_low_stock_products()
RETURNS TABLE (
  id UUID,
  name TEXT,
  current_stock NUMERIC,
  minimum_stock NUMERIC,
  unit TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, name, current_stock, minimum_stock, unit
  FROM public.products
  WHERE current_stock <= minimum_stock AND is_active = true
$$;

-- Function to get tomorrow's orders
CREATE OR REPLACE FUNCTION public.get_future_orders(target_date DATE DEFAULT CURRENT_DATE + 1)
RETURNS TABLE (
  id UUID,
  product_id UUID,
  product_name TEXT,
  quantity NUMERIC,
  customer_type TEXT,
  delivery_date DATE
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT se.id, se.product_id, p.name, se.quantity, se.customer_type, se.delivery_date
  FROM public.selling_entries se
  JOIN public.products p ON p.id = se.product_id
  WHERE se.delivery_date = target_date AND se.is_future_order = true AND se.is_fulfilled = false
$$;

-- Insert default products
INSERT INTO public.products (name, unit, minimum_stock, current_stock, purchase_price, selling_price, image_url) VALUES
  ('Milk', 'Litre', 50, 100, 45, 60, '/placeholder.svg'),
  ('Paneer', 'Kg', 10, 25, 280, 350, '/placeholder.svg'),
  ('Butter', 'Kg', 5, 15, 400, 500, '/placeholder.svg'),
  ('Ghee', 'Kg', 5, 20, 450, 550, '/placeholder.svg'),
  ('Curd', 'Kg', 20, 40, 35, 50, '/placeholder.svg'),
  ('Cream', 'Litre', 10, 25, 200, 280, '/placeholder.svg');