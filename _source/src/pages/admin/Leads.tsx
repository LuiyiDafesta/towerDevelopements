import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Loader2, Calendar, Phone, Mail, User, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AdminLeads() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setLeads(data || []);
    setLoading(false);
  };

  const filteredLeads = leads.filter(l => 
    l.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-playfair text-white tracking-wide">Leads de Clientes</h1>
          <p className="text-white/40 mt-2 font-inter">Visualiza y gestiona los prospectos interesados capturados en la web.</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        <input
          type="text"
          placeholder="Buscar por nombre, email o teléfono..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-black/40 border border-gold/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-gold/40"
        />
      </div>

      <div className="bg-black/40 border border-gold/10 rounded-lg overflow-hidden backdrop-blur-sm">
        <Table>
          <TableHeader className="bg-gold/5">
            <TableRow className="border-gold/10 hover:bg-transparent">
              <TableHead className="text-gold uppercase tracking-widest text-[10px] font-bold">Cliente</TableHead>
              <TableHead className="text-gold uppercase tracking-widest text-[10px] font-bold">Preferencias</TableHead>
              <TableHead className="text-gold uppercase tracking-widest text-[10px] font-bold">Objetivo / Plazo</TableHead>
              <TableHead className="text-gold uppercase tracking-widest text-[10px] font-bold">Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-20 text-white/20">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-gold" />
                    <span>Cargando leads...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredLeads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-20 text-white/20 font-inter font-light italic text-lg">
                  No se encontraron leads registrados.
                </TableCell>
              </TableRow>
            ) : (
              filteredLeads.map((l) => (
                <TableRow key={l.id} className="border-gold/10 hover:bg-white/5 transition-colors group">
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-white font-semibold">
                        <User className="w-3 h-3 text-gold/60" />
                        {l.full_name}
                      </div>
                      <div className="flex items-center gap-2 text-white/40 text-xs">
                        <Mail className="w-3 h-3" />
                        {l.email}
                      </div>
                      <div className="flex items-center gap-2 text-white/40 text-xs text-gold/80">
                        <Phone className="w-3 h-3" />
                        {l.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-white/80 text-xs">
                        <Badge variant="outline" className="border-gold/20 text-gold/80 rounded-none text-[9px] uppercase tracking-tighter">
                          {l.property_type || "No especificado"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-white/60 text-[11px]">
                        <Info className="w-3 h-3" />
                        Zona: {l.preferred_zone || "Cualquiera"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-xs text-white/80">
                        {l.purpose === "Inversión" ? (
                          <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[9px]">INVERSIÓN</Badge>
                        ) : (
                          <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-[9px]">VIVIENDA</Badge>
                        )}
                      </div>
                      <div className="text-[10px] text-white/40 uppercase tracking-widest">
                        {l.delivery_time}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-white/40 text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3 text-gold/40" />
                      {formatDate(l.created_at)}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
