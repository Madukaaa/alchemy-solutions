import HeroAlchemy from "@/components/homeComponents/HeroAlchemy";
import ServicesShowcase from "@/components/homeComponents/ServicesShowcase";
import { HeroScrollVideo } from "@/components/ui/scroll-animated-video";
import FeaturedWork from "@/components/homeComponents/FeaturedWork";
import AboutUsSection from "@/components/homeComponents/AboutUsSection";
import LogoLoop from "@/components/ui/LogoLoop";
import { listClientLogos } from "@/lib/firestoreHelpers";

const partnerLogos = [
  { src: "/logos/Alchemixlogo.png", alt: "Alchemix logo" },
  { src: "/logos/Alchemy%20logo%20ai-01.png", alt: "Alchemy logo variant 1" },
  { src: "/logos/Alchemy%20logo%20ai-02.png", alt: "Alchemy logo variant 2" },
  { src: "/logos/Alchemypics.png", alt: "Alchemy Pictures logo" },
];

export default async function Home() {
  let dbLogos: any[] = [];
  try {
    dbLogos = await listClientLogos();
  } catch (err) {
    console.error("Failed to load client logos from Firestore:", err);
  }

  // Combine hardcoded logos with ones from DB, or just use DB if preferred.
  // Here we'll show DB logos if they exist, otherwise fallback to defaults.
  const displayLogos = dbLogos.length > 0 
    ? dbLogos.map(l => {
        let src = l.url;
        if (src && !src.startsWith('http') && !src.startsWith('/logos/')) {
          src = `/logos/${src.startsWith('/') ? src.slice(1) : src}`;
        }
        return { src, alt: l.alt || l.name };
      })
    : partnerLogos;

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
      <section className="bg-black px-4 pt-4 pb-12 md:px-8 md:py-16" aria-label="Trusted brand logos">
        <h2 className="mb-10 text-center text-2xl font-bold uppercase tracking-wide text-brand md:mb-14 md:text-4xl">
          SHOWCASING OUR BRAND TRAILBLAZERS
        </h2>
        <LogoLoop logos={displayLogos} speed={90} logoHeight={60} gap={120} scaleOnHover />
      </section>
      <AboutUsSection />
    </>
  );
}
