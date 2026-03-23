import GeneralHero from "@/components/homeComponents/GeneralHero";
import CareersSection from "@/components/careersComponents/CareersSection";

export default function CareersPage() {
  return (
    <>
      <GeneralHero
        line1="Grow"
        line2="with Our"
        line3="Team"
        subtitle="Where curious minds craft meaningful digital experiences"
        showTextSection={true}
      />
      <CareersSection />
    </>
  );
}
