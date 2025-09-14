-- Create admin user profile (this will be used after admin signs up)
-- Note: This is just a placeholder. The actual admin user will be created through the signup process
-- with user_type = 'admin' in the metadata

-- Create some sample data for testing (optional)
-- You can remove this section if you don't want sample data

-- Sample apartment profile (will be created when user signs up)
-- Sample NGO profile (will be created when user signs up)
-- Sample clothing listings (will be created through the app)

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON public.profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_clothing_listings_apartment_id ON public.clothing_listings(apartment_id);
CREATE INDEX IF NOT EXISTS idx_clothing_listings_available ON public.clothing_listings(available);
CREATE INDEX IF NOT EXISTS idx_clothing_requests_ngo_id ON public.clothing_requests(ngo_id);
CREATE INDEX IF NOT EXISTS idx_clothing_requests_listing_id ON public.clothing_requests(listing_id);
CREATE INDEX IF NOT EXISTS idx_clothing_requests_status ON public.clothing_requests(status);
CREATE INDEX IF NOT EXISTS idx_messages_request_id ON public.messages(request_id);
