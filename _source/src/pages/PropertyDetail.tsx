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
import { ArrowLeft, Bath, BedDouble, Car, MapPin, Maximize, ChevronLeft, ChevronRight, FileText, LayoutGrid } from "lucide-react";

const PropertyDetail = () => {
  const { id } = useParams();
  const [currentImage, setCurrentImage] = useState(0);

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
    images.push("https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800");
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-28 container mx-auto px-4 md:px-8">
          <Skeleton className="h-[500px] w-full rounded-xl" />
          <div className="mt-8 space-y-4">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 text-center">
          <h1 className="text-3xl font-serif text-foreground">Propiedad no encontrada</h1>
          <Button asChild variant="link" className="mt-4 text-primary">
            <Link to="/propiedades">Volver a propiedades</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-28 pb-20">
        <div className="container mx-auto px-4 md:px-8">
          {/* Back */}
          <Link to="/propiedades" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8 font-sans">
            <ArrowLeft className="w-4 h-4" /> Volver a propiedades
          </Link>

          {/* Gallery */}
          <div className="relative rounded-xl overflow-hidden h-[400px] md:h-[550px] mb-10">
            <img
              src={images[currentImage]}
              alt={property.title}
              className="w-full h-full object-cover"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/60 backdrop-blur-sm p-2 rounded-full hover:bg-background/80 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6 text-foreground" />
                </button>
                <button
                  onClick={() => setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/60 backdrop-blur-sm p-2 rounded-full hover:bg-background/80 transition-colors"
                >
                  <ChevronRight className="w-6 h-6 text-foreground" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImage(i)}
                      className={`w-2.5 h-2.5 rounded-full transition-colors ${i === currentImage ? "bg-primary" : "bg-foreground/30"}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                {property.status && (
                  <Badge className={`${property.status === "disponible" ? "bg-emerald-600/90" : property.status === "reservado" ? "bg-amber-600/90" : "bg-red-600/90"} text-white border-0`}>
                    {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                  </Badge>
                )}
                {property.project_name && (
                  <Badge variant="outline" className="text-primary border-primary/40">
                    {property.project_name}
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-2">{property.title}</h1>
              <p className="flex items-center gap-2 text-muted-foreground mb-8 font-sans">
                <MapPin className="w-4 h-4 text-primary" /> {property.location}
              </p>

              {/* Features grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                {property.square_meters && (
                  <div className="flex flex-col items-center gap-2 p-4 bg-card rounded-lg border border-border">
                    <Maximize className="w-5 h-5 text-primary" />
                    <span className="text-lg font-bold text-foreground">{property.square_meters}</span>
                    <span className="text-xs text-muted-foreground font-sans">m²</span>
                  </div>
                )}
                {property.bedrooms !== null && (
                  <div className="flex flex-col items-center gap-2 p-4 bg-card rounded-lg border border-border">
                    <BedDouble className="w-5 h-5 text-primary" />
                    <span className="text-lg font-bold text-foreground">{property.bedrooms}</span>
                    <span className="text-xs text-muted-foreground font-sans">Dormitorios</span>
                  </div>
                )}
                {property.bathrooms !== null && (
                  <div className="flex flex-col items-center gap-2 p-4 bg-card rounded-lg border border-border">
                    <Bath className="w-5 h-5 text-primary" />
                    <span className="text-lg font-bold text-foreground">{property.bathrooms}</span>
                    <span className="text-xs text-muted-foreground font-sans">Baños</span>
                  </div>
                )}
                {property.ambientes !== null && (
                  <div className="flex flex-col items-center gap-2 p-4 bg-card rounded-lg border border-border">
                    <LayoutGrid className="w-5 h-5 text-primary" />
                    <span className="text-lg font-bold text-foreground">{property.ambientes} Amb.</span>
                    <span className="text-xs text-muted-foreground font-sans">Ambientes</span>
                  </div>
                )}
                {property.parking !== null && property.parking > 0 && (
                  <div className="flex flex-col items-center gap-2 p-4 bg-card rounded-lg border border-border">
                    <Car className="w-5 h-5 text-primary" />
                    <span className="text-lg font-bold text-foreground">{property.parking}</span>
                    <span className="text-xs text-muted-foreground font-sans">Cocheras</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mb-10">
                <h2 className="text-2xl font-serif font-bold text-foreground mb-4">Descripción</h2>
                <p className="text-muted-foreground leading-relaxed font-sans">{property.description}</p>
              </div>

              {/* Amenities */}
              {property.amenities && property.amenities.length > 0 && (
                <div>
                  <h2 className="text-2xl font-serif font-bold text-foreground mb-4">Amenities</h2>
                  <div className="flex flex-wrap gap-3">
                    {property.amenities.map((a) => (
                      <Badge key={a} variant="outline" className="text-muted-foreground border-border px-4 py-2 font-sans">
                        {a}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 bg-card border border-border rounded-xl p-8">
                <p className="text-4xl font-serif font-bold text-primary mb-2">
                  USD {property.price.toLocaleString("es-AR")}
                </p>
                <p className="text-sm text-muted-foreground mb-8 font-sans">{property.location}</p>

                <Button variant="outline" className="w-full border-primary/40 text-primary hover:bg-primary/10 font-sans tracking-wider mb-6">
                  Contactar
                </Button>

                {property.pdf_url && (
                  <div className="pt-6 border-t border-border">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3 font-sans">Documentación</p>
                    <Button 
                      asChild 
                      className="w-full bg-secondary text-primary hover:bg-gold/10 border border-primary/20 gap-2 font-sans tracking-wide"
                    >
                      <a href={property.pdf_url} target="_blank" rel="noreferrer">
                        <FileText className="w-4 h-4" /> Descargar Ficha PDF
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Related */}
          {related && related.length > 0 && (
            <div className="mt-20">
              <h2 className="text-3xl font-serif font-bold text-foreground mb-8">
                Propiedades en <em className="text-primary not-italic">{property.neighborhoods?.name || "la zona"}</em>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {related.map((p) => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PropertyDetail;
