# G&A Property Management — Site Extension Specification
## Building on Existing Next.js App

---

## IMPORTANT: This is NOT a greenfield build

The site is already live as a **Next.js application** with App Router. The existing site has:
- Home page with hero, property showcase, amenities, "Why Choose G&A", CTA sections, contact cards, footer
- Property detail page (`/properties/1`)
- Contact page (`/contact`)
- Tenant Login page (`/tenant-login`)
- Navigation with Home, Contact, Tenant Login, Contact Us
- Footer with Quick Links, Tenant Resources, Office Hours
- Tailwind CSS styling with blue-600/blue-800 brand colors
- Already references routes: `/properties`, `/maintenance`, `/documents`, `/payments`, `/privacy`, `/terms`

**The task is to extend this existing app** with backend functionality (auth, database, payments) and build out the pages that are currently linked but not yet implemented.

---

## Existing Content & Verbiage (Use As-Is)

### Contact Information
| Channel | Value |
|---------|-------|
| Main Phone | (502) 783-7573 |
| Tour Line | (859) 333-9244 |
| Email | dejon@digitalgaines.com |
| Address | 244 W. Irvine Street, Richmond, KY 40475 |
| Office Hours | Mon–Fri 9:00 AM – 5:00 PM; Sat & Sun by appointment |

### Property Listing — 244 W. Irvine Street
- **Status badge**: "AVAILABLE NOW"
- **Suite sizes**: 200 – 1,000 SF
- **Monthly rent range**: $600 – $3,500
- **Renovated**: 2025
- **Total building**: 6,000 SF
- **Location note**: "Behind City Hall"
- **Description**: "Welcome to your next professional address. This newly renovated commercial building offers private office suites ideal for counselors & therapists, attorneys & legal professionals, accountants & financial advisors, and consultants. Premium location with excellent visibility and proximity to legal and civic services."

### "Perfect For" List
- Counselors & Therapists
- Attorneys & Legal Professionals
- Accountants & Financial Advisors
- Consultants & Remote Professionals

### Included Amenities
- Receptionist Services – Lobby staff available to greet clients
- Conference Room – Shared meeting space for client sessions
- Break Room – Kitchenette with seating
- Secure Access – Controlled entry
- ADA-Compliant Restrooms
- Walkable to Courthouse & City Hall
- Close to restaurants and banks
- Ample street parking and nearby public lots

### "Why Choose G&A" Pillars
1. **Secure & Professional** — Bank-level security for all your property documents and personal information.
2. **24/7 Support** — Emergency maintenance available around the clock for tenant peace of mind.
3. **Experienced Team** — 15+ years managing properties with dedicated support for every need.
4. **Hassle-Free Payments** — Multiple payment options including ACH, credit card, and auto-pay setup.

### Hero Section
- Headline: "Premium Professional Office Space in Richmond"
- Subtitle: "Newly renovated commercial office suites located behind City Hall, perfect for counselors, attorneys, accountants, and professional service providers."
- Stats bar: 6,000 Square Feet | Office Suite Monthly Rent | Prime Location
- CTAs: "View Office Details & Apply" → `/properties/1`, "Schedule a Tour" → `tel:859-333-9244`

### Footer Links Already Referenced
- Quick Links: Home, Properties, Maintenance, Contact, Tenant Portal
- Tenant Resources: Lease Documents (`/documents`), Pay Rent (`/payments`), Request Maintenance (`/maintenance`), Report Issue (`/contact`)
- Legal: Privacy Policy (`/privacy`), Terms of Service (`/terms`)

---

## Tech Stack (Additions to Existing App)

| Layer | Technology | Why |
|-------|-----------|-----|
| Auth | **Supabase Auth** (Magic Link) | Passwordless — no passwords to manage |
| Database | **Supabase PostgreSQL** | Row Level Security, real-time, free tier |
| Storage | **Supabase Storage** | Lease docs, property photos, maintenance images |
| Payments | **Stripe** (already set up) | ACH, credit/debit, auto-pay, invoicing |
| Email | **Resend** | Transactional emails (magic links, receipts, maintenance updates) |
| Maps | **Google Maps API** or **Mapbox** | Property map views |

### New Dependencies to Install
```bash
npm install @supabase/supabase-js @supabase/ssr stripe @stripe/stripe-js @stripe/react-stripe-js resend
```

---

## Authentication Flow (Passwordless)

```
Tenant visits /tenant-login (page already exists, needs backend wiring)
  → Enters email address only
  → Supabase sends magic link to email
  → Tenant clicks link → redirected to /auth/callback
  → /auth/callback exchanges code for session
  → Redirect to /tenant/dashboard
  → Session persists via HTTP-only cookie (Supabase SSR handles refresh)
```

### Supabase Auth Setup
```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createServerSupabaseClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
```

### Magic Link Sign-In (wire into existing /tenant-login page)
```typescript
async function signIn(email: string) {
  const supabase = createClient()
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  })
  return { error }
}
```

### Auth Callback Route
```typescript
// app/auth/callback/route.ts
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/tenant/dashboard'

  if (code) {
    const supabase = await createServerSupabaseClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url))
    }
  }
  return NextResponse.redirect(new URL('/tenant-login?error=auth', request.url))
}
```

### Middleware (protect tenant routes)
```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()

  if (!user && request.nextUrl.pathname.startsWith('/tenant')) {
    return NextResponse.redirect(new URL('/tenant-login', request.url))
  }
  if (!user && request.nextUrl.pathname.startsWith('/owner')) {
    return NextResponse.redirect(new URL('/tenant-login', request.url))
  }
  return response
}

export const config = {
  matcher: ['/tenant/:path*', '/owner/:path*'],
}
```

### Role-Based Access
| Role | Access |
|------|--------|
| `tenant` | Own lease docs, payment history, maintenance requests |
| `owner` | All data, financials, investor section |
| `admin` | Full CRUD on all resources |

Roles stored in `profiles` table, enforced via Supabase RLS policies + middleware.

---

## Database Schema (Supabase PostgreSQL)

```sql
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

-- Auto-create profile on signup
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
  payment_method_type TEXT NOT NULL CHECK (payment_method_type IN ('ach', 'card')),
  day_of_month INTEGER NOT NULL DEFAULT 1 CHECK (day_of_month BETWEEN 1 AND 28),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
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
```

### Row Level Security Policies
```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Helper function: check if user is owner/admin
CREATE OR REPLACE FUNCTION is_owner_or_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin')
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Profiles: users see own profile, owner/admin sees all
CREATE POLICY "Users see own profile" ON profiles
  FOR SELECT USING (id = auth.uid() OR is_owner_or_admin());

-- Leases: tenants see own, owner/admin sees all
CREATE POLICY "Tenants see own leases" ON leases
  FOR SELECT USING (tenant_id = auth.uid() OR is_owner_or_admin());

-- Payments: tenants see own, owner/admin sees all
CREATE POLICY "Tenants see own payments" ON payments
  FOR SELECT USING (tenant_id = auth.uid() OR is_owner_or_admin());

-- Maintenance: tenants see own, owner/admin sees all
CREATE POLICY "Tenants see own requests" ON maintenance_requests
  FOR SELECT USING (tenant_id = auth.uid() OR is_owner_or_admin());
CREATE POLICY "Tenants create own requests" ON maintenance_requests
  FOR INSERT WITH CHECK (tenant_id = auth.uid());

-- Documents: tenants see own + public, owner/admin sees all
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
```

---

## Pages to Build (Extending Existing App)

### Already Built (may need minor updates)
- `/` — Home page ✅
- `/properties/1` — Property detail ✅
- `/contact` — Contact page ✅
- `/tenant-login` — Login page (needs backend wiring to Supabase magic link)

### Need to Build

#### Public Pages
| Route | Description |
|-------|-------------|
| `/properties` | Property listings grid with filter (commercial/residential) |
| `/properties/[slug]` | Dynamic property detail (extend existing `/properties/1`) |
| `/properties/[slug]/apply` | Lease application form |
| `/news` | News & updates feed |
| `/privacy` | Privacy policy |
| `/terms` | Terms of service |
| `/auth/callback` | Supabase auth callback handler |

#### Tenant Portal (Protected)
| Route | Description |
|-------|-------------|
| `/tenant/dashboard` | Welcome, lease summary, next payment, recent activity |
| `/tenant/payments` | Pay rent (Stripe Elements), auto-pay setup, payment history |
| `/tenant/payments/setup` | Auto-pay enrollment with Stripe |
| `/maintenance` | Maintenance requests list + new request form (already in footer nav) |
| `/documents` | Lease docs, rules, notices (already in footer nav) |
| `/tenant/profile` | Update contact info |

#### Owner Dashboard (Protected)
| Route | Description |
|-------|-------------|
| `/owner/dashboard` | Portfolio overview, occupancy, revenue |
| `/owner/properties` | Property & unit management |
| `/owner/tenants` | Tenant management |
| `/owner/financials` | Financial reports |
| `/owner/maintenance` | All maintenance requests across properties |
| `/owner/documents` | Document management (upload/share) |

---

## Stripe Integration

### Setup (DeJon already has a Stripe account)

#### One-Time Payment Flow
```typescript
// app/api/payments/create-intent/route.ts
import Stripe from 'stripe'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const { leaseId, amount, tenantEmail } = await req.json()

  // Get or create Stripe customer
  const customers = await stripe.customers.list({ email: tenantEmail, limit: 1 })
  const customer = customers.data[0] || await stripe.customers.create({ email: tenantEmail })

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: 'usd',
    customer: customer.id,
    payment_method_types: ['us_bank_account', 'card'], // ACH preferred, card available
    metadata: { leaseId },
  })

  return Response.json({ clientSecret: paymentIntent.client_secret })
}
```

#### Auto-Pay via Stripe Subscriptions
```typescript
// app/api/payments/setup-autopay/route.ts
export async function POST(req: Request) {
  const { customerId, priceId } = await req.json()

  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_settings: {
      payment_method_types: ['us_bank_account', 'card'],
      save_default_payment_method: 'on_subscription',
    },
    collection_method: 'charge_automatically',
  })

  return Response.json({ subscriptionId: subscription.id })
}
```

#### Stripe Webhook Handler
```typescript
// app/api/webhooks/stripe/route.ts
export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!
  const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)

  switch (event.type) {
    case 'payment_intent.succeeded':
      // Update payment record in Supabase, send receipt via Resend
      break
    case 'payment_intent.payment_failed':
      // Notify tenant + owner
      break
    case 'invoice.payment_succeeded':
      // Auto-pay confirmation
      break
    case 'invoice.payment_failed':
      // Auto-pay failure notification
      break
  }

  return Response.json({ received: true })
}
```

---

## Environment Variables (add to `.env.local`)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe (already has account)
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Resend (email)
RESEND_API_KEY=

# Google Maps (optional)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=

# App
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

---

## Build Order for Claude Code

Since the app already exists, build in this order:

### Phase 1: Auth & Database (Foundation)
1. Install Supabase dependencies
2. Create Supabase project, run schema SQL
3. Set up `lib/supabase/client.ts` and `lib/supabase/server.ts`
4. Wire existing `/tenant-login` page to Supabase magic link
5. Create `/auth/callback` route
6. Add `middleware.ts` to protect `/tenant/*` and `/owner/*`
7. Test: full magic link login flow works end-to-end

### Phase 2: Tenant Portal
8. Build `/tenant/dashboard` — lease summary, next payment, recent activity
9. Build `/documents` — categorized document list with download
10. Build `/maintenance` — request list + new request form with image upload
11. Build `/tenant/profile` — view/update contact info

### Phase 3: Payments (Stripe)
12. Create Stripe products/prices for each unit's rent
13. Build `/tenant/payments` — Stripe Elements for one-time payment
14. Build auto-pay enrollment flow
15. Set up Stripe webhook handler
16. Build payment history with receipt downloads

### Phase 4: Public Pages
17. Build `/properties` — listing grid with filters, extend existing data
18. Convert `/properties/1` to dynamic `/properties/[slug]`
19. Build `/properties/[slug]/apply` — lease application form
20. Build `/news` — news feed from `news_updates` table
21. Add `/privacy` and `/terms` static pages

### Phase 5: Owner Dashboard
22. Build `/owner/dashboard` — portfolio KPIs
23. Build `/owner/tenants` — tenant management with lease details
24. Build `/owner/maintenance` — all requests across properties
25. Build `/owner/documents` — upload/share document management
26. Build `/owner/financials` — financial reports and data

### Phase 6: Polish
27. Email notifications via Resend (payment receipts, maintenance updates)
28. Add Google Maps to property pages
29. Mobile responsive QA pass
30. Seed production data (properties, units, initial documents)

---

## Branding (Existing — Do Not Change)

| Element | Value |
|---------|-------|
| Primary Blue | `blue-600` (#2563EB) |
| Dark Blue | `blue-800` (#1E40AF) |
| Gradients | `bg-gradient-to-r from-blue-600 to-blue-800` |
| Text Dark | `gray-800` |
| Text Medium | `gray-700` |
| Text Light | `gray-600` |
| Background | `gray-50`, `bg-white` |
| Accent Green | `green-600` (checkmarks) |
| Cards | White with `border-gray-200`, `shadow-sm` or `shadow-md` |
| Logo | Blue rounded rect "G&A" badge + "Property Management" text |
| Font | Inter (already loaded via Next.js font optimization) |

---

## Seed Data

### Properties
```sql
INSERT INTO properties (name, slug, address_line1, city, state, zip, property_type, total_sqft, description, year_renovated, latitude, longitude, featured, amenities)
VALUES
  ('244 W. Irvine Street', '244-w-irvine', '244 W. Irvine Street', 'Richmond', 'KY', '40475', 'commercial', 6166,
   'Welcome to your next professional address. This newly renovated commercial building offers private office suites ideal for counselors & therapists, attorneys & legal professionals, accountants & financial advisors, and consultants. Premium location with excellent visibility and proximity to legal and civic services.',
   2025, 37.7488, -84.2947, true,
   '["Receptionist Services", "Conference Room", "Break Room", "Secure Access", "ADA-Compliant Restrooms", "Walkable to Courthouse & City Hall", "Close to restaurants and banks", "Ample street parking"]'),

  ('375 Michelle Drive', '375-michelle', '375 Michelle Drive', 'Richmond', 'KY', '40475', 'residential', null,
   'Well-maintained residential rental property in a quiet Richmond neighborhood.',
   null, null, null, true, '[]');
```

### Second Property (375 Michelle Dr)
Add to the Properties page and home page. Currently the site only showcases 244 W. Irvine.

### Mezzanine (Phase 2 — Coming Soon)
Add as a "Coming Soon" unit under 244 W. Irvine:
```sql
INSERT INTO units (property_id, unit_number, unit_type, sqft, floor, status, description)
VALUES
  ((SELECT id FROM properties WHERE slug = '244-w-irvine'), 'Mezzanine', 'office', 940, 2, 'coming_soon',
   'Second-floor mezzanine space currently under development. Grey box condition with all utilities roughed in. Ideal for office expansion.');
```
