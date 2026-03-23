import HeroAlchemy from "@/components/homeComponents/HeroAlchemy";
import ServicesShowcase from "@/components/homeComponents/ServicesShowcase";
import { HeroScrollVideo } from "@/components/ui/scroll-animated-video";
import FeaturedWork from "@/components/homeComponents/FeaturedWork";
import AboutUsSection from "@/components/homeComponents/AboutUsSection";

export default function Home() {
  return (
    <>
      <HeroAlchemy />
      <section id="services">
        <ServicesShowcase />
      </section>
      <HeroScrollVideo
        media="/Showreel.webm"
        title="UNSEEN VISUAL SHOWCASE"
        subtitle="SHOWREEL"
        meta="2025"
        overlay={{
          heading: "Future- Forward",
          paragraphs: [
            "Building tomorrow's digital landscape today.",
            "We blend cutting-edge development with strategic marketing to create ecosystems where brands don't just exist-they evolve, adapt, and dominate their space.",
          ],
        }}
        credits={
          <>
            <p>Crafted by</p>
            <p>Alchemy</p>
          </>
        }
      />
      <FeaturedWork />
      <AboutUsSection />
    </>
  );
}
