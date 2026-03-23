import Link from "next/link";
import ServicesHero from "@/components/servicesComponents/ServiceHero";
import ExpertiseSection from "@/components/servicesComponents/ExpertiseSection";
import ContactSection from "@/components/servicesComponents/ContactSection";
import Timeline from "@/components/servicesComponents/Timeline";
import timelineData from "@/data/webDevelopmentTimelineData";

export default function DevelopmentServicePage() {
  return (
    <>
      <ServicesHero
        title="WEB & MOBILE DEVELOPMENT"
        highlight="Building Seamless Digital Experience"
      />

      <ExpertiseSection description="At the forefront of technology advancement, our team seamlessly blends expertise and creativity to engineer bespoke software solutions tailored to your needs." />
      <Timeline data={timelineData} />
      <ContactSection />
    </>
  );
}
