import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import FarmerWorkflow from "@/components/landing/FarmerWorkflow";
import CropManagementPreview from "@/components/landing/CropManagementPreview";
import PlatformCTA from "@/components/landing/PlatformCTA";

export default function Home() {
  return (
    <>
      <Navbar />

      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <FarmerWorkflow />
        <CropManagementPreview />
        <PlatformCTA />
      </main>

      <Footer />
    </>
  );
}