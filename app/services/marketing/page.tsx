import Link from "next/link";
import ServicesHero from "@/components/servicesComponents/ServiceHero";
import ExpertiseSection from "@/components/servicesComponents/ExpertiseSection";
import YoutubeShowreel from "@/components/servicesComponents/YoutubeShowreel";

export default function MarketingServicePage() {
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
