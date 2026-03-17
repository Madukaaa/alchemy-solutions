"use client";

import { useState } from "react";
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

  const navItems = [
    { label: "Home", href: "/" },
    { label: "About Us", href: "/about" },
    { label: "Services", href: "/services" },
    { label: "Gallery", href: "/gallery" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-60 flex items-center justify-between px-5 sm:px-8 md:px-12 lg:px-16 xl:px-24 2xl:px-32 py-6 bg-transparent ${poppins.className}`}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/Alchemy logo ai-02.png"
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
          className="hidden sm:block px-6 py-2.5 rounded-full border border-[#E87A27] text-white text-sm font-medium hover:bg-[#E87A27]/10 transition-colors"
        >
          Talk to us
        </Link>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-[#E87A27] text-white hover:bg-[#D97736] transition-colors"
        >
          {/* Left Side: Contact & Info */}
          <div className="w-full md:w-1/2 flex flex-col justify-between border-r border-gray-200 pr-0 md:pr-12 md:max-h-[70vh] my-auto">
            <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-8">
              {/* Placeholder for Robot Image */}
              <div className="w-48 h-48 bg-gray-100 rounded-3xl flex items-center justify-center mb-8 md:flex">
                <span className="text-gray-400 text-sm">
                  Robot Image Placeholder
                </span>
              </div>

    {/* Fullscreen Overlay */}
    <div 
      className={`fixed inset-0 z-50 bg-white transition-transform duration-500 ease-in-out ${isOpen ? "translate-y-0" : "-translate-y-full"}`}
    >
      <div className={`flex flex-col md:flex-row h-full w-full pt-32 pl-6 pr-6 md:pl-32 md:pr-20 lg:pl-40 lg:pr-24 pb-12 ${poppins.className}`}>
        
        {/* Left Side: Contact & Info */}
        <div className="w-full md:w-1/2 flex flex-col justify-between pr-0 md:pr-12 md:max-h-[70vh] my-auto">
          <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-8">
            <div className="relative mb-8 hidden h-48 w-48 md:flex">
              <Image
                src="/"
                alt="Alchemy visual"
                fill
                className="object-contain"
                sizes="192px"
                priority
              />
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
                Where creativity flows through our bloodline. 
                We transform ideas into extraordinary digital experiences.
              </p>
              
              {/* Social Icons */}
              <div className="flex justify-center md:justify-start space-x-4">
                <Link href="https://www.facebook.com/alchemys.lk" target="_blank" rel="noreferrer noopener" className="w-12 h-12 rounded-full border border-[#E87A27] text-[#E87A27] flex items-center justify-center hover:bg-[#E87A27] hover:text-white transition-colors">
                  <Facebook className="w-5 h-5" />
                </Link>
                <Link href="https://www.instagram.com/alchemy.lk" target="_blank" rel="noreferrer noopener" className="w-12 h-12 rounded-full border border-[#E87A27] text-[#E87A27] flex items-center justify-center hover:bg-[#E87A27] hover:text-white transition-colors">
                  <Instagram className="w-5 h-5" />
                </Link>
                <Link href="https://www.linkedin.com/company/alchemylk/" target="_blank" rel="noreferrer noopener" className="w-12 h-12 rounded-full border border-[#E87A27] text-[#E87A27] flex items-center justify-center hover:bg-[#E87A27] hover:text-white transition-colors">
                  <Linkedin className="w-5 h-5" />
                </Link>
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
                onClick={() => setIsOpen(false)}
              >
                <HoverAnimatedText text={item.label} />
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>

    {isOpen && (
      <FloatingCallButton className="bottom-6 right-6 md:bottom-10 md:right-12" />
    )}
    </>
  );
}
