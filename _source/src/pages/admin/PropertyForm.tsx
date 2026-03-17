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
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ArrowLeft, Upload, FileText, CheckCircle2, Image as ImageIcon, X } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

const AVAILABLE_AMENITIES = [
  "Piscina",
  "Gimnasio",
  "SUM",
  "Seguridad 24h",
  "Jardín",
  "Parrilla",
  "Balcón",
  "Terraza",
  "Laundry",
  "Cochera de Cortesía",
  "Solarium"
];

const propertySchema = z.object({
  title: z.string().min(5, "El título debe tener al menos 5 caracteres"),
  description: z.string().min(20, "La descripción debe ser más detallada"),
  price: z.coerce.number().min(0),
  location: z.string().min(3),
  neighborhood_id: z.string().optional(),
  square_meters: z.coerce.number().min(0),
  ambientes: z.coerce.number().min(0).optional(),
  bedrooms: z.coerce.number().min(0),
  bathrooms: z.coerce.number().min(0),
  parking: z.coerce.number().min(0),
  status: z.enum(["disponible", "reservado", "vendido"]),
  featured: z.boolean().default(false),
  image_url: z.string().optional(),
  images: z.array(z.string()).default([]),
  amenities: z.array(z.string()).default([]),
  project_name: z.string().optional(),
});

type PropertyFormValues = z.infer<typeof propertySchema>;

export default function PropertyForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!id);
  const [neighborhoods, setNeighborhoods] = useState<any[]>([]);
  
  // Files states
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  
  // Existing URLs (from DB)
  const [currentMainImageUrl, setCurrentMainImageUrl] = useState<string | null>(null);
  const [currentGalleryUrls, setCurrentGalleryUrls] = useState<string[]>([]);
  const [currentPdfUrl, setCurrentPdfUrl] = useState<string | null>(null);

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      location: "",
      square_meters: 0,
      ambientes: 0,
      bedrooms: 0,
      bathrooms: 0,
      parking: 0,
      status: "disponible",
      featured: false,
      image_url: "",
      images: [],
      amenities: [],
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
      images: data.images || [],
      project_name: data.project_name || "",
      ambientes: data.ambientes || 0,
      featured: data.featured || false,
      amenities: data.amenities || [],
    });
    setCurrentMainImageUrl(data.image_url);
    setCurrentGalleryUrls(data.images || []);
    setCurrentPdfUrl(data.pdf_url);
    setFetching(false);
  };

  const uploadToStorage = async (file: File, folder: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('property-files')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('property-files')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const onSubmit = async (values: PropertyFormValues) => {
    setLoading(true);
    try {
      // 1. Upload Main Image if exists
      let image_url = currentMainImageUrl;
      if (mainImageFile) {
        image_url = await uploadToStorage(mainImageFile, 'main-images');
      }

      // 2. Upload Gallery Images
      let gallery_urls = [...currentGalleryUrls];
      if (galleryFiles.length > 0) {
        toast.info(`Subiendo ${galleryFiles.length} fotos de la galería...`);
        const uploadedGallery = await Promise.all(
          galleryFiles.map(file => uploadToStorage(file, 'gallery'))
        );
        gallery_urls = [...gallery_urls, ...uploadedGallery];
      }

      // 3. Upload PDF if exists
      let pdf_url = currentPdfUrl;
      if (pdfFile) {
        pdf_url = await uploadToStorage(pdfFile, 'fichas');
      }

      const finalData: any = { 
        ...values, 
        image_url, 
        images: gallery_urls, 
        pdf_url 
      };

      if (id) {
        const { error } = await supabase.from("properties").update(finalData).eq("id", id);
        if (error) throw error;
        toast.success("Propiedad actualizada.");
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

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setGalleryFiles([...galleryFiles, ...Array.from(e.target.files)]);
    }
  };

  const removeGalleryFile = (index: number) => {
    setGalleryFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingGalleryUrl = (url: string) => {
    setCurrentGalleryUrls(prev => prev.filter(u => u !== url));
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-10 h-10 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
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
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gold/10 bg-white/5 p-4 md:col-span-2">
                    <div className="space-y-0.5">
                      <FormLabel className="text-gold uppercase text-[10px] tracking-widest font-bold">Propiedad Destacada</FormLabel>
                      <p className="text-[10px] text-white/40">Si se activa, aparecerá en la sección "Destacadas" de la página principal.</p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-gold"
                      />
                    </FormControl>
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
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="square_meters"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gold/80 uppercase text-[10px] tracking-widest font-bold text-nowrap">Sup. Total (m²)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} className="bg-white/5 border-gold/10 text-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ambientes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gold/80 uppercase text-[10px] tracking-widest font-bold">Ambientes</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} className="bg-white/5 border-gold/10 text-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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

              {/* Amenities */}
              <FormField
                control={form.control}
                name="amenities"
                render={() => (
                  <FormItem className="md:col-span-2 space-y-4 pt-4 border-t border-gold/10">
                    <div className="mb-4">
                      <FormLabel className="text-gold uppercase text-xs tracking-widest font-bold">Amenities</FormLabel>
                      <p className="text-[10px] text-white/40">Seleccione los amenities disponibles.</p>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                      {AVAILABLE_AMENITIES.map((amenity) => (
                        <FormField
                          key={amenity}
                          control={form.control}
                          name="amenities"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={amenity}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(amenity)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, amenity])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== amenity
                                            )
                                          )
                                    }}
                                    className="border-gold/20 data-[state=checked]:bg-gold data-[state=checked]:text-black focus:ring-gold"
                                  />
                                </FormControl>
                                <FormLabel className="font-normal text-white text-sm cursor-pointer whitespace-nowrap">
                                  {amenity}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Main Image Uploader */}
              <div className="md:col-span-2 space-y-4 pt-4 border-t border-gold/10">
                <FormLabel className="text-gold uppercase text-xs tracking-widest font-bold flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" /> Foto Principal
                </FormLabel>
                
                {currentMainImageUrl && (
                  <div className="relative group w-40 h-40 rounded-lg overflow-hidden border border-gold/20">
                    <img src={currentMainImageUrl} alt="Principal" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                      <p className="text-[10px] text-white font-bold" onClick={() => setCurrentMainImageUrl(null)}>REEMPLAZAR</p>
                    </div>
                  </div>
                )}

                {!currentMainImageUrl && (
                  <div className="relative group">
                    <input
                      type="file"
                      id="main-image-upload"
                      accept="image/*"
                      onChange={(e) => setMainImageFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <label
                      htmlFor="main-image-upload"
                      className="flex flex-col items-center justify-center border-2 border-dashed border-gold/20 rounded-xl p-8 hover:border-gold/40 hover:bg-gold/5 transition-all cursor-pointer"
                    >
                      {mainImageFile ? (
                        <div className="flex items-center gap-2 text-white">
                          <CheckCircle2 className="w-5 h-5 text-gold" />
                          <span className="font-semibold">{mainImageFile.name}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-white/40">
                          <Upload className="w-8 h-8 mb-2" />
                          <span className="text-sm font-medium uppercase tracking-tighter">Subir Foto Principal</span>
                        </div>
                      )}
                    </label>
                  </div>
                )}
              </div>

              {/* Gallery Uploader */}
              <div className="md:col-span-2 space-y-4 pt-4 border-t border-gold/10">
                <FormLabel className="text-gold uppercase text-xs tracking-widest font-bold flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" /> Galería de Fotos
                </FormLabel>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {/* Existing URLs */}
                  {currentGalleryUrls.map((url, idx) => (
                    <div key={`existing-${idx}`} className="relative group h-32 rounded-lg overflow-hidden border border-gold/10">
                      <img src={url} alt="Gallery item" className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => removeExistingGalleryUrl(url)}
                        className="absolute top-1 right-1 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ))}
                  
                  {/* New files being uploaded */}
                  {galleryFiles.map((file, idx) => (
                    <div key={`new-${idx}`} className="relative group h-32 rounded-lg overflow-hidden border border-gold/40 border-dashed bg-gold/5">
                      <div className="w-full h-full flex items-center justify-center text-[8px] text-gold p-2 text-center uppercase font-bold leading-none">
                        {file.name}
                      </div>
                      <button 
                        type="button"
                        onClick={() => removeGalleryFile(idx)}
                        className="absolute top-1 right-1 bg-gold rounded-full p-1"
                      >
                        <X className="w-3 h-3 text-black" />
                      </button>
                    </div>
                  ))}

                  <label 
                    htmlFor="gallery-upload" 
                    className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-gold/10 rounded-lg cursor-pointer hover:bg-gold/5 hover:border-gold/30 transition-all"
                  >
                    <Input
                      id="gallery-upload"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleGalleryUpload}
                      className="hidden"
                    />
                    <Upload className="w-5 h-5 text-white/20 mb-2" />
                    <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Añadir Fotos</span>
                  </label>
                </div>
              </div>

              {/* PDF Upload Section */}
              <div className="md:col-span-2 space-y-4 pt-4 border-t border-gold/10">
                <FormLabel className="text-gold/80 uppercase text-[10px] tracking-widest font-bold block">Ficha Técnica (PDF)</FormLabel>
                <div className="flex flex-col gap-4">
                  {currentPdfUrl && (
                    <div className="flex items-center gap-2 p-3 bg-gold/5 border border-gold/20 rounded-lg text-gold text-sm font-inter">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Ficha actual cargada correctamente.</span>
                      <a href={currentPdfUrl} target="_blank" rel="noreferrer" className="ml-auto underline font-bold">VER PDF</a>
                      <button type="button" onClick={() => setCurrentPdfUrl(null)} className="ml-2 text-red-500/60 hover:text-red-500"><X className="w-4 h-4"/></button>
                    </div>
                  )}
                  
                  {!currentPdfUrl && (
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
                        className="flex flex-col items-center justify-center border-2 border-dashed border-gold/20 rounded-xl p-6 hover:border-gold/40 hover:bg-gold/5 transition-all cursor-pointer"
                      >
                        {pdfFile ? (
                          <div className="flex items-center gap-2 text-white">
                            <FileText className="w-6 h-6 text-gold" />
                            <span className="font-semibold text-sm">{pdfFile.name}</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-white/40">
                            <Upload className="w-6 h-6 mb-1" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Subir Ficha PDF</span>
                          </div>
                        )}
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-12 flex gap-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gold text-black hover:bg-gold/80 font-bold h-14 tracking-widest text-lg"
              >
                {loading ? <Loader2 className="animate-spin" /> : id ? "GUARDAR CAMBIOS" : "PUBLICAR PROPIEDAD"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/admin/propiedades")}
                className="border-white/10 text-white/60 hover:bg-white/5 hover:text-white h-14 font-bold"
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
