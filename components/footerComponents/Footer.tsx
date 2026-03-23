"use client";

import Link from "next/link";
import Image from "next/image";
import { lazy, Suspense, useEffect, useState } from "react";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaLocationDot,
} from "react-icons/fa6";

const FooterModel3D = lazy(() => import("./FooterModel3D"));

type AddressItem = {
  address: string;
  display: string;
  animated: boolean;
  clickable?: boolean;
};

export default function Footer() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkScreen = () => setIsDesktop(window.innerWidth >= 768);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  const openGoogleMaps = (address: string) => {
    if (address.startsWith("http")) {
      window.open(address, "_blank", "noopener,noreferrer");
      return;
    }

    const encodedAddress = encodeURIComponent(address);
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const addresses: AddressItem[] = [
    {
      address: "https://maps.app.goo.gl/5Tbthdgyrq6CXhhi8",
      display: `43/5, Senanayake Mawatha,<br />
Sri Jayawardenepura Kotte<br />
Sri Lanka`,
      animated: true,
    },
    {
      address: "203, George Street, Queens Park, WA 6107, Australia",
      display: `203, George Street,<br />
Queens Park, WA 6107<br />
Australia`,
      animated: false,
      clickable: false,
    },
  ];

  return (
    <footer className="bg-linear-to-r from-black via-zinc-900 to-black text-white py-16 md:py-12 lg:py-16 px-6 md:px-8 lg:px-16 relative overflow-hidden font-sans">
      {isDesktop && (
        <div className="absolute bottom-0 right-0 w-full h-full pointer-events-none">
          <Suspense fallback={null}>
            <FooterModel3D />
          </Suspense>
        </div>
      )}

      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between relative z-10">
        <div className="flex-1 space-y-6 md:space-y-4 lg:space-y-6 text-center md:text-left">
          <div>
            <Image
              src="/Alchemy logo ai-02.png"
              alt="Alchemy Logo"
              width={220}
              height={64}
              className="h-8 md:h-5 lg:h-12 w-auto mx-auto md:mx-0 filter drop-shadow-lg"
              priority={false}
            />
          </div>

          <div>
            <p className="text-2xl md:text-lg lg:text-3xl font-semibold">
              hello@alchemy.lk
            </p>
            <a
              href="tel:+94719563675"
              className="text-lg md:text-xs lg:text-lg block mt-1 hover:text-brand transition-colors duration-300"
            >
              +94 71 956 3675
            </a>
          </div>

          <p className="text-sm md:text-xs lg:text-sm max-w-sm md:max-w-xs lg:max-w-sm">
            Where creativity flows through our bloodline. <br />
            We transform ideas into extraordinary digital experiences.
          </p>

          <div className="flex space-x-3 md:space-x-1.5 lg:space-x-4 justify-center md:justify-start">
            <a
              href="https://www.facebook.com/alchemys.lk"
              aria-label="Facebook"
              target="_blank"
              rel="noreferrer noopener"
              className="relative bg-brand text-black p-2 md:p-0.5 lg:p-2 rounded-full hover:bg-brand/90 transition-all duration-300 ease-out group/social hover:scale-110 hover:-translate-y-1 hover:shadow-lg hover:shadow-brand/50"
            >
              <FaFacebookF className="text-sm md:text-xs lg:text-base transition-transform duration-300 group-hover/social:scale-110" />
              <div className="absolute inset-0 rounded-full bg-brand animate-ping opacity-0 group-hover/social:opacity-30 group-hover/social:animate-none" />
            </a>

            <a
              href="https://www.instagram.com/alchemy.lk/"
              aria-label="Instagram"
              target="_blank"
              rel="noreferrer noopener"
              className="relative bg-brand text-black p-2 md:p-0.5 lg:p-2 rounded-full hover:bg-brand/90 transition-all duration-300 ease-out group/social hover:scale-110 hover:-translate-y-1 hover:shadow-lg hover:shadow-brand/50"
            >
              <FaInstagram className="text-sm md:text-xs lg:text-base transition-transform duration-300 group-hover/social:scale-110" />
              <div className="absolute inset-0 rounded-full bg-brand animate-ping opacity-0 group-hover/social:opacity-30 group-hover/social:animate-none" />
            </a>

            <a
              href="https://www.linkedin.com/company/alchemylk/"
              aria-label="LinkedIn"
              target="_blank"
              rel="noreferrer noopener"
              className="relative bg-brand text-black p-2 md:p-0.5 lg:p-2 rounded-full hover:bg-brand/90 transition-all duration-300 ease-out group/social hover:scale-110 hover:-translate-y-1 hover:shadow-lg hover:shadow-brand/50"
            >
              <FaLinkedinIn className="text-sm md:text-xs lg:text-base transition-transform duration-300 group-hover/social:scale-110" />
              <div className="absolute inset-0 rounded-full bg-brand animate-ping opacity-0 group-hover/social:opacity-30 group-hover/social:animate-none" />
            </a>
          </div>
        </div>

        <div className="flex-1 space-y-8 md:space-y-4 lg:space-y-8 flex flex-col items-start md:items-end pt-8 md:pt-4 lg:pt-8">
          {addresses.map((location, index) =>
            location.clickable === false ? (
              <div
                key={index}
                className="flex items-start gap-3 md:gap-1.5 lg:gap-3 max-w-sm md:max-w-xs lg:max-w-sm"
              >
                <FaLocationDot className="text-brand text-lg md:text-xs lg:text-lg mt-1 shrink-0" />
                <div
                  className="text-sm md:text-xs lg:text-sm text-gray-200 leading-relaxed md:leading-tight lg:leading-relaxed text-left md:text-right"
                  dangerouslySetInnerHTML={{ __html: location.display }}
                />
              </div>
            ) : (
              <button
                key={index}
                onClick={() => openGoogleMaps(location.address)}
                className={`flex items-start gap-3 md:gap-1.5 lg:gap-3 max-w-sm md:max-w-xs lg:max-w-sm group cursor-pointer transition-all duration-300 ${
                  location.animated ? "hover:scale-105" : ""
                }`}
              >
                <FaLocationDot
                  className={`text-brand text-lg md:text-xs lg:text-lg mt-1 shrink-0 ${
                    location.animated
                      ? "group-hover:text-brand/80 transition-colors"
                      : ""
                  }`}
                />
                <div
                  className={`text-sm md:text-xs lg:text-sm text-gray-200 leading-relaxed md:leading-tight lg:leading-relaxed text-left md:text-right ${
                    location.animated
                      ? "group-hover:text-white transition-colors"
                      : ""
                  }`}
                >
                  <span
                    dangerouslySetInnerHTML={{ __html: location.display }}
                  />
                </div>
              </button>
            ),
          )}
        </div>
      </div>

      <div className="mt-20 relative z-10">
        <div className="relative w-full flex items-center justify-between">
          <div className="relative w-2/5">
            <div className="h-px bg-linear-to-r from-brand via-brand/80 to-transparent shadow-[0_0_10px_rgba(226,121,29,0.8)]" />
          </div>
          <div className="relative w-2/5">
            <div className="h-px bg-linear-to-l from-brand via-brand/80 to-transparent shadow-[0_0_10px_rgba(226,121,29,0.8)]" />
          </div>
        </div>
      </div>

      <div className="pt-8 pb-2 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400 relative z-10">
        <p>© 2025 Alchemy. All rights reserved.</p>
        <div className="flex gap-4">
          <Link
            href="/careers"
            className="transition-colors duration-300 hover:text-brand hover:scale-105 transform"
          >
            Careers
          </Link>
          <Link
            href="/privacy-policy"
            className="transition-colors duration-300 hover:text-brand hover:scale-105 transform"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
