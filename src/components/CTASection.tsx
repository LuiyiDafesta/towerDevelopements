import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTASection = () => {
  return (
    <section className="relative py-32 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=80')" }}
      />
      <div className="absolute inset-0 bg-background/80" />

      <div className="relative z-10 container mx-auto px-4 md:px-8 text-center">
        <h2 className="text-4xl md:text-6xl font-serif font-bold text-foreground mb-6">
          Tu nuevo hogar te está <em className="text-primary not-italic">esperando</em>
        </h2>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 font-sans">
          Agendá una visita y descubrí por qué somos la desarrolladora líder en Buenos Aires.
        </p>
        <Button
          asChild
          size="lg"
          className="bg-primary text-primary-foreground hover:bg-gold-light font-sans tracking-wider gap-2 text-base px-10 py-6"
        >
          <Link to="/propiedades">
            Ver Propiedades <ArrowRight className="w-5 h-5" />
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default CTASection;
