import GeneralHero from "@/components/homeComponents/GeneralHero";
import AboutSection from "@/components/aboutComponents/AboutSection";

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
    </>
  );
}
