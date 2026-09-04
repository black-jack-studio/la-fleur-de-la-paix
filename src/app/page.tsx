import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Maison } from "@/components/Maison";
import { Catalogue } from "@/components/Catalogue";
import { BouquetStudio } from "@/components/BouquetStudio";
import { QuoteExperience } from "@/components/QuoteExperience";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <Maison />
        <Catalogue />
        <BouquetStudio />
        <QuoteExperience />
      </main>
      <Footer />
    </>
  );
}
