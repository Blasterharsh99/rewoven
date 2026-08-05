-- ================================================================
-- Neon PostgreSQL Schema for Rewoven NGO Platform
-- Run this entire script in your Neon SQL editor to set up the DB
-- ================================================================

-- Enable pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ================================================================
-- USERS TABLE (replaces Supabase auth.users)
-- ================================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================================
-- PROFILES TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  user_type TEXT NOT NULL CHECK (user_type IN ('apartment', 'ngo', 'admin')),
  name TEXT NOT NULL DEFAULT '',
  contact_person TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT,
  address TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  state TEXT NOT NULL DEFAULT '',
  pincode TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================================
-- APARTMENT DETAILS TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS apartment_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  apartment_name TEXT NOT NULL DEFAULT '',
  total_units INTEGER,
  society_registration_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================================
-- NGO DETAILS TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS ngo_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  ngo_name TEXT NOT NULL DEFAULT '',
  registration_number TEXT NOT NULL DEFAULT '',
  head_office_address TEXT NOT NULL DEFAULT '',
  website TEXT,
  focus_areas TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================================
-- CLOTHING LISTINGS TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS clothing_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  apartment_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  clothing_type TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  condition TEXT NOT NULL CHECK (condition IN ('excellent', 'good', 'fair')),
  size_range TEXT,
  available BOOLEAN DEFAULT TRUE,
  pickup_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================================
-- CLOTHING REQUESTS TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS clothing_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ngo_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES clothing_listings(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  requested_quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================================
-- MESSAGES TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES clothing_requests(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================================
-- INDEXES FOR PERFORMANCE
-- ================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_clothing_listings_apartment_id ON clothing_listings(apartment_id);
CREATE INDEX IF NOT EXISTS idx_clothing_listings_available ON clothing_listings(available);
CREATE INDEX IF NOT EXISTS idx_clothing_requests_ngo_id ON clothing_requests(ngo_id);
CREATE INDEX IF NOT EXISTS idx_clothing_requests_listing_id ON clothing_requests(listing_id);
CREATE INDEX IF NOT EXISTS idx_clothing_requests_status ON clothing_requests(status);
CREATE INDEX IF NOT EXISTS idx_messages_request_id ON messages(request_id);

-- ================================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE OR REPLACE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_clothing_listings_updated_at
  BEFORE UPDATE ON clothing_listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_clothing_requests_updated_at
  BEFORE UPDATE ON clothing_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- ADMIN USER SETUP
-- ================================================================
-- Run this section AFTER you have the admin email/password ready.
-- Replace 'admin@rewoven.org' and the bcrypt hash below.
--
-- To generate a bcrypt hash for 'YourPassword123', use this Node.js snippet:
--   const bcrypt = require('bcryptjs');
--   console.log(bcrypt.hashSync('YourPassword123', 12));
--
-- Then paste the hash below and uncomment:

-- INSERT INTO users (email, password_hash)
-- VALUES ('admin@rewoven.org', '$2a$12$REPLACE_WITH_YOUR_BCRYPT_HASH_HERE')
-- ON CONFLICT (email) DO NOTHING
-- RETURNING id;
--
-- After getting the user id from above, run:
-- INSERT INTO profiles (id, user_type, name, contact_person, email, address, city, state, pincode)
-- VALUES (
--   '<PASTE_USER_ID_HERE>',
--   'admin',
--   'Admin',
--   'Admin',
--   'admin@rewoven.org',
--   'Admin Office',
--   'Mumbai',
--   'Maharashtra',
--   '400001'
-- ) ON CONFLICT (id) DO NOTHING;
