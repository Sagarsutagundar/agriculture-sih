import HowItWorks from "@/components/landing/HowItWorks";
import Navbar from "@/components/common/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";

export default function Home() {
  return (
    <>
      <Navbar />

      <main>
  <Hero />
  <Features />
  <HowItWorks />
</main>
    </>
  );
}