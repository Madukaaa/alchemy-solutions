"use client";

import { useCallback } from "react";
import Link from "next/link";
import ServicesHero from "@/components/servicesComponents/ServiceHero";
import ExpertiseSection from "@/components/servicesComponents/ExpertiseSection";
import YoutubeShowreel from "@/components/servicesComponents/YoutubeShowreel";
import DomeGallery from "../../../components/servicesComponents/marketing/DomeGallery";

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

          <section className="bg-black px-4 pb-16 pt-6 md:px-10 lg:px-16">
            <h2 className="mb-6 text-center text-2xl font-bold tracking-wide text-[#E2791D] md:mb-10 md:text-4xl">
              OUR WORK SHOWCASE
            </h2>
            <div style={{ width: "100vw", height: "100vh" }}>
              {/* Forward expand handler so header hides when fullscreen */}
              <DomeGallery onExpandChange={onExpandChange} />
            </div>
          </section>
    
          <section className="min-h-screen bg-black px-6 py-20 text-white md:px-16 lg:px-20">
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
    
              <div className="pt-4">
                <Link
                  href="/#services"
                  className="inline-flex items-center rounded-full border border-[#E2791D] px-6 py-3 text-sm font-semibold uppercase tracking-wider text-[#E2791D] transition-colors hover:bg-[#E2791D] hover:text-black"
                >
                  Back to Services
                </Link>
              </div>
            </div>
          </section>
        </>
  );
}
