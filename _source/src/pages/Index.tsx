import Navbar from "@/components/Navbar";
import SEO from "@/components/SEO";
import HeroSection from "@/components/HeroSection";
import FeaturedProperties from "@/components/FeaturedProperties";
import StatsSection from "@/components/StatsSection";
import AmenitiesSection from "@/components/AmenitiesSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Inicio" 
        description="Explorá nuestra colección exclusiva de propiedades de lujo en Buenos Aires. Real Estate premium con Tower Developers."
      />
      <Navbar />
      <HeroSection />
      <FeaturedProperties />
      <StatsSection />
      <AmenitiesSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
