import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Save, Webhook, ExternalLink, Info, BarChart3, Facebook, Users } from "lucide-react";

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    webhook_leads: "",
    webhook_inquiries: "",
    google_analytics_id: "",
    facebook_pixel_id: "",
    visitor_tracking_code: "",
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

      setFormData({
        webhook_leads: settings.webhook_leads || "",
        webhook_inquiries: settings.webhook_inquiries || "",
        google_analytics_id: settings.google_analytics_id || "",
        facebook_pixel_id: settings.facebook_pixel_id || "",
        visitor_tracking_code: settings.visitor_tracking_code || "",
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
      const updates = Object.entries(formData).map(([key, value]) => ({
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
        <p className="text-white/40 mt-2 font-inter">Gestiona las integraciones, webhooks y herramientas de marketing para Tower Developers.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Webhooks Section */}
        <Card className="bg-black/40 border-gold/10 backdrop-blur-sm overflow-hidden">
          <CardHeader className="bg-gold/5 border-b border-gold/10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gold/10 rounded-lg">
                <Webhook className="w-5 h-5 text-gold" />
              </div>
              <div>
                <CardTitle className="text-xl text-white font-serif">Integración Automática (CRM)</CardTitle>
                <CardDescription className="text-white/40 text-xs uppercase tracking-widest mt-1">
                  Configura las URLs de n8n para recibir leads y consultas.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="grid gap-8">
              <div className="space-y-4">
                <Label htmlFor="webhook_leads" className="text-gold/80 text-xs uppercase tracking-[0.2em] font-bold">
                  Webhook para Leads
                </Label>
                <Input
                  id="webhook_leads"
                  value={formData.webhook_leads}
                  onChange={(e) => setFormData({ ...formData, webhook_leads: e.target.value })}
                  placeholder="https://n8n.tu-instancia.com/webhook/..."
                  className="bg-white/5 border-gold/10 text-white focus-visible:ring-gold/40 placeholder:text-white/10 h-12"
                />
              </div>
              <div className="space-y-4">
                <Label htmlFor="webhook_inquiries" className="text-gold/80 text-xs uppercase tracking-[0.2em] font-bold">
                  Webhook para Consultas
                </Label>
                <Input
                  id="webhook_inquiries"
                  value={formData.webhook_inquiries}
                  onChange={(e) => setFormData({ ...formData, webhook_inquiries: e.target.value })}
                  placeholder="https://n8n.tu-instancia.com/webhook/..."
                  className="bg-white/5 border-gold/10 text-white focus-visible:ring-gold/40 placeholder:text-white/10 h-12"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Marketing & Tracking Section */}
        <Card className="bg-black/40 border-gold/10 backdrop-blur-sm overflow-hidden">
          <CardHeader className="bg-gold/5 border-b border-gold/10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gold/10 rounded-lg">
                <BarChart3 className="w-5 h-5 text-gold" />
              </div>
              <div>
                <CardTitle className="text-xl text-white font-serif">Marketing & Tracking</CardTitle>
                <CardDescription className="text-white/40 text-xs uppercase tracking-widest mt-1">
                  Mide el éxito de tus campañas pegando tus IDs de seguimiento.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-10">
            {/* Google Analytics */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-gold/60" />
                <Label htmlFor="ga_id" className="text-gold/80 text-xs uppercase tracking-[0.2em] font-bold">
                  Google Analytics ID (G-XXXXXXXXXX)
                </Label>
              </div>
              <Input
                id="ga_id"
                value={formData.google_analytics_id}
                onChange={(e) => setFormData({ ...formData, google_analytics_id: e.target.value })}
                placeholder="G-..."
                className="bg-white/5 border-gold/10 text-white focus-visible:ring-gold/40 placeholder:text-white/10 h-12 font-mono"
              />
            </div>

            {/* Facebook Pixel */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Facebook className="w-4 h-4 text-gold/60" />
                <Label htmlFor="fb_id" className="text-gold/80 text-xs uppercase tracking-[0.2em] font-bold">
                  Facebook Pixel ID
                </Label>
              </div>
              <Input
                id="fb_id"
                value={formData.facebook_pixel_id}
                onChange={(e) => setFormData({ ...formData, facebook_pixel_id: e.target.value })}
                placeholder="Ej: 1234567890..."
                className="bg-white/5 border-gold/10 text-white focus-visible:ring-gold/40 placeholder:text-white/10 h-12 font-mono"
              />
            </div>

            {/* Visitor Tracking */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gold/60" />
                <Label htmlFor="visitor_track" className="text-gold/80 text-xs uppercase tracking-[0.2em] font-bold">
                  Visitor Tracking Script / ID
                </Label>
              </div>
              <Input
                id="visitor_track"
                value={formData.visitor_tracking_code}
                onChange={(e) => setFormData({ ...formData, visitor_tracking_code: e.target.value })}
                placeholder="Pega el script o ID de seguimiento aquí"
                className="bg-white/5 border-gold/10 text-white focus-visible:ring-gold/40 placeholder:text-white/10 h-12 font-mono"
              />
              <p className="text-[10px] text-white/20 uppercase tracking-widest leading-relaxed">
                Este código se inyectará automáticamente en el cabezado (HEAD) de todas las páginas para rastrear visitantes únicos.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-4">
          <Button 
            type="submit" 
            disabled={saving}
            className="bg-gold hover:bg-gold/80 text-black font-black h-12 px-12 transition-all duration-300 shadow-xl shadow-gold/10 flex items-center gap-2 uppercase tracking-widest text-xs"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Guardar Configuración
          </Button>
        </div>
      </form>
    </div>
  );
}
