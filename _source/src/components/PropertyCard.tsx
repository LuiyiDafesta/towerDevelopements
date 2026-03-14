import { Link } from "react-router-dom";
import { Bath, BedDouble, Car, Maximize } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Tables } from "@/integrations/supabase/types";

type Property = Tables<"properties">;

interface PropertyCardProps {
  property: Property;
}

const statusColors: Record<string, string> = {
  disponible: "bg-emerald-600/90 text-white border-0",
  reservado: "bg-amber-600/90 text-white border-0",
  vendido: "bg-red-600/90 text-white border-0",
};

const PropertyCard = ({ property }: PropertyCardProps) => {
  const image = property.image_url || property.images?.[0] || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800";

  return (
    <Link to={`/propiedades/${property.id}`} className="group block">
      <div className="relative overflow-hidden rounded-lg bg-card border border-border transition-all duration-500 hover:border-primary/40 hover:shadow-[0_0_30px_hsl(var(--primary)/0.1)]">
        {/* Image */}
        <div className="relative h-64 overflow-hidden">
          <img
            src={image}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />

          {/* Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            {property.status && (
              <Badge className={statusColors[property.status] || ""}>
                {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
              </Badge>
            )}
            {property.featured && (
              <Badge className="bg-primary/90 text-primary-foreground border-0">Destacado</Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <p className="text-2xl font-serif font-bold text-primary mb-1">
            USD {property.price.toLocaleString("es-AR")}
          </p>
          <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
            {property.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">{property.location}</p>

          {/* Features */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground border-t border-border pt-4">
            {property.square_meters && (
              <span className="flex items-center gap-1">
                <Maximize className="w-4 h-4 text-primary" /> {property.square_meters} m²
              </span>
            )}
            {property.bedrooms && (
              <span className="flex items-center gap-1">
                <BedDouble className="w-4 h-4 text-primary" /> {property.bedrooms}
              </span>
            )}
            {property.bathrooms && (
              <span className="flex items-center gap-1">
                <Bath className="w-4 h-4 text-primary" /> {property.bathrooms}
              </span>
            )}
            {property.parking ? (
              <span className="flex items-center gap-1">
                <Car className="w-4 h-4 text-primary" /> {property.parking}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
