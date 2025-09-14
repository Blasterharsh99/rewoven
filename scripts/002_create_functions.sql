-- Function to automatically create profile trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only create profile if user_type is provided in metadata
  IF NEW.raw_user_meta_data ? 'user_type' THEN
    INSERT INTO public.profiles (
      id, 
      user_type, 
      name, 
      contact_person, 
      email, 
      phone, 
      address, 
      city, 
      state, 
      pincode
    )
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data ->> 'user_type', 'apartment'),
      COALESCE(NEW.raw_user_meta_data ->> 'name', ''),
      COALESCE(NEW.raw_user_meta_data ->> 'contact_person', ''),
      COALESCE(NEW.email, ''),
      COALESCE(NEW.raw_user_meta_data ->> 'phone', ''),
      COALESCE(NEW.raw_user_meta_data ->> 'address', ''),
      COALESCE(NEW.raw_user_meta_data ->> 'city', ''),
      COALESCE(NEW.raw_user_meta_data ->> 'state', ''),
      COALESCE(NEW.raw_user_meta_data ->> 'pincode', '')
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clothing_listings_updated_at
  BEFORE UPDATE ON public.clothing_listings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clothing_requests_updated_at
  BEFORE UPDATE ON public.clothing_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
