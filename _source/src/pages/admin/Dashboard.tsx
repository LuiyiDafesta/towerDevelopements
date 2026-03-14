import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, MapPin, Users } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    properties: 0,
    neighborhoods: 0,
    users: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const [props, neighs, users] = await Promise.all([
      supabase.from("properties").select("id", { count: "exact", head: true }),
      supabase.from("neighborhoods").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("id", { count: "exact", head: true })
    ]);

    setStats({
      properties: props.count || 0,
      neighborhoods: neighs.count || 0,
      users: users.count || 0
    });
  };

  const cards = [
    { title: "Propiedades", value: stats.properties, icon: Building2, color: "text-blue-400" },
    { title: "Barrios", value: stats.neighborhoods, icon: MapPin, color: "text-green-400" },
    { title: "Usuarios/Admins", value: stats.users, icon: Users, color: "text-purple-400" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-playfair text-white tracking-wide">Bienvenido, Admin</h1>
        <p className="text-white/40 mt-2 font-inter">Resumen general de tu portfolio inmobiliario.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="bg-black/40 border-gold/10 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-white/60 tracking-widest uppercase">{card.title}</CardTitle>
                <Icon className={`w-5 h-5 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-playfair text-white">{card.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
