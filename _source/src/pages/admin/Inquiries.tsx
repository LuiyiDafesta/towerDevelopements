import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Loader2, Calendar, Phone, Mail, User, Home, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious,
  PaginationEllipsis
} from "@/components/ui/pagination";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

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

  const filteredInquiries = inquiries.filter((i) =>
    i.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.properties?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredInquiries.length / itemsPerPage);
  const paginatedInquiries = filteredInquiries.slice(
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
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-playfair text-white tracking-wide">Consultas de Propiedades</h1>
          <p className="text-white/40 mt-2 font-inter font-light">Interesados de alta intención que consultaron por inmuebles específicos.</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        <input
          type="text"
          placeholder="Buscar por nombre, email o propiedad..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-black/40 border border-gold/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-gold/40 transition-all font-inter"
        />
      </div>

      <div className="bg-black/40 border border-gold/10 rounded-lg overflow-hidden backdrop-blur-sm">
        <Table>
          <TableHeader className="bg-gold/5">
            <TableRow className="border-gold/10 hover:bg-transparent">
              <TableHead className="text-gold uppercase tracking-widest text-[10px] font-bold py-5">Interesado</TableHead>
              <TableHead className="text-gold uppercase tracking-widest text-[10px] font-bold py-5">Contacto</TableHead>
              <TableHead className="text-gold uppercase tracking-widest text-[10px] font-bold py-5">Propiedad</TableHead>
              <TableHead className="text-gold uppercase tracking-widest text-[10px] font-bold py-5">Mensaje</TableHead>
              <TableHead className="text-gold uppercase tracking-widest text-[10px] font-bold py-5">Fecha</TableHead>
              <TableHead className="text-gold uppercase tracking-widest text-[10px] font-bold py-5 text-right w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-20 text-white/20">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-gold" />
                    <span className="font-inter font-light">Cargando consultas...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : paginatedInquiries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-20 text-white/40 font-inter font-light italic text-lg">
                  No se encontraron consultas.
                </TableCell>
              </TableRow>
            ) : (
              paginatedInquiries.map((i) => (
                <TableRow key={i.id} className="border-gold/10 hover:bg-white/5 transition-colors group">
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold">
                        <User className="w-4 h-4" />
                      </div>
                      <span className="text-white/80 font-medium font-inter">{i.full_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-white/60 text-xs font-inter">
                        <Mail className="w-3 h-3 text-gold/60" /> {i.email}
                      </div>
                      <div className="flex items-center gap-2 text-white/60 text-xs font-inter">
                        <Phone className="w-3 h-3 text-gold/60" /> {i.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2">
                      <Home className="w-4 h-4 text-primary" />
                      <span className="text-primary text-xs font-bold font-inter italic tracking-tight">
                        {i.properties?.title || "Propiedad no encontrada"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 max-w-[250px]">
                    <p className="text-white/60 text-xs font-inter line-clamp-2 leading-relaxed">
                      {i.message || "Sin mensaje."}
                    </p>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2 text-white/40 text-[10px] font-inter">
                      <Calendar className="w-3 h-3" /> {formatDate(i.created_at)}
                    </div>
                  </TableCell>
                  <TableCell className="py-4 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(i.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-white/20 hover:text-red-500 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            
            {[...Array(totalPages)].map((_, i) => {
              const pageNumber = i + 1;
              if (
                pageNumber === 1 || 
                pageNumber === totalPages || 
                (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
              ) {
                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      isActive={currentPage === pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      className="cursor-pointer"
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              } else if (
                pageNumber === currentPage - 2 || 
                pageNumber === currentPage + 2
              ) {
                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }
              return null;
            })}

            <PaginationItem>
              <PaginationNext 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
