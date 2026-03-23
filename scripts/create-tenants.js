#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── Tenant definitions ──────────────────────────────────────────────

const TENANTS = [
  {
    email: 'dejon.gaines@outlook.com',
    full_name: 'DeJon Gaines (Test)',
    role: 'tenant',
  },
  {
    email: 'mbarnett654456@gmail.com',
    full_name: 'Melissa Barnett',
    role: 'tenant',
  },
  {
    email: 'Shainem97@gmail.com',
    full_name: 'Christopher Conner',
    role: 'tenant',
    phone: '859-893-8240',
  },
];

// ── Lease definitions ───────────────────────────────────────────────

const LEASES = [
  {
    tenantEmail: 'dejon.gaines@outlook.com',
    propertySlug: '244-w-irvine',
    unitNumber: 'Office 101',
    monthlyRent: 600,
    leaseStart: '2026-03-01',
    leaseEnd: '2027-02-28',
    leaseType: 'gross',
    status: 'active',
    securityDeposit: null,
  },
  {
    tenantEmail: 'mbarnett654456@gmail.com',
    propertySlug: '244-w-irvine',
    unitNumber: 'Office 106',
    monthlyRent: 850,
    leaseStart: '2026-02-01',
    leaseEnd: '2027-01-31',
    leaseType: 'gross',
    status: 'active',
    securityDeposit: 1400,
  },
  {
    tenantEmail: 'mbarnett654456@gmail.com',
    propertySlug: '244-w-irvine',
    unitNumber: 'Office 108',
    monthlyRent: 550,
    leaseStart: '2026-02-01',
    leaseEnd: '2027-01-31',
    leaseType: 'gross',
    status: 'active',
    securityDeposit: null,
  },
  {
    tenantEmail: 'Shainem97@gmail.com',
    propertySlug: '375-michelle',
    unitNumber: 'Main',
    monthlyRent: 1600,
    leaseStart: '2026-02-01',
    leaseEnd: '2026-12-31',
    leaseType: 'gross',
    status: 'active',
    securityDeposit: 1500,
  },
];

// ── Document definitions (re-link existing storage files) ───────────

const DOCUMENTS = [
  {
    localPath: path.resolve(__dirname, '..', 'GAC_Office_Lease_Melissa_Barnett-Signed.pdf'),
    storagePath: 'leases/244-w-irvine/GAC_Office_Lease_Melissa_Barnett-Signed.pdf',
    title: 'Office Lease — Melissa Barnett (Signed)',
    category: 'lease',
    propertySlug: '244-w-irvine',
    tenantEmail: 'mbarnett654456@gmail.com',
  },
  {
    localPath: path.resolve(__dirname, '..', '2026 - Residential Lease Agreement-Conner-Renewal.pdf'),
    storagePath: 'leases/375-michelle/2026-Residential-Lease-Agreement-Conner-Renewal.pdf',
    title: '2026 Residential Lease Agreement — Conner (Renewal)',
    category: 'lease',
    propertySlug: '375-michelle',
    tenantEmail: 'Shainem97@gmail.com',
  },
];

// ── Main ────────────────────────────────────────────────────────────

async function main() {
  const userIdMap = {}; // email -> uuid

  // ─── 1. Create auth users ─────────────────────────────────────────
  console.log('\n=== Creating Auth Users ===\n');

  for (const t of TENANTS) {
    console.log(`Creating user: ${t.email}`);

    const { data, error } = await supabase.auth.admin.createUser({
      email: t.email,
      email_confirm: true,
      user_metadata: { full_name: t.full_name },
    });

    if (error) {
      // If user already exists, look them up
      if (error.message.includes('already been registered') || error.message.includes('already exists')) {
        console.log(`  User already exists, looking up...`);
        const { data: listData } = await supabase.auth.admin.listUsers();
        const existing = listData?.users?.find(
          (u) => u.email?.toLowerCase() === t.email.toLowerCase()
        );
        if (existing) {
          userIdMap[t.email] = existing.id;
          console.log(`  Found existing user: ${existing.id}`);
        } else {
          console.error(`  Could not find existing user for ${t.email}`);
          continue;
        }
      } else {
        console.error(`  Error creating ${t.email}:`, error.message);
        continue;
      }
    } else {
      userIdMap[t.email] = data.user.id;
      console.log(`  Created: ${data.user.id}`);
    }
  }

  // ─── 2. Update profiles (role, phone) ─────────────────────────────
  console.log('\n=== Updating Profiles ===\n');

  for (const t of TENANTS) {
    const userId = userIdMap[t.email];
    if (!userId) continue;

    const updates = { role: t.role };
    if (t.phone) updates.phone = t.phone;

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);

    if (error) {
      console.error(`  Failed to update profile for ${t.email}:`, error.message);
    } else {
      console.log(`Updated profile for ${t.email}: role=${t.role}${t.phone ? ', phone=' + t.phone : ''}`);
    }
  }

  // ─── 3. Ensure units exist (create Suite 106, Suite 108 if needed) ─
  console.log('\n=== Ensuring Units Exist ===\n');

  // Get property IDs
  const { data: properties } = await supabase
    .from('properties')
    .select('id, slug');

  const propMap = {};
  for (const p of properties || []) {
    propMap[p.slug] = p.id;
  }
  console.log('Properties:', Object.keys(propMap).join(', '));

  const unitsToEnsure = [
    {
      propertySlug: '244-w-irvine',
      unitNumber: 'Office 106',
      unitType: 'office',
      sqft: 300,
      floor: 1,
      monthlyRent: 850,
      leaseType: 'gross',
      status: 'occupied',
      description: 'Private office suite.',
    },
    {
      propertySlug: '244-w-irvine',
      unitNumber: 'Office 108',
      unitType: 'office',
      sqft: 200,
      floor: 1,
      monthlyRent: 550,
      leaseType: 'gross',
      status: 'occupied',
      description: 'Compact office suite.',
    },
  ];

  for (const u of unitsToEnsure) {
    const propId = propMap[u.propertySlug];
    if (!propId) {
      console.error(`  Property not found: ${u.propertySlug}`);
      continue;
    }

    const { data: existing } = await supabase
      .from('units')
      .select('id')
      .eq('property_id', propId)
      .eq('unit_number', u.unitNumber)
      .maybeSingle();

    if (existing) {
      console.log(`Unit ${u.unitNumber} already exists: ${existing.id}`);
    } else {
      const { data: created, error } = await supabase
        .from('units')
        .insert({
          property_id: propId,
          unit_number: u.unitNumber,
          unit_type: u.unitType,
          sqft: u.sqft,
          floor: u.floor,
          monthly_rent: u.monthlyRent,
          lease_type: u.leaseType,
          status: u.status,
          description: u.description,
        })
        .select('id')
        .single();

      if (error) {
        console.error(`  Failed to create unit ${u.unitNumber}:`, error.message);
      } else {
        console.log(`Created unit ${u.unitNumber}: ${created.id}`);
      }
    }
  }

  // Also mark Suite 101 as occupied
  const irvineId = propMap['244-w-irvine'];
  if (irvineId) {
    await supabase
      .from('units')
      .update({ status: 'occupied' })
      .eq('property_id', irvineId)
      .eq('unit_number', 'Suite 101');
    console.log('Marked Suite 101 as occupied.');
  }

  // Update 375 Michelle Main unit rent to $1600
  const michelleId = propMap['375-michelle'];
  if (michelleId) {
    await supabase
      .from('units')
      .update({ monthly_rent: 1600 })
      .eq('property_id', michelleId)
      .eq('unit_number', 'Main');
    console.log('Updated 375 Michelle Main rent to $1600.');
  }

  // ─── 4. Create leases ─────────────────────────────────────────────
  console.log('\n=== Creating Leases ===\n');

  for (const lease of LEASES) {
    const tenantId = userIdMap[lease.tenantEmail];
    if (!tenantId) {
      console.error(`  No user ID for ${lease.tenantEmail}, skipping lease.`);
      continue;
    }

    const propId = propMap[lease.propertySlug];
    if (!propId) {
      console.error(`  Property not found: ${lease.propertySlug}`);
      continue;
    }

    // Look up unit
    const { data: unit } = await supabase
      .from('units')
      .select('id')
      .eq('property_id', propId)
      .eq('unit_number', lease.unitNumber)
      .single();

    if (!unit) {
      console.error(`  Unit not found: ${lease.unitNumber} in ${lease.propertySlug}`);
      continue;
    }

    const { data: created, error } = await supabase
      .from('leases')
      .insert({
        tenant_id: tenantId,
        unit_id: unit.id,
        lease_start: lease.leaseStart,
        lease_end: lease.leaseEnd,
        monthly_rent: lease.monthlyRent,
        lease_type: lease.leaseType,
        security_deposit: lease.securityDeposit,
        status: lease.status,
      })
      .select('id')
      .single();

    if (error) {
      console.error(`  Lease insert failed for ${lease.tenantEmail} / ${lease.unitNumber}:`, error.message);
    } else {
      console.log(`Lease created: ${lease.tenantEmail} → ${lease.unitNumber} ($${lease.monthlyRent}/mo) [${created.id}]`);
    }
  }

  // ─── 5. Upload PDFs & create document records ─────────────────────
  console.log('\n=== Uploading Documents & Creating Records ===\n');

  // Ensure bucket exists
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some((b) => b.name === 'documents');

  if (!bucketExists) {
    const { error } = await supabase.storage.createBucket('documents', {
      public: false,
      fileSizeLimit: 10 * 1024 * 1024,
    });
    if (error) {
      console.error('Failed to create documents bucket:', error.message);
    } else {
      console.log('Created "documents" bucket.');
    }
  } else {
    console.log('"documents" bucket already exists.');
  }

  for (const doc of DOCUMENTS) {
    const tenantId = userIdMap[doc.tenantEmail];
    const propId = propMap[doc.propertySlug];

    if (!propId) {
      console.error(`  Property not found for doc: ${doc.propertySlug}`);
      continue;
    }

    // Upload PDF if local file exists
    if (fs.existsSync(doc.localPath)) {
      const fileBuffer = fs.readFileSync(doc.localPath);
      console.log(`Uploading ${doc.storagePath} (${(fileBuffer.length / 1024).toFixed(0)} KB)...`);

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(doc.storagePath, fileBuffer, {
          contentType: 'application/pdf',
          upsert: true,
        });

      if (uploadError) {
        console.error('  Upload failed:', uploadError.message);
      } else {
        console.log('  Uploaded.');
      }
    } else {
      console.log(`  Local file not found: ${doc.localPath} — skipping upload.`);
    }

    // Create signed URL (10-year)
    const { data: urlData, error: urlError } = await supabase.storage
      .from('documents')
      .createSignedUrl(doc.storagePath, 60 * 60 * 24 * 365 * 10);

    if (urlError) {
      console.error('  Failed to create signed URL:', urlError.message);
      continue;
    }

    // Insert document record
    const { error: insertError } = await supabase.from('documents').insert({
      title: doc.title,
      category: doc.category,
      file_url: urlData.signedUrl,
      property_id: propId,
      tenant_id: tenantId || null,
      is_public: false,
    });

    if (insertError) {
      console.error('  Document record insert failed:', insertError.message);
    } else {
      console.log(`  Document record created: ${doc.title} → tenant ${doc.tenantEmail}`);
    }
  }

  // ─── Summary ──────────────────────────────────────────────────────
  console.log('\n=== Summary ===\n');
  for (const t of TENANTS) {
    const uid = userIdMap[t.email] || '(not created)';
    console.log(`${t.full_name} <${t.email}> → ${uid}`);
  }
  console.log('\nDone!\n');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
