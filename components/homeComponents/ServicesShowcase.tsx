"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Service = {
  path: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
};

const services: Service[] = [
  {
    path: "/services/development",
    title: "Development",
    subtitle: "Web & Mobile",
    description: "Web & Mobile solutions without limits.",
    image: "/Alchemy logo ai-01.png",
  },
  {
    path: "/services/production",
    title: "Production",
    subtitle: "Audio & Visual",
    description: "Bring Your Ideas to Life on\nScreen.",
    image: "/Alchemy logo ai-02.png",
  },
  {
    path: "/services/marketing",
    title: "Marketing",
    subtitle: "Digital",
    description: "Connect. Engage.\nGrow.",
    image: "/Alchemy logo ai-01.png",
  },
  {
    path: "/services/management",
    title: "Management",
    subtitle: "Event",
    description: "Designing seamless,\nmemorable events.",
    image: "/Alchemy logo ai-02.png",
  },
];

export default function ServicesShowcase() {
  const [activePath, setActivePath] = useState<string>("/services/development");
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();
  const navigationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const currentService =
    services.find((service) => service.path === activePath) ?? services[0];

  useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, []);

  const handleNavigate = (servicePath: string) => {
    if (isNavigating) {
      return;
    }

    try {
      setIsNavigating(true);

      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }

      router.push(servicePath);

      navigationTimeoutRef.current = setTimeout(() => {
        setIsNavigating(false);
      }, 1500);
    } catch (error) {
      console.error("Navigation error:", error);
      setIsNavigating(false);
      setActivePath(servicePath);
    }
  };

  return (
    <section className="bg-black text-white font-sans">
      <div className="mx-auto flex min-h-125 flex-col items-start justify-between px-6 pb-16 pt-0 md:min-h-175 md:flex-row md:px-16 md:pb-20 md:pt-4 lg:min-h-175 lg:px-20 lg:pb-24 lg:pt-6">
        <div className="flex h-full w-full flex-col space-y-6 md:w-1/2 md:pl-6 lg:pl-12">
          <h3 className="py-2 text-2xl font-bold text-[#E2791D] sm:text-3xl md:py-8 md:text-4xl">
            OUR SERVICES
          </h3>

          <div className="space-y-4 md:space-y-6">
            {services.map((service) => (
              <div
                key={service.path}
                onMouseEnter={() => !isNavigating && setActivePath(service.path)}
                onClick={() => !isNavigating && handleNavigate(service.path)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (isNavigating) {
                    return;
                  }
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleNavigate(service.path);
                  }
                }}
                className={`cursor-pointer transition-all duration-300 ${
                  isNavigating ? "pointer-events-none opacity-75" : ""
                }`}
              >
                <div className="flex items-center justify-between gap-0">
                  <div className="flex-1">
                    <p className="block pl-2 text-sm font-semibold text-white md:hidden">
                      {service.subtitle}
                    </p>

                    <p className="hidden pl-4 text-sm font-semibold text-white md:block md:pl-12 lg:hidden">
                      {service.subtitle}
                    </p>

                    <p
                      className={`hidden pl-4 text-sm font-semibold transition-all duration-300 md:pl-12 lg:block ${
                        activePath === service.path ? "text-white" : "text-gray-500"
                      }`}
                    >
                      {service.subtitle}
                    </p>

                    <div className="flex h-12 items-center justify-between">
                      <div className="flex-1">
                        <h2 className="block text-3xl font-bold text-white md:hidden">
                          {service.title}
                        </h2>

                        <h2 className="hidden font-bold text-white md:block md:text-3xl lg:hidden">
                          {service.title}
                        </h2>

                        <h2
                          className={`hidden font-bold transition-all duration-300 lg:block ${
                            activePath === service.path
                              ? "text-3xl text-white lg:text-4xl xl:text-7xl"
                              : "text-3xl text-gray-500 lg:text-3xl xl:text-6xl"
                          }`}
                        >
                          {service.title}
                        </h2>
                      </div>

                      <motion.button
                        onClick={(event) => {
                          event.stopPropagation();
                          handleNavigate(service.path);
                        }}
                        disabled={isNavigating}
                        className="group mr-12 block shrink-0 rounded-full bg-linear-to-r from-[#E2791D] to-orange-600 p-3 shadow-lg transition-all duration-300 hover:shadow-xl active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 md:hidden"
                        whileTap={{ scale: 0.95 }}
                        whileHover={{ scale: 1.1 }}
                      >
                        <motion.div
                          animate={{ x: [0, 3, 0], rotate: [-40, -45, -40] }}
                        >
                          <svg
                            className="h-5 w-5 transform text-white transition-transform duration-300 group-hover:translate-x-0.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M14 5l7 7m0 0l-7 7m7-7H3"
                            />
                          </svg>
                        </motion.div>
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-0 hidden max-w-md py-10 text-lg text-gray-200 md:block">
            {currentService.description}
          </p>
        </div>

        <div className="my-10 mt-0 flex w-full justify-center md:mt-32.5 md:w-1/2 lg:mt-30 xl:mt-32.5">
          <motion.div
            key={currentService.path}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="relative hidden h-56 w-full max-w-full overflow-hidden rounded-2xl shadow-lg sm:h-72 sm:max-w-md md:flex md:h-100 md:max-w-lg md:rounded-3xl lg:h-112.5 xl:h-112.5"
          >
            <Image
              src={currentService.image}
              alt={currentService.title}
              fill
              className="object-cover transition-transform duration-500 ease-in-out hover:scale-105"
              sizes="(min-width: 1280px) 40vw, (min-width: 768px) 45vw, 100vw"
              priority
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}