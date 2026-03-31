import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import SEO from "@/components/SEO";
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
  const [userInfo, setUserInfo] = useState({ full_name: "", email: "", phone: "" });

  useEffect(() => {
    const savedInfo = localStorage.getItem("user_contact_info");
    if (savedInfo) {
      try {
        setUserInfo(JSON.parse(savedInfo));
      } catch (e) {
        console.error("Error parsing user info from storage:", e);
      }
    }
  }, []);

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

  const handleShare = async () => {
    const shareData = {
      title: property?.title,
      text: `Mirá esta propiedad en Tower Developers: ${property?.title}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Enlace copiado al portapapeles");
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
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
      <SEO 
        title={property.title} 
        description={property.description?.substring(0, 160) + "..."}
        image={property.image_url || "/og-image.png"}
        url={`https://towerdevelopers.com/propiedades/${property.id}`}
        type="article"
      />
      <Navbar />

      <div className="pt-28 pb-20">
        <div className="container mx-auto px-4 md:px-8">
          
          {/* Top Section: Gallery and Primary Info Box */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
            
            {/* Gallery (Col 8) */}
            <div className="lg:col-span-8">
              <div className="relative rounded-sm overflow-hidden h-[400px] md:h-[600px] group shadow-2xl bg-black/40">
                {/* Background Blur Layer */}
                <img
                  src={images[currentImage]}
                  alt="Background blur"
                  className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-110"
                />
                
                {/* Main Content Layer (Contain) */}
                <img
                  src={images[currentImage]}
                  alt={property.title}
                  className="relative w-full h-full object-contain transition-transform duration-700 group-hover:scale-105 z-10"
                />
                
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 to-transparent z-20" />
                
                <div className="absolute bottom-6 right-6 z-30">
                  <button 
                    onClick={() => setShowAllGallery(true)}
                    className="bg-black/60 backdrop-blur-md border border-white/20 text-white px-4 py-2 text-[10px] uppercase tracking-widest font-bold flex items-center gap-2 hover:bg-primary hover:text-black transition-all"
                  >
                    Ver galería completa <span className="opacity-60">{images.length} fotos</span>
                  </button>
                </div>

                {images.length > 1 && (
                  <div className="absolute top-1/2 inset-x-4 -translate-y-1/2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity z-30">
                    <button
                      onClick={() => setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                      className="bg-black/40 backdrop-blur-md p-3 border border-white/10 text-white"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                      className="bg-black/40 backdrop-blur-md p-3 border border-white/10 text-white"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Price & Stats Box (Col 4) */}
            <div className="lg:col-span-4">
              <div className="bg-[#0A0A0A] border border-white/5 p-8 h-full flex flex-col shadow-xl">
                <div className="mb-8">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-bold mb-2">PRECIO</p>
                  <p className="text-5xl font-serif font-bold text-primary tracking-tight">
                    USD {property.price >= 1000000 ? `${(property.price / 1000000).toFixed(1)}M` : `${(property.price / 1000).toFixed(0)}K`}
                  </p>
                  <p className="text-[10px] text-white/30 uppercase tracking-widest mt-2">Precio en USD. Consultar financiación.</p>
                </div>

                <div className="flex-grow space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-white/5">
                    <span className="text-xs text-white/40 uppercase tracking-widest">Superficie</span>
                    <span className="text-sm font-medium">{property.square_meters}m²</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-white/5">
                    <span className="text-xs text-white/40 uppercase tracking-widest">Dormitorios</span>
                    <span className="text-sm font-medium">{property.bedrooms}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-white/5">
                    <span className="text-xs text-white/40 uppercase tracking-widest">Baños</span>
                    <span className="text-sm font-medium">{property.bathrooms}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-white/5">
                    <span className="text-xs text-white/40 uppercase tracking-widest">Ambientes</span>
                    <span className="text-sm font-medium">{property.ambientes}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-white/5">
                    <span className="text-xs text-white/40 uppercase tracking-widest">Cocheras</span>
                    <span className="text-sm font-medium">{property.parking || 0}</span>
                  </div>
                </div>

                <div className="mt-8">
                  <Button asChild className="w-full bg-primary text-black hover:bg-gold-light rounded-none py-7 font-black tracking-widest uppercase text-xs">
                    <a href={`https://wa.me/${property.whatsapp || "5491122334455"}?text=Hola, me interesa la propiedad: ${property.title} (REF-${property.id.substring(0, 8).toUpperCase()})`} target="_blank" rel="noreferrer">
                      Contactar por WhatsApp
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Title and Secondary Info Area */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16 items-end">
            <div className="lg:col-span-8">
              <div className="space-y-4">
                {property.project_name && (
                  <p className="text-primary text-[10px] uppercase tracking-[0.5em] font-black">{property.project_name}</p>
                )}
                <h1 className="text-5xl md:text-6xl font-serif font-bold text-white uppercase tracking-tight leading-none">
                  {property.title}
                </h1>
                <div className="flex items-center gap-2 text-white/40 text-sm font-medium tracking-wide">
                  <MapPin className="w-4 h-4 text-primary" /> {property.location}
                </div>
              </div>
            </div>
            <div className="lg:col-span-4 flex justify-between items-center border-t border-white/5 pt-8 lg:border-t-0 lg:pt-0">
              <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-none px-6 py-2 uppercase tracking-[0.3em] font-black text-[10px]">
                {property.status || "Disponible"}
              </Badge>
              <button 
                onClick={handleShare}
                className="flex items-center gap-2 text-white/40 hover:text-primary transition-colors uppercase tracking-[0.2em] text-[10px] font-bold"
              >
                <Send className="w-4 h-4" /> Compartir
              </button>
            </div>
          </div>

          {/* Detailed Info: Description and Form */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Description & Amenities (Col 8) */}
            <div className="lg:col-span-8 space-y-16">
              <div className="space-y-8">
                <h2 className="text-[10px] uppercase tracking-[0.6em] text-primary font-black pb-4 border-b border-primary/20 w-fit">DESCRIPCIÓN</h2>
                <div className="prose prose-invert max-w-none">
                  <p className="text-white/70 text-lg leading-relaxed font-light whitespace-pre-line">
                    {property.description}
                  </p>
                </div>
              </div>

              {property.amenities && property.amenities.length > 0 && (
                <div className="space-y-10">
                  <h2 className="text-[10px] uppercase tracking-[0.6em] text-primary font-black pb-4 border-b border-primary/20 w-fit">AMENITIES</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-12">
                    {property.amenities.map((amenity) => (
                      <div key={amenity} className="flex items-center gap-4 group">
                        <div className="w-5 h-5 flex items-center justify-center border border-primary/30 rounded-full group-hover:bg-primary group-hover:border-primary transition-all">
                          <Check className="w-2.5 h-2.5 text-primary group-hover:text-black" />
                        </div>
                        <span className="text-xs uppercase tracking-widest font-bold text-white/60 group-hover:text-white transition-colors">
                          {amenity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {property.location && (
                <div className="space-y-10 pt-8 mt-8 border-t border-white/5">
                  <h2 className="text-[10px] uppercase tracking-[0.6em] text-primary font-black pb-4 border-b border-primary/20 w-fit">UBICACIÓN</h2>
                  <div className="w-full h-[250px] border border-white/10 rounded-sm overflow-hidden relative shadow-2xl">
                    <iframe
                      width="100%"
                      height="100%"
                      style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) contrast(100%)' }}
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(property.location)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                    ></iframe>
                  </div>
                </div>
              )}
            </div>

            {/* Detailed Contact Form (Col 4) */}
            <div className="lg:col-span-4">
              <div className="bg-[#0A0A0A] border border-white/5 p-8 shadow-xl mb-12">
                <p className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-bold mb-2">REFERENCIA</p>
                <p className="text-xl font-serif text-white tracking-tight">
                  REF-{property.id.substring(0, 8).toUpperCase()}
                </p>
              </div>

              {property.status === "vendido" ? (
                <div className="bg-red-500/10 border border-red-500/20 p-10 backdrop-blur-md text-center">
                  <Badge className="bg-red-500 text-white border-0 rounded-none px-6 py-2 uppercase tracking-[0.3em] font-black text-[10px] mb-6">
                    VENDIDO
                  </Badge>
                  <h3 className="text-xl font-serif font-bold text-white mb-4">Esta propiedad ya no está disponible</h3>
                  <p className="text-white/40 text-xs leading-relaxed uppercase tracking-widest mb-8">
                    Ya ha sido vendida. Te invitamos a explorar otras opciones similares en nuestro portfolio.
                  </p>
                  <Button asChild variant="outline" className="w-full border-white/10 text-white hover:bg-white/5 rounded-none py-6 font-bold tracking-widest uppercase text-[10px]">
                    <Link to="/propiedades">Ver otras propiedades</Link>
                  </Button>
                </div>
              ) : (
                <div className="bg-white/5 border border-white/10 p-10 backdrop-blur-md relative">
                  <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                  
                  <h3 className="text-lg font-serif font-bold text-white mb-2 tracking-tight">Consultá ahora</h3>
                  <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] mb-10">Te respondemos a la brevedad.</p>

                  <form 
                    key={userInfo.email || "empty"}
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const form = e.target as HTMLFormElement;
                      const formData = new FormData(form);
                      
                      const nombre = formData.get("nombre") as string;
                      const email = formData.get("email") as string;
                      const telefono = formData.get("telefono") as string;
                      const consulta = formData.get("consulta") as string;

                      try {
                        const { error } = await supabase.from("inquiries").insert({
                          full_name: nombre,
                          email: email,
                          phone: telefono,
                          property_id: property.id,
                          message: consulta
                        });

                        if (error) throw error;

                        toast.success("Consulta enviada con éxito. Nos contactaremos a la brevedad.");
                        form.reset();
                      } catch (error) {
                        console.error("Error saving inquiry:", error);
                        toast.error("Hubo un error al enviar la consulta. Por favor, intenta de nuevo.");
                      }
                    }} 
                    className="space-y-8"
                  >
                    <div className="space-y-6">
                      <div className="group">
                        <Input 
                          name="nombre"
                          required
                          placeholder="Tu nombre *" 
                          defaultValue={userInfo.full_name}
                          className="bg-transparent border-0 border-b border-white/10 rounded-none focus-visible:ring-0 focus-visible:border-primary text-xs tracking-widest px-0 h-10 transition-colors group-hover:border-white/20"
                        />
                      </div>
                      <div className="group">
                        <Input 
                          name="email"
                          required
                          type="email"
                          placeholder="Tu email *" 
                          defaultValue={userInfo.email}
                          className="bg-transparent border-0 border-b border-white/10 rounded-none focus-visible:ring-0 focus-visible:border-primary text-xs tracking-widest px-0 h-10 transition-colors group-hover:border-white/20"
                        />
                      </div>
                      <div className="group">
                        <Input 
                          name="telefono"
                          placeholder="Tu teléfono" 
                          defaultValue={userInfo.phone}
                          className="bg-transparent border-0 border-b border-white/10 rounded-none focus-visible:ring-0 focus-visible:border-primary text-xs tracking-widest px-0 h-10 transition-colors group-hover:border-white/20"
                        />
                      </div>
                      <div className="group">
                        <Textarea 
                          name="consulta"
                          placeholder="Tu consulta" 
                          className="bg-transparent border-0 border-b border-white/10 rounded-none focus-visible:ring-0 focus-visible:border-primary text-xs tracking-widest px-0 min-h-[120px] resize-none transition-colors group-hover:border-white/20"
                        />
                      </div>
                    </div>
                    <Button 
                      type="submit"
                      className="w-full bg-primary text-black hover:bg-gold-light py-8 uppercase tracking-[0.4em] font-black rounded-none shadow-lg hover:shadow-primary/20 transition-all"
                    >
                      Enviar consulta
                    </Button>
                  </form>

                  {property.pdf_url && (
                    <div className="mt-12 pt-10 border-t border-white/10 text-center">
                      <a 
                        href={property.pdf_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] font-black text-white/40 hover:text-primary transition-colors"
                      >
                        <FileText className="w-5 h-5" /> Ver Ficha PDF
                      </a>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex items-center justify-center gap-8 mt-12">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success("Enlace copiado para Instagram");
                  }}
                  className="text-white/20 hover:text-primary transition-colors"
                  title="Copiar para Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </button>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-white/20 hover:text-primary transition-colors"
                  title="Compartir en Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(`Mirá esta propiedad: ${property.title}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-white/20 hover:text-primary transition-colors"
                  title="Compartir en WhatsApp / Telegram"
                >
                  <Send className="w-5 h-5" />
                </a>
              </div>
            </div>

          </div>

          {/* Related Section */}
          {related && related.length > 0 && (
            <div className="mt-40 pt-24 border-t border-white/5 pb-20">
              <div className="mb-20">
                <p className="text-primary text-[10px] uppercase tracking-[0.6em] font-black mb-4">DESCUBRÍ MÁS</p>
                <h2 className="text-5xl font-serif font-bold text-white uppercase tracking-tight">
                  Propiedades <em className="text-primary not-italic">Similares</em>
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {images.map((img, i) => (
                <div key={i} className="relative h-[500px] rounded-sm overflow-hidden bg-black/40 border border-white/5 group">
                  {/* Background Blur */}
                  <img 
                    src={img} 
                    alt="Gallery item blur" 
                    className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-30 scale-110"
                  />
                  {/* Main Image */}
                  <img 
                    src={img} 
                    alt="Gallery item" 
                    className="relative w-full h-full object-contain cursor-zoom-in z-10 transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetail;
