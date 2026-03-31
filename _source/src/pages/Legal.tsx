import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const Legal = () => {
  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <SEO 
        title="Legales | Tower Developers" 
        description="Información legal, términos y condiciones y políticas de privacidad de Tower Developers."
      />
      <Navbar />

      <section className="pt-40 pb-32 container px-4 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-16 tracking-tight border-b border-primary/20 pb-8 uppercase">
          Información <span className="text-primary">Legal</span>
        </h1>
        
        <div className="space-y-16">
          <article className="space-y-6">
            <h2 className="text-2xl font-serif font-bold text-primary">Términos y Condiciones</h2>
            <div className="space-y-4 text-white/60 leading-relaxed font-light">
              <p>
                Los presentes Términos y Condiciones regulan el uso del sitio web de Tower Developers. 
                Al acceder a este sitio, usted acepta cumplir con estos términos en su totalidad.
              </p>
              <p className="p-4 bg-primary/5 border-l-2 border-primary italic">
                [Espacio reservado para texto legal definitivo. Se incluirán detalles sobre el uso del sitio, 
                propiedad intelectual de los proyectos mostrados y limitaciones de responsabilidad.]
              </p>
              <p>
                La información sobre las propiedades, precios y disponibilidades es de carácter informativo y 
                puede estar sujeta a cambios sin previo aviso. Las imágenes son ilustrativas y pueden variar 
                según el desarrollo final del proyecto.
              </p>
            </div>
          </article>

          <article className="space-y-6">
            <h2 className="text-2xl font-serif font-bold text-primary">Política de Privacidad</h2>
            <div className="space-y-4 text-white/60 leading-relaxed font-light">
              <p>
                En Tower Developers, nos tomamos muy en serio la privacidad de sus datos. La información 
                recolectada a través de nuestros formularios de contacto y registro se utiliza exclusivamente 
                para brindarle un servicio personalizado sobre nuestras ofertas inmobiliarias.
              </p>
              <p className="p-4 bg-primary/5 border-l-2 border-primary italic">
                [Espacio reservado para texto legal definitivo sobre el tratamiento de datos personales 
                según las leyes locales vigentes.]
              </p>
              <p>
                No compartimos su información con terceros sin su consentimiento expreso, excepto cuando sea 
                necesario para la ejecución de los servicios solicitados o por requerimiento legal.
              </p>
            </div>
          </article>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Legal;
