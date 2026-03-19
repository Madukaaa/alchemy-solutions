import Image from "next/image";

type ProductionIntroProps = {
  imageSrc: string;
  imageAlt: string;
  description: string;
};

export default function ProductionIntro({
  imageSrc,
  imageAlt,
  description,
}: ProductionIntroProps) {
  return (
    <section className="w-full bg-black px-6 py-16 text-white md:px-16 lg:px-20 lg:py-20">
      <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[minmax(260px,420px)_1fr] lg:items-center lg:gap-14">
        <div className="relative w-full max-w-[320px]">
          <Image
            src={imageSrc}
            alt={imageAlt}
            width={640}
            height={320}
            priority
            className="h-auto w-full object-contain"
          />
        </div>

        <p className="max-w-5xl text-lg leading-relaxed text-justify text-white">
          {description}
        </p>
      </div>
    </section>
  );
}