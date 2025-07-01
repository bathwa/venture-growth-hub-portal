
-- First, let's check what policies already exist and create only the missing ones
-- Drop any conflicting policies that might not work correctly
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view other users' basic info" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;

-- Create the correct policies for user registration and management
CREATE POLICY "Users can insert their own profile during signup" 
  ON public.users 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own profile" 
  ON public.users 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.users 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Allow users to view basic info of other users (needed for platform functionality)
CREATE POLICY "Users can view other users basic info" 
  ON public.users 
  FOR SELECT 
  USING (true);

-- Allow admins to manage all users
CREATE POLICY "Admins can manage all users" 
  ON public.users 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
