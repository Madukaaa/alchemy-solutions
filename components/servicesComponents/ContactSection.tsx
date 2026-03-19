"use client";

import { useRouter } from "next/navigation";

const ContactSection = () => {
  const router = useRouter();

  return (
    <section className="relative w-full min-h-[50vh] sm:min-h-[60vh] md:min-h-screen bg-black flex items-center justify-center text-center overflow-hidden">
      <img
        src="/contact-bg.webp"
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div className="relative z-10 flex flex-col items-center justify-center px-4 w-full">
        <h1 className="text-white font-extrabold uppercase leading-[0.95] text-4xl sm:text-5xl md:text-6xl lg:text-8xl space-y-3">
          {["CREATE", "INNOVATE", "SUCCEED", "TOGETHER"].map((word) => (
            <div key={word}>{word}</div>
          ))}
        </h1>

        <div className="absolute top-1/2 left-1/2 w-full -translate-x-1/2 -translate-y-1/2">
          <div className="relative h-16 sm:h-20 md:h-24 lg:h-28">
            <button
              onClick={() => router.push("/contact")}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-6 bg-orange-500 text-white text-xs sm:text-sm md:text-base font-semibold px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 rounded-full shadow-lg transition-transform duration-300 ease-out hover:scale-110 hover:bg-orange-600"
            >
              Get in touch
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
