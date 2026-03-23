"use client";

import DotExpandButton from "../ui/DotExpandButton";
import { useRouter } from "next/navigation";

const AboutUsSection = () => {
  const router = useRouter();
  return (
    <section className="relative w-full min-h-[70dvh] md:min-h-[100dvh] flex items-center justify-center font-poppins overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <div
          className="w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: `url(/HomeImages/Background.jpg)`,
          }}
        />
      </div>

      {/* Black overlay */}
      <div className="absolute inset-0 bg-black/80 z-[1]" />

      {/* Content */}
      <div className="z-10 text-center px-4">
        {/* First line - centered */}
        <h1 className="text-white font-extrabold text-3xl md:text-7xl leading-tight">
          Where Ideas
        </h1>

        {/* Second line with button inline */}
        <div className="flex items-center justify-center gap-5">
          <h1 className="text-white font-extrabold text-3xl md:text-7xl">
            Transform
          </h1>
            <div className="mt-1 md:mt-2">
              <DotExpandButton text="About Us" onClick={() => router.push("/about")} />
            </div>
        </div>

        {/* Third line */}
        <h1 className="text-white font-extrabold text-3xl md:text-7xl translate-x-4 md:translate-x-[80px]">
          into Reality
        </h1>
      </div>
    </section>
  );
};

export default AboutUsSection;
