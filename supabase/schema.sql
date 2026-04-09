-- ============================================================
-- G&A Property Management — Complete Database Schema
-- Paste this entire block into the Supabase SQL Editor and run.
-- ============================================================

-- =====================
-- 1. TABLES
-- =====================

-- Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'tenant' CHECK (role IN ('tenant', 'owner', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Properties
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL DEFAULT 'Richmond',
  state TEXT NOT NULL DEFAULT 'KY',
  zip TEXT NOT NULL DEFAULT '40475',
  property_type TEXT NOT NULL CHECK (property_type IN ('commercial', 'residential')),
  total_sqft INTEGER,
  description TEXT,
  amenities JSONB DEFAULT '[]',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  year_built INTEGER,
  year_renovated INTEGER,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'under_renovation')),
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Units (individual leasable spaces within a property)
CREATE TABLE units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id),
  unit_number TEXT NOT NULL,
  unit_type TEXT NOT NULL CHECK (unit_type IN ('office', 'retail', 'residential', 'storage')),
  sqft INTEGER,
  floor INTEGER,
  bedrooms INTEGER,
  bathrooms DECIMAL(3,1),
  monthly_rent DECIMAL(10, 2),
  lease_type TEXT CHECK (lease_type IN ('NNN', 'gross', 'modified_gross')),
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'under_renovation', 'coming_soon')),
  description TEXT,
  amenities JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Property/Unit Images
CREATE TABLE property_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id),
  unit_id UUID REFERENCES units(id),
  image_url TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER DEFAULT 0,
  image_type TEXT DEFAULT 'photo' CHECK (image_type IN ('photo', 'floor_plan', 'amenity', 'exterior')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leases
CREATE TABLE leases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES profiles(id),
  unit_id UUID NOT NULL REFERENCES units(id),
  lease_start DATE NOT NULL,
  lease_end DATE NOT NULL,
  monthly_rent DECIMAL(10, 2) NOT NULL,
  lease_type TEXT NOT NULL CHECK (lease_type IN ('NNN', 'gross', 'modified_gross')),
  security_deposit DECIMAL(10, 2),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'terminated', 'pending')),
  document_url TEXT,
  terms JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES profiles(id),
  lease_id UUID NOT NULL REFERENCES leases(id),
  amount DECIMAL(10, 2) NOT NULL,
  base_amount DECIMAL(10, 2),
  surcharge_amount DECIMAL(10, 2) DEFAULT 0,
  payment_date TIMESTAMPTZ NOT NULL,
  due_date DATE NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('ach', 'credit_card', 'debit_card', 'check', 'cash')),
  stripe_payment_id TEXT,
  stripe_invoice_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  late_fee DECIMAL(10, 2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-Pay Enrollment
CREATE TABLE autopay_enrollment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES profiles(id),
  lease_id UUID NOT NULL REFERENCES leases(id),
  stripe_customer_id TEXT NOT NULL,
  stripe_payment_method_id TEXT NOT NULL,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,
  payment_method_type TEXT NOT NULL CHECK (payment_method_type IN ('ach', 'card')),
  day_of_month INTEGER NOT NULL DEFAULT 1 CHECK (day_of_month BETWEEN 1 AND 28),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (tenant_id, lease_id)
);

-- Maintenance Requests
CREATE TABLE maintenance_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES profiles(id),
  unit_id UUID NOT NULL REFERENCES units(id),
  category TEXT NOT NULL CHECK (category IN ('plumbing', 'electrical', 'hvac', 'appliance', 'structural', 'pest', 'other')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('emergency', 'urgent', 'normal', 'low')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'acknowledged', 'in_progress', 'scheduled', 'completed', 'closed')),
  scheduled_date DATE,
  completed_date DATE,
  vendor_name TEXT,
  vendor_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Maintenance Request Images
CREATE TABLE maintenance_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES maintenance_requests(id),
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents (shared with tenants)
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('lease', 'rules', 'insurance', 'renovation', 'compliance', 'notice', 'other')),
  file_url TEXT NOT NULL,
  property_id UUID REFERENCES properties(id),
  tenant_id UUID REFERENCES profiles(id),
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- News/Updates
CREATE TABLE news_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT CHECK (category IN ('renovation', 'ordinance', 'market', 'general', 'maintenance')),
  property_id UUID REFERENCES properties(id),
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact Inquiries
CREATE TABLE inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  inquiry_type TEXT NOT NULL CHECK (inquiry_type IN ('general', 'leasing', 'maintenance_emergency', 'tour_request')),
  property_id UUID REFERENCES properties(id),
  unit_id UUID REFERENCES units(id),
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'responded', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Owner Financial Reports
CREATE TABLE financial_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id),
  report_type TEXT NOT NULL CHECK (report_type IN ('income_statement', 'balance_sheet', 'cash_flow', 'cap_improvement', 'tax_doc', 'insurance')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  file_url TEXT,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- 2. AUTO-CREATE PROFILE ON SIGNUP
-- =====================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================
-- 3. ENABLE ROW LEVEL SECURITY
-- =====================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE autopay_enrollment ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_reports ENABLE ROW LEVEL SECURITY;

-- =====================
-- 4. HELPER FUNCTION
-- =====================

CREATE OR REPLACE FUNCTION is_owner_or_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin')
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- =====================
-- 5. RLS POLICIES
-- =====================

-- Profiles: users see own profile, owner/admin sees all
CREATE POLICY "Users see own profile" ON profiles
  FOR SELECT USING (id = auth.uid() OR is_owner_or_admin());

CREATE POLICY "Users update own profile" ON profiles
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Properties: everyone can read active properties
CREATE POLICY "Anyone can view active properties" ON properties
  FOR SELECT USING (status = 'active' OR is_owner_or_admin());

CREATE POLICY "Owner/admin manage properties" ON properties
  FOR ALL USING (is_owner_or_admin());

-- Units: everyone can read available/occupied units
CREATE POLICY "Anyone can view units" ON units
  FOR SELECT USING (true);

CREATE POLICY "Owner/admin manage units" ON units
  FOR ALL USING (is_owner_or_admin());

-- Property Images: everyone can view
CREATE POLICY "Anyone can view property images" ON property_images
  FOR SELECT USING (true);

CREATE POLICY "Owner/admin manage images" ON property_images
  FOR ALL USING (is_owner_or_admin());

-- Leases: tenants see own, owner/admin sees all
CREATE POLICY "Tenants see own leases" ON leases
  FOR SELECT USING (tenant_id = auth.uid() OR is_owner_or_admin());

CREATE POLICY "Owner/admin manage leases" ON leases
  FOR ALL USING (is_owner_or_admin());

-- Payments: tenants see own, owner/admin sees all
CREATE POLICY "Tenants see own payments" ON payments
  FOR SELECT USING (tenant_id = auth.uid() OR is_owner_or_admin());

CREATE POLICY "Owner/admin manage payments" ON payments
  FOR ALL USING (is_owner_or_admin());

-- Autopay: tenants see own
CREATE POLICY "Tenants see own autopay" ON autopay_enrollment
  FOR SELECT USING (tenant_id = auth.uid() OR is_owner_or_admin());

CREATE POLICY "Owner/admin manage autopay" ON autopay_enrollment
  FOR ALL USING (is_owner_or_admin());

-- Maintenance Requests: tenants see own, create own; owner/admin sees all
CREATE POLICY "Tenants see own requests" ON maintenance_requests
  FOR SELECT USING (tenant_id = auth.uid() OR is_owner_or_admin());

CREATE POLICY "Tenants create own requests" ON maintenance_requests
  FOR INSERT WITH CHECK (tenant_id = auth.uid());

CREATE POLICY "Tenants update own requests" ON maintenance_requests
  FOR UPDATE USING (tenant_id = auth.uid())
  WITH CHECK (tenant_id = auth.uid());

CREATE POLICY "Owner/admin manage requests" ON maintenance_requests
  FOR ALL USING (is_owner_or_admin());

-- Maintenance Images: visible if you can see the request
CREATE POLICY "View maintenance images" ON maintenance_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM maintenance_requests mr
      WHERE mr.id = request_id
      AND (mr.tenant_id = auth.uid() OR is_owner_or_admin())
    )
  );

CREATE POLICY "Tenants upload maintenance images" ON maintenance_images
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM maintenance_requests mr
      WHERE mr.id = request_id AND mr.tenant_id = auth.uid()
    )
  );

-- Documents: tenants see own + public for their property, owner/admin sees all
CREATE POLICY "Tenants see own/public docs" ON documents
  FOR SELECT USING (
    tenant_id = auth.uid()
    OR (is_public = true AND property_id IN (
      SELECT u.property_id FROM units u
      JOIN leases l ON l.unit_id = u.id
      WHERE l.tenant_id = auth.uid() AND l.status = 'active'
    ))
    OR is_owner_or_admin()
  );

CREATE POLICY "Owner/admin manage documents" ON documents
  FOR ALL USING (is_owner_or_admin());

-- News Updates: published ones are public, owner/admin manages
CREATE POLICY "Anyone sees published news" ON news_updates
  FOR SELECT USING (is_published = true OR is_owner_or_admin());

CREATE POLICY "Owner/admin manage news" ON news_updates
  FOR ALL USING (is_owner_or_admin());

-- Inquiries: anyone can insert, owner/admin manages
CREATE POLICY "Anyone can submit inquiry" ON inquiries
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Owner/admin manage inquiries" ON inquiries
  FOR ALL USING (is_owner_or_admin());

-- Financial Reports: owner/admin only
CREATE POLICY "Owner/admin view reports" ON financial_reports
  FOR SELECT USING (is_owner_or_admin());

CREATE POLICY "Owner/admin manage reports" ON financial_reports
  FOR ALL USING (is_owner_or_admin());

-- =====================
-- 6. SEED DATA
-- =====================

INSERT INTO properties (name, slug, address_line1, city, state, zip, property_type, total_sqft, description, year_renovated, latitude, longitude, featured, amenities)
VALUES
  ('244 W. Irvine Street', '244-w-irvine', '244 W. Irvine Street', 'Richmond', 'KY', '40475', 'commercial', 6166,
   'Welcome to your next professional address. This newly renovated commercial building offers private office suites ideal for counselors & therapists, attorneys & legal professionals, accountants & financial advisors, and consultants. Premium location with excellent visibility and proximity to legal and civic services.',
   2025, 37.7488, -84.2947, true,
   '["Receptionist Services", "Conference Room", "Break Room", "Secure Access", "ADA-Compliant Restrooms", "Walkable to Courthouse & City Hall", "Close to restaurants and banks", "Ample street parking"]'),

  ('375 Michelle Drive', '375-michelle', '375 Michelle Drive', 'Richmond', 'KY', '40475', 'residential', null,
   'Well-maintained residential rental property in a quiet Richmond neighborhood.',
   null, null, null, true, '[]');

-- Units for 244 W. Irvine
INSERT INTO units (property_id, unit_number, unit_type, sqft, floor, monthly_rent, lease_type, status, description)
VALUES
  ((SELECT id FROM properties WHERE slug = '244-w-irvine'), 'Suite 101', 'office', 200, 1, 600.00, 'gross', 'available', 'Private office suite ideal for solo practitioners.'),
  ((SELECT id FROM properties WHERE slug = '244-w-irvine'), 'Suite 102', 'office', 400, 1, 1200.00, 'gross', 'available', 'Spacious office suite with room for a small team.'),
  ((SELECT id FROM properties WHERE slug = '244-w-irvine'), 'Suite 103', 'office', 600, 1, 2000.00, 'gross', 'available', 'Large suite with multiple rooms, ideal for established practices.'),
  ((SELECT id FROM properties WHERE slug = '244-w-irvine'), 'Suite 104', 'office', 1000, 1, 3500.00, 'gross', 'available', 'Premium corner suite with maximum space and visibility.'),
  ((SELECT id FROM properties WHERE slug = '244-w-irvine'), 'Mezzanine', 'office', 940, 2, null, 'gross', 'coming_soon', 'Second-floor mezzanine space currently under development. Grey box condition with all utilities roughed in. Ideal for office expansion.');

-- Units for 375 Michelle Drive
INSERT INTO units (property_id, unit_number, unit_type, sqft, floor, bedrooms, bathrooms, monthly_rent, lease_type, status, description)
VALUES
  ((SELECT id FROM properties WHERE slug = '375-michelle'), 'Main', 'residential', 1800, 1, 3, 2.0, 1200.00, 'gross', 'occupied', 'Three bedroom, two bathroom residential home.');
