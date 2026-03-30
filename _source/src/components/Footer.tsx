import { Link } from "react-router-dom";
import { Award, Clock, ShieldCheck } from "lucide-react";

const badges = [
  { icon: Award, label: "Mejor Desarrolladora 2024" },
  { icon: Clock, label: "Entrega en Tiempo" },
  { icon: ShieldCheck, label: "Inversión Segura" },
];

const Footer = () => {
  return (
    <footer className="bg-black border-t border-white/5">
      {/* Trust badges */}
      <div className="container mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {badges.map((badge) => (
            <div key={badge.label} className="flex items-center justify-center gap-3 text-muted-foreground">
              <badge.icon className="w-6 h-6 text-primary" />
              <span className="text-sm font-medium tracking-wider uppercase">{badge.label}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xl font-serif font-bold text-primary">Tower</span>
              <span className="text-xl font-serif font-light text-foreground">Developers</span>
            </div>
            <div className="text-xs text-muted-foreground tracking-widest uppercase font-sans">
              Más de 25 años de experiencia
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8 text-center md:text-left">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/40 mb-1">Contacto</p>
              <a href="https://wa.me/5491165717856" target="_blank" rel="noreferrer" className="text-sm text-foreground hover:text-primary transition-colors">+54 9 11 6571 7856</a>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/40 mb-1">Email</p>
              <a href="mailto:info@towerdevelopers.com" className="text-sm text-foreground hover:text-primary transition-colors">info@towerdevelopers.com</a>
            </div>
          </div>

          <div className="flex flex-col items-center md:items-end gap-4">
            <div className="flex gap-6">
              <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">Inicio</Link>
              <Link to="/propiedades" className="text-sm text-muted-foreground hover:text-primary transition-colors">Propiedades</Link>
            </div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
              © {new Date().getFullYear()} Tower Developers.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
