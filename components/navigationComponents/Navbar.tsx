"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Menu, X, Facebook, Instagram, Linkedin } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Poppins } from "next/font/google";
import { motion, AnimatePresence } from "framer-motion";
import FloatingCallButton from "./FloatingCallButton";
import HoverAnimatedText from "./HoverAnimatedText";
import FooterModel3D from "../footerComponents/FooterModel3D";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [useLightLogo, setUseLightLogo] = useState(false);
  const [isHiddenByGallery, setIsHiddenByGallery] = useState(false);
  const [isHiddenByScroll, setIsHiddenByScroll] = useState(false);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const logoRef = useRef<HTMLAnchorElement | null>(null);
  const lastScrollYRef = useRef(0);

  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [linksLoaded, setLinksLoaded] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);
  const [FooterModelComponent, setFooterModelComponent] = useState<any>(() => FooterModel3D);

  useEffect(() => {
    let isMounted = true;
    if (linksLoaded && FooterModelComponent === FooterModel3D) {
      setModelLoading(true);
      import("../footerComponents/FooterModel3D")
        .then((mod) => {
          if (!isMounted) return;
          setFooterModelComponent(() => mod.default || mod);
        })
        .catch(() => {})
        .finally(() => {
          if (!isMounted) return;
          setModelLoading(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [linksLoaded, FooterModelComponent]);

  useEffect(() => {
    const checkDeviceType = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setIsMobile(width < 768 || (width < 900 && height < 600));

      const isIPadPro =
        (width === 1024 && height === 1366) ||
        (width === 1366 && height === 1024);
      const isRegularTablet =
        width >= 768 && width < 1024 && !(width < 900 && height < 600);
      setIsTablet(isRegularTablet || isIPadPro);
    };

    checkDeviceType();
    window.addEventListener("resize", checkDeviceType);
    window.addEventListener("orientationchange", checkDeviceType);

    return () => {
      window.removeEventListener("resize", checkDeviceType);
      window.removeEventListener("orientationchange", checkDeviceType);
    };
  }, []);

  const navItems = [
    { label: "Home", href: "/" },
    { label: "About Us", href: "/about" },
    { label: "Services", href: "/#services" },
    { label: "Gallery", href: "/gallery" },
    { label: "Blog", href: "/blog" },
    // { label: "Careers", href: "/careers" },
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

  useEffect(() => {
    let isTicking = false;
    const threshold = 10;

    const handleScroll = () => {
      if (isTicking) {
        return;
      }

      isTicking = true;

      window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const lastScrollY = lastScrollYRef.current;
        const delta = currentScrollY - lastScrollY;

        if (Math.abs(delta) >= threshold) {
          if (delta > 0 && currentScrollY > 80) {
            setIsHiddenByScroll(true);
          } else if (delta < 0 || currentScrollY <= 80) {
            setIsHiddenByScroll(false);
          }

          lastScrollYRef.current = currentScrollY;
        }

        isTicking = false;
      });
    };

    lastScrollYRef.current = window.scrollY;
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const shouldHideNavbar =
    isHiddenByGallery || (isHiddenByScroll && !isMenuVisible);

  const isAdminRoute =
    pathname.startsWith("/admin") ||
    pathname.includes("-admin") ||
    pathname.includes("/admin-") ||
    pathname === "/privacy-policy";

  if (isAdminRoute) {
    return null;
  }

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-60 flex items-center justify-between px-5 sm:px-8 md:px-12 lg:px-16 xl:px-24 2xl:px-32 py-6 bg-transparent transition-all duration-300 ${shouldHideNavbar ? "pointer-events-none opacity-0 -translate-y-full" : "opacity-100 translate-y-0"} ${poppins.className}`}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center" ref={logoRef}>
          <Image
            src={
              useLightLogo
                ? "/logos/Alchemy logo ai-01.png"
                : "/logos/Alchemy logo ai-02.png"
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
            setLinksLoaded(false);
          }
        }}
        className={`fixed inset-0 z-50 bg-white overflow-hidden transition-[clip-path] duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] ${
          !isHiddenByGallery && isOpen
            ? "[clip-path:inset(0_0_0_0%)] pointer-events-auto"
            : "[clip-path:inset(0_0_0_100%)] pointer-events-none"
        }`}
      >
        <AnimatePresence>
          {isOpen && (
            <div className={`h-full w-full ${poppins.className}`}>
              {/* MOBILE VIEW */}
              {isMobile && (
                <div className="flex flex-col h-full justify-between px-6 py-8 relative overflow-hidden">
                  <motion.div 
                    className="flex flex-col space-y-1 mt-16 sm:mt-20 flex-1 min-h-0"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: { staggerChildren: 0.06, delayChildren: 0.06 }
                      }
                    }}
                    onAnimationComplete={() => {
                      if (!linksLoaded) setLinksLoaded(true);
                    }}
                  >
                    {navItems.map((item, index) => (
                      <motion.div
                        key={index}
                        variants={{
                          hidden: { opacity: 0, y: -12 },
                          visible: { 
                            opacity: 1, 
                            y: 0,
                            transition: { type: 'spring', stiffness: 280, damping: 28 }
                          }
                        }}
                      >
                        <Link
                          href={item.href}
                          onClick={(e) => {
                            closeMenu();
                            if (item.href.startsWith("/#") && pathname === "/") {
                              e.preventDefault();
                              const id = item.href.replace("/#", "");
                              const element = document.getElementById(id);
                              if (element) {
                                element.scrollIntoView({ behavior: "smooth" });
                                window.history.pushState(null, "", item.href);
                              }
                            }
                          }}
                          className="text-left py-1.5 sm:py-2 block"
                        >
                          <span className="text-3xl xs:text-4xl sm:text-5xl font-extrabold text-black tracking-tight leading-tight">
                            <HoverAnimatedText text={item.label} />
                          </span>
                        </Link>
                      </motion.div>
                    ))}
                  </motion.div>

                  <div className="space-y-4 sm:space-y-6 pb-4 flex-shrink-0">
                    <div>
                      <p className="uppercase tracking-[0.2em] text-[10px] font-medium text-[#E87A27] mb-2">
                        GET IN TOUCH
                      </p>
                      <p className="text-lg sm:text-xl text-black font-medium">
                        hello@alchemy.lk
                      </p>
                      <p className="text-gray-700 text-sm">
                        +94 71 956 3675
                      </p>
                    </div>

                    <div className="flex gap-3">
                      {[
                        { href: "https://www.facebook.com/alchemys.lk", Icon: Facebook, label: "Facebook" },
                        { href: "https://www.instagram.com/alchemy.lk", Icon: Instagram, label: "Instagram" },
                        { href: "https://www.linkedin.com/company/alchemylk/", Icon: Linkedin, label: "LinkedIn" },
                      ].map(({ href, Icon, label }, index) => (
                        <a
                          key={index}
                          href={href}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="flex items-center justify-center w-9 h-9 rounded-full border border-[#E87A27] text-[#E87A27] hover:scale-110 transition-transform"
                        >
                          <Icon size={16} />
                        </a>
                      ))}
                    </div>
                  </div>

                  <div className="absolute top-5 right-6">
                    <FloatingCallButton />
                  </div>
                </div>
              )}

              {/* TABLET VIEW */}
              {isTablet && (
                <div className="flex flex-col h-full justify-between items-center px-8 py-8 text-center relative overflow-hidden">
                  <motion.div 
                    className="flex flex-col space-y-3 mt-16 flex-1"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: { staggerChildren: 0.06, delayChildren: 0.06 }
                      }
                    }}
                    onAnimationComplete={() => {
                      if (!linksLoaded) setLinksLoaded(true);
                    }}
                  >
                    {navItems.map((item, index) => (
                      <motion.div
                        key={index}
                        variants={{
                          hidden: { opacity: 0, y: 12 },
                          visible: { 
                            opacity: 1, 
                            y: 0,
                            transition: { type: 'spring', stiffness: 260, damping: 22 }
                          }
                        }}
                      >
                         <Link
                          href={item.href}
                          onClick={(e) => {
                            closeMenu();
                            if (item.href.startsWith("/#") && pathname === "/") {
                              e.preventDefault();
                              const id = item.href.replace("/#", "");
                              const element = document.getElementById(id);
                              if (element) {
                                element.scrollIntoView({ behavior: "smooth" });
                                window.history.pushState(null, "", item.href);
                              }
                            }
                          }}
                          className="text-5xl md:text-6xl font-extrabold text-black block"
                        >
                          <HoverAnimatedText text={item.label} />
                        </Link>
                      </motion.div>
                    ))}
                  </motion.div>

                  <div className="flex flex-col items-center space-y-6 mt-8">
                    <div className="w-[150px] h-[120px] pointer-events-none">
                      {FooterModelComponent && !modelLoading && (
                        <FooterModelComponent scale={2.2} positionY={-1} />
                      )}
                      {modelLoading && (
                        <div className="w-full h-full bg-gray-100 animate-pulse rounded" />
                      )}
                    </div>

                    <div className="flex flex-col items-center space-y-4">
                      <div>
                        <p className="uppercase tracking-[0.2em] text-xs font-medium text-[#E87A27] mb-3">
                          Get in touch
                        </p>
                        <p className="text-2xl md:text-3xl text-black font-medium">
                          hello@alchemy.lk
                        </p>
                        <p className="text-gray-700 text-base md:text-lg mt-2">
                          +94 (0)719 563 675
                        </p>
                      </div>

                      <div className="flex gap-4">
                        {[
                          { href: "https://www.facebook.com/alchemys.lk", Icon: Facebook },
                          { href: "https://www.instagram.com/alchemy.lk", Icon: Instagram },
                          { href: "https://www.linkedin.com/company/alchemylk/", Icon: Linkedin },
                        ].map(({ href, Icon }, index) => (
                          <a
                            key={index}
                            href={href}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="flex items-center justify-center w-11 h-11 rounded-full border border-[#E87A27] text-[#E87A27] hover:scale-110 transition-transform"
                          >
                            <Icon size={20} />
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="absolute top-5 right-6">
                    <FloatingCallButton />
                  </div>
                </div>
              )}

              {/* DESKTOP VIEW */}
              {!isMobile && !isTablet && (
                <div className="flex items-center justify-center h-full w-full max-w-[1440px] mx-auto px-12 lg:px-20 relative">
                  <div className="flex flex-col lg:flex-row items-center justify-between w-full h-full py-20">
                    <div className="flex flex-col justify-center w-full max-w-[520px] relative h-full">
                      <div className="absolute -left-12 top-10 w-[340px] h-[360px] pointer-events-none z-0">
                        {FooterModelComponent && !modelLoading && (
                          <FooterModelComponent scale={6} positionY={-1} />
                        )}
                        {modelLoading && (
                          <div className="w-full h-full bg-gray-100 animate-pulse rounded" />
                        )}
                      </div>

                      <div className="mt-64 relative z-10">
                        <p className="uppercase tracking-[0.2em] text-xs font-medium text-[#E87A27] mb-3">
                          Get in touch
                        </p>
                        <p className="text-3xl md:text-4xl lg:text-5xl text-black">
                          hello@alchemy.lk
                        </p>
                        <p className="text-gray-700 text-lg md:text-xl mt-2">
                          +94 71 956 3675
                        </p>
                        <p className="text-sm text-gray-500 max-w-sm mt-4">
                          Where creativity flows through our bloodline. 
                          We transform ideas into extraordinary digital experiences.
                        </p>

                        <div className="flex gap-4 mt-8">
                          {[
                            { href: "https://www.facebook.com/alchemys.lk", Icon: Facebook },
                            { href: "https://www.instagram.com/alchemy.lk", Icon: Instagram },
                            { href: "https://www.linkedin.com/company/alchemylk/", Icon: Linkedin },
                          ].map(({ href, Icon }, index) => (
                            <a
                              key={index}
                              href={href}
                              target="_blank"
                              rel="noreferrer noopener"
                              className="w-12 h-12 rounded-full border border-[#E87A27] text-[#E87A27] flex items-center justify-center hover:bg-[#E87A27] hover:text-white transition-colors"
                            >
                              <Icon size={20} />
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>

                    <motion.div 
                      className="flex flex-col space-y-3 lg:space-y-4 items-start"
                      initial="hidden"
                      animate="visible"
                      onAnimationComplete={() => {
                        if (!linksLoaded) setLinksLoaded(true);
                      }}
                      variants={{
                        hidden: { opacity: 0 },
                        visible: {
                          opacity: 1,
                          transition: { staggerChildren: 0.06, delayChildren: 0.06 }
                        }
                      }}
                    >
                      {navItems.map((item, index) => (
                        <motion.div
                          key={index}
                          variants={{
                            hidden: { opacity: 0, x: 20 },
                            visible: { 
                              opacity: 1, 
                              x: 0,
                              transition: { type: 'spring', stiffness: 260, damping: 22 }
                            }
                          }}
                        >
                          <Link
                            href={item.href}
                            onClick={(e) => {
                              closeMenu();
                              if (item.href.startsWith("/#") && pathname === "/") {
                                e.preventDefault();
                                const id = item.href.replace("/#", "");
                                const element = document.getElementById(id);
                                if (element) {
                                  element.scrollIntoView({ behavior: "smooth" });
                                  window.history.pushState(null, "", item.href);
                                }
                              }
                            }}
                            className="text-black text-5xl md:text-6xl lg:text-6xl xl:text-7xl font-extrabold block leading-none tracking-tight"
                          >
                            <HoverAnimatedText text={item.label} />
                          </Link>
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>

                  <div className="absolute bottom-10 right-10">
                    <FloatingCallButton />
                  </div>
                </div>
              )}
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

