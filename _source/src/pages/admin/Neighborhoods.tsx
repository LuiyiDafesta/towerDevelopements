import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, Loader2, Search, Edit2, Check, X } from "lucide-react";
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

interface Neighborhood {
  id: string;
  name: string;
}

export default function AdminNeighborhoods() {
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  
  // Search and Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    fetchNeighborhoods();
  }, []);

  const fetchNeighborhoods = async () => {
    const { data, error } = await supabase.from("neighborhoods").select("*").order("name");
    if (!error) setNeighborhoods(data || []);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);

    const { error } = await supabase.from("neighborhoods").insert({ name: newName.trim() });

    if (error) {
      toast.error("Error al crear el barrio: " + error.message);
    } else {
      toast.success("Barrio creado con éxito.");
      setNewName("");
      fetchNeighborhoods();
    }
    setAdding(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro? Se borrarán las propiedades relacionadas si no tienen otro barrio.")) {
      return;
    }
    const { error } = await supabase.from("neighborhoods").delete().eq("id", id);
    if (error) {
      toast.error("No se puede borrar el barrio si tiene propiedades asociadas.");
    } else {
      toast.success("Barrio eliminado.");
      fetchNeighborhoods();
    }
  };

  const startEditing = (id: string, currentName: string) => {
    setEditingId(id);
    setEditName(currentName);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName("");
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return;

    const { error } = await supabase
      .from("neighborhoods")
      .update({ name: editName.trim() })
      .eq("id", id);

    if (error) {
      toast.error("Error al actualizar el barrio.");
    } else {
      toast.success("Barrio actualizado.");
      setEditingId(null);
      fetchNeighborhoods();
    }
  };

  const filteredNeighborhoods = neighborhoods.filter(n => 
    n.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredNeighborhoods.length / itemsPerPage);
  const paginatedNeighborhoods = filteredNeighborhoods.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-playfair text-white tracking-wide">Gestión de Barrios</h1>
          <p className="text-white/40 mt-2 font-inter">Administra las ubicaciones disponibles para las propiedades.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="bg-black/40 border-gold/10 backdrop-blur-sm lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg font-playfair text-white">Nuevo Barrio</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <Input
                placeholder="Nombre del barrio (ej: Puerto Madero)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="bg-white/5 border-gold/10 text-white focus-visible:ring-gold/40"
              />
              <Button type="submit" disabled={adding} className="w-full bg-gold text-black hover:bg-gold/80 flex gap-2">
                {adding ? <Loader2 className="animate-spin w-4 h-4" /> : <Plus className="w-4 h-4" />}
                Agregar Barrio
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Buscar barrios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/40 border border-gold/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-gold/40"
            />
          </div>

          <div className="bg-black/40 border border-gold/10 rounded-lg overflow-hidden backdrop-blur-sm">
            <Table>
              <TableHeader className="bg-gold/5">
                <TableRow className="border-gold/10 hover:bg-transparent">
                  <TableHead className="text-gold uppercase tracking-widest text-[10px] font-bold">Nombre</TableHead>
                  <TableHead className="text-gold uppercase tracking-widest text-[10px] font-bold text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-20 text-white/20">
                      <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-8 h-8 animate-spin text-gold" />
                        <span>Cargando barrios...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginatedNeighborhoods.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-20 text-white/20 font-inter font-light italic text-lg">
                      No se encontraron barrios.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedNeighborhoods.map((n) => (
                    <TableRow key={n.id} className="border-gold/10 hover:bg-white/5 transition-colors group">
                      <TableCell className="font-inter">
                        {editingId === n.id ? (
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="h-8 bg-white/10 border-gold/20 text-white focus-visible:ring-gold/40"
                            autoFocus
                          />
                        ) : (
                          <span className="text-white/80">{n.name}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        {editingId === n.id ? (
                          <>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleUpdate(n.id)}
                              className="text-green-500 hover:bg-green-500/10"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={cancelEditing}
                              className="text-red-500 hover:bg-red-500/10"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => startEditing(n.id, n.name)}
                              className="text-white/20 hover:text-gold hover:bg-gold/10"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDelete(n.id)}
                              className="text-white/20 hover:text-red-500 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <Pagination className="mt-4">
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
      </div>
    </div>
  );
}
