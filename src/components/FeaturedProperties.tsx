import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import PropertyCard from "./PropertyCard";
import { Skeleton } from "@/components/ui/skeleton";

const FeaturedProperties = () => {
  const { data: properties, isLoading } = useQuery({
    queryKey: ["featured-properties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("featured", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <p className="text-primary text-sm font-medium tracking-[0.3em] uppercase mb-4 font-sans">
            Selección Exclusiva
          </p>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground">
            Propiedades <em className="text-primary not-italic">Destacadas</em>
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg overflow-hidden">
                <Skeleton className="h-64 w-full" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties?.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProperties;
