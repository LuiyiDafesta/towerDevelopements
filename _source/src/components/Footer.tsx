import { Link } from "react-router-dom";
import { Award, Clock, ShieldCheck } from "lucide-react";

const badges = [
  { icon: Clock, label: "Entrega en Tiempo" },
  { icon: ShieldCheck, label: "Inversión Segura" },
];

const Footer = () => {
  return (
    <footer className="bg-black border-t border-white/5">
      {/* Trust badges */}
      <div className="container mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {badges.map((badge) => (
            <div key={badge.label} className="flex items-center justify-center gap-3 text-muted-foreground">
              <badge.icon className="w-6 h-6 text-primary" />
              <span className="text-sm font-medium tracking-wider uppercase">{badge.label}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <img src="/logo.png" alt="Tower Developers" className="w-10 h-10 object-contain rounded-md border border-white/5" />
              <div className="flex flex-col -space-y-1">
                <span className="text-base font-serif font-bold text-primary tracking-wide">Tower</span>
                <span className="text-base font-serif font-light text-foreground tracking-wide">Developers</span>
              </div>
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
              <a href="mailto:contacto@towerdevelopers.com.ar" className="text-sm text-foreground hover:text-primary transition-colors">contacto@towerdevelopers.com.ar</a>
            </div>
          </div>

          <div className="flex flex-col items-center md:items-end gap-4">
            <div className="flex flex-wrap gap-4 md:gap-6 justify-center md:justify-end">
              <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">Inicio</Link>
              <Link to="/nosotros" className="text-sm text-muted-foreground hover:text-primary transition-colors">Nosotros</Link>
              <Link to="/propiedades" className="text-sm text-muted-foreground hover:text-primary transition-colors">Propiedades</Link>
              <Link to="/legales" className="text-sm text-muted-foreground hover:text-primary transition-colors">Legales</Link>
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
