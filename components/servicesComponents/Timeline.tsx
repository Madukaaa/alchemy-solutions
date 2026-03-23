"use client";
import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

// ✅ Import content file
import timelineData from "../../data/timelineData";

const TimelineCore = ({ data, isMobile, isTablet, isTabletVertical }: any) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lineStart, setLineStart] = useState("0px");
  const [lineHeight, setLineHeight] = useState("100%");
  const [lineLeft, setLineLeft] = useState("0px");
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const observerOptions = {
      root: null,
      rootMargin: "-50% 0px -50% 0px",
      threshold: 0,
    };

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const idx = sectionRefs.current.indexOf(entry.target as HTMLDivElement);
          if (idx >= 0) setActiveIndex(idx);
        }
      });
    }, observerOptions);

    sectionRefs.current.forEach((el) => {
      if (el) io.observe(el);
    });

    return () => io.disconnect();
  }, [data, isMobile, isTablet]);

  const calculateLine = useCallback(() => {
    if (!containerRef.current || isMobile) return;
    const sections = sectionRefs.current;
    if (!sections || sections.length === 0) return;

    const firstDot = dotRefs.current[0];
    const lastDot = dotRefs.current[sections.length - 1];
    if (!firstDot || !lastDot) return;

    const firstDotRect = firstDot.getBoundingClientRect();
    const lastDotRect = lastDot.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();

    setLineLeft(
      firstDotRect.left - containerRect.left + firstDotRect.width / 2 + "px"
    );

    const containerTop = containerRect.top + window.scrollY;
    const firstCenter = firstDotRect.top + firstDotRect.height / 2 + window.scrollY;
    const lastCenter = lastDotRect.top + lastDotRect.height / 2 + window.scrollY;

    setLineStart(firstCenter - containerTop + "px");
    setLineHeight(lastCenter - firstCenter + "px");
  }, [isMobile]);

  useEffect(() => {
    calculateLine();

    let ro: ResizeObserver;
    if (typeof ResizeObserver !== "undefined" && containerRef.current) {
      ro = new ResizeObserver(() => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => calculateLine());
      });
      ro.observe(containerRef.current);
    }

    const onResize = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        calculateLine();
        rafRef.current = null;
      });
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      if (ro) ro.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [calculateLine, data, isMobile, isTablet]);

  // Check if we should show the vertical line
  const shouldShowVerticalLine = !isMobile && !(isTablet && isTabletVertical);

  return (
    <div
      ref={containerRef}
      className={`relative max-w-7xl mx-auto pb-20 ${isMobile ? "px-6" : ""}`}
    >

      {/* Animated gradient orbs */}
      {!isMobile && (
        <>
          <div className="absolute top-1/4 -left-20 w-72 h-72 bg-orange-600/30 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute top-3/4 -right-20 w-96 h-96 bg-orange-600/30 rounded-full blur-3xl animate-pulse-slow delay-1000" />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-orange-600/30 rounded-full blur-3xl animate-pulse-slow delay-500" />
        </>
      )}

      {data.map((item: any, index: number) => {
        const isActive = activeIndex === index;

        return (
          <div
            key={index}
            data-service-section
            ref={(el) => { sectionRefs.current[index] = el; }}
            className={`flex relative ${
              isMobile
                ? "flex-col gap-6 pb-12"
                : "flex-row pt-10 md:pb-40 md:gap-10"
            }`}
          >
            {/* Dot + Title */}
            <div
              className={`relative flex ${
                isMobile
                  ? "items-start gap-4"
                  : "sticky flex-col md:flex-row items-center top-40 self-start max-w-xs lg:max-w-sm md:w-full"
              }`}
            >
              {/* Dot container */}
              <div className="h-10 w-10 flex items-center justify-center relative">
                <motion.div
                  className="absolute rounded-full border-4 border-orange-200 z-50"
                  animate={{
                    scale: isActive ? 1.5 : 0,
                    opacity: isActive ? 1 : 0,
                  }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  style={{ width: "2.5rem", height: "2.5rem" }}
                />
                <motion.div
                  className={`timeline-dot h-4 w-4 rounded-full border-2 z-10 ${
                    isActive
                      ? "bg-brand border-brand shadow-lg shadow-brand/70"
                      : "bg-brand border-brand"
                  }`}
                  ref={(el) => { dotRefs.current[index] = el; }}
                  animate={{ scale: isActive ? 1.2 : 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                />
              </div>

              {!isMobile && (
                <h3
                  className={`hidden md:block ${
                    isTablet ? "text-3xl" : "text-xl md:text-5xl"
                  } font-bold transition-all duration-300 md:pl-20 ${
                    isActive ? "opacity-100" : "opacity-50"
                  }`}
                  style={{
                    color: isActive ? "#ffffff" : "#6b7280",
                  }}
                >
                  {item.title}
                </h3>
              )}
            </div>

            {/* Content */}
            <motion.div
              className={`relative w-full ${
                isMobile ? "" : "pl-20 pr-4 md:pl-16 lg:pl-24 flex items-center"
              }`}
              animate={{
                scale: isActive ? 1.05 : 1,
                opacity: isActive ? 1 : 0.6,
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <div>
                {isMobile && (
                  <h3 className="text-2xl mb-2 font-bold" style={{ color: "#ffffff" }}>
                    {item.title}
                  </h3>
                )}
                <p
                  className={`leading-relaxed ${
                    isMobile
                      ? "text-base"
                      : isTablet
                      ? "text-lg"
                      : "text-base md:text-xl"
                  }`}
                  style={{ color: "#d1d5db" }}
                >
                  {item.content}
                </p>
              </div>
            </motion.div>
          </div>
        );
      })}

      {/* Vertical line - Desktop and Tablet (except tablet vertical) */}
      {shouldShowVerticalLine && (
        <div
          className="absolute w-[3px] bg-brand transition-colors duration-300"
          style={{
            left: lineLeft,
            top: lineStart,
            height: lineHeight,
          }}
        />
      )}
    </div>
  );
};

const Timeline = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isTabletVertical, setIsTabletVertical] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      
      // Check if tablet is in vertical orientation (height > width)
      setIsTabletVertical(width >= 768 && width < 1024 && height > width);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  // ✅ Choose content
  const data = timelineData;

  return (
    <div className="w-full md:px-10 relative overflow-hidden" style={{ backgroundColor: "#000000" }}>
      {/* Inline CSS for float animation */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          33% {
            transform: translateY(-12px) translateX(6px);
          }
          66% {
            transform: translateY(6px) translateX(-6px);
          }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
      `}</style>

      {/* Main background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-orange-900/10 to-orange-950/10" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-black/50 to-transparent" />
        <div className="absolute bottom-0 right-0 w-full h-1/2 bg-gradient-to-t from-black/50 to-transparent" />
        
        {/* Floating particles background */}
        <div className="absolute inset-0 opacity-50 pointer-events-none">
          {Array.from({ length: 20 }).map((_, index) => {
            const top = Math.random() * 100;
            const left = Math.random() * 100;
            const size = Math.random() * 4 + 2; // 0.5px to 2px
            const isBrand = Math.random() > 0.5;
            const delay = Math.random() * 2000;
            const duration = 6000 + Math.random() * 4000; // 6-10 seconds
            
            return (
              <div
                key={index}
                className={`absolute rounded-full animate-float ${
                  isBrand ? 'bg-brand' : 'bg-white'
                }`}
                style={{
                  top: `${top}%`,
                  left: `${left}%`,
                  width: `${size}px`,
                  height: `${size}px`,
                  animationDelay: `${delay}ms`,
                  animationDuration: `${duration}ms`,
                }}
              />
            );
          })}
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto mt-20 py-10 px-4 md:px-8 lg:px-10">
        <motion.h1
          className="font-extrabold text-center leading-none pb-12"
          style={{
            fontSize: "clamp(60px, 14vw, 100px)",
            marginTop: "0",
            marginBottom: "0",
            lineHeight: "0.7",
            color: "#ffffff",
          }}
        >
          SERVICES
        </motion.h1>
        
        {/* Subtle accent line under title */}
        <motion.div 
          className="w-24 h-1 bg-brand mx-auto mb-8 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: "6rem" }}
          transition={{ delay: 0.5, duration: 0.8 }}
        />
      </div>

      {/* Desktop & Tablet */}
      <div className="hidden md:block relative z-10">
        <TimelineCore 
          data={data} 
          isMobile={false} 
          isTablet={isTablet} 
          isTabletVertical={isTabletVertical} 
        />
      </div>

      {/* Mobile */}
      <div className="block md:hidden relative z-10">
        <TimelineCore 
          data={data} 
          isMobile={true} 
          isTablet={false} 
          isTabletVertical={false} 
        />
      </div>
    </div>
  );
};

export default Timeline;
