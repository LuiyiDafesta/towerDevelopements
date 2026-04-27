import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const formSchema = z.object({
  full_name: z.string().min(2, "El nombre es muy corto"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(8, "Teléfono inválido"),
  property_type: z.string().min(1, "Seleccione una opción"),
  preferred_zone: z.string().min(1, "Seleccione una opción"),
  purpose: z.string().min(1, "Seleccione una opción"),
  delivery_time: z.string().min(1, "Seleccione una opción"),
});

interface LeadCaptureProps {
  onComplete: () => void;
}

const LeadCapture = ({ onComplete }: LeadCaptureProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const [neighborhoods, setNeighborhoods] = useState<any[]>([]);

  useEffect(() => {
    const fetchNeighborhoods = async () => {
      try {
        const { data, error } = await supabase.from("neighborhoods").select("*").order("name");
        if (error) throw error;
        setNeighborhoods(data || []);
      } catch (err) {
        console.error("Error fetching neighborhoods:", err);
      }
    };
    fetchNeighborhoods();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      property_type: "",
      preferred_zone: "",
      purpose: "",
      delivery_time: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      // 1. Check if email already exists
      const { data: existingLead } = await supabase
        .from("leads")
        .select("full_name, email, phone")
        .eq("email", values.email)
        .maybeSingle();

      if (!existingLead) {
        // 2. Insert new lead if it doesn't exist
        const { error } = await supabase.from("leads").insert([values as any]);
        if (error) throw error;
      }

      // 3. Store contact info for auto-filling property forms later
      const contactInfo = {
        full_name: values.full_name,
        email: values.email,
        phone: values.phone
      };
      localStorage.setItem("user_contact_info", JSON.stringify(contactInfo));
      localStorage.setItem("lead_captured", "true");

      toast({
        title: "¡Gracias por tu interés!",
        description: "Ya podés explorar todas nuestras propiedades.",
      });

      // 4. Trigger Webhook if configured
      try {
        const { data: webhookUrl } = await supabase
          .from("admin_settings")
          .select("value")
          .eq("key", "webhook_leads")
          .maybeSingle();

        if (webhookUrl?.value) {
          await fetch(webhookUrl.value, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              event: "new_lead",
              timestamp: new Date().toISOString(),
              source: "website_lead_capture",
              data: values
            }),
          }).catch(err => console.error("Webhook fetch error:", err));
        }
      } catch (webhookErr) {
        console.error("Error triggering lead webhook:", webhookErr);
      }

      onComplete();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Hubo un problema al enviar tus datos. Reintenta por favor.",
      });
      console.error("Error submitting lead:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col md:flex-row overflow-y-auto font-sans">
      {/* Left Column: Marketing & Info */}
      <div className="w-full md:w-1/2 bg-neutral-900 p-8 md:p-16 flex flex-col justify-center items-center text-center border-b md:border-b-0 md:border-r border-gold/20">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-center gap-2 mb-12">
            <span className="text-3xl font-bold text-primary">Tower</span>
            <span className="text-3xl font-light text-white">Developers</span>
          </div>

          <h2 className="text-primary text-sm font-medium tracking-[0.3em] uppercase mb-6">
            Inversiones Inmobiliarias
          </h2>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-8 leading-tight">
            Tu próximo departamento en CABA desde <span className="text-primary">USD 80.000</span>
          </h1>

          <p className="text-lg text-neutral-400 mb-12 font-light leading-relaxed">
            Nuestro staff de ventas te ayudará a encontrar lo que mejor se adapte a tu necesidad de vivienda, o inversión.
          </p>

          <div className="grid grid-cols-2 gap-8 mb-12">
            <div className="p-6 border border-gold/20 rounded-xl bg-black/40 flex flex-col items-center">
              <div className="text-4xl font-bold text-primary mb-2">24</div>
              <p className="text-xs text-neutral-500 uppercase tracking-widest leading-tight">
                Edificios entregados por los socios
              </p>
            </div>
            <div className="p-6 border border-gold/20 rounded-xl bg-black/40 flex flex-col items-center">
              <div className="text-4xl font-bold text-primary mb-2">1.791</div>
              <p className="text-xs text-neutral-500 uppercase tracking-widest leading-tight">
                Departamentos entregados en CABA
              </p>
            </div>
          </div>

          <div className="space-y-4 text-neutral-500 text-sm italic">
            <p>Más de 1000 unidades entregadas en los mejores barrios de la ciudad.</p>
            <p>Somos especialistas en construir edificios de calidad y excelencia.</p>
          </div>
        </div>
      </div>

      {/* Right Column: Form */}
      <div className="w-full md:w-1/2 bg-black p-8 md:p-16 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full">
          <div className="mb-10 p-6 border-l-2 border-primary bg-neutral-900/50">
            <h3 className="text-white font-bold mb-3 text-sm tracking-wider uppercase">Solo para clientes registrados:</h3>
            <ul className="space-y-2">
              {[
                "Acceso a preventas exclusivas",
                "Precios especiales de lanzamiento",
                "Oportunidades fuera del mercado"
              ].map((benefit) => (
                <li key={benefit} className="flex items-center gap-2 text-neutral-400 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="property_type"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-neutral-400 uppercase tracking-wider text-xs">¿Qué tipo de departamento buscás?</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-2 gap-2"
                        >
                          {["1 ambiente", "2 ambientes", "3 ambientes", "4 ambientes"].map((opt) => (
                            <FormItem key={opt} className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value={opt} className="border-gold text-primary" />
                              </FormControl>
                              <FormLabel className="font-normal text-white text-sm cursor-pointer">
                                {opt}
                              </FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="preferred_zone"
                  render={({ field }) => (
                    <FormItem className="space-y-3 flex flex-col">
                      <FormLabel className="text-neutral-400 uppercase tracking-wider text-xs">¿Cuál es tu zona de preferencia?</FormLabel>
                      <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between bg-neutral-900 border-neutral-800 text-white hover:bg-neutral-800 hover:text-white h-10 px-3",
                                !field.value && "text-neutral-600"
                              )}
                            >
                              {field.value
                                ? neighborhoods.find(
                                    (n) => n.name === field.value
                                  )?.name
                                : "Seleccione un barrio"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent 
                          className="w-[var(--radix-popover-trigger-width)] p-0 bg-neutral-900 border-neutral-800 z-[10001]"
                          align="start"
                        >
                          <Command className="bg-neutral-900 text-white border-none">
                            <CommandInput placeholder="Buscar barrio..." className="h-9 text-white border-neutral-800" />
                            <CommandList className="max-h-[300px]">
                              {neighborhoods.length === 0 && (
                                <CommandEmpty className="py-6 text-center text-sm text-neutral-500">
                                  No hay barrios cargados.
                                </CommandEmpty>
                              )}
                              <CommandGroup>
                                {neighborhoods.map((n) => (
                                  <CommandItem
                                    key={n.id}
                                    value={n.name}
                                    onSelect={() => {
                                      form.setValue("preferred_zone", n.name);
                                      setOpen(false);
                                    }}
                                    className="flex items-center gap-2 hover:bg-gold hover:text-black cursor-pointer text-white aria-selected:bg-gold aria-selected:text-black"
                                  >
                                    <Check
                                      className={cn(
                                        "h-4 w-4",
                                        n.name === field.value ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {n.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="purpose"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-neutral-400 uppercase tracking-wider text-xs">Objetivo</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col gap-2"
                          >
                            {["Vivienda", "Inversión"].map((opt) => (
                              <FormItem key={opt} className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value={opt} className="border-gold text-primary" />
                                </FormControl>
                                <FormLabel className="font-normal text-white text-sm cursor-pointer">
                                  {opt}
                                </FormLabel>
                              </FormItem>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="delivery_time"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-neutral-400 uppercase tracking-wider text-xs">Plazo</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col gap-2"
                          >
                            {["Entrega Inmediata", "Con plazo"].map((opt) => (
                              <FormItem key={opt} className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value={opt} className="border-gold text-primary" />
                                </FormControl>
                                <FormLabel className="font-normal text-white text-sm cursor-pointer">
                                  {opt}
                                </FormLabel>
                              </FormItem>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="Nombre completo"
                            {...field}
                            className="bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-600 focus:border-gold"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="Email"
                            type="email"
                            {...field}
                            className="bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-600 focus:border-gold"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="Teléfono (ej: +54 9 11 ...)"
                            {...field}
                            className="bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-600 focus:border-gold"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-black hover:bg-gold-light font-bold py-6 rounded-none uppercase tracking-widest mt-8 transition-all duration-300"
              >
                {isSubmitting ? "Enviando..." : "Explorar Propiedades Exclusivas"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default LeadCapture;
