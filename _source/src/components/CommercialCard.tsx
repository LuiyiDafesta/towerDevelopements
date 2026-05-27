import { Link } from "react-router-dom";
import { Bath, Car, Maximize, Store, Building, Key } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Tables } from "@/integrations/supabase/types";

type Commercial = Tables<"commercials">;

interface CommercialCardProps {
  commercial: Commercial;
}

const statusColors: Record<string, string> = {
  disponible: "bg-emerald-600/90 text-white border-0",
  reservado: "bg-amber-600/90 text-white border-0",
  vendido: "bg-red-600/90 text-white border-0",
  alquilado: "bg-blue-600/90 text-white border-0",
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case "local": return <Store className="w-3.5 h-3.5" />;
    case "oficina": return <Building className="w-3.5 h-3.5" />;
    case "cochera": return <Key className="w-3.5 h-3.5" />;
    default: return null;
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case "local": return "Local";
    case "oficina": return "Oficina";
    case "cochera": return "Cochera";
    default: return type;
  }
};

const CommercialCard = ({ commercial }: CommercialCardProps) => {
  const image = commercial.image_url || commercial.images?.[0] || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800";

  return (
    <Link to={`/comerciales/${commercial.id}`} className="group block">
      <div className="relative overflow-hidden rounded-lg bg-card border border-border transition-all duration-500 hover:border-primary/40 hover:shadow-[0_0_30px_hsl(var(--primary)/0.1)]">
        {/* Image */}
        <div className="relative h-64 overflow-hidden">
          <img
            src={image}
            alt={commercial.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />

          {/* Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            {commercial.status && (
              <Badge className={statusColors[commercial.status] || ""}>
                {commercial.status.charAt(0).toUpperCase() + commercial.status.slice(1)}
              </Badge>
            )}
            {commercial.type && (
              <Badge className="bg-[#1A1A1A]/90 text-primary border border-primary/20 flex items-center gap-1.5 font-inter">
                {getTypeIcon(commercial.type)}
                {getTypeLabel(commercial.type)}
              </Badge>
            )}
            {commercial.featured && (
              <Badge className="bg-primary/90 text-primary-foreground border-0">Destacado</Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-baseline justify-between mb-1">
            <p className="text-2xl font-serif font-bold text-primary">
              USD {commercial.price.toLocaleString("es-AR")}
            </p>
            {commercial.expenses && commercial.expenses > 0 ? (
              <span className="text-xs text-muted-foreground font-inter">
                + USD {commercial.expenses.toLocaleString("es-AR")} exp.
              </span>
            ) : null}
          </div>
          
          <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors truncate">
            {commercial.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-4 truncate">{commercial.location}</p>

          {/* Features */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground border-t border-border pt-4 min-h-[40px]">
            {commercial.square_meters ? (
              <span className="flex items-center gap-1 font-inter">
                <Maximize className="w-4 h-4 text-primary" /> {commercial.square_meters} m²
              </span>
            ) : null}
            
            {commercial.type !== "cochera" && commercial.bathrooms ? (
              <span className="flex items-center gap-1 font-inter">
                <Bath className="w-4 h-4 text-primary" /> {commercial.bathrooms} Baños
              </span>
            ) : null}

            {commercial.type !== "cochera" && commercial.parking ? (
              <span className="flex items-center gap-1 font-inter">
                <Car className="w-4 h-4 text-primary" /> {commercial.parking} Coch.
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CommercialCard;
