import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit2, Plus, Trash2, Search, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
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

export default function AdminProperties() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    const { data, error } = await supabase
      .from("properties")
      .select("*, neighborhoods(name)")
      .order("created_at", { ascending: false });

    if (!error) setProperties(data || []);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta propiedad?")) return;

    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (error) {
      toast.error("Error al eliminar la propiedad.");
    } else {
      toast.success("Propiedad eliminada.");
      fetchProperties();
    }
  };

  const filteredProperties = properties.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  const paginatedProperties = filteredProperties.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "disponible": return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Disponible</Badge>;
      case "reservado": return <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20">Reservado</Badge>;
      case "vendido": return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Vendido</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-playfair text-white tracking-wide">Propiedades</h1>
          <p className="text-white/40 mt-2 font-inter">Gestiona el inventario de propiedades de Tower Developers.</p>
        </div>
        <Button asChild className="bg-gold text-black hover:bg-gold/80 flex gap-2">
          <Link to="/admin/propiedades/nueva">
            <Plus className="w-4 h-4" /> Nueva Propiedad
          </Link>
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        <input
          type="text"
          placeholder="Buscar por título o ubicación..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-black/40 border border-gold/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-gold/40"
        />
      </div>

      <div className="bg-black/40 border border-gold/10 rounded-lg overflow-hidden backdrop-blur-sm">
        <Table>
          <TableHeader className="bg-gold/5">
            <TableRow className="border-gold/10 hover:bg-transparent">
              <TableHead className="text-gold uppercase tracking-widest text-[10px] font-bold">Inmueble</TableHead>
              <TableHead className="text-gold uppercase tracking-widest text-[10px] font-bold">Ubicación</TableHead>
              <TableHead className="text-gold uppercase tracking-widest text-[10px] font-bold">Precio</TableHead>
              <TableHead className="text-gold uppercase tracking-widest text-[10px] font-bold">Estado</TableHead>
              <TableHead className="text-gold uppercase tracking-widest text-[10px] font-bold">Ficha</TableHead>
              <TableHead className="text-gold uppercase tracking-widest text-[10px] font-bold text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-20 text-white/20">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-gold" />
                    <span>Cargando propiedades...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredProperties.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-20 text-white/20 font-inter font-light italic text-lg">
                  No se encontraron propiedades.
                </TableCell>
              </TableRow>
            ) : (
              filteredProperties.map((p) => (
                <TableRow key={p.id} className="border-gold/10 hover:bg-white/5 transition-colors group">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded bg-gold/10 overflow-hidden border border-gold/20">
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gold/40 text-[10px]">NO IMG</div>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-white group-hover:text-gold transition-colors">{p.title}</div>
                        <div className="text-xs text-white/40">{p.bedrooms} dorm · {p.bathrooms} baños</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-white/60 text-sm">
                    {p.neighborhoods?.name || p.location}
                  </TableCell>
                  <TableCell className="font-bold text-white">
                    USD {p.price?.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(p.status)}
                  </TableCell>
                  <TableCell>
                    {p.pdf_url ? (
                      <a href={p.pdf_url} target="_blank" rel="noreferrer" className="text-gold hover:text-white transition-colors">
                        <FileText className="w-5 h-5" />
                      </a>
                    ) : (
                      <span className="text-white/10">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" asChild className="text-white/20 hover:text-gold hover:bg-gold/10">
                      <Link to={`/admin/propiedades/${p.id}`}>
                        <Edit2 className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDelete(p.id)}
                      className="text-white/20 hover:text-red-500 hover:bg-red-500/10"
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
              // Simple logic for showing logic: always show first, last, and current +/- 1
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

