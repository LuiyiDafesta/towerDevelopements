

## Plan: Sitio Inmobiliario "Tower Developers"

### 1. Configurar Supabase (Lovable Cloud)
- Crear tabla `properties` con campos: id, title, description, price, location, neighborhood, project_name, square_meters, bedrooms, bathrooms, parking, images (text[]), featured (boolean), status (enum: disponible/reservado/vendido), amenities (text[]), created_at
- Insertar 3 propiedades de seed data del sitio de referencia

### 2. Tema y estilos globales
- Actualizar CSS variables: fondo negro (#0a0a0a), dorado (#C9A96E), tipografía serif para títulos
- Agregar fuente Playfair Display desde Google Fonts

### 3. Componentes compartidos
- **Navbar**: Logo "Tower Developers", links (Inicio, Propiedades), fondo transparente con blur
- **Footer**: Info de contacto, badges de confianza, copyright
- **PropertyCard**: Card oscura con imagen, badge de estado, precio en dorado, características (m², dormitorios, baños)

### 4. Landing Page (`/`)
- **Hero**: Fondo con overlay oscuro, título "Vivir en *Otro Nivel*" con tipografía serif dorada, barra de búsqueda con filtros (dormitorios, precio máximo, botón dorado)
- **Propiedades Destacadas**: Grid de PropertyCards filtradas por `featured=true`
- **Stats**: Contadores (15+ años, 50+ proyectos, 1.200 familias)
- **Amenities**: Grid de iconos (Piscina, Gym, Seguridad 24hs, etc.)
- **CTA**: Sección con fondo + "Tu nuevo hogar te está esperando" + botón dorado

### 5. Página de Listado (`/propiedades`)
- Filtros por dormitorios, rango de precio, barrio
- Grid de PropertyCards con datos de Supabase

### 6. Página de Detalle (`/propiedades/:id`)
- Galería de imágenes
- Info completa: precio, ubicación, características, descripción
- Botón de contacto
- Propiedades relacionadas

### 7. Routing
- Agregar rutas: `/propiedades` y `/propiedades/:id` en App.tsx

### Archivos a crear/modificar
- `src/index.css` — tema oscuro/dorado
- `index.html` — fuente Google Fonts
- `src/integrations/supabase/` — cliente y tipos
- `src/components/Navbar.tsx`
- `src/components/Footer.tsx`
- `src/components/PropertyCard.tsx`
- `src/components/HeroSection.tsx`
- `src/components/StatsSection.tsx`
- `src/components/AmenitiesSection.tsx`
- `src/components/CTASection.tsx`
- `src/pages/Index.tsx` — landing completa
- `src/pages/Properties.tsx` — listado
- `src/pages/PropertyDetail.tsx` — detalle
- `src/App.tsx` — rutas nuevas
- Migración SQL para tabla `properties` + seed data

