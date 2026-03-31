import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Loader2, Calendar, Phone, Mail, User, Info, Download, FileJson, FileText, CheckCircle2, Clock, XCircle, HelpCircle, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious,
  PaginationEllipsis
} from "@/components/ui/pagination";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { json2csv } from "json-2-csv";

export default function AdminLeads() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  const updateLeadStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("leads")
        .update({ status: newStatus })
        .eq("id", id);
      
      if (error) throw error;
      
      setLeads(leads.map(l => l.id === id ? { ...l, status: newStatus } : l));
      toast.success("Estado actualizado");
    } catch (error) {
      console.error("Error updating lead status:", error);
      toast.error("Error al actualizar estado");
    }
  };

  const exportToCSV = async () => {
    try {
      const csv = await json2csv(filteredLeads);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `leads_tower_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("CSV exportado con éxito");
    } catch (error) {
      console.error("Error exporting to CSV:", error);
      toast.error("Error al exportar CSV");
    }
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF() as any;
      
      // Header
      doc.setFontSize(20);
      doc.setTextColor(191, 155, 48); // Gold color
      doc.text("TOWER DEVELOPERS", 105, 15, { align: "center" });
      
      doc.setFontSize(14);
      doc.setTextColor(100);
      doc.text("Reporte de Leads de Clientes", 105, 25, { align: "center" });
      
      doc.setFontSize(10);
      doc.text(`Fecha de generación: ${new Date().toLocaleString()}`, 105, 32, { align: "center" });

      const tableData = filteredLeads.map(l => [
        l.full_name,
        l.email,
        l.phone,
        l.property_type || "-",
        l.preferred_zone || "-",
        l.purpose || "-",
        l.status?.toUpperCase() || "NUEVO",
        new Date(l.created_at).toLocaleDateString()
      ]);

      (doc as any).autoTable({
        head: [['Nombre', 'Email', 'Teléfono', 'Propiedad', 'Zona', 'Objetivo', 'Estado', 'Fecha']],
        body: tableData,
        startY: 40,
        theme: 'striped',
        headStyles: { fillColor: [191, 155, 48] },
        styles: { fontSize: 8 }
      });

      doc.save(`leads_tower_reporte_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success("PDF generado con éxito");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Error al generar PDF");
    }
  };

  const filteredLeads = leads.filter(l => 
    l.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "contactado": return <Clock className="w-3 h-3" />;
      case "interesado": return <CheckCircle2 className="w-3 h-3" />;
      case "descartado": return <XCircle className="w-3 h-3" />;
      default: return <HelpCircle className="w-3 h-3" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "contactado": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "interesado": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "descartado": return "bg-red-500/10 text-red-400 border-red-500/20";
      default: return "bg-gold/10 text-gold border-gold/20";
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-playfair text-white tracking-wide">Gestión de Leads</h1>
          <p className="text-white/40 mt-2 font-inter">Administra los prospectos y exporta reportos de rendimiento.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={exportToCSV}
            variant="outline" 
            className="border-gold/20 text-white/60 hover:text-gold hover:bg-gold/5 flex gap-2 uppercase tracking-widest text-[9px] font-black h-10 px-5"
          >
            <FileJson className="w-4 h-4" /> CSV
          </Button>
          <Button 
            onClick={exportToPDF}
            variant="outline" 
            className="border-gold/20 text-white/60 hover:text-gold hover:bg-gold/5 flex gap-2 uppercase tracking-widest text-[9px] font-black h-10 px-5"
          >
            <FileText className="w-4 h-4" /> Reporte PDF
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        <input
          type="text"
          placeholder="Buscar por nombre, email o teléfono..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-black/40 border border-gold/10 rounded-none py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-gold/40 transition-all"
        />
      </div>

      <div className="bg-black/40 border border-gold/10 rounded-none overflow-hidden backdrop-blur-sm">
        <Table>
          <TableHeader className="bg-gold/5">
            <TableRow className="border-gold/10 hover:bg-transparent">
              <TableHead className="text-gold uppercase tracking-widest text-[10px] font-black py-4">Cliente / Contacto</TableHead>
              <TableHead className="text-gold uppercase tracking-widest text-[10px] font-black">Interés / Perfil</TableHead>
              <TableHead className="text-gold uppercase tracking-widest text-[10px] font-black">Estado Gestión</TableHead>
              <TableHead className="text-gold uppercase tracking-widest text-[10px] font-black text-right pr-8">Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-20 text-white/20">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-gold" />
                    <span className="uppercase tracking-[0.3em] text-[10px]">Sincronizando Leads...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : paginatedLeads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-20 text-white/20 font-inter font-light italic text-lg">
                  No se encontraron resultados.
                </TableCell>
              </TableRow>
            ) : (
              paginatedLeads.map((l) => (
                <TableRow key={l.id} className="border-gold/10 hover:bg-gold/5 transition-all group">
                  <TableCell className="py-6">
                    <div className="space-y-1.5 ml-4">
                      <div className="flex items-center gap-2 text-white font-bold tracking-tight">
                        <User className="w-3.5 h-3.5 text-gold" />
                        {l.full_name}
                      </div>
                      <div className="flex items-center gap-4 text-white/40 text-[10px] uppercase tracking-widest">
                        <span className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"><Mail className="w-3 h-3" /> {l.email}</span>
                        <span className="flex items-center gap-1.5 text-gold/60"><Phone className="w-3 h-3" /> {l.phone}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="border-white/5 bg-white/5 text-white/60 rounded-none text-[8px] uppercase tracking-widest px-2 py-0.5">
                          {l.property_type || "No especificado"}
                        </Badge>
                        {l.purpose === "Inversión" ? (
                          <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[8px] rounded-none px-2 py-0.5 font-black tracking-widest">INVERSIÓN</Badge>
                        ) : (
                          <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-[8px] rounded-none px-2 py-0.5 font-black tracking-widest">VIVIENDA</Badge>
                        )}
                      </div>
                      <div className="text-[10px] text-white/30 truncate max-w-[200px]">
                        Prefiere: {l.preferred_zone || "Cualquiera"} • {l.delivery_time}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select 
                      defaultValue={l.status || "nuevo"} 
                      onValueChange={(val) => updateLeadStatus(l.id, val)}
                    >
                      <SelectTrigger className={`w-[140px] h-8 text-[9px] uppercase tracking-widest font-black rounded-none border-0 ${getStatusColor(l.status || "nuevo")}`}>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(l.status || "nuevo")}
                          <SelectValue />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="bg-black border-gold/20 text-white rounded-none">
                        <SelectItem value="nuevo" className="text-[9px] uppercase tracking-widest focus:bg-gold/10 focus:text-gold">Nuevo</SelectItem>
                        <SelectItem value="contactado" className="text-[9px] uppercase tracking-widest focus:bg-gold/10 focus:text-gold">Contactado</SelectItem>
                        <SelectItem value="interesado" className="text-[9px] uppercase tracking-widest focus:bg-gold/10 focus:text-gold">Interesado</SelectItem>
                        <SelectItem value="descartado" className="text-[9px] uppercase tracking-widest focus:bg-gold/10 focus:text-gold">Descartado</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right pr-8">
                    <div className="inline-flex flex-col items-end">
                      <span className="text-[10px] text-white/60 font-mono tracking-tighter">
                        {formatDate(l.created_at)}
                      </span>
                      <span className="text-[8px] text-white/20 uppercase tracking-widest mt-1">
                        Registrado
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination className="mt-12">
          <PaginationContent>
            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  isActive={currentPage === i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className="cursor-pointer border-white/5 text-white/40 hover:text-gold hover:border-gold/20 rounded-none bg-transparent"
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
