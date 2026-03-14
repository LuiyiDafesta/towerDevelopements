import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const HeroSection = () => {
  const navigate = useNavigate();
  const [bedrooms, setBedrooms] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (bedrooms) params.set("bedrooms", bedrooms);
    if (maxPrice) params.set("maxPrice", maxPrice);
    navigate(`/propiedades?${params.toString()}`);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80')" }}
      />
      <div className="absolute inset-0 bg-background/75" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 md:px-8 text-center">
        <p className="text-primary text-sm font-medium tracking-[0.3em] uppercase mb-6 animate-fade-in-up">
          Desarrollos Inmobiliarios de Lujo
        </p>
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-foreground mb-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          Vivir en <em className="text-primary not-italic">Otro Nivel</em>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          Descubrí las propiedades más exclusivas de Buenos Aires. Diseñadas para quienes buscan lo extraordinario.
        </p>

        {/* Search bar */}
        <div className="max-w-3xl mx-auto bg-card/80 backdrop-blur-md border border-border rounded-xl p-4 md:p-6 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={bedrooms} onValueChange={setBedrooms}>
              <SelectTrigger className="bg-secondary border-border text-foreground font-sans">
                <SelectValue placeholder="Dormitorios" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Dormitorio</SelectItem>
                <SelectItem value="2">2 Dormitorios</SelectItem>
                <SelectItem value="3">3 Dormitorios</SelectItem>
                <SelectItem value="4">4+ Dormitorios</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="number"
              placeholder="Precio máximo (USD)"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="bg-secondary border-border text-foreground font-sans"
            />

            <Button
              onClick={handleSearch}
              className="bg-primary text-primary-foreground hover:bg-gold-light font-sans tracking-wider gap-2"
            >
              <Search className="w-4 h-4" />
              Buscar
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
