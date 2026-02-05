-- ═══════════════════════════════════════════════════════════════════════════════════════
-- TAXENGINE SUPABASE SETUP SQL
-- ═══════════════════════════════════════════════════════════════════════════════════════
-- Run this SQL in Supabase Dashboard > SQL Editor
-- This sets up the auth trigger and RLS policies
-- ═══════════════════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════════════════
-- 1. AUTO-CREATE USER PROFILE ON SIGNUP
-- ═══════════════════════════════════════════════════════════════════════════════════════
-- This trigger automatically creates a TaxEngineUsers record when someone signs up

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public."TaxEngineUsers" (
    uuid,
    email,
    "firstName",
    "lastName",
    role,
    status,
    "ssoProvider",
    "ssoProviderId",
    "createdAt",
    "updatedAt"
  )
  VALUES (
    NEW.id::text,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'firstName', NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'lastName', NEW.raw_user_meta_data->>'last_name', ''),
    'CLAIM_PROCESSOR',  -- Default role for new signups
    'ACTIVE',
    CASE 
      WHEN NEW.raw_app_meta_data->>'provider' IS NOT NULL 
      THEN NEW.raw_app_meta_data->>'provider' 
      ELSE NULL 
    END,
    CASE 
      WHEN NEW.raw_app_meta_data->>'provider_id' IS NOT NULL 
      THEN NEW.raw_app_meta_data->>'provider_id' 
      ELSE NULL 
    END,
    NOW(),
    NOW()
  )
  ON CONFLICT (uuid) DO UPDATE SET
    email = EXCLUDED.email,
    "updatedAt" = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ═══════════════════════════════════════════════════════════════════════════════════════
-- 2. ROW LEVEL SECURITY (RLS) POLICIES
-- ═══════════════════════════════════════════════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE "TaxEngineUsers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Permissions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Templates" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ClaimPacks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Submissions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ClientCompanies" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ClientContacts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ClientAccountant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "GovernmentGateway" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Invoices" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AccountingPeriods" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Ct600Groups" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Ct600AlphaDatasets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Files" ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════════════════════════════
-- TaxEngineUsers Policies
-- ═══════════════════════════════════════════════════════════════════════════════════════

-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON "TaxEngineUsers"
  FOR SELECT USING (auth.uid()::text = uuid);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON "TaxEngineUsers"
  FOR UPDATE USING (auth.uid()::text = uuid);

-- Admins can view all users
CREATE POLICY "Admins can view all users" ON "TaxEngineUsers"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "TaxEngineUsers" 
      WHERE uuid = auth.uid()::text AND role = 'ADMINISTRATOR'
    )
  );

-- Admins can update all users
CREATE POLICY "Admins can update all users" ON "TaxEngineUsers"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM "TaxEngineUsers" 
      WHERE uuid = auth.uid()::text AND role = 'ADMINISTRATOR'
    )
  );

-- Admins can insert new users
CREATE POLICY "Admins can insert users" ON "TaxEngineUsers"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM "TaxEngineUsers" 
      WHERE uuid = auth.uid()::text AND role = 'ADMINISTRATOR'
    )
  );

-- ═══════════════════════════════════════════════════════════════════════════════════════
-- General Access Policies (for authenticated users)
-- ═══════════════════════════════════════════════════════════════════════════════════════

-- All authenticated users can read these tables
CREATE POLICY "Authenticated users can view" ON "Permissions"
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view" ON "Templates"
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view" ON "ClientCompanies"
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view" ON "ClientContacts"
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view" ON "ClientAccountant"
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view" ON "AccountingPeriods"
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view" ON "ClaimPacks"
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view" ON "Ct600Groups"
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view" ON "Ct600AlphaDatasets"
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view" ON "Files"
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view" ON "Submissions"
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view" ON "Invoices"
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- ═══════════════════════════════════════════════════════════════════════════════════════
-- Admin-Only Policies
-- ═══════════════════════════════════════════════════════════════════════════════════════

-- Only admins can view/modify Government Gateway
CREATE POLICY "Admins can view gateway" ON "GovernmentGateway"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "TaxEngineUsers" 
      WHERE uuid = auth.uid()::text AND role = 'ADMINISTRATOR'
    )
  );

CREATE POLICY "Admins can modify gateway" ON "GovernmentGateway"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "TaxEngineUsers" 
      WHERE uuid = auth.uid()::text AND role = 'ADMINISTRATOR'
    )
  );

-- Only admins can view audit log
CREATE POLICY "Admins can view audit log" ON "AuditLog"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "TaxEngineUsers" 
      WHERE uuid = auth.uid()::text AND role = 'ADMINISTRATOR'
    )
  );

-- Anyone authenticated can insert audit log (for tracking their actions)
CREATE POLICY "Authenticated users can insert audit" ON "AuditLog"
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ═══════════════════════════════════════════════════════════════════════════════════════
-- Write Policies for Claim Processors and Admins
-- ═══════════════════════════════════════════════════════════════════════════════════════

-- Claim Processors and Admins can create/edit claims
CREATE POLICY "Users can modify claims" ON "ClaimPacks"
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can modify client companies" ON "ClientCompanies"
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can modify client contacts" ON "ClientContacts"
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can modify accounting periods" ON "AccountingPeriods"
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can modify CT600 groups" ON "Ct600Groups"
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can modify CT600 alpha datasets" ON "Ct600AlphaDatasets"
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can modify files" ON "Files"
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Only admins can submit (modify submissions)
CREATE POLICY "Admins can modify submissions" ON "Submissions"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "TaxEngineUsers" 
      WHERE uuid = auth.uid()::text AND role = 'ADMINISTRATOR'
    )
  );

-- Only admins can modify templates
CREATE POLICY "Admins can modify templates" ON "Templates"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "TaxEngineUsers" 
      WHERE uuid = auth.uid()::text AND role = 'ADMINISTRATOR'
    )
  );

-- Only admins can modify invoices
CREATE POLICY "Admins can modify invoices" ON "Invoices"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "TaxEngineUsers" 
      WHERE uuid = auth.uid()::text AND role = 'ADMINISTRATOR'
    )
  );

-- ═══════════════════════════════════════════════════════════════════════════════════════
-- 3. HELPER FUNCTION: Check if user is admin
-- ═══════════════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM "TaxEngineUsers" 
    WHERE uuid = auth.uid()::text AND role = 'ADMINISTRATOR'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ═══════════════════════════════════════════════════════════════════════════════════════
-- 4. DONE!
-- ═══════════════════════════════════════════════════════════════════════════════════════
-- Now create your super admin user:
-- 1. Go to Authentication > Users > Add user
-- 2. Enter email and password
-- 3. Copy the user UUID
-- 4. Run this SQL (replace YOUR_UUID_HERE):
--
-- UPDATE "TaxEngineUsers" 
-- SET role = 'ADMINISTRATOR', status = 'ACTIVE' 
-- WHERE uuid = 'YOUR_UUID_HERE';
--
-- ═══════════════════════════════════════════════════════════════════════════════════════
