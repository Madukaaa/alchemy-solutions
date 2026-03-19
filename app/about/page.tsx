import GeneralHero from "@/components/homeComponents/GeneralHero";
import AboutSection from "@/components/aboutComponents/AboutSection";
import CountSection from "@/components/aboutComponents/CountSection";
import TeamSection from "@/components/aboutComponents/TeamSection";

export default function AboutUsPage() {
  return (
    <>
      <GeneralHero
        line1="Our Journey"
        line2="Evolves"
        line3="with Purpose"
        subtitle="Crafting Digital Excellence"
        showTextSection={true}
      />
      <AboutSection />
      <CountSection />
      <TeamSection />
    </>
  );
}
