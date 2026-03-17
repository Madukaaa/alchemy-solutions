import Link from "next/link";

export default function ProductionServicePage() {
  return (
    <section className="min-h-screen bg-black px-6 py-20 text-white md:px-16 lg:px-20">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <p className="text-sm font-semibold tracking-widest text-[#E2791D]">
          Audio & Visual
        </p>

        <h1 className="text-4xl font-bold leading-tight md:text-6xl">
          Production
        </h1>

        <p className="max-w-2xl text-lg text-gray-200 md:text-xl">
          Create premium audio-visual experiences that elevate your brand story.
        </p>

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
  );
}
