import ServicesHero from "@/components/servicesComponents/ServiceHero";
import ProductionIntro from "@/components/servicesComponents/ProductionIntro";
import YoutubeShowreel from "@/components/servicesComponents/YoutubeShowreel";
import ContactSection from "@/components/servicesComponents/ContactSection";
import Timeline from "@/components/servicesComponents/Timeline";
import productionTimelineData from "@/data/productionTimelineData";

export default function ProductionServicePage() {
  return (
    <>
      <ServicesHero
        title="AUDIO & VISUAL PRODUCTION"
        highlight="Bringing Stories to Life Through Sound & Vision"
      />

      <ProductionIntro
        imageSrc="/Alchemypics.png"
        imageAlt="Alchemy Pictures"
        description="We assist businesses and individuals in telling their stories through captivating visuals, encompassing both pre-recorded videos and the dynamic power of live streaming. Our team of creative professionals combines technical expertise with artistic vision to deliver exceptional audiovisual content that resonates with your audience."
      />

      <YoutubeShowreel
        videoId="PP2NszjOEBA"
        title="Watch Our AV Production Showcase"
        description="See how we bring visions to life through captivating audiovisual storytelling"
      />

      <ProductionIntro
        imageSrc="/Alchemixlogo.png"
        imageAlt="Alchemy Mix"
        description="We transform raw musical talent into sonic gold, crafting extraordinary soundscapes that resonate with audiences worldwide. Our recording label specializes in discovering and nurturing emerging artists while providing comprehensive music production services that span from initial composition to final mastering."
      />

      <YoutubeShowreel
        videoId="L9rqEEdpOXo" // 
        title="Listen to Our Latest Productions"
        description="Experience the sound of tomorrow with our cutting-edge music production"
      />
      <Timeline data={productionTimelineData} />
      <ContactSection />
      
    </>
  );
}
