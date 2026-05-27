import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit2, Plus, Trash2, Search, FileText, Loader2, Store, Building, Key } from "lucide-react";
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

export default function AdminCommercials() {
  const [commercials, setCommercials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchCommercials();
  }, []);

  const fetchCommercials = async () => {
    const { data, error } = await supabase
      .from("commercials")
      .select("*, neighborhoods(name)")
      .order("created_at", { ascending: false });

    if (!error) {
      setCommercials(data || []);
    } else {
      toast.error("Error al cargar los comerciales.");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este comercial?")) return;

    const { error } = await supabase.from("commercials").delete().eq("id", id);
    if (error) {
      toast.error("Error al eliminar el comercial.");
    } else {
      toast.success("Comercial eliminado correctamente.");
      fetchCommercials();
    }
  };

  const filteredCommercials = commercials.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCommercials.length / itemsPerPage);
  const paginatedCommercials = filteredCommercials.slice(
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
      case "alquilado": return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Alquilado</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "local": return <Store className="w-4 h-4 text-gold" />;
      case "oficina": return <Building className="w-4 h-4 text-gold" />;
      case "cochera": return <Key className="w-4 h-4 text-gold" />;
      default: return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "local": return "Local Comercial";
      case "oficina": return "Oficina";
      case "cochera": return "Cochera";
      default: return type;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-playfair text-white tracking-wide">Módulo de Comerciales</h1>
          <p className="text-white/40 mt-2 font-inter">Gestiona locales comerciales, oficinas y cocheras de forma independiente.</p>
        </div>
        <Button asChild className="bg-gold text-black hover:bg-gold/80 flex gap-2">
          <Link to="/admin/comerciales/nueva">
            <Plus className="w-4 h-4" /> Nuevo Comercial
          </Link>
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        <input
          type="text"
          placeholder="Buscar por título, ubicación o tipo (local, oficina, cochera)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-black/40 border border-gold/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-gold/40 font-inter"
        />
      </div>

      <div className="bg-black/40 border border-gold/10 rounded-lg overflow-hidden backdrop-blur-sm">
        <Table>
          <TableHeader className="bg-gold/5">
            <TableRow className="border-gold/10 hover:bg-transparent">
              <TableHead className="text-gold uppercase tracking-widest text-[10px] font-bold">Unidad</TableHead>
              <TableHead className="text-gold uppercase tracking-widest text-[10px] font-bold">Tipo</TableHead>
              <TableHead className="text-gold uppercase tracking-widest text-[10px] font-bold">Ubicación</TableHead>
              <TableHead className="text-gold uppercase tracking-widest text-[10px] font-bold">Precio</TableHead>
              <TableHead className="text-gold uppercase tracking-widest text-[10px] font-bold">Expensas</TableHead>
              <TableHead className="text-gold uppercase tracking-widest text-[10px] font-bold">Estado</TableHead>
              <TableHead className="text-gold uppercase tracking-widest text-[10px] font-bold">Ficha</TableHead>
              <TableHead className="text-gold uppercase tracking-widest text-[10px] font-bold text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-20 text-white/20">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-gold" />
                    <span>Cargando comerciales...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredCommercials.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-20 text-white/20 font-inter font-light italic text-lg">
                  No se encontraron locales, oficinas ni cocheras.
                </TableCell>
              </TableRow>
            ) : (
              paginatedCommercials.map((c) => (
                <TableRow key={c.id} className="border-gold/10 hover:bg-white/5 transition-colors group">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded bg-gold/10 overflow-hidden border border-gold/20">
                        {c.image_url ? (
                          <img src={c.image_url} alt={c.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gold/40 text-[10px]">NO IMG</div>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-white group-hover:text-gold transition-colors">{c.title}</div>
                        <div className="text-xs text-white/40">{c.square_meters ? `${c.square_meters} m²` : "- m²"}{c.type !== "cochera" ? ` · ${c.bathrooms} baños` : ""}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-white/80 text-sm font-inter">
                      {getTypeIcon(c.type)}
                      <span>{getTypeLabel(c.type)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-white/60 text-sm">
                    {c.neighborhoods?.name || c.location}
                  </TableCell>
                  <TableCell className="font-bold text-white">
                    USD {c.price?.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-white/80">
                    {c.expenses ? `USD ${c.expenses.toLocaleString()}` : "Sin expensas"}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(c.status)}
                  </TableCell>
                  <TableCell>
                    {c.pdf_url ? (
                      <a href={c.pdf_url} target="_blank" rel="noreferrer" className="text-gold hover:text-white transition-colors">
                        <FileText className="w-5 h-5" />
                      </a>
                    ) : (
                      <span className="text-white/10">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" asChild className="text-white/20 hover:text-gold hover:bg-gold/10">
                      <Link to={`/admin/comerciales/${c.id}`}>
                        <Edit2 className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDelete(c.id)}
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
