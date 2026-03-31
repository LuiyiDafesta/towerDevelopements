import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building2, MapPin, Users, MessageSquare, TrendingUp, Clock, User, Mail, Phone, Calendar } from "lucide-react";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    properties: 0,
    neighborhoods: 0,
    leads: 0,
    inquiries: 0
  });
  const [recentLeads, setRecentLeads] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [props, neighs, leads, inquiries, recent] = await Promise.all([
        supabase.from("properties").select("id", { count: "exact", head: true }),
        supabase.from("neighborhoods").select("id", { count: "exact", head: true }),
        supabase.from("leads").select("id", { count: "exact", head: true }),
        supabase.from("inquiries").select("id", { count: "exact", head: true }),
        supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(5)
      ]);

      setStats({
        properties: props.count || 0,
        neighborhoods: neighs.count || 0,
        leads: leads.count || 0,
        inquiries: inquiries.count || 0
      });

      setRecentLeads(recent.data || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    { title: "Total Leads", value: stats.leads, icon: Users, color: "text-gold", description: "Interesados registrados" },
    { title: "Consultas", value: stats.inquiries, icon: MessageSquare, color: "text-gold", description: "Preguntas por propiedades" },
    { title: "Propiedades", value: stats.properties, icon: Building2, color: "text-gold", description: "Portfolio activo" },
    { title: "Barrios", value: stats.neighborhoods, icon: MapPin, color: "text-gold", description: "Presencia geográfica" },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-white/20">
        <Loader2 className="w-10 h-10 animate-spin text-gold mb-4" />
        <span className="font-inter tracking-widest uppercase text-xs">Cargando escritorio...</span>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-playfair text-white tracking-wide">Escritorio <em className="text-gold not-italic">Premium</em></h1>
          <p className="text-white/40 mt-2 font-inter">Bienvenido al centro de gestión de Tower Developers.</p>
        </div>
        <div className="bg-gold/5 border border-gold/20 px-4 py-2 rounded-none flex items-center gap-3">
          <TrendingUp className="w-4 h-4 text-gold" />
          <span className="text-[10px] text-gold uppercase tracking-widest font-black">Sitio en línea</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="bg-black/40 border-gold/10 backdrop-blur-sm group hover:border-gold/30 transition-all duration-500">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-[10px] font-bold text-white/40 tracking-[0.2em] uppercase">{card.title}</CardTitle>
                <div className="p-2 bg-white/5 rounded-lg group-hover:bg-gold/10 transition-colors">
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-playfair text-white mb-1">{card.value}</div>
                <p className="text-[10px] text-white/20 uppercase tracking-widest">{card.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Recent Activity (Leads) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gold/10 rounded-full">
                <Clock className="w-4 h-4 text-gold" />
              </div>
              <h2 className="text-xl font-serif text-white tracking-wide">Actividad Reciente</h2>
            </div>
            <Badge variant="outline" className="border-white/10 text-white/40 text-[9px] uppercase tracking-widest font-normal">
              Últimos 5 Leads
            </Badge>
          </div>

          <div className="bg-black/40 border border-gold/10 backdrop-blur-sm rounded-none overflow-hidden">
            <div className="divide-y divide-gold/5">
              {recentLeads.length > 0 ? recentLeads.map((lead) => (
                <div key={lead.id} className="p-6 hover:bg-gold/5 transition-colors group flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-10 h-10 rounded-full bg-white/5 service-icon flex items-center justify-center border border-white/10 group-hover:border-gold/30 transition-all">
                      <User className="w-4 h-4 text-white/40 group-hover:text-gold" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium text-sm group-hover:text-gold transition-colors">{lead.full_name}</h4>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1.5 text-[10px] text-white/30 lowercase italic">
                          <Mail className="w-3 h-3" /> {lead.email}
                        </span>
                        <span className="flex items-center gap-1.5 text-[10px] text-gold/60">
                          <Phone className="w-3 h-3" /> {lead.phone}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <div className="flex items-center gap-2 justify-end mb-1">
                      <Badge className="bg-gold/10 text-gold border-gold/20 text-[9px] uppercase tracking-tighter">
                        {lead.property_type || "Interesado"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] text-white/20 uppercase tracking-widest justify-end">
                      <Calendar className="w-3 h-3" />
                      {new Date(lead.created_at).toLocaleDateString("es-AR")}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="p-20 text-center text-white/20 italic font-inter font-light">
                  No hay actividad reciente registrada.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions / Tips */}
        <div className="lg:col-span-4 space-y-6">
          <h2 className="text-xl font-serif text-white tracking-wide ml-2">Enlace Rápido</h2>
          <Card className="bg-gold/5 border-gold/20 rounded-none relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
              <TrendingUp className="w-20 h-20 text-gold" />
            </div>
            <CardHeader>
              <CardTitle className="text-sm font-bold text-gold uppercase tracking-[0.2em]">Crecimiento</CardTitle>
              <CardDescription className="text-white/60 text-xs">
                Capturaste {stats.leads} leads desde el lanzamiento del portal.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-[10px] text-white/40 leading-relaxed uppercase tracking-widest border-t border-gold/10 pt-4 mt-2">
                "La persistencia en el seguimiento de un lead aumenta las posibilidades de venta en un 40%."
              </p>
            </CardContent>
          </Card>

          <Card className="bg-black/60 border-white/5 rounded-none group hover:border-gold/20 transition-all">
            <CardHeader className="pb-3 text-center">
              <Building2 className="w-8 h-8 text-white/20 mx-auto mb-4 group-hover:text-gold transition-colors" />
              <CardTitle className="text-xs font-bold text-white uppercase tracking-widest">¿Nueva Propiedad?</CardTitle>
            </CardHeader>
            <CardContent className="text-center pt-0">
              <p className="text-[10px] text-white/40 mb-6 uppercase tracking-widest">Añade un nuevo proyecto a tu portfolio inmobiliario.</p>
              <a 
                href="/admin/propiedades/nueva"
                className="inline-block w-full py-3 border border-gold/20 text-gold text-[10px] font-black uppercase tracking-[0.3em] hover:bg-gold hover:text-black transition-all"
              >
                Sumar Propiedad
              </a>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
