import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import AdSense from "@/components/AdSense";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate("/app");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <AdSense slot="1234567890" format="auto" className="my-8" />
        <div id="features">
          <Features />
        </div>
        <AdSense slot="1234567891" format="auto" className="my-8" />
        <div id="how-it-works">
          <HowItWorks />
        </div>
        <CTA />
        <AdSense slot="1234567892" format="auto" className="my-8" />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
