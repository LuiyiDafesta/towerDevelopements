import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Award, Building2, CheckCircle2, History, MapPin, Users2 } from "lucide-react";

const stats = [
  { label: "Años de Trayectoria", value: "15+", icon: History },
  { label: "Edificios Entregados", value: "24", icon: Building2 },
  { label: "Departamentos en CABA", value: "1.791", icon: Award },
  { label: "Clientes Satisfechos", value: "2.000+", icon: Users2 },
];

const values = [
  {
    title: "Calidad Constructiva",
    description: "Compromiso con el uso de materiales de alta gama y una distribución arquitectónica superior en cada detalle.",
  },
  {
    title: "Innovación & Tecnológia",
    description: "Integración de diseño funcional con tecnología de vanguardia para potenciar la experiencia de vida.",
  },
  {
    title: "Rentabilidad de Inversión",
    description: "Enfoque en proyectos que ofrecen un alto retorno para inversores, gestionando el ciclo completo del desarrollo.",
  },
  {
    title: "Exclusividad",
    description: "Dedicados a crear experiencias de vida únicas en las ubicaciones más codiciadas de Buenos Aires.",
  },
];

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <SEO 
        title="Nuestra Empresa | Trayectoria y Excelencia" 
        description="Conocé la historia de Tower Developers. Más de 15 años transformando el Real Estate de lujo en Buenos Aires con más de 1700 unidades entregadas."
        image="/tower_about_us_hero_1774965024054.png"
      />
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="/tower_about_us_hero_1774965024054.png" 
            alt="Tower Developers Office" 
            className="w-full h-full object-cover opacity-50 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black" />
        </div>
        
        <div className="container relative z-10 px-4 text-center">
          <h2 className="text-primary text-sm font-bold tracking-[0.5em] uppercase mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            Sobre Nosotros
          </h2>
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 tracking-tight animate-in fade-in slide-in-from-bottom-6 duration-1000">
            Liderando el <em className="text-primary not-italic">Real Estate</em> <br /> de Lujo
          </h1>
          <p className="max-w-2xl mx-auto text-white/60 text-lg md:text-xl font-light leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000">
            Especialistas en el desarrollo integral, diseño y comercialización de proyectos residenciales y comerciales de alta gama en Buenos Aires.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 border-y border-white/5 bg-neutral-900/30">
        <div className="container px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
            {stats.map((stat, i) => (
              <div key={stat.label} className="space-y-4 animate-in fade-in duration-1000" style={{ animationDelay: `${i * 200}ms` }}>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary">
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-4xl md:text-5xl font-serif font-bold text-primary tracking-tighter">
                  {stat.value}
                </div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Narrative Section */}
      <section className="py-32 container px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-primary text-xs font-black tracking-[0.4em] uppercase">Nuestra Historia</h3>
              <h2 className="text-4xl md:text-5xl font-serif font-bold leading-tight">
                15 años transformando la <br /> <span className="text-primary">arquitectura urbana</span>
              </h2>
            </div>
            <div className="space-y-6 text-white/70 text-lg leading-relaxed font-light">
              <p>
                Tower Developers nace con la visión de elevar los estándares del desarrollo inmobiliario en Argentina. 
                Nos especializamos en el ciclo completo del Real Estate: desde la conceptualización y el diseño arquitectónico 
                hasta la construcción y comercialización final.
              </p>
              <p>
                Con presencia en las zonas más exclusivas como <strong>Palermo Hollywood, Recoleta, Belgrano, Puerto Madero y Cerro Catedral</strong>, 
                cada uno de nuestros proyectos es una declaración de calidad y exclusividad.
              </p>
              <p className="italic border-l-2 border-primary pl-6 py-2 bg-primary/5">
                "Nuestro compromiso es crear experiencias de vida extraordinarias para quienes buscan lo mejor."
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((v) => (
              <div key={v.title} className="p-8 border border-white/5 bg-neutral-900/50 space-y-4 hover:border-primary/30 transition-colors group">
                <CheckCircle2 className="w-6 h-6 text-primary/40 group-hover:text-primary transition-colors" />
                <h4 className="font-serif font-bold text-xl">{v.title}</h4>
                <p className="text-white/40 text-sm leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Locations Banner */}
      <section className="pb-32 container px-4">
        <div className="bg-primary/10 border border-primary/20 p-12 text-center space-y-8">
          <div className="flex justify-center items-center gap-2 text-primary">
            <MapPin className="w-5 h-5" />
            <span className="text-xs uppercase tracking-[0.5em] font-black">Presencia Estratégica</span>
          </div>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-medium tracking-widest uppercase opacity-70">
            <span>Palermo</span>
            <span>Recoleta</span>
            <span>Belgrano</span>
            <span>Puerto Madero</span>
            <span>Nuñez</span>
            <span>Nordelta</span>
            <span>Cerro Catedral</span>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutUs;
