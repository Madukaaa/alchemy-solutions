"use client";

import { useCallback } from "react";
import Link from "next/link";
import ServicesHero from "@/components/servicesComponents/ServiceHero";
import ExpertiseSection from "@/components/servicesComponents/ExpertiseSection";
import YoutubeShowreel from "@/components/servicesComponents/YoutubeShowreel";
import ContactSection from "@/components/servicesComponents/ContactSection";
import DomeGallery from "../../../components/servicesComponents/marketing/DomeGallery";
import Timeline from "@/components/servicesComponents/Timeline";
import digitalMarketingTimelineData from "@/data/digitalMarketingTimelineData";

export default function MarketingServicePage() {
  const onExpandChange = useCallback((expanded: boolean) => {
    window.dispatchEvent(
      new CustomEvent("gallery:expanded-change", {
        detail: { expanded },
      }),
    );
  }, []);

  return (
    <>
      <ServicesHero
        title="DIGITAL MARKETING"
        highlight="Empowering Brands in the Digital World"
      />

      <ExpertiseSection description="As a reputable and experienced company, we specialize in providing top-notch digital marketing services to help businesses achieve their goals in a crowded online marketplace" />

      <YoutubeShowreel
        videoId="8H64aNd8beo"
        title="Watch Our Digital Marketing Showcase"
        description="See how transform businesses through innovative digital strategies"
      />

      <section className="bg-black px-4 pb-16 pt-6 md:px-10 lg:px-16 overflow-x-hidden">
        <h2 className="mb-6 text-center text-2xl font-bold tracking-wide text-[#E2791D] md:mb-10 md:text-4xl">
          OUR WORK SHOWCASE
        </h2>
        <div className="relative h-[70vh] min-h-[460px] w-full overflow-hidden md:h-[85vh] md:min-h-[620px]">
          {/* Forward expand handler so header hides when fullscreen */}
          <DomeGallery onExpandChange={onExpandChange} />
        </div>
      </section>

      <Timeline data={digitalMarketingTimelineData} />
      <ContactSection />
    </>
  );
}
