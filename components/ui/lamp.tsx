"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const LampContainer = ({
  children,
  className,
  translateY = "-0.65",
}: {
  children: React.ReactNode;
  className?: string;
  translateY?: string;
}) => {
  return (
    <div
      className={cn(
        "hero-lamp-container relative flex min-h-[60vh] xs:min-h-[70vh] sm:min-h-[80vh] md:min-h-[90vh] lg:min-h-screen flex-col items-center justify-center overflow-hidden bg-black w-full rounded-md z-0 lg:pt-24",
        className
      )}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .hero-lamp-container {
            --lamp-width: 10rem;
            --lamp-width-expanded: 16rem;
            --lamp-height: 6rem;
            --glow-size: 12rem;
            --blur-size: 24px;
            --font-size: clamp(4.5rem, 12vw, 28rem);
          }
          @media (min-width: 475px) {
            .hero-lamp-container {
              --lamp-width: 12rem;
              --lamp-width-expanded: 20rem;
              --lamp-height: 8rem;
              --glow-size: 16rem;
              --blur-size: 32px;
            }
          }
          @media (min-width: 640px) {
            .hero-lamp-container {
              --lamp-width: 14rem;
              --lamp-width-expanded: 24rem;
              --lamp-height: 10rem;
              --glow-size: 20rem;
              --blur-size: 36px;
            }
          }
          @media (min-width: 768px) {
            .hero-lamp-container {
              --lamp-width: 15rem;
              --lamp-width-expanded: 30rem;
              --lamp-height: 14rem;
              --glow-size: 28rem;
              --blur-size: 48px;
              --font-size: 9rem;
            }
          }
          @media (min-width: 1024px) {
            .hero-lamp-container {
              --font-size: clamp(4.5rem, 12vw, 28rem);
            }
          }
        `,
        }}
      />
      <div
        className="relative flex w-full flex-1 scale-y-125 items-center justify-center isolate z-0"
        style={{ transform: "translateY(calc(var(--lamp-height) * 0.62))" }}
      >
        <motion.div
          initial={{ opacity: 0.5, width: "var(--lamp-width)" }}
          whileInView={{ opacity: 1, width: "var(--lamp-width-expanded)" }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          style={{
            backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
            position: "absolute",
            inset: "auto",
            right: "50%",
            height: "var(--lamp-height)",
            overflow: "visible",
            width: "var(--lamp-width-expanded)",
            background:
              "conic-gradient(from 70deg at center top, #ff8c00, transparent, transparent)",
            color: "white",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: "100%",
              left: 0,
              backgroundColor: "#000000",
              height: "calc(var(--lamp-height) * 0.7)",
              bottom: 0,
              zIndex: 20,
              maskImage: "linear-gradient(to top, white, transparent)",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: "calc(var(--lamp-height) * 0.7)",
              height: "100%",
              left: 0,
              backgroundColor: "#000000",
              bottom: 0,
              zIndex: 20,
              maskImage: "linear-gradient(to right, white, transparent)",
            }}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0.5, width: "var(--lamp-width)" }}
          whileInView={{ opacity: 1, width: "var(--lamp-width-expanded)" }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            inset: "auto",
            left: "50%",
            height: "var(--lamp-height)",
            width: "var(--lamp-width-expanded)",
            background:
              "conic-gradient(from 290deg at center top, transparent, transparent, #ff8c00)",
            color: "white",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: "calc(var(--lamp-height) * 0.7)",
              height: "100%",
              right: 0,
              backgroundColor: "#000000",
              bottom: 0,
              zIndex: 20,
              maskImage: "linear-gradient(to left, white, transparent)",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: "100%",
              right: 0,
              backgroundColor: "#000000",
              height: "calc(var(--lamp-height) * 0.7)",
              bottom: 0,
              zIndex: 20,
              maskImage: "linear-gradient(to top, white, transparent)",
            }}
          />
        </motion.div>
        <div
          style={{
            position: "absolute",
            top: "50%",
            height: "calc(var(--lamp-height) * 0.85)",
            width: "100%",
            transform: "translateY(12px) scaleX(1.5)",
            backgroundColor: "#000000",
            filter: "blur(32px)",
          }}
        ></div>
        <div
          style={{
            position: "absolute",
            top: "50%",
            zIndex: 50,
            height: "calc(var(--lamp-height) * 0.85)",
            width: "100%",
            backgroundColor: "transparent",
            opacity: 0.1,
            backdropFilter: "blur(8px)",
          }}
        ></div>
        <div
          style={{
            position: "absolute",
            inset: "auto",
            zIndex: 50,
            height: "calc(var(--lamp-height) * 0.64)",
            width: "var(--glow-size)",
            transform: "translateY(-50%)",
            borderRadius: "50%",
            backgroundColor: "#ff8c00",
            opacity: 0.5,
            filter: "blur(var(--blur-size))",
          }}
        ></div>
        <motion.div
          initial={{ width: "calc(var(--lamp-width) * 0.53)" }}
          whileInView={{ width: "calc(var(--lamp-width-expanded) * 0.53)" }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            inset: "auto",
            zIndex: 30,
            height: "calc(var(--lamp-height) * 0.64)",
            width: "calc(var(--lamp-width-expanded) * 0.53)",
            transform: "translateY(calc(var(--lamp-height) * -0.43))",
            borderRadius: "50%",
            backgroundColor: "#ffa500",
            filter: "blur(32px)",
          }}
        ></motion.div>
        <motion.div
          initial={{ width: "var(--lamp-width)" }}
          whileInView={{ width: "var(--lamp-width-expanded)" }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            inset: "auto",
            zIndex: 50,
            height: "2px",
            width: "var(--lamp-width-expanded)",
            transform: "translateY(calc(var(--lamp-height) * -0.5))",
            backgroundColor: "#ff8c00",
          }}
        ></motion.div>

        <div
          style={{
            position: "absolute",
            inset: "auto",
            zIndex: 40,
            height: "calc(var(--lamp-height) * 0.78)",
            width: "100%",
            transform: "translateY(calc(var(--lamp-height) * -0.89))",
            backgroundColor: "#000000",
          }}
        ></div>
      </div>

      <div
        className="relative z-50 flex flex-col items-center px-5"
        style={{
          transform: `translateY(calc(var(--lamp-height) * ${translateY}))`,
        }}
      >
        {children}
      </div>
    </div>
  );
};
