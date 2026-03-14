import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Bath, BedDouble, Car, MapPin, Maximize, ChevronLeft, ChevronRight, FileText, LayoutGrid, Check, Instagram, Facebook, Send, X } from "lucide-react";
import { toast } from "sonner";

const PropertyDetail = () => {
  const { id } = useParams();
  const [currentImage, setCurrentImage] = useState(0);
  const [showAllGallery, setShowAllGallery] = useState(false);

  const { data: property, isLoading } = useQuery({
    queryKey: ["property", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*, neighborhoods(name)")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: related } = useQuery({
    queryKey: ["related-properties", id, property?.neighborhood_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .neq("id", id!)
        .eq("neighborhood_id", property!.neighborhood_id!)
        .limit(3);
      if (error) throw error;
      return data;
    },
    enabled: !!property?.neighborhood_id,
  });

  const images = [
    property?.image_url,
    ...(property?.images || [])
  ].filter(Boolean) as string[];

  if (images.length === 0) {
    images.push("https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80");
  }

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Consulta enviada con éxito. Nos contactaremos a la brevedad.");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="pt-28 container mx-auto px-4 md:px-8">
          <Skeleton className="h-[600px] w-full rounded-xl bg-white/5" />
          <div className="mt-8 space-y-4">
            <Skeleton className="h-10 w-1/3 bg-white/5" />
            <Skeleton className="h-6 w-1/2 bg-white/5" />
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="pt-32 text-center text-white">
          <h1 className="text-3xl font-serif">Propiedad no encontrada</h1>
          <Button asChild variant="link" className="mt-4 text-primary">
            <Link to="/propiedades">Volver a propiedades</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden">
      <Navbar />

      <div className="pt-20">
        {/* Main Hero Image / Gallery Entry */}
        <section className="relative w-full h-[70vh] md:h-[85vh] overflow-hidden group">
          <img
            src={images[currentImage]}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
          
          <div className="absolute bottom-8 right-4 md:right-8">
            <Button 
              onClick={() => setShowAllGallery(true)}
              className="bg-primary text-black hover:bg-gold-light px-8 py-6 text-sm uppercase tracking-[0.2em] font-bold rounded-none"
            >
              Ver galería completa
            </Button>
          </div>

          <div className="absolute top-1/2 left-4 md:left-8 -translate-y-1/2 flex flex-col gap-4">
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                  className="bg-black/40 backdrop-blur-md p-4 hover:bg-primary/20 transition-all border border-white/10"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <button
                  onClick={() => setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                  className="bg-black/40 backdrop-blur-md p-4 hover:bg-primary/20 transition-all border border-white/10"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
              </>
            )}
          </div>
        </section>

        <div className="container mx-auto px-4 md:px-8 -mt-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left Column: Property Info */}
            <div className="lg:col-span-8 space-y-12">
              <div>
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <Badge className="bg-primary text-black rounded-none uppercase tracking-widest text-[10px] py-1 px-3">
                    {property.status === "disponible" ? "Venta" : property.status}
                  </Badge>
                  {property.neighborhoods?.name && (
                    <span className="text-primary uppercase tracking-[0.3em] text-xs font-bold">
                      {property.neighborhoods.name}
                    </span>
                  )}
                </div>
                <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4 leading-tight uppercase tracking-tight">
                  {property.title}
                </h1>
                <p className="flex items-center gap-2 text-white/60 font-medium tracking-wide">
                  <MapPin className="w-4 h-4 text-primary" /> {property.location}
                </p>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-white/10 bg-white/5 backdrop-blur-sm">
                <div className="p-8 border-r border-b md:border-b-0 border-white/10 flex flex-col items-center justify-center gap-3">
                  <Maximize className="w-6 h-6 text-primary" />
                  <span className="text-xl font-bold">{property.square_meters}</span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Metros²</span>
                </div>
                <div className="p-8 border-r-0 md:border-r border-b md:border-b-0 border-white/10 flex flex-col items-center justify-center gap-3">
                  <LayoutGrid className="w-6 h-6 text-primary" />
                  <span className="text-xl font-bold">{property.ambientes}</span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Ambientes</span>
                </div>
                <div className="p-8 border-r border-white/10 flex flex-col items-center justify-center gap-3">
                  <BedDouble className="w-6 h-6 text-primary" />
                  <span className="text-xl font-bold">{property.bedrooms}</span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Dormitorios</span>
                </div>
                <div className="p-8 flex flex-col items-center justify-center gap-3">
                  <Bath className="w-6 h-6 text-primary" />
                  <span className="text-xl font-bold">{property.bathrooms}</span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Baños</span>
                </div>
              </div>

              {/* Description Section */}
              <div className="pt-8 space-y-6">
                <h2 className="text-xs uppercase tracking-[0.5em] text-primary font-bold">Descripción</h2>
                <div className="prose prose-invert max-w-none">
                  <p className="text-white/70 text-lg leading-relaxed font-light">
                    {property.description}
                  </p>
                </div>
              </div>

              {/* Amenities Grid */}
              {property.amenities && property.amenities.length > 0 && (
                <div className="pt-8 space-y-8">
                  <h2 className="text-xs uppercase tracking-[0.5em] text-primary font-bold">Comodidades y Amenities</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {property.amenities.map((amenity) => (
                      <div key={amenity} className="flex items-center gap-3 group">
                        <div className="w-6 h-6 flex items-center justify-center bg-primary/10 border border-primary/20 rounded-full group-hover:bg-primary transition-colors">
                          <Check className="w-3 h-3 text-primary group-hover:text-black" />
                        </div>
                        <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">
                          {amenity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Sticky Contact Sidebar */}
            <div className="lg:col-span-4 relative">
              <div className="lg:sticky lg:top-28 space-y-8">
                {/* Price Box */}
                <div className="bg-white/5 border border-white/10 p-10 backdrop-blur-md">
                  <div className="space-y-1 mb-8">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-bold">Precio de Lista</p>
                    <p className="text-5xl font-serif font-bold text-white tracking-tighter">
                      USD {property.price.toLocaleString("es-AR")}
                    </p>
                  </div>

                  <form onSubmit={handleContactSubmit} className="space-y-6">
                    <p className="text-sm uppercase tracking-[0.2em] text-white/60 font-bold mb-6">Consultá ahora</p>
                    <div className="space-y-4">
                      <Input 
                        placeholder="NOMBRE COMPLETO" 
                        className="bg-transparent border-0 border-b border-white/10 rounded-none focus-visible:ring-0 focus-visible:border-primary text-xs tracking-widest p-0 h-10"
                      />
                      <Input 
                        placeholder="EMAIL" 
                        type="email"
                        className="bg-transparent border-0 border-b border-white/10 rounded-none focus-visible:ring-0 focus-visible:border-primary text-xs tracking-widest p-0 h-10"
                      />
                      <Input 
                        placeholder="TELÉFONO" 
                        className="bg-transparent border-0 border-b border-white/10 rounded-none focus-visible:ring-0 focus-visible:border-primary text-xs tracking-widest p-0 h-10"
                      />
                      <Textarea 
                        placeholder="MENSAJE" 
                        className="bg-transparent border-0 border-b border-white/10 rounded-none focus-visible:ring-0 focus-visible:border-primary text-xs tracking-widest p-0 min-h-[100px] resize-none"
                      />
                    </div>
                    <Button 
                      type="submit"
                      className="w-full bg-primary text-black hover:bg-gold-light py-8 uppercase tracking-[0.3em] font-black mt-4 rounded-none transition-all hover:translate-y-[-2px]"
                    >
                      Enviar consulta
                    </Button>
                  </form>

                  {property.pdf_url && (
                    <div className="mt-10 pt-8 border-t border-white/10">
                      <Button 
                        asChild 
                        variant="link"
                        className="w-full text-primary hover:text-white uppercase tracking-[0.2em] font-bold text-xs gap-3 p-0"
                      >
                        <a href={property.pdf_url} target="_blank" rel="noreferrer">
                          <FileText className="w-5 h-5" /> Descargar Ficha PDF
                        </a>
                      </Button>
                    </div>
                  )}
                </div>

                {/* Shared Socials */}
                <div className="flex items-center justify-center gap-6 pt-4">
                  <button className="text-white/40 hover:text-primary transition-colors"><Instagram className="w-5 h-5" /></button>
                  <button className="text-white/40 hover:text-primary transition-colors"><Facebook className="w-5 h-5" /></button>
                  <button className="text-white/40 hover:text-primary transition-colors"><Send className="w-5 h-5" /></button>
                </div>
              </div>
            </div>
          </div>

          {/* Related Section */}
          {related && related.length > 0 && (
            <div className="mt-32 pt-20 border-t border-white/10 pb-20">
              <div className="text-center mb-16">
                <p className="text-primary text-[10px] uppercase tracking-[0.4em] font-bold mb-4">Descubrí más</p>
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-white uppercase tracking-tight">
                  Propiedades <em className="text-primary not-italic">Similares</em>
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {related.map((p) => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />

      {/* Gallery Modal / Overlay */}
      {showAllGallery && (
        <div className="fixed inset-0 z-[100] bg-black overflow-y-auto animate-in fade-in duration-300">
          <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10 px-8 py-6 flex items-center justify-between">
            <h3 className="text-xs uppercase tracking-[0.5em] font-bold text-primary">Galería Completa</h3>
            <button 
              onClick={() => setShowAllGallery(false)}
              className="text-white flex items-center gap-2 hover:text-primary transition-colors uppercase tracking-widest text-[10px] font-bold"
            >
              Cerrar <X className="w-4 h-4" />
            </button>
          </div>
          <div className="container mx-auto px-4 py-12">
            <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
              {images.map((img, i) => (
                <img 
                  key={i} 
                  src={img} 
                  alt="Gallery item" 
                  className="w-full h-auto border border-white/5 hover:border-primary/40 transition-all cursor-zoom-in"
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetail;
