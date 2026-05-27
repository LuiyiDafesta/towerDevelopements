import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";
import CommercialCard from "@/components/CommercialCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";

const Commercials = () => {
  const [searchParams] = useSearchParams();
  const [type, setType] = useState<string>(searchParams.get("type") || "all");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [neighborhood, setNeighborhood] = useState(searchParams.get("neighborhood") || "");

  const { data: commercials, isLoading } = useQuery({
    queryKey: ["all-commercials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("commercials")
        .select("*, neighborhoods(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const neighborhoodsList = useMemo(() => {
    if (!commercials) return [];
    const names = commercials.map((c) => c.neighborhoods?.name).filter(Boolean);
    return [...new Set(names)];
  }, [commercials]);

  const filtered = useMemo(() => {
    if (!commercials) return [];
    return commercials.filter((c) => {
      // Type filter
      if (type !== "all" && c.type !== type) return false;
      
      // Price filter
      if (maxPrice && c.price > parseInt(maxPrice)) return false;
      
      // Neighborhood filter
      if (neighborhood && neighborhood !== "all" && c.neighborhoods?.name !== neighborhood) return false;
      
      return true;
    });
  }, [commercials, type, maxPrice, neighborhood]);

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Locales, Oficinas y Cocheras" 
        description="Explorá nuestro portfolio comercial de oficinas, locales comerciales y cocheras exclusivas en Buenos Aires con Tower Developers."
      />
      <Navbar />

      {/* Header */}
      <div className="pt-32 pb-12 bg-secondary">
        <div className="container mx-auto px-4 md:px-8">
          <p className="text-primary text-sm font-medium tracking-[0.3em] uppercase mb-4 font-sans">
            Portfolio Comercial
          </p>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-foreground">
            Locales, Oficinas <em className="text-primary not-italic">& Cocheras</em>
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-12">
        
        {/* Filters */}
        <div className="bg-card rounded-xl border border-border p-6 mb-12 space-y-6">
          
          {/* Custom Tabs for Types */}
          <div>
            <Label className="text-muted-foreground font-sans text-xs tracking-wider uppercase mb-3 block">Tipo de Inmueble</Label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: "all", label: "Todos" },
                { value: "local", label: "Locales" },
                { value: "oficina", label: "Oficinas" },
                { value: "cochera", label: "Cocheras" }
              ].map((t) => (
                <button
                  key={t.value}
                  onClick={() => setType(t.value)}
                  className={`px-5 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-widest transition-all duration-300 font-inter border ${
                    type === t.value
                      ? "bg-primary text-primary-foreground border-primary shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                      : "bg-secondary text-muted-foreground border-border hover:text-foreground hover:border-primary/20"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/40">
            <div>
              <Label className="text-muted-foreground font-sans text-xs tracking-wider uppercase mb-2 block">Precio máximo (USD)</Label>
              <Input
                type="number"
                placeholder="Sin límite"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="bg-secondary border-border font-sans focus-visible:ring-primary/40 text-white"
              />
            </div>

            <div>
              <Label className="text-muted-foreground font-sans text-xs tracking-wider uppercase mb-2 block">Barrio</Label>
              <Select value={neighborhood} onValueChange={setNeighborhood}>
                <SelectTrigger className="bg-secondary border-border font-sans text-white focus:ring-primary/40">
                  <SelectValue placeholder="Todos los barrios" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-border text-white">
                  <SelectItem value="all">Todos los barrios</SelectItem>
                  {neighborhoodsList.map((n) => (
                    <SelectItem key={n} value={n}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-lg overflow-hidden border border-border bg-card">
                <Skeleton className="h-64 w-full bg-muted" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-6 w-1/3 bg-muted" />
                  <Skeleton className="h-5 w-2/3 bg-muted" />
                  <Skeleton className="h-4 w-1/2 bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-xl border border-border/50">
            <p className="text-2xl font-serif text-muted-foreground">No se encontraron inmuebles comerciales</p>
            <p className="text-sm text-muted-foreground mt-2 font-sans">Intentá ajustar los filtros o el tipo de espacio.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((commercial) => (
              <CommercialCard key={commercial.id} commercial={commercial} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Commercials;
