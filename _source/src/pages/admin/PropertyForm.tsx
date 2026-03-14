import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, Upload, FileText, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const propertySchema = z.object({
  title: z.string().min(5, "El título debe tener al menos 5 caracteres"),
  description: z.string().min(20, "La descripción debe ser más detallada"),
  price: z.coerce.number().min(0),
  location: z.string().min(3),
  neighborhood_id: z.string().optional(),
  surface: z.coerce.number().min(0),
  bedrooms: z.coerce.number().min(0),
  bathrooms: z.coerce.number().min(0),
  parking: z.coerce.number().min(0),
  status: z.enum(["disponible", "reservado", "vendido"]),
  image_url: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
  project_name: z.string().optional(),
});

export default function PropertyForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!id);
  const [neighborhoods, setNeighborhoods] = useState<any[]>([]);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState<string | null>(null);

  const form = useForm<z.infer<typeof propertySchema>>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      location: "",
      surface: 0,
      bedrooms: 0,
      bathrooms: 0,
      parking: 0,
      status: "disponible",
      image_url: "",
      project_name: "",
    },
  });

  useEffect(() => {
    fetchNeighborhoods();
    if (id) fetchProperty();
  }, [id]);

  const fetchNeighborhoods = async () => {
    const { data } = await supabase.from("neighborhoods").select("*").order("name");
    setNeighborhoods(data || []);
  };

  const fetchProperty = async () => {
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      toast.error("Error al cargar la propiedad.");
      navigate("/admin/propiedades");
      return;
    }

    form.reset({
      ...data,
      neighborhood_id: data.neighborhood_id || undefined,
      image_url: data.image_url || "",
      project_name: data.project_name || "",
    });
    setCurrentPdfUrl(data.pdf_url);
    setFetching(false);
  };

  const uploadFile = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `fichas/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('property-files')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('property-files')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const onSubmit = async (values: z.infer<typeof propertySchema>) => {
    setLoading(true);
    try {
      let pdf_url = currentPdfUrl;

      if (pdfFile) {
        setUploadingPdf(true);
        pdf_url = await uploadFile(pdfFile);
        setUploadingPdf(false);
      }

      const finalData: any = { ...values, pdf_url };

      if (id) {
        const { error } = await supabase.from("properties").update(finalData).eq("id", id);
        if (error) throw error;
        toast.success("Propiedad actualizada hoy.");
      } else {
        const { error } = await supabase.from("properties").insert([finalData]);
        if (error) throw error;
        toast.success("Propiedad creada con éxito.");
      }

      navigate("/admin/propiedades");
    } catch (error: any) {
      toast.error(error.message || "Error al guardar.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-10 h-10 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-white/40 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-3xl font-playfair text-white">
          {id ? "Editar Propiedad" : "Nueva Propiedad"}
        </h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card className="bg-black/40 border-gold/10 backdrop-blur-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Información Básica */}
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gold/80 uppercase text-[10px] tracking-widest font-bold">Título de la propiedad</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-white/5 border-gold/10 text-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gold/80 uppercase text-[10px] tracking-widest font-bold">Descripción</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={4} className="bg-white/5 border-gold/10 text-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gold/80 uppercase text-[10px] tracking-widest font-bold">Precio (USD)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} className="bg-white/5 border-gold/10 text-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gold/80 uppercase text-[10px] tracking-widest font-bold">Estado</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white/5 border-gold/10 text-white">
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#1A1A1A] border-gold/20 text-white">
                        <SelectItem value="disponible">Disponible</SelectItem>
                        <SelectItem value="reservado">Reservado</SelectItem>
                        <SelectItem value="vendido">Vendido</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="neighborhood_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gold/80 uppercase text-[10px] tracking-widest font-bold">Barrio</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white/5 border-gold/10 text-white">
                          <SelectValue placeholder="Seleccionar barrio" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#1A1A1A] border-gold/20 text-white">
                        {neighborhoods.map((n) => (
                          <SelectItem key={n.id} value={n.id}>{n.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gold/80 uppercase text-[10px] tracking-widest font-bold">Dirección / Ref</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ej: Av. del Libertador 1500" className="bg-white/5 border-gold/10 text-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Características */}
              <FormField
                control={form.control}
                name="surface"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gold/80 uppercase text-[10px] tracking-widest font-bold">Sup. Total (m²)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} className="bg-white/5 border-gold/10 text-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="bedrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gold/80 text-[10px]">Dorm.</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} className="bg-white/5 border-gold/10 text-white" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bathrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gold/80 text-[10px]">Baños</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} className="bg-white/5 border-gold/10 text-white" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="parking"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gold/80 text-[10px]">Cocheras</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} className="bg-white/5 border-gold/10 text-white" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Media */}
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="image_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gold/80 uppercase text-[10px] tracking-widest font-bold">URL de Imagen Principal</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://..." className="bg-white/5 border-gold/10 text-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* PDF Upload Section */}
              <div className="md:col-span-2 space-y-2">
                <FormLabel className="text-gold/80 uppercase text-[10px] tracking-widest font-bold block mb-2">Ficha Técnica (PDF)</FormLabel>
                <div className="flex flex-col gap-4">
                  {currentPdfUrl && (
                    <div className="flex items-center gap-2 p-3 bg-gold/5 border border-gold/20 rounded-lg text-gold text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Ficha actual configurada correctamente.</span>
                      <a href={currentPdfUrl} target="_blank" rel="noreferrer" className="ml-auto underline">Ver PDF</a>
                    </div>
                  )}
                  
                  <div className="relative group">
                    <input
                      type="file"
                      id="pdf-upload"
                      accept=".pdf"
                      onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <label
                      htmlFor="pdf-upload"
                      className="flex flex-col items-center justify-center border-2 border-dashed border-gold/20 rounded-xl p-8 hover:border-gold/40 hover:bg-gold/5 transition-all cursor-pointer"
                    >
                      {pdfFile ? (
                        <div className="flex items-center gap-2 text-white">
                          <FileText className="w-8 h-8 text-gold" />
                          <span className="font-semibold">{pdfFile.name}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-white/40">
                          <Upload className="w-8 h-8 mb-2" />
                          <span className="text-sm font-medium">Subir nueva Ficha PDF</span>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-10 flex gap-4">
              <Button
                type="submit"
                disabled={loading || uploadingPdf}
                className="flex-1 bg-gold text-black hover:bg-gold/80 font-bold h-12"
              >
                {loading ? <Loader2 className="animate-spin" /> : id ? "GUARDAR CAMBIOS" : "CREAR PROPIEDAD"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/admin/propiedades")}
                className="border-white/10 text-white/60 hover:bg-white/5 hover:text-white"
              >
                CANCELAR
              </Button>
            </div>
          </Card>
        </form>
      </Form>
    </div>
  );
}
