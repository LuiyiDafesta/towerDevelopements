import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";

const Properties = () => {
  const [searchParams] = useSearchParams();
  const [ambientes, setAmbientes] = useState(searchParams.get("ambientes") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [neighborhood, setNeighborhood] = useState(searchParams.get("neighborhood") || "");

  const { data: properties, isLoading } = useQuery({
    queryKey: ["all-properties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*, neighborhoods(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const neighborhoodsList = useMemo(() => {
    if (!properties) return [];
    const names = properties.map((p) => p.neighborhoods?.name).filter(Boolean);
    return [...new Set(names)];
  }, [properties]);

  const filtered = useMemo(() => {
    if (!properties) return [];
    return properties.filter((p) => {
      const selectedAmbientes = parseInt(ambientes);
      if (ambientes && ambientes !== "all" && !isNaN(selectedAmbientes) && (p.ambientes === null || p.ambientes < selectedAmbientes)) return false;
      if (maxPrice && p.price > parseInt(maxPrice)) return false;
      if (neighborhood && neighborhood !== "all" && p.neighborhoods?.name !== neighborhood) return false;
      return true;
    });
  }, [properties, ambientes, maxPrice, neighborhood]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <div className="pt-32 pb-12 bg-secondary">
        <div className="container mx-auto px-4 md:px-8">
          <p className="text-primary text-sm font-medium tracking-[0.3em] uppercase mb-4 font-sans">
            Nuestro Portfolio
          </p>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-foreground">
            Todas las <em className="text-primary not-italic">Propiedades</em>
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-12">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 p-6 bg-card rounded-xl border border-border">
          <div>
            <Label className="text-muted-foreground font-sans text-xs tracking-wider uppercase mb-2 block">Ambientes</Label>
            <Select value={ambientes} onValueChange={setAmbientes}>
              <SelectTrigger className="bg-secondary border-border font-sans">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="1">1+</SelectItem>
                <SelectItem value="2">2+</SelectItem>
                <SelectItem value="3">3+</SelectItem>
                <SelectItem value="4">4+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-muted-foreground font-sans text-xs tracking-wider uppercase mb-2 block">Precio máximo (USD)</Label>
            <Input
              type="number"
              placeholder="Sin límite"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="bg-secondary border-border font-sans"
            />
          </div>

          <div>
            <Label className="text-muted-foreground font-sans text-xs tracking-wider uppercase mb-2 block">Barrio</Label>
            <Select value={neighborhood} onValueChange={setNeighborhood}>
              <SelectTrigger className="bg-secondary border-border font-sans">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {neighborhoodsList.map((n) => (
                  <SelectItem key={n} value={n}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-lg overflow-hidden">
                <Skeleton className="h-64 w-full" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-5 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl font-serif text-muted-foreground">No se encontraron propiedades</p>
            <p className="text-sm text-muted-foreground mt-2 font-sans">Intentá ajustar los filtros</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Properties;
