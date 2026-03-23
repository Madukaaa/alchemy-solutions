import Link from "next/link";
import ServicesHero from "@/components/servicesComponents/ServiceHero";
import ExpertiseSection from "@/components/servicesComponents/ExpertiseSection";
import ContactSection from "@/components/servicesComponents/ContactSection";

export default function ManagementServicePage() {
  return (
    <>
      <ServicesHero
        title="EVENT MANAGEMENT"
        highlight="Creating Moments that Inspire & Connect"
      />

      <ExpertiseSection description="As a premier event management company with years of industry experience, we specialize in creating extraordinary experiences that leave lasting impressions." />
      <ContactSection />
    </>
  );
}
