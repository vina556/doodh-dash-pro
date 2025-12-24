-- =============================================
-- COMPREHENSIVE RLS POLICY FIX FOR ALL TABLES
-- =============================================

-- 1. FIX: profiles table - require authentication
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Founders can manage all profiles" ON public.profiles;

CREATE POLICY "Authenticated users can view own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Founders can manage all profiles" 
ON public.profiles 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'founder'::app_role));

-- 2. FIX: products table - hide purchase_price from public, only show via edge function
DROP POLICY IF EXISTS "Public can view products" ON public.products;
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;

-- Staff can see all product details including purchase price
CREATE POLICY "Staff can view all products" 
ON public.products 
FOR SELECT 
TO authenticated
USING (is_staff(auth.uid()));

-- Admins can manage products
CREATE POLICY "Admins can manage products" 
ON public.products 
FOR ALL 
TO authenticated
USING (is_admin_or_manager(auth.uid()));

-- 3. FIX: purchase_entries - add UPDATE/DELETE protection
CREATE POLICY "Admins can update purchases" 
ON public.purchase_entries 
FOR UPDATE 
TO authenticated
USING (is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins can delete purchases" 
ON public.purchase_entries 
FOR DELETE 
TO authenticated
USING (is_admin_or_manager(auth.uid()));

-- 4. FIX: selling_entries - add UPDATE/DELETE protection  
CREATE POLICY "Admins can update sales" 
ON public.selling_entries 
FOR UPDATE 
TO authenticated
USING (is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins can delete sales" 
ON public.selling_entries 
FOR DELETE 
TO authenticated
USING (is_admin_or_manager(auth.uid()));

-- 5. Ensure user_roles policies require authentication
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
DROP POLICY IF EXISTS "Founders can manage all roles" ON public.user_roles;

CREATE POLICY "Authenticated users can view own role" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Founders can manage all roles" 
ON public.user_roles 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'founder'::app_role));

-- 6. Ensure activity_logs policies require authentication
DROP POLICY IF EXISTS "Admins can view all logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Staff can insert logs" ON public.activity_logs;

CREATE POLICY "Admins can view all logs" 
ON public.activity_logs 
FOR SELECT 
TO authenticated
USING (is_admin_or_manager(auth.uid()));

CREATE POLICY "Staff can insert logs" 
ON public.activity_logs 
FOR INSERT 
TO authenticated
WITH CHECK (is_staff(auth.uid()));

-- 7. Ensure daily_summaries policies require authentication
DROP POLICY IF EXISTS "Admins can manage summaries" ON public.daily_summaries;

CREATE POLICY "Admins can manage summaries" 
ON public.daily_summaries 
FOR ALL 
TO authenticated
USING (is_admin_or_manager(auth.uid()));

-- 8. Ensure price_history policies require authentication
DROP POLICY IF EXISTS "Admins can manage price history" ON public.price_history;

CREATE POLICY "Admins can manage price history" 
ON public.price_history 
FOR ALL 
TO authenticated
USING (is_admin_or_manager(auth.uid()));

-- 9. Ensure purchase_entries SELECT policies require authentication
DROP POLICY IF EXISTS "Admins can view all purchases" ON public.purchase_entries;
DROP POLICY IF EXISTS "Workers can view own purchases" ON public.purchase_entries;
DROP POLICY IF EXISTS "Staff can insert purchases" ON public.purchase_entries;

CREATE POLICY "Admins can view all purchases" 
ON public.purchase_entries 
FOR SELECT 
TO authenticated
USING (is_admin_or_manager(auth.uid()));

CREATE POLICY "Workers can view own purchases" 
ON public.purchase_entries 
FOR SELECT 
TO authenticated
USING ((auth.uid() = entered_by) AND has_role(auth.uid(), 'worker'::app_role));

CREATE POLICY "Staff can insert purchases" 
ON public.purchase_entries 
FOR INSERT 
TO authenticated
WITH CHECK (is_staff(auth.uid()));

-- 10. Ensure selling_entries policies require authentication  
DROP POLICY IF EXISTS "Admins can view all sales" ON public.selling_entries;
DROP POLICY IF EXISTS "Workers can view own sales" ON public.selling_entries;
DROP POLICY IF EXISTS "Staff can insert sales" ON public.selling_entries;

CREATE POLICY "Admins can view all sales" 
ON public.selling_entries 
FOR SELECT 
TO authenticated
USING (is_admin_or_manager(auth.uid()));

CREATE POLICY "Workers can view own sales" 
ON public.selling_entries 
FOR SELECT 
TO authenticated
USING ((auth.uid() = entered_by) AND has_role(auth.uid(), 'worker'::app_role));

CREATE POLICY "Staff can insert sales" 
ON public.selling_entries 
FOR INSERT 
TO authenticated
WITH CHECK (is_staff(auth.uid()));