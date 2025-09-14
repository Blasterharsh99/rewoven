-- Create user profiles table for apartments and NGOs
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type TEXT NOT NULL CHECK (user_type IN ('apartment', 'ngo', 'admin')),
  name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create apartment-specific details table
CREATE TABLE IF NOT EXISTS public.apartment_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  apartment_name TEXT NOT NULL,
  total_units INTEGER,
  society_registration_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create NGO-specific details table
CREATE TABLE IF NOT EXISTS public.ngo_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  ngo_name TEXT NOT NULL,
  registration_number TEXT NOT NULL,
  head_office_address TEXT NOT NULL,
  website TEXT,
  focus_areas TEXT[], -- Array of focus areas like 'education', 'healthcare', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create clothing listings table
CREATE TABLE IF NOT EXISTS public.clothing_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  apartment_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  clothing_type TEXT NOT NULL, -- 'men', 'women', 'children', 'mixed'
  quantity INTEGER NOT NULL DEFAULT 1,
  condition TEXT NOT NULL CHECK (condition IN ('excellent', 'good', 'fair')),
  size_range TEXT, -- 'S-M', 'L-XL', 'Mixed', etc.
  available BOOLEAN DEFAULT TRUE,
  pickup_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create clothing requests table
CREATE TABLE IF NOT EXISTS public.clothing_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ngo_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.clothing_listings(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  requested_quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table for communication between apartments and NGOs
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.clothing_requests(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.apartment_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ngo_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clothing_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clothing_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- RLS Policies for apartment_details
CREATE POLICY "Apartment owners can manage their details" ON public.apartment_details
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = profile_id AND id = auth.uid()
    )
  );

-- RLS Policies for ngo_details
CREATE POLICY "NGO owners can manage their details" ON public.ngo_details
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = profile_id AND id = auth.uid()
    )
  );

-- RLS Policies for clothing_listings
CREATE POLICY "Apartment owners can manage their listings" ON public.clothing_listings
  FOR ALL USING (auth.uid() = apartment_id);

CREATE POLICY "NGOs can view all available listings" ON public.clothing_listings
  FOR SELECT USING (
    available = TRUE AND 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_type = 'ngo'
    )
  );

CREATE POLICY "Admins can view all listings" ON public.clothing_listings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- RLS Policies for clothing_requests
CREATE POLICY "NGOs can manage their own requests" ON public.clothing_requests
  FOR ALL USING (auth.uid() = ngo_id);

CREATE POLICY "Apartment owners can view requests for their listings" ON public.clothing_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.clothing_listings 
      WHERE id = listing_id AND apartment_id = auth.uid()
    )
  );

CREATE POLICY "Apartment owners can update request status" ON public.clothing_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.clothing_listings 
      WHERE id = listing_id AND apartment_id = auth.uid()
    )
  );

-- RLS Policies for messages
CREATE POLICY "Users can view messages for their requests" ON public.messages
  FOR SELECT USING (
    auth.uid() = sender_id OR
    EXISTS (
      SELECT 1 FROM public.clothing_requests cr
      JOIN public.clothing_listings cl ON cr.listing_id = cl.id
      WHERE cr.id = request_id AND (cr.ngo_id = auth.uid() OR cl.apartment_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages for their requests" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.clothing_requests cr
      JOIN public.clothing_listings cl ON cr.listing_id = cl.id
      WHERE cr.id = request_id AND (cr.ngo_id = auth.uid() OR cl.apartment_id = auth.uid())
    )
  );
