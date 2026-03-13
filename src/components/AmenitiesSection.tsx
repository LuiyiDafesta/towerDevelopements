import { Waves, Dumbbell, Shield, Car, TreePine, Wifi, Sofa, ConciergeBell } from "lucide-react";

const amenities = [
  { icon: Waves, label: "Piscina" },
  { icon: Dumbbell, label: "Gimnasio" },
  { icon: Shield, label: "Seguridad 24hs" },
  { icon: Car, label: "Cochera" },
  { icon: TreePine, label: "Jardín" },
  { icon: Wifi, label: "Conectividad" },
  { icon: Sofa, label: "Lounge" },
  { icon: ConciergeBell, label: "Concierge" },
];

const AmenitiesSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <p className="text-primary text-sm font-medium tracking-[0.3em] uppercase mb-4 font-sans">
            Comodidades Premium
          </p>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground">
            Amenities de <em className="text-primary not-italic">Primera Clase</em>
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {amenities.map((amenity) => (
            <div
              key={amenity.label}
              className="flex flex-col items-center gap-4 p-8 rounded-xl bg-card border border-border transition-all duration-300 hover:border-primary/40 hover:shadow-[0_0_20px_hsl(var(--primary)/0.08)]"
            >
              <amenity.icon className="w-8 h-8 text-primary" />
              <span className="text-sm font-medium text-muted-foreground tracking-wider uppercase font-sans">
                {amenity.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AmenitiesSection;
