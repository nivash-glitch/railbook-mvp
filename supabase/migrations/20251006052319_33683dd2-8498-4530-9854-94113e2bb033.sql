-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create trains table
CREATE TABLE public.trains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  train_number TEXT UNIQUE NOT NULL,
  train_name TEXT NOT NULL,
  source_station TEXT NOT NULL,
  destination_station TEXT NOT NULL,
  departure_time TIME NOT NULL,
  arrival_time TIME NOT NULL,
  duration TEXT NOT NULL,
  available_classes JSONB NOT NULL DEFAULT '{"sleeper": true, "3ac": true, "2ac": true, "1ac": true}',
  base_fare DECIMAL(10,2) NOT NULL,
  runs_on JSONB NOT NULL DEFAULT '["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]',
  total_seats INTEGER NOT NULL DEFAULT 500,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on trains (public read)
ALTER TABLE public.trains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view trains"
  ON public.trains FOR SELECT
  USING (true);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pnr TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  train_id UUID NOT NULL REFERENCES public.trains(id) ON DELETE CASCADE,
  passenger_name TEXT NOT NULL,
  passenger_age INTEGER NOT NULL,
  passenger_gender TEXT NOT NULL,
  travel_date DATE NOT NULL,
  class TEXT NOT NULL,
  seat_number TEXT,
  booking_status TEXT NOT NULL DEFAULT 'Confirmed',
  fare_paid DECIMAL(10,2) NOT NULL,
  booking_date TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookings"
  ON public.bookings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create train status table
CREATE TABLE public.train_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  train_id UUID NOT NULL REFERENCES public.trains(id) ON DELETE CASCADE,
  current_station TEXT,
  expected_arrival TIME,
  actual_arrival TIME,
  delay_minutes INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'On Time',
  last_updated TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on train status (public read)
ALTER TABLE public.train_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view train status"
  ON public.train_status FOR SELECT
  USING (true);

-- Create function to generate PNR
CREATE OR REPLACE FUNCTION generate_pnr()
RETURNS TEXT AS $$
BEGIN
  RETURN LPAD(FLOOR(RANDOM() * 10000000000)::TEXT, 10, '0');
END;
$$ LANGUAGE plpgsql;

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    COALESCE(new.raw_user_meta_data->>'phone', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create update trigger for profiles
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Insert sample train data
INSERT INTO public.trains (train_number, train_name, source_station, destination_station, departure_time, arrival_time, duration, base_fare, available_classes) VALUES
  ('12301', 'Rajdhani Express', 'New Delhi', 'Howrah', '16:55', '10:05', '17h 10m', 1500.00, '{"sleeper": false, "3ac": true, "2ac": true, "1ac": true}'),
  ('12951', 'Mumbai Rajdhani', 'Mumbai Central', 'New Delhi', '16:25', '08:35', '16h 10m', 2000.00, '{"sleeper": false, "3ac": true, "2ac": true, "1ac": true}'),
  ('12430', 'Lucknow AC SF', 'New Delhi', 'Lucknow', '22:20', '06:35', '08h 15m', 800.00, '{"sleeper": false, "3ac": true, "2ac": true, "1ac": false}'),
  ('12009', 'Shatabdi Express', 'New Delhi', 'Kalka', '07:40', '11:35', '03h 55m', 550.00, '{"sleeper": false, "3ac": false, "2ac": true, "1ac": false}'),
  ('12423', 'Dibrugarh Rajdhani', 'New Delhi', 'Dibrugarh', '11:05', '10:30', '47h 25m', 3500.00, '{"sleeper": false, "3ac": true, "2ac": true, "1ac": true}'),
  ('12002', 'Bhopal Shatabdi', 'New Delhi', 'Bhopal', '06:00', '14:20', '08h 20m', 900.00, '{"sleeper": false, "3ac": false, "2ac": true, "1ac": true}'),
  ('12622', 'Tamil Nadu Express', 'New Delhi', 'Chennai', '22:30', '07:05', '32h 35m', 1200.00, '{"sleeper": true, "3ac": true, "2ac": true, "1ac": true}'),
  ('12433', 'Hazrat Nizamuddin - Trivandrum Rajdhani Express', 'Hazrat Nizamuddin', 'Trivandrum', '11:00', '06:50', '43h 50m', 2800.00, '{"sleeper": false, "3ac": true, "2ac": true, "1ac": true}');