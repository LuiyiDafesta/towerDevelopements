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

      <section className="pt-40 pb-32 container px-4 max-w-4xl mx-auto shadow-2xl">
        <div className="mb-16">
          <p className="text-primary text-[10px] uppercase tracking-[0.6em] font-black mb-4">SEGURIDAD Y TRANSPARENCIA</p>
          <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight border-b border-primary/20 pb-8 uppercase">
            Información <span className="text-primary">Legal</span>
          </h1>
        </div>
        
        <div className="space-y-20">
          <article className="space-y-8">
            <h2 className="text-2xl font-serif font-bold text-primary flex items-center gap-4">
              <span className="w-8 h-px bg-primary/30"></span> Términos y Condiciones
            </h2>
            <div className="space-y-6 text-white/60 leading-relaxed font-light text-sm md:text-base">
              <p>
                El acceso y uso de este sitio web atribuye la condición de Usuario, quien acepta, desde dicho acceso y/o uso, los Términos y Condiciones aquí reflejados.
              </p>
              
              <div className="space-y-4 p-8 bg-white/5 border border-white/10 rounded-sm">
                <h3 className="text-white font-bold uppercase tracking-widest text-xs">1. Veracidad de la Información</h3>
                <p>
                  Toda la información volcada en este sitio referente a proyectos inmobiliarios, sus medidas, renders, superficies y precios es de carácter estrictamente informativo y puede estar sujeta a modificaciones sin previo aviso. Los renders e imágenes son representaciones artísticas digitales y pueden no coincidir exactamente con el resultado final de la obra.
                </p>
              </div>

              <div className="space-y-4 p-8 bg-white/5 border border-white/10 rounded-sm">
                <h3 className="text-white font-bold uppercase tracking-widest text-xs">2. Propiedad Intelectual</h3>
                <p>
                  Tower Developers es titular de todos los derechos de propiedad intelectual e industrial de este sitio web, así como de los elementos contenidos en el mismo (imágenes, audios, vídeos, software, textos, marcas o logotipos). Queda prohibida la reproducción, distribución y comunicación pública de la totalidad o parte de los contenidos de esta página web con fines comerciales sin la autorización expresa.
                </p>
              </div>

              <div className="space-y-4 p-8 bg-white/5 border border-white/10 rounded-sm">
                <h3 className="text-white font-bold uppercase tracking-widest text-xs">3. Responsabilidad</h3>
                <p>
                  Tower Developers no se hace responsable, en ningún caso, de los daños y perjuicios de cualquier naturaleza que pudieran ocasionar, a título enunciativo: errores u omisiones en los contenidos, falta de disponibilidad del portal o la transmisión de virus o programas maliciosos.
                </p>
              </div>
            </div>
          </article>

          <article className="space-y-8">
            <h2 className="text-2xl font-serif font-bold text-primary flex items-center gap-4">
              <span className="w-8 h-px bg-primary/30"></span> Política de Privacidad
            </h2>
            <div className="space-y-6 text-white/60 leading-relaxed font-light text-sm md:text-base">
              <p>
                Conforme a la Ley de Protección de Datos Personales (Ley 25.326 de la República Argentina), informamos que sus datos serán tratados con la máxima confidencialidad.
              </p>
              
              <div className="space-y-4 p-8 bg-white/5 border border-white/10 rounded-sm">
                <h3 className="text-white font-bold uppercase tracking-widest text-xs">Tratamiento de Datos</h3>
                <p>
                  Los datos personales que se soliciten en los formularios de contacto se utilizarán exclusivamente para gestionar su consulta y enviarle información comercial sobre nuestros desarrollos inmobiliarios. El titular de los datos personales tiene la facultad de ejercer el derecho de acceso, rectificación o supresión de los mismos en forma gratuita.
                </p>
              </div>

              <p>
                Al completar cualquier formulario en nuestro sitio, usted consiente expresamente que sus datos sean incorporados a nuestra base de contactos para fines comerciales. No compartimos su información con terceros sin su consentimiento expreso, excepto cuando sea necesario para la ejecución del servicio inmobiliario solicitado.
              </p>
            </div>
          </article>

          <div className="pt-10 border-t border-white/10 text-center">
            <p className="text-[10px] text-white/20 uppercase tracking-[0.4em]">© {new Date().getFullYear()} TOWER DEVELOPERS. TODOS LOS DERECHOS RESERVADOS.</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Legal;
