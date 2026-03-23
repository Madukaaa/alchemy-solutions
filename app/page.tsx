import HeroAlchemy from "@/components/homeComponents/HeroAlchemy";
import ServicesShowcase from "@/components/homeComponents/ServicesShowcase";
import { HeroScrollVideo } from "@/components/ui/scroll-animated-video";
import CircularGallery from "@/components/CircularGallery";

export default function Home() {
  const galleryItems = [
    {
      image: "https://picsum.photos/seed/kidzcare-slide-1/1400/900",
      title: "Kidzcare Brand Awareness",
      description: "Produced a showcase video that significantly increased Kidzcare's brand reach.",
      category: "Baby & Mother Care Retail Promotion",
    },
    {
      image: "https://picsum.photos/seed/kidzcare-slide-2/1400/900",
      title: "Community-Based Initiatives",
      description: "Created story-led visual campaigns to communicate grassroots impact clearly.",
      category: "Public Health Outreach",
    },
    {
      image: "https://picsum.photos/seed/kidzcare-slide-3/1400/900",
      title: "Clinical Team Collaboration",
      description: "Showcased authentic consultation moments to improve trust and engagement.",
      category: "Healthcare Trust Campaign",
    },
  ];

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
      <section className="h-[100svh] bg-black">
        <CircularGallery items={galleryItems} bend={0} />
      </section>
    </>
  );
}
