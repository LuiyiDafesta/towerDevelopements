import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { compressImage } from "@/utils/imageCompression";

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

const COMMERCIAL_AMENITIES = [
  "Seguridad 24h",
  "Vidriera",
  "Doble Altura",
  "Fuerza Motriz / Trifásica",
  "Kitchenette",
  "Aire Acondicionado",
  "Calefacción",
  "Acceso Vehicular",
  "Cochera de Cortesía",
  "Grupo Electrógeno",
  "Salida de Humos"
];

const commercialSchema = z.object({
  title: z.string().min(5, "El título debe tener al menos 5 caracteres"),
  description: z.string().min(20, "La descripción debe ser más detallada"),
  type: z.enum(["local", "oficina", "cochera"]),
  price: z.coerce.number().min(0),
  expenses: z.coerce.number().min(0).optional().default(0),
  location: z.string().min(3),
  neighborhood_id: z.string().optional(),
  square_meters: z.coerce.number().min(0).optional().default(0),
  bathrooms: z.coerce.number().min(0).optional().default(0),
  parking: z.coerce.number().min(0).optional().default(0),
  status: z.enum(["disponible", "reservado", "vendido", "alquilado"]),
  featured: z.boolean().default(false),
  image_url: z.string().optional(),
  images: z.array(z.string()).default([]),
  amenities: z.array(z.string()).default([]),
  whatsapp: z.string().optional(),
  contact_email: z.string().optional(),
});

type CommercialFormValues = z.infer<typeof commercialSchema>;

export default function CommercialForm() {
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

  const form = useForm<CommercialFormValues>({
    resolver: zodResolver(commercialSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "local",
      price: 0,
      expenses: 0,
      location: "",
      square_meters: 0,
      bathrooms: 0,
      parking: 0,
      status: "disponible",
      featured: false,
      image_url: "",
      images: [],
      amenities: [],
      whatsapp: "",
      contact_email: "",
    },
  });

  // Watch the type field to adjust form inputs dynamically
  const selectedType = form.watch("type");

  useEffect(() => {
    fetchNeighborhoods();
    if (id) fetchCommercial();
  }, [id]);

  const fetchNeighborhoods = async () => {
    const { data } = await supabase.from("neighborhoods").select("*").order("name");
    setNeighborhoods(data || []);
  };

  const fetchCommercial = async () => {
    const { data, error } = await supabase
      .from("commercials")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      toast.error("Error al cargar el comercial.");
      navigate("/admin/comerciales");
      return;
    }

    form.reset({
      ...data,
      neighborhood_id: data.neighborhood_id || undefined,
      image_url: data.image_url || "",
      images: data.images || [],
      expenses: data.expenses || 0,
      square_meters: data.square_meters || 0,
      bathrooms: data.bathrooms || 0,
      parking: data.parking || 0,
      featured: data.featured || false,
      amenities: data.amenities || [],
      whatsapp: data.whatsapp || "",
      contact_email: data.contact_email || "",
    });
    
    setCurrentMainImageUrl(data.image_url);
    setCurrentGalleryUrls(data.images || []);
    setCurrentPdfUrl(data.pdf_url);
    setFetching(false);
  };

  const uploadToStorage = async (file: File, folder: string) => {
    let fileToUpload = file;
    
    if (file.type.startsWith('image/')) {
      try {
        fileToUpload = await compressImage(file);
      } catch (compressError) {
        console.error("Error al comprimir la imagen, se subirá la original:", compressError);
      }
    }

    const fileExt = fileToUpload.type === 'image/jpeg' ? 'jpg' : fileToUpload.name.split('.').pop() || 'dat';
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const formData = new FormData();
    formData.append('file', fileToUpload);
    formData.append('path', filePath);

    const { data, error: uploadError } = await supabase.functions.invoke('upload-to-b2', {
      body: formData,
    });

    if (uploadError) {
      throw new Error(uploadError.message || "Error al subir el archivo.");
    }

    if (!data || !data.publicUrl) {
      throw new Error("No se obtuvo una URL pública de respuesta.");
    }

    return data.publicUrl;
  };

  const onSubmit = async (values: CommercialFormValues) => {
    setLoading(true);
    try {
      // 1. Upload Main Image if exists
      let image_url = currentMainImageUrl;
      if (mainImageFile) {
        image_url = await uploadToStorage(mainImageFile, 'main-images-commercial');
      }

      // 2. Upload Gallery Images
      let gallery_urls = [...currentGalleryUrls];
      if (galleryFiles.length > 0) {
        toast.info(`Subiendo ${galleryFiles.length} fotos de la galería...`);
        const uploadedGallery = await Promise.all(
          galleryFiles.map(file => uploadToStorage(file, 'gallery-commercial'))
        );
        gallery_urls = [...gallery_urls, ...uploadedGallery];
      }

      // 3. Upload PDF if exists
      let pdf_url = currentPdfUrl;
      if (pdfFile) {
        pdf_url = await uploadToStorage(pdfFile, 'fichas-commercial');
      }

      // Adjust dynamic variables based on type
      const finalData: any = { 
        ...values, 
        image_url, 
        images: gallery_urls, 
        pdf_url,
        // Override irrelevant fields for parking spaces
        bathrooms: values.type === "cochera" ? 0 : values.bathrooms,
        parking: values.type === "cochera" ? 0 : values.parking,
        amenities: values.type === "cochera" ? [] : values.amenities,
      };

      if (id) {
        const { error } = await supabase.from("commercials").update(finalData).eq("id", id);
        if (error) throw error;
        toast.success("Comercial actualizado con éxito.");
      } else {
        const { error } = await supabase.from("commercials").insert([finalData]);
        if (error) throw error;
        toast.success("Comercial creado con éxito.");
      }

      navigate("/admin/comerciales");
    } catch (error: any) {
      toast.error(error.message || "Error al guardar el comercial.");
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
          {id ? "Editar Comercial" : "Nuevo Comercial"}
        </h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card className="bg-black/40 border-gold/10 backdrop-blur-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Tipo de Comercial */}
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gold/80 uppercase text-[10px] tracking-widest font-bold">Tipo de Espacio</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white/5 border-gold/10 text-white font-inter">
                            <SelectValue placeholder="Seleccionar tipo de espacio" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-[#1A1A1A] border-gold/20 text-white font-inter">
                          <SelectItem value="local">Local Comercial</SelectItem>
                          <SelectItem value="oficina">Oficina</SelectItem>
                          <SelectItem value="cochera">Cochera</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Título */}
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gold/80 uppercase text-[10px] tracking-widest font-bold">Título de la publicación</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ej: Espectacular Local en Esquina Premium" className="bg-white/5 border-gold/10 text-white font-inter" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Descripción */}
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gold/80 uppercase text-[10px] tracking-widest font-bold">Descripción detallada</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={4} placeholder="Escriba los detalles comerciales, potencial del inmueble, etc..." className="bg-white/5 border-gold/10 text-white font-inter" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Precio y Expensas */}
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gold/80 uppercase text-[10px] tracking-widest font-bold">Precio de Lista (USD)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} className="bg-white/5 border-gold/10 text-white font-inter" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expenses"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gold/80 uppercase text-[10px] tracking-widest font-bold">Expensas (USD o equivalente)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} placeholder="0 si no tiene" className="bg-white/5 border-gold/10 text-white font-inter" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Estado */}
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gold/80 uppercase text-[10px] tracking-widest font-bold">Estado</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white/5 border-gold/10 text-white font-inter">
                            <SelectValue placeholder="Seleccionar estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-[#1A1A1A] border-gold/20 text-white font-inter">
                          <SelectItem value="disponible">Disponible</SelectItem>
                          <SelectItem value="reservado">Reservado</SelectItem>
                          <SelectItem value="vendido">Vendido / Vendida</SelectItem>
                          <SelectItem value="alquilado">Alquilado / Alquilada</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Destacado */}
              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gold/10 bg-white/5 p-4 md:col-span-2">
                    <div className="space-y-0.5">
                      <FormLabel className="text-gold uppercase text-[10px] tracking-widest font-bold">Comercial Destacado</FormLabel>
                      <p className="text-[10px] text-white/40">Si se activa, aparecerá en zonas destacadas del portal.</p>
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

              {/* Barrio y Dirección */}
              <FormField
                control={form.control}
                name="neighborhood_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gold/80 uppercase text-[10px] tracking-widest font-bold">Barrio</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white/5 border-gold/10 text-white font-inter">
                          <SelectValue placeholder="Seleccionar barrio" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#1A1A1A] border-gold/20 text-white font-inter">
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
                    <FormLabel className="text-gold/80 uppercase text-[10px] tracking-widest font-bold">Dirección / Referencia</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ej: Florida 500 o Microcentro" className="bg-white/5 border-gold/10 text-white font-inter" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Características Físicas (Omitir Baños y Cocheras si es Cochera) */}
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gold/10">
                <FormField
                  control={form.control}
                  name="square_meters"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gold/80 uppercase text-[10px] tracking-widest font-bold text-nowrap">Superficie Total (m²)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} className="bg-white/5 border-gold/10 text-white font-inter" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedType !== "cochera" && (
                  <>
                    <FormField
                      control={form.control}
                      name="bathrooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gold/80 uppercase text-[10px] tracking-widest font-bold">Cantidad de Baños</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} className="bg-white/5 border-gold/10 text-white font-inter" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="parking"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gold/80 uppercase text-[10px] tracking-widest font-bold">Cocheras Propias</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} className="bg-white/5 border-gold/10 text-white font-inter" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </div>

              {/* Contacto de WhatsApp y Correo */}
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gold/10">
                <FormField
                  control={form.control}
                  name="whatsapp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gold/80 uppercase text-[10px] tracking-widest font-bold block">Teléfono WhatsApp</FormLabel>
                      <p className="text-[10px] text-white/40 mb-2 font-inter">Código país sin el +, ej: 5491123456789</p>
                      <FormControl>
                        <Input {...field} placeholder="5491123456789" className="bg-white/5 border-gold/10 text-white font-inter" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="contact_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gold/80 uppercase text-[10px] tracking-widest font-bold block">Email para Consultas</FormLabel>
                      <p className="text-[10px] text-white/40 mb-2 font-inter">Correo corporativo que recibirá los prospectos</p>
                      <FormControl>
                        <Input type="email" {...field} placeholder="comercial@towerdevelopers.com" className="bg-white/5 border-gold/10 text-white font-inter" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Amenities Especiales (Solo si no es Cochera) */}
              {selectedType !== "cochera" && (
                <FormField
                  control={form.control}
                  name="amenities"
                  render={() => (
                    <FormItem className="md:col-span-2 space-y-4 pt-4 border-t border-gold/10">
                      <div className="mb-4">
                        <FormLabel className="text-gold uppercase text-xs tracking-widest font-bold">Especificaciones / Amenities Comerciales</FormLabel>
                        <p className="text-[10px] text-white/40 font-inter">Seleccione el equipamiento e infraestructura disponible.</p>
                      </div>
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        {COMMERCIAL_AMENITIES.map((amenity) => (
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
                                  <FormLabel className="font-normal text-white text-sm cursor-pointer whitespace-nowrap font-inter">
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
              )}

              {/* Foto Principal */}
              <div className="md:col-span-2 space-y-4 pt-4 border-t border-gold/10">
                <FormLabel className="text-gold uppercase text-xs tracking-widest font-bold flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" /> Foto Principal
                </FormLabel>
                
                {currentMainImageUrl && (
                  <div className="relative group w-40 h-40 rounded-lg overflow-hidden border border-gold/20 bg-black/20">
                    <img src={currentMainImageUrl} alt="Principal" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                      <p className="text-[10px] text-white font-bold font-inter" onClick={() => setCurrentMainImageUrl(null)}>REEMPLAZAR</p>
                    </div>
                  </div>
                )}

                {!currentMainImageUrl && mainImageFile && (
                  <div className="relative group w-40 h-40 rounded-lg overflow-hidden border border-gold/40 border-dashed bg-gold/5">
                    <img 
                      src={URL.createObjectURL(mainImageFile)} 
                      alt="Nueva Principal" 
                      className="w-full h-full object-cover"
                      onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                    />
                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex flex-col justify-center items-center gap-1 transition-opacity cursor-pointer" onClick={() => setMainImageFile(null)}>
                      <p className="text-[10px] text-white font-bold font-inter">REMOVER</p>
                      <span className="text-[8px] text-white/60 truncate max-w-[90%] px-2 font-inter">{mainImageFile.name}</span>
                    </div>
                  </div>
                )}

                {!currentMainImageUrl && !mainImageFile && (
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
                      <div className="flex flex-col items-center gap-2 text-white/40 font-inter">
                        <Upload className="w-8 h-8 mb-2" />
                        <span className="text-sm font-medium uppercase tracking-tighter">Subir Foto Principal</span>
                      </div>
                    </label>
                  </div>
                )}
              </div>

              {/* Galería de Fotos */}
              <div className="md:col-span-2 space-y-4 pt-4 border-t border-gold/10">
                <FormLabel className="text-gold uppercase text-xs tracking-widest font-bold flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" /> Galería de Fotos
                </FormLabel>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {currentGalleryUrls.map((url, idx) => (
                    <div key={`existing-${idx}`} className="relative group h-32 rounded-lg overflow-hidden border border-gold/10 bg-black/20">
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
                  
                  {galleryFiles.map((file, idx) => (
                    <div key={`new-${idx}`} className="relative group h-32 rounded-lg overflow-hidden border border-gold/40">
                      <img 
                        src={URL.createObjectURL(file)} 
                        alt={file.name} 
                        className="w-full h-full object-cover"
                        onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col justify-between p-2 transition-opacity font-inter">
                        <span className="text-[8px] text-white bg-black/70 px-1 py-0.5 rounded truncate self-start max-w-full">
                          {file.name}
                        </span>
                        <button 
                          type="button"
                          onClick={() => removeGalleryFile(idx)}
                          className="bg-red-500 rounded-full p-1 self-end hover:bg-red-600 transition-colors"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
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
                    <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest font-inter">Añadir Fotos</span>
                  </label>
                </div>
              </div>

              {/* Ficha Técnica PDF */}
              <div className="md:col-span-2 space-y-4 pt-4 border-t border-gold/10">
                <FormLabel className="text-gold/80 uppercase text-[10px] tracking-widest font-bold block">Ficha Técnica (PDF)</FormLabel>
                <div className="flex flex-col gap-4">
                  {currentPdfUrl && (
                    <div className="flex items-center gap-2 p-3 bg-gold/5 border border-gold/20 rounded-lg text-gold text-sm font-inter">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Ficha PDF actual cargada correctamente.</span>
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
                          <div className="flex items-center gap-2 text-white font-inter">
                            <FileText className="w-6 h-6 text-gold" />
                            <span className="font-semibold text-sm">{pdfFile.name}</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-white/40 font-inter">
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
                className="flex-1 bg-gold text-black hover:bg-gold/80 font-bold h-14 tracking-widest text-lg font-playfair"
              >
                {loading ? <Loader2 className="animate-spin" /> : id ? "GUARDAR CAMBIOS" : "PUBLICAR COMERCIAL"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/admin/comerciales")}
                className="border-white/10 text-white/60 hover:bg-white/5 hover:text-white h-14 font-bold font-inter"
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
