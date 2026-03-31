import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Save, Webhook, ExternalLink, Info } from "lucide-react";

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [webhooks, setWebhooks] = useState({
    webhook_leads: "",
    webhook_inquiries: "",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("admin_settings")
        .select("key, value");

      if (error) throw error;

      const settings: any = {};
      data?.forEach((item) => {
        settings[item.key] = item.value || "";
      });

      setWebhooks({
        webhook_leads: settings.webhook_leads || "",
        webhook_inquiries: settings.webhook_inquiries || "",
      });
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("No se pudieron cargar las configuraciones.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updates = Object.entries(webhooks).map(([key, value]) => ({
        key,
        value,
        updated_at: new Date().toISOString(),
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from("admin_settings")
          .upsert(update, { onConflict: "key" });
        if (error) throw error;
      }

      toast.success("Configuración guardada correctamente.");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Error al guardar la configuración.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-white/20">
        <Loader2 className="w-10 h-10 animate-spin text-gold mb-4" />
        <span className="font-inter tracking-widest uppercase text-xs">Cargando configuración...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl">
      <div>
        <h1 className="text-3xl font-playfair text-white tracking-wide">Configuración del Sistema</h1>
        <p className="text-white/40 mt-2 font-inter">Gestiona las integraciones y webhooks externos para automatizar tu flujo de trabajo.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="bg-black/40 border-gold/10 backdrop-blur-sm overflow-hidden">
          <CardHeader className="bg-gold/5 border-b border-gold/10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gold/10 rounded-lg">
                <Webhook className="w-5 h-5 text-gold" />
              </div>
              <div>
                <CardTitle className="text-xl text-white font-serif">Webhooks de Integración (n8n / CRM)</CardTitle>
                <CardDescription className="text-white/40 text-xs uppercase tracking-widest mt-1">
                  Configura las URLs donde se enviarán los datos en tiempo real.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="grid gap-8">
              {/* Leads Webhook */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="webhook_leads" className="text-gold/80 text-xs uppercase tracking-[0.2em] font-bold">
                    Webhook para Captura de Leads
                  </Label>
                  <a 
                    href="https://n8n.io" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-[10px] text-white/20 hover:text-gold flex items-center gap-1 transition-colors uppercase tracking-widest font-black"
                  >
                    n8n Documentation <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <Input
                  id="webhook_leads"
                  value={webhooks.webhook_leads}
                  onChange={(e) => setWebhooks({ ...webhooks, webhook_leads: e.target.value })}
                  placeholder="https://tu-instancia.n8n.cloud/webhook/..."
                  className="bg-white/5 border-gold/10 text-white focus-visible:ring-gold/40 placeholder:text-white/10 h-12"
                />
                <p className="text-[11px] text-white/30 flex items-start gap-2 italic">
                  <Info className="w-3 h-3 mt-0.5 shrink-0 text-gold/40" />
                  Se disparará cada vez que un nuevo visitante complete el formulario de entrada (Lead Capture). 
                  Payload: Full Lead Object (Nombre, Email, Teléfono, Zona, Propósito, Plazo).
                </p>
              </div>

              {/* Inquiries Webhook */}
              <div className="space-y-4">
                <Label htmlFor="webhook_inquiries" className="text-gold/80 text-xs uppercase tracking-[0.2em] font-bold">
                  Webhook para Consultas de Propiedades
                </Label>
                <Input
                  id="webhook_inquiries"
                  value={webhooks.webhook_inquiries}
                  onChange={(e) => setWebhooks({ ...webhooks, webhook_inquiries: e.target.value })}
                  placeholder="https://tu-instancia.n8n.cloud/webhook/..."
                  className="bg-white/5 border-gold/10 text-white focus-visible:ring-gold/40 placeholder:text-white/10 h-12"
                />
                <p className="text-[11px] text-white/30 flex items-start gap-2 italic">
                  <Info className="w-3 h-3 mt-0.5 shrink-0 text-gold/40" />
                  Se disparará cuando un cliente consulte por una propiedad específica. 
                  Payload: Contacto del cliente + Metadatos de la propiedad (ID, Título, Ref, Precio).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-4">
          <Button 
            type="submit" 
            disabled={saving}
            className="bg-gold hover:bg-gold/80 text-black font-bold h-12 px-10 transition-all duration-300 shadow-lg shadow-gold/10 flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                GUARDAR CONFIGURACIÓN
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
