#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load env from .env.local
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const BUCKET = 'documents';

const FILES = [
  {
    localPath: path.resolve(__dirname, '..', 'GAC_Office_Lease_Melissa_Barnett-Signed.pdf'),
    storagePath: 'leases/244-w-irvine/GAC_Office_Lease_Melissa_Barnett-Signed.pdf',
    title: 'Office Lease — Melissa Barnett (Signed)',
    category: 'lease',
    propertySlug: '244-w-irvine',
    tenantEmail: 'melissa.barnett@outlook.com',
  },
  {
    localPath: path.resolve(__dirname, '..', '2026 - Residential Lease Agreement-Conner-Renewal.pdf'),
    storagePath: 'leases/375-michelle/2026-Residential-Lease-Agreement-Conner-Renewal.pdf',
    title: '2026 Residential Lease Agreement — Conner (Renewal)',
    category: 'lease',
    propertySlug: '375-michelle',
    tenantEmail: 'conner@outlook.com',
  },
];

async function main() {
  // 1. Create bucket if it doesn't exist
  console.log(`\n--- Ensuring "${BUCKET}" bucket exists ---`);
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some(b => b.name === BUCKET);

  if (exists) {
    console.log(`Bucket "${BUCKET}" already exists.`);
  } else {
    const { error } = await supabase.storage.createBucket(BUCKET, {
      public: false,
      fileSizeLimit: 10 * 1024 * 1024, // 10 MB
    });
    if (error) {
      console.error('Failed to create bucket:', error.message);
      process.exit(1);
    }
    console.log(`Created bucket "${BUCKET}" (private).`);
  }

  // 2. Upload files and insert document records
  for (const file of FILES) {
    console.log(`\n--- Processing: ${file.title} ---`);

    // Verify local file
    if (!fs.existsSync(file.localPath)) {
      console.error(`File not found: ${file.localPath}`);
      continue;
    }

    // Upload
    const fileBuffer = fs.readFileSync(file.localPath);
    console.log(`Uploading ${file.storagePath} (${(fileBuffer.length / 1024).toFixed(0)} KB)...`);

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(file.storagePath, fileBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload failed:', uploadError.message);
      continue;
    }
    console.log('Uploaded successfully.');

    // Get signed URL (private bucket — use signed URL valid for 10 years)
    const { data: urlData, error: urlError } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(file.storagePath, 60 * 60 * 24 * 365 * 10);

    if (urlError) {
      console.error('Failed to create signed URL:', urlError.message);
      continue;
    }
    const fileUrl = urlData.signedUrl;
    console.log(`Signed URL created.`);

    // Look up property
    const { data: property, error: propError } = await supabase
      .from('properties')
      .select('id')
      .eq('slug', file.propertySlug)
      .single();

    if (propError || !property) {
      console.error(`Property not found for slug "${file.propertySlug}":`, propError?.message);
      continue;
    }
    console.log(`Property found: ${property.id}`);

    // Look up tenant by email
    const { data: tenant, error: tenantError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', file.tenantEmail)
      .maybeSingle();

    if (tenantError) {
      console.error(`Tenant lookup failed for "${file.tenantEmail}":`, tenantError.message);
    }

    const tenantId = tenant?.id || null;
    if (tenantId) {
      console.log(`Tenant found: ${tenantId}`);
    } else {
      console.log(`No tenant found for "${file.tenantEmail}" — inserting without tenant_id.`);
    }

    // 3. Insert document record
    const { error: insertError } = await supabase
      .from('documents')
      .insert({
        title: file.title,
        category: file.category,
        file_url: fileUrl,
        property_id: property.id,
        tenant_id: tenantId,
        is_public: false,
      });

    if (insertError) {
      console.error('Document insert failed:', insertError.message);
      continue;
    }
    console.log(`Document record inserted.`);
  }

  console.log('\n--- Done! ---\n');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
