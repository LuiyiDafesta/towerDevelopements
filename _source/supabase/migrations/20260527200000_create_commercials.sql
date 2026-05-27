-- Crear tabla de comerciales
CREATE TABLE public.commercials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('local', 'oficina', 'cochera')),
  price NUMERIC NOT NULL,
  expenses NUMERIC DEFAULT 0, -- Expensas del inmueble
  location TEXT NOT NULL,
  neighborhood_id UUID REFERENCES public.neighborhoods(id) ON DELETE SET NULL,
  square_meters INTEGER,
  bathrooms INTEGER DEFAULT 0,
  parking INTEGER DEFAULT 0,
  image_url TEXT, -- Foto principal
  images TEXT[] DEFAULT '{}', -- Galería de fotos
  pdf_url TEXT, -- Ficha PDF
  status TEXT DEFAULT 'disponible' CHECK (status IN ('disponible', 'reservado', 'vendido', 'alquilado')),
  featured BOOLEAN DEFAULT false,
  amenities TEXT[] DEFAULT '{}', -- Amenities comerciales
  whatsapp TEXT,
  contact_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar Seguridad a Nivel de Fila (RLS)
ALTER TABLE public.commercials ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
CREATE POLICY "Commercials are viewable by everyone" 
  ON public.commercials FOR SELECT USING (true);

CREATE POLICY "Admins can manage commercials" 
  ON public.commercials FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
