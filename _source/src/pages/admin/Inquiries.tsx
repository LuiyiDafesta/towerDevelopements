import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Loader2, Calendar, Phone, Mail, User, Home, Trash2, Download, FileJson, FileText, CheckCircle2, Clock, XCircle, HelpCircle } from "lucide-react";
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
import autoTable from "jspdf-autotable";
import { json2csv } from "json-2-csv";

export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("inquiries")
      .select("*, properties(title)")
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Error fetching inquiries:", error);
    } else {
      setInquiries(data || []);
    }
    setLoading(false);
  };

  const updateInquiryStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("inquiries")
        .update({ status: newStatus })
        .eq("id", id);
      
      if (error) throw error;
      
      setInquiries(inquiries.map(i => i.id === id ? { ...i, status: newStatus } : i));
      toast.success("Estado actualizado");
    } catch (error) {
      console.error("Error updating inquiry status:", error);
      toast.error("Error al actualizar estado");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta consulta?")) return;
    
    const { error } = await supabase.from("inquiries").delete().eq("id", id);
    if (error) {
      toast.error("Error al eliminar la consulta");
    } else {
      toast.success("Consulta eliminada");
      fetchInquiries();
    }
  };

  const exportToCSV = async () => {
    try {
      const exportData = filteredInquiries.map(i => ({
        Nombre: i.full_name,
        Email: i.email,
        Telefono: i.phone,
        Propiedad: i.properties?.title || "No encontrada",
        Referencia: getRef(i.property_id),
        Mensaje: i.message,
        Estado: (i.status || "nuevo").toUpperCase(),
        Fecha: new Date(i.created_at).toLocaleString()
      }));
      
      const csv = await json2csv(exportData);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `consultas_tower_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("CSV exportado");
    } catch (error) {
      console.error("Error exporting CSV:", error);
    }
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF() as any;
      
      doc.setFontSize(20);
      doc.setTextColor(191, 155, 48); // Gold
      doc.text("TOWER DEVELOPERS", 105, 15, { align: "center" });
      
      doc.setFontSize(14);
      doc.setTextColor(100);
      doc.text("Reporte de Consultas por Propiedad", 105, 25, { align: "center" });
      
      const tableData = filteredInquiries.map(i => [
        i.full_name,
        i.email,
        i.properties?.title?.substring(0, 25) || "-",
        getRef(i.property_id),
        (i.status || "nuevo").toUpperCase(),
        new Date(i.created_at).toLocaleDateString()
      ]);

      autoTable(doc, {
        head: [['Nombre', 'Email', 'Propiedad', 'Ref', 'Estado', 'Fecha']],
        body: tableData,
        startY: 35,
        theme: 'striped',
        headStyles: { fillColor: [191, 155, 48] },
        styles: { fontSize: 8 }
      });

      doc.save(`consultas_tower_reporte_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success("PDF generado");
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  const filteredInquiries = inquiries.filter((i) =>
    i.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.properties?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (i.property_id && `REF-${i.property_id.substring(0, 8)}`.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredInquiries.length / itemsPerPage);
  const paginatedInquiries = filteredInquiries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  const getRef = (id: string) => {
    if (!id) return "";
    return `REF-${id.substring(0, 8).toUpperCase()}`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "respondido": return <CheckCircle2 className="w-3 h-3" />;
      case "interesado": return <Clock className="w-3 h-3" />;
      case "descartado": return <XCircle className="w-3 h-3" />;
      default: return <HelpCircle className="w-3 h-3" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "respondido": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "interesado": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "descartado": return "bg-red-500/10 text-red-400 border-red-500/20";
      default: return "bg-gold/10 text-gold border-gold/20";
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-playfair text-white tracking-wide">Gestión de Consultas</h1>
          <p className="text-white/40 mt-2 font-inter font-light">Seguimiento de interesados por propiedades específicas.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={exportToCSV} variant="outline" className="border-gold/20 text-white/60 hover:text-gold hover:bg-gold/5 flex gap-2 uppercase tracking-widest text-[9px] font-black h-10 px-5">
            <Download className="w-4 h-4" /> CSV
          </Button>
          <Button onClick={exportToPDF} variant="outline" className="border-gold/20 text-white/60 hover:text-gold hover:bg-gold/5 flex gap-2 uppercase tracking-widest text-[9px] font-black h-10 px-5">
            <FileText className="w-4 h-4" /> PDF Reporte
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        <input
          type="text"
          placeholder="Buscar interesado, propiedad o REF..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-black/40 border border-gold/10 rounded-none py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-gold/40 transition-all"
        />
      </div>

      <div className="bg-black/40 border border-gold/10 rounded-none overflow-hidden backdrop-blur-sm">
        <Table>
          <TableHeader className="bg-gold/5">
            <TableRow className="border-gold/10 hover:bg-transparent">
              <TableHead className="text-gold uppercase tracking-widest text-[10px] font-black py-5">Interesado</TableHead>
              <TableHead className="text-gold uppercase tracking-widest text-[10px] font-black">Propiedad / Ref</TableHead>
              <TableHead className="text-gold uppercase tracking-widest text-[10px] font-black">Estado</TableHead>
              <TableHead className="text-gold uppercase tracking-widest text-[10px] font-black">Mensaje</TableHead>
              <TableHead className="text-gold uppercase tracking-widest text-[10px] font-black text-right pr-6">Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-20 text-white/20">
                  <Loader2 className="w-8 h-8 animate-spin text-gold mx-auto mb-4" />
                  <span className="uppercase tracking-widest text-[10px]">Cargando consultas...</span>
                </TableCell>
              </TableRow>
            ) : paginatedInquiries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-20 text-white/40 italic">
                  No se encontraron consultas registradas.
                </TableCell>
              </TableRow>
            ) : (
              paginatedInquiries.map((i) => (
                <TableRow key={i.id} className="border-gold/10 hover:bg-gold/5 transition-all group">
                  <TableCell className="py-6">
                    <div className="flex items-center gap-3 ml-2">
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-gold/30">
                        <User className="w-4 h-4 text-white/40 group-hover:text-gold" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-white font-bold text-sm tracking-tight">{i.full_name}</span>
                        <div className="flex items-center gap-3 text-[10px] text-white/30 uppercase tracking-tighter mt-0.5">
                          <span className="flex items-center gap-1"><Mail className="w-2.5 h-2.5" /> {i.email}</span>
                          <span className="flex items-center gap-1 text-gold/60"><Phone className="w-2.5 h-2.5" /> {i.phone}</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-white/80 text-[10px] font-bold uppercase tracking-tight truncate max-w-[150px]">
                        <Home className="w-3 h-3 text-gold" /> {i.properties?.title || "No encontrada"}
                      </div>
                      <Badge variant="outline" className="w-fit text-[8px] border-gold/10 text-white/40 font-mono py-0 px-2 h-4 scale-90 origin-left">
                        {getRef(i.property_id)}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select 
                      defaultValue={i.status || "nuevo"} 
                      onValueChange={(val) => updateInquiryStatus(i.id, val)}
                    >
                      <SelectTrigger className={`w-[130px] h-7 text-[9px] uppercase tracking-widest font-black rounded-none border-0 ${getStatusColor(i.status || "nuevo")}`}>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(i.status || "nuevo")}
                          <SelectValue />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="bg-black border-gold/20 text-white rounded-none">
                        <SelectItem value="nuevo" className="text-[9px] uppercase tracking-widest focus:bg-gold/10 focus:text-gold">Nuevo</SelectItem>
                        <SelectItem value="respondido" className="text-[9px] uppercase tracking-widest focus:bg-gold/10 focus:text-gold">Respondido</SelectItem>
                        <SelectItem value="interesado" className="text-[9px] uppercase tracking-widest focus:bg-gold/10 focus:text-gold">Interesado</SelectItem>
                        <SelectItem value="descartado" className="text-[9px] uppercase tracking-widest focus:bg-gold/10 focus:text-gold">Descartado</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    <p className="text-[11px] text-white/50 italic font-inter line-clamp-2 leading-relaxed">
                      "{i.message || "Sin mensaje."}"
                    </p>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] text-white/40 font-mono">{formatDate(i.created_at)}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(i.id)}
                        className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity text-white/10 hover:text-red-500 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
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
