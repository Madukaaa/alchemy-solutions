"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Menu, X, Facebook, Instagram, Linkedin } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Poppins } from "next/font/google";
import FloatingCallButton from "./FloatingCallButton";
import HoverAnimatedText from "./HoverAnimatedText";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [useLightLogo, setUseLightLogo] = useState(false);
  const [isHiddenByGallery, setIsHiddenByGallery] = useState(false);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const logoRef = useRef<HTMLAnchorElement | null>(null);

  const navItems = [
    { label: "Home", href: "/" },
    { label: "About Us", href: "/about" },
    { label: "Services", href: "/#services" },
    { label: "Gallery", href: "/gallery" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ];

  const openMenu = () => {
    setIsClosing(false);
    setIsOpen(true);
  };

  const closeMenu = () => {
    setIsClosing(true);
    setIsOpen(false);
  };

  const isMenuVisible = isOpen || isClosing;

  const updateLogoByCurtainPosition = useCallback(() => {
    const overlayEl = overlayRef.current;
    const logoEl = logoRef.current;

    if (!overlayEl || !logoEl) {
      return;
    }

    const clipPath = window.getComputedStyle(overlayEl).clipPath;
    const insetMatch = clipPath.match(
      /^inset\(([^\s]+)\s+([^\s]+)\s+([^\s]+)\s+([^\s\)]+)\)/,
    );

    if (!insetMatch) {
      return;
    }

    const leftInsetValue = insetMatch[4];
    const viewportWidth = window.innerWidth;
    let leftEdgePx = Number.NaN;

    if (leftInsetValue.endsWith("%")) {
      leftEdgePx = (parseFloat(leftInsetValue) / 100) * viewportWidth;
    } else if (leftInsetValue.endsWith("px")) {
      leftEdgePx = parseFloat(leftInsetValue);
    }

    if (Number.isNaN(leftEdgePx)) {
      return;
    }

    const logoRect = logoEl.getBoundingClientRect();
    const isCurtainBehindLogo = leftEdgePx <= logoRect.right;
    setUseLightLogo(isCurtainBehindLogo);
  }, []);

  useEffect(() => {
    if (!isMenuVisible) {
      setUseLightLogo(false);
      return;
    }

    let frameId = 0;
    const track = () => {
      updateLogoByCurtainPosition();
      frameId = window.requestAnimationFrame(track);
    };

    frameId = window.requestAnimationFrame(track);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [isMenuVisible, updateLogoByCurtainPosition]);

  useEffect(() => {
    const handleGalleryExpandedChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ expanded?: boolean }>;
      const expanded = Boolean(customEvent.detail?.expanded);
      setIsHiddenByGallery(expanded);

      if (expanded) {
        setIsOpen(false);
        setIsClosing(false);
      }
    };

    window.addEventListener(
      "gallery:expanded-change",
      handleGalleryExpandedChange,
    );
    return () => {
      window.removeEventListener(
        "gallery:expanded-change",
        handleGalleryExpandedChange,
      );
    };
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-60 flex items-center justify-between px-5 sm:px-8 md:px-12 lg:px-16 xl:px-24 2xl:px-32 py-6 bg-transparent transition-opacity duration-200 ${isHiddenByGallery ? "pointer-events-none opacity-0" : "opacity-100"} ${poppins.className}`}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center" ref={logoRef}>
          <Image
            src={
              useLightLogo
                ? "/Alchemy logo ai-01.png"
                : "/Alchemy logo ai-02.png"
            }
            alt="Alchemy Logo"
            width={105}
            height={35}
            className="object-contain"
          />
        </Link>

        {/* Right side actions */}
        <div className="flex items-center space-x-6">
          <Link
            href="/contact"
            className={`${
              isMenuVisible ? "hidden" : "hidden sm:block"
            } px-6 py-2.5 rounded-full border border-[#E87A27] text-white text-sm font-medium hover:bg-[#E87A27]/10 transition-colors`}
          >
            Talk to us
          </Link>
          <button
            onClick={() => (isOpen ? closeMenu() : openMenu())}
            aria-label={isMenuVisible ? "Close menu" : "Open menu"}
            aria-expanded={isMenuVisible}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-[#E87A27] text-white hover:bg-[#D97736] transition-colors"
          >
            {isMenuVisible ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </nav>

      {/* Fullscreen Overlay */}
      <div
        ref={overlayRef}
        aria-hidden={!isOpen}
        onTransitionEnd={(event) => {
          if (event.propertyName === "clip-path" && !isOpen) {
            setIsClosing(false);
          }
        }}
        className={`fixed inset-0 z-50 bg-white overflow-hidden transition-[clip-path] duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] ${
          !isHiddenByGallery && isOpen
            ? "[clip-path:inset(0_0_0_0%)] pointer-events-auto"
            : "[clip-path:inset(0_0_0_100%)] pointer-events-none"
        }`}
      >
        <div
          className={`flex flex-col md:flex-row h-full w-full pt-32 pl-6 pr-6 md:pl-32 md:pr-20 lg:pl-40 lg:pr-24 pb-12 transition-transform duration-500 ease-out ${
            isOpen ? "translate-x-0" : "translate-x-8"
          } ${poppins.className}`}
        >
          {/* Left Side: Contact & Info */}
          <div className="w-full md:w-1/2 flex flex-col justify-between pr-0 md:pr-12 md:max-h-[70vh] my-auto">
            <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-8">
              <div className="w-48 h-48 bg-gray-100 rounded-3xl hidden md:flex items-center justify-center mb-8">
                <span className="text-gray-400 text-sm">Image Placeholder</span>
              </div>

              <div>
                <p className="text-[#E87A27] text-xs tracking-[0.2em] font-medium uppercase mb-4">
                  Get In Touch
                </p>
                <h2 className="text-black text-3xl md:text-4xl lg:text-5xl tracking-tight mb-2">
                  hello@alchemy.lk
                </h2>
                <p className="text-gray-700 text-lg md:text-xl mb-6">
                  +94 71 956 3675
                </p>
                <p className="text-gray-500 text-sm max-w-sm mb-12">
                  Where creativity flows through our bloodline. We transform
                  ideas into extraordinary digital experiences.
                </p>

                {/* Social Icons */}
                <div className="flex justify-center md:justify-start space-x-4">
                  <Link
                    href="https://www.facebook.com/alchemys.lk"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="w-12 h-12 rounded-full border border-[#E87A27] text-[#E87A27] flex items-center justify-center hover:bg-[#E87A27] hover:text-white transition-colors"
                  >
                    <Facebook className="w-5 h-5" />
                  </Link>
                  <Link
                    href="https://www.instagram.com/alchemy.lk"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="w-12 h-12 rounded-full border border-[#E87A27] text-[#E87A27] flex items-center justify-center hover:bg-[#E87A27] hover:text-white transition-colors"
                  >
                    <Instagram className="w-5 h-5" />
                  </Link>
                  <Link
                    href="https://www.linkedin.com/company/alchemylk/"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="w-12 h-12 rounded-full border border-[#E87A27] text-[#E87A27] flex items-center justify-center hover:bg-[#E87A27] hover:text-white transition-colors"
                  >
                    <Linkedin className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Navigation Links */}
          <div className="w-full md:w-1/2 flex flex-col justify-center pl-0 md:pl-24 mt-12 md:mt-0 relative">
            <nav className="flex flex-col space-y-2 md:space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-black text-6xl md:text-7xl lg:text-7xl font-black transition-colors leading-none tracking-wide"
                  onClick={closeMenu}
                >
                  <HoverAnimatedText text={item.label} />
                </Link>
              ))}
            </nav>

            <div className="mt-10 flex justify-end pr-2 md:pr-4">
              <FloatingCallButton className="static! h-14! w-14! md:h-16! md:w-16!" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
