import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Check if user has a profile and is admin
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (profileError || profile?.role !== "admin") {
        await supabase.auth.signOut();
        toast.error("No tienes permisos de administrador.");
        return;
      }

      toast.success("Bienvenido al panel de administración.");
      navigate("/admin");
    } catch (error: any) {
      toast.error(error.message || "Error al iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gold/10 via-transparent to-transparent opacity-30" />
      
      <Card className="w-full max-w-md bg-black/40 border-gold/20 backdrop-blur-xl relative z-10">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mb-4 border border-gold/20">
            <LogIn className="w-8 h-8 text-gold" />
          </div>
          <CardTitle className="text-2xl font-playfair text-white tracking-wide uppercase">Admin Access</CardTitle>
          <CardDescription className="text-white/60">
            Ingresa tus credenciales para gestionar Tower Developers
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gold/80 text-xs uppercase tracking-widest font-semibold">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nombre@ejemplo.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/5 border-gold/10 text-white focus-visible:ring-gold/40 placeholder:text-white/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" title="Contraseña" className="text-gold/80 text-xs uppercase tracking-widest font-semibold">Contraseña</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/5 border-gold/10 text-white focus-visible:ring-gold/40"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gold hover:bg-gold/80 text-black font-bold h-12 transition-all duration-300"
            >
              {loading ? "Iniciando sesión..." : "ACCEDER AL PANEL"}
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      <footer className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-white/20 text-xs font-inter tracking-widest uppercase italic">
          &copy; {new Date().getFullYear()} Tower Developers Portfolio
        </p>
      </footer>
    </div>
  );
}
