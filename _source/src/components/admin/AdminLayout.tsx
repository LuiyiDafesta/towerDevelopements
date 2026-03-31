import { useEffect, useState } from "react";
import { useNavigate, Link, Outlet, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Building2, MapPin, LogOut, Loader2, Menu, X, Users, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export default function AdminLayout() {
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/login");
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (error || profile?.role !== "admin") {
        await supabase.auth.signOut();
        navigate("/login");
        toast.error("No autorizado.");
        return;
      }

      setLoading(false);
    } catch (error) {
      navigate("/login");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
    toast.info("Sesión cerrada.");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-gold animate-spin" />
      </div>
    );
  }

  const navItems = [
    { title: "Escritorio", path: "/admin", icon: LayoutDashboard },
    { title: "Leads", path: "/admin/leads", icon: Users },
    { title: "Consultas", path: "/admin/consultas", icon: MessageSquare },
    { title: "Propiedades", path: "/admin/propiedades", icon: Building2 },
    { title: "Barrios", path: "/admin/barrios", icon: MapPin },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex">
      {/* Mobile Sidebar Trigger */}
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-50 bg-gold text-black p-4 rounded-full shadow-lg shadow-gold/20"
      >
        {sidebarOpen ? <X /> : <Menu />}
      </button>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-black border-r border-gold/10 transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6">
          <h2 className="text-xl font-playfair text-gold tracking-widest uppercase">Tower Admin</h2>
        </div>

        <nav className="mt-6 px-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                  ${isActive 
                    ? 'bg-gold/10 text-gold border border-gold/20 shadow-[0_0_15px_rgba(212,175,55,0.1)]' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'}
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="font-inter text-sm font-medium tracking-wide">{item.title}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-8 left-0 right-0 px-8">
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className="w-full flex items-center justify-start gap-3 text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Cerrar Sesión</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-gold/5 via-transparent to-transparent">
        <main className="flex-1 p-6 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
