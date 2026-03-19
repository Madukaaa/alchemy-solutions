import Link from "next/link";
import ServicesHero from "@/components/servicesComponents/ServiceHero";
import ExpertiseSection from "@/components/servicesComponents/ExpertiseSection";

export default function ManagementServicePage() {
  return (
    <>
          <ServicesHero
            title="EVENT MANAGEMENT"
            highlight="Creating Moments that Inspire & Connect"
          />
    
          <ExpertiseSection description="As a premier event management company with years of industry experience, we specialize in creating extraordinary experiences that leave lasting impressions." />
    
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
