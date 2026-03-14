
-- Create enum for property status
CREATE TYPE public.property_status AS ENUM ('disponible', 'reservado', 'vendido');

-- Create properties table
CREATE TABLE public.properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  location TEXT NOT NULL,
  neighborhood TEXT,
  project_name TEXT,
  square_meters INTEGER,
  bedrooms INTEGER,
  bathrooms INTEGER,
  parking INTEGER DEFAULT 0,
  images TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT false,
  status property_status DEFAULT 'disponible',
  amenities TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Properties are viewable by everyone"
  ON public.properties FOR SELECT
  USING (true);
