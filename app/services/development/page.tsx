import Link from "next/link";
import ServicesHero from "@/components/servicesComponents/ServiceHero";
import ExpertiseSection from "@/components/servicesComponents/ExpertiseSection";
import ContactSection from "@/components/servicesComponents/ContactSection";
import Timeline from "@/components/servicesComponents/Timeline";
import timelineData from "@/data/webDevelopmentTimelineData";
import FeaturedITWork from "@/components/servicesComponents/FeaturedITWork";

export default function DevelopmentServicePage() {
  return (
    <>
      <ServicesHero
        title="WEB & MOBILE DEVELOPMENT"
        highlight="Building Seamless Digital Experience"
      />

      <ExpertiseSection description="At the forefront of technology advancement, our team seamlessly blends expertise and creativity to engineer bespoke software solutions tailored to your needs." />
      <Timeline data={timelineData} />
      <FeaturedITWork
        title="FEATURED WORK"
        subtitle="We believe in the power of ideas and the magic that happens when they're brought to life."
      />
      <ContactSection />
    </>
  );
}
