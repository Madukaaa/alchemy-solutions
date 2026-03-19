import Link from "next/link";
import ServicesHero from "@/components/service/ServiceHero";
import ExpertiseSection from "@/components/service/ExpertiseSection";

export default function DevelopmentServicePage() {
  return (
    <>
      <ServicesHero
        title="WEB & MOBILE DEVELOPMENT"
        highlight="Building Seamless Digital Experience"
      />

      <ExpertiseSection description="At the forefront of technology advancement, our team seamlessly blends expertise and creativity to engineer bespoke software solutions tailored to your needs." />

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
