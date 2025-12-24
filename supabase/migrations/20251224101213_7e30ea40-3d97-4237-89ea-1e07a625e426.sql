-- Fix user_roles table: Add explicit authentication requirement to all policies
-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can view own role" ON public.user_roles;
DROP POLICY IF EXISTS "Founders can manage all roles" ON public.user_roles;

-- Create new policies with explicit authentication checks
-- Policy 1: Authenticated users can only view their own role
CREATE POLICY "Authenticated users can view own role"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy 2: Founders can manage all roles (with explicit auth check)
CREATE POLICY "Founders can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'founder'::app_role))
WITH CHECK (has_role(auth.uid(), 'founder'::app_role));

-- Fix profiles table: Add explicit authentication requirement
-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Founders can manage all profiles" ON public.profiles;

-- Create new policies with explicit TO authenticated
-- Policy 1: Authenticated users can view their own profile
CREATE POLICY "Authenticated users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy 2: Authenticated users can update their own profile
CREATE POLICY "Authenticated users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Policy 3: Founders can manage all profiles
CREATE POLICY "Founders can manage all profiles"
ON public.profiles
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'founder'::app_role))
WITH CHECK (has_role(auth.uid(), 'founder'::app_role));