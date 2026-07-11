const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://brwfwfeompfhwahfmvum.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyd2Z3ZmVvbXBmaHdhaGZtdnVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzcwMTQ1NSwiZXhwIjoyMDk5Mjc3NDU1fQ.Mt1V6yYpVnmfS0f2lpoQjp4ioVQXEo0kCi0EH96TmAM';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

const INITIAL_PROFILES = [
  {
    id: "6b5832a8-12cd-4860-91c6-2c5ebc0c7f21",
    username: "EliteBroker_Assets",
    reputation: 99.8,
    sales_count: 142,
    is_admin: false
  },
  {
    id: "f3747d25-d2ba-4eb2-8c10-d8fe67d54eb2",
    username: "ViralGrowthCo",
    reputation: 98.5,
    sales_count: 57,
    is_admin: false
  },
  {
    id: "2d5474ad-88f5-449e-b9b2-a400c0f8e9ef",
    username: "DomainKing",
    reputation: 100.0,
    sales_count: 12,
    is_admin: false
  },
  {
    id: "a7620e7a-9a99-467f-94d3-059929ccf0c1",
    username: "PromoNowAdmin",
    reputation: 100.0,
    sales_count: 0,
    is_admin: true
  }
];

const INITIAL_LISTINGS = [
  {
    id: "a809f61b-9cc2-4df4-8d4e-128b7e289bf5",
    platform: "instagram",
    handle: "@wanderlust_daily",
    followers: 124500,
    engagement_rate: 6.82,
    avg_likes: 8420,
    category: "Fashion & Lifestyle",
    description: "Highly engaged lifestyle page featuring travel and luxury photography. USA audience.",
    price: 4850,
    verification_status: "verified",
    audience_region: "USA",
    status: "active",
    aged_year: 2018,
    og_email_included: true,
    instant_delivery: true,
    seller_id: "6b5832a8-12cd-4860-91c6-2c5ebc0c7f21",
    is_promoted: true
  },
  {
    id: "f2c4a10e-744a-4e20-80de-3cc8cb4c0ab6",
    platform: "tiktok",
    handle: "@tech_unboxed",
    followers: 320000,
    engagement_rate: 12.0,
    avg_likes: 38400,
    category: "Tech & Unboxing",
    description: "Gaming and tech unboxing page. Highly active commentary community.",
    price: 4200,
    verification_status: "verified",
    audience_region: "Global",
    status: "active",
    aged_year: 2023,
    og_email_included: true,
    instant_delivery: true,
    seller_id: "f3747d25-d2ba-4eb2-8c10-d8fe67d54eb2",
    is_promoted: true
  }
];

const INITIAL_PROMO_REQUESTS = [
  {
    id: "9c3c0df3-0a7c-4a3d-be6d-2c1b72e89bf5",
    listing_id: "a809f61b-9cc2-4df4-8d4e-128b7e289bf5",
    plan_name: "Verified Premium",
    price: 35000,
    status: "active"
  },
  {
    id: "f84b120c-783b-482a-bc91-2ca8cb4c0ab6",
    listing_id: "f2c4a10e-744a-4e20-80de-3cc8cb4c0ab6",
    plan_name: "Elite Broker Placement",
    price: 75000,
    status: "pending"
  }
];

async function seed() {
  console.log("Checking and seeding tables...");
  try {
    // 1. Create Special Admin Login Credentials in Supabase Auth if needed
    console.log("Creating/Verifying admin auth credentials...");
    const adminEmail = 'admin@promonow.com';
    const adminPassword = 'AdminSecret2026!';
    let adminAuthId = 'a7620e7a-9a99-467f-94d3-059929ccf0c1'; // Fallback if auth admin API fails

    try {
      const { data: userList, error: listErr } = await supabase.auth.admin.listUsers();
      if (!listErr && userList && userList.users) {
        const existingAdmin = userList.users.find(u => u.email === adminEmail);
        if (existingAdmin) {
          console.log("Admin Auth credentials already exist in Supabase.");
          adminAuthId = existingAdmin.id;
        } else {
          const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
            email: adminEmail,
            password: adminPassword,
            email_confirm: true,
            user_metadata: { username: 'PromoNowAdmin' }
          });
          if (!createErr && newUser && newUser.user) {
            console.log("Successfully created Admin Auth user in Supabase!");
            adminAuthId = newUser.user.id;
          } else {
            console.warn("Auth Admin API returned error when creating:", createErr ? createErr.message : "Unknown error");
          }
        }
      }
    } catch (authErr) {
      console.warn("Supabase Auth Admin API check failed. Using fallback UUID for profiles database.", authErr.message);
    }

    // Override the profile id of PromoNowAdmin with the actual Auth ID
    const profilesToInsert = INITIAL_PROFILES.map(p => {
      if (p.username === 'PromoNowAdmin') {
        return { ...p, id: adminAuthId };
      }
      return p;
    });

    // 2. Seed Profiles
    const { data: profiles, error: pError } = await supabase.from('profiles').select('id');
    if (pError) {
      console.error("Error reading profiles. Have you run the SQL schema in your Supabase dashboard?", pError);
      return;
    }
    if (profiles.length === 0) {
      console.log("Seeding profiles...");
      const { error } = await supabase.from('profiles').insert(profilesToInsert);
      if (error) console.error("Error seeding profiles:", error);
    } else {
      console.log("Profiles already seeded.");
    }

    // 3. Seed Listings
    const { data: listings, error: lError } = await supabase.from('listings').select('id');
    if (lError) {
      console.error("Error reading listings:", lError);
      return;
    }
    if (listings.length === 0) {
      console.log("Seeding listings...");
      const { error } = await supabase.from('listings').insert(INITIAL_LISTINGS);
      if (error) console.error("Error seeding listings:", error);
    } else {
      console.log("Listings already seeded.");
    }

    // 4. Seed Promotion Requests
    const { data: promos, error: prError } = await supabase.from('promotion_requests').select('id');
    if (!prError) {
      if (promos.length === 0) {
        console.log("Seeding promotion requests...");
        const { error } = await supabase.from('promotion_requests').insert(INITIAL_PROMO_REQUESTS);
        if (error) console.error("Error seeding promotion_requests:", error);
      } else {
        console.log("Promotion requests already seeded.");
      }
    } else {
      console.warn("promotion_requests table not available for seeding (might not exist yet).");
    }

    console.log("\n========================================================");
    console.log("Setup verification completed successfully!");
    console.log(`ADMIN LOGIN DETAILS:`);
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log("========================================================\n");
  } catch (err) {
    console.error("Unexpected error during seed:", err);
  }
}

seed();
