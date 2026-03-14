import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Neighborhood {
  id: string;
  name: string;
}

export default function AdminNeighborhoods() {
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

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
    const { error } = await supabase.from("neighborhoods").delete().eq("id", id);
    if (error) {
      toast.error("No se puede borrar el barrio si tiene propiedades asociadas.");
    } else {
      toast.success("Barrio eliminado.");
      fetchNeighborhoods();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-playfair text-white tracking-wide">Gestión de Barrios</h1>
        <p className="text-white/40 mt-2 font-inter">Administra las ubicaciones disponibles para las propiedades.</p>
      </div>

      <Card className="bg-black/40 border-gold/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-playfair text-white">Nuevo Barrio</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex gap-4">
            <Input
              placeholder="Nombre del barrio (ej: Puerto Madero)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="bg-white/5 border-gold/10 text-white focus-visible:ring-gold/40"
            />
            <Button type="submit" disabled={adding} className="bg-gold text-black hover:bg-gold/80 flex gap-2">
              {adding ? <Loader2 className="animate-spin" /> : <Plus />}
              Agregar
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="bg-black/40 border border-gold/10 rounded-lg overflow-hidden backdrop-blur-sm">
        <Table>
          <TableHeader className="bg-gold/5">
            <TableRow className="border-gold/10 hover:bg-transparent">
              <TableHead className="text-gold uppercase tracking-widest text-xs font-bold">Nombre</TableHead>
              <TableHead className="text-gold uppercase tracking-widest text-xs font-bold w-[100px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center py-10 text-white/20">Cargando...</TableCell>
              </TableRow>
            ) : neighborhoods.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center py-10 text-white/20">No hay barrios creados todavía.</TableCell>
              </TableRow>
            ) : (
              neighborhoods.map((n) => (
                <TableRow key={n.id} className="border-gold/10 hover:bg-white/5 transition-colors">
                  <TableCell className="font-inter text-white/80">{n.name}</TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDelete(n.id)}
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
    </div>
  );
}
