type ExpertiseSectionProps = {
  description: string;
};

export default function ExpertiseSection({
  description,
}: ExpertiseSectionProps) {
  return (
    <section className="w-full bg-black px-6 py-16 text-white md:px-16 lg:px-20 lg:py-20">
      <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[minmax(220px,320px)_1fr] lg:items-start lg:gap-14">
        <h2 className="text-2xl font-bold uppercase tracking-tight text-brand">
          Our Expertise
        </h2>

        <p className="max-w-5xl text-lg leading-relaxed text-justify text-white">
          {description}
        </p>
      </div>
    </section>
  );
}