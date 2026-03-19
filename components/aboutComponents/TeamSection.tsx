"use client";

import { useRef, useState, useCallback, useEffect } from "react";

type TeamMember = {
  name: string;
  role: string;
  img?: string;
  position?: number;
  createdAt?: number;
};

const TEAM_MEMBERS: TeamMember[] = [
  {
    name: "Ava Morgan",
    role: "Creative Director",
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=900&auto=format&fit=crop",
    position: 1,
    createdAt: 1,
  },
  {
    name: "Liam Carter",
    role: "Lead Developer",
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=900&auto=format&fit=crop",
    position: 2,
    createdAt: 2,
  },
  {
    name: "Noah Reed",
    role: "Product Strategist",
    img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=900&auto=format&fit=crop",
    position: 3,
    createdAt: 3,
  },
  {
    name: "Sophia Lane",
    role: "Marketing Lead",
    img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=900&auto=format&fit=crop",
    position: 4,
    createdAt: 4,
  },
  {
    name: "Mason Blake",
    role: "Motion Designer",
    img: "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=900&auto=format&fit=crop",
    position: 5,
    createdAt: 5,
  },
  {
    name: "Emma Hayes",
    role: "Client Success Manager",
    img: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=900&auto=format&fit=crop",
    position: 6,
    createdAt: 6,
  },
];

export default function TeamSection() {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    const sorted = [...TEAM_MEMBERS].sort((a, b) => {
      const pa =
        typeof a.position === "number" ? a.position : (a.createdAt ?? 0);
      const pb =
        typeof b.position === "number" ? b.position : (b.createdAt ?? 0);
      return pa - pb;
    });

    setTeamMembers(sorted);
  }, []);

  const checkScrollPosition = useCallback(() => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const { scrollLeft, scrollWidth, clientWidth } = container;

    setShowLeftArrow(scrollLeft > 10);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  const smoothScroll = useCallback(
    (distance: number) => {
      if (!scrollContainerRef.current) return;

      const container = scrollContainerRef.current;
      const start = container.scrollLeft;
      const startTime = performance.now();
      const duration = 600;

      const animateScroll = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);

        container.scrollLeft = start + distance * ease;

        if (progress < 1) {
          requestAnimationFrame(animateScroll);
        } else {
          checkScrollPosition();
        }
      };

      requestAnimationFrame(animateScroll);
    },
    [checkScrollPosition],
  );

  const scrollNext = useCallback(() => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const cardWidth = 340 + 32;
    const visibleCards = Math.max(
      1,
      Math.floor(container.clientWidth / cardWidth),
    );
    const scrollDistance = cardWidth * visibleCards;

    smoothScroll(scrollDistance);
  }, [smoothScroll]);

  const scrollPrev = useCallback(() => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const cardWidth = 340 + 32;
    const visibleCards = Math.max(
      1,
      Math.floor(container.clientWidth / cardWidth),
    );
    const scrollDistance = -cardWidth * visibleCards;

    smoothScroll(scrollDistance);
  }, [smoothScroll]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement | HTMLButtonElement>) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        scrollPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        scrollNext();
      }
    },
    [scrollPrev, scrollNext],
  );

  useEffect(() => {
    checkScrollPosition();

    const handleResize = () => checkScrollPosition();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [checkScrollPosition, teamMembers.length]);

  return (
    <section className="relative bg-black px-4 py-20 text-white">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-20 text-center text-2xl font-bold tracking-wide text-brand md:text-4xl">
          MEET THE TEAM
        </h2>

        <div className="grid grid-cols-1 gap-12 px-2 py-8 md:hidden">
          {teamMembers.map((member) => (
            <div
              key={member.name}
              className="group flex flex-col items-center text-center"
            >
              <div className="w-full max-w-70 overflow-hidden rounded-3xl bg-white/5 p-2 shadow-xl backdrop-blur-sm">
                <img
                  src={member.img}
                  alt={member.name}
                  loading="lazy"
                  className="h-85 w-full rounded-2xl object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                />
              </div>
              <div className="relative">
                <p className="mt-4 text-xl font-semibold">{member.name}</p>
              </div>
              <p className="text-sm text-brand/70">+ {member.role}</p>
            </div>
          ))}
        </div>

        <div className="relative hidden md:block">
          {showLeftArrow && (
            <button
              onClick={scrollPrev}
              onKeyDown={handleKeyDown}
              className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-black/90 p-4 text-white shadow-2xl backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:border-white/40 hover:bg-black"
              aria-label="Previous team members"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}

          <div
            ref={scrollContainerRef}
            className="flex space-x-8 overflow-x-auto px-8 py-12 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            onScroll={checkScrollPosition}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            style={{
              scrollBehavior: "smooth",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {teamMembers.map((member, index) => (
              <div
                key={member.name}
                className={`group flex w-85 shrink-0 transform flex-col items-center text-center transition-all duration-500 ${
                  index % 2 === 1 ? "translate-y-8" : "-translate-y-8"
                }`}
              >
                <div className="mb-4 w-full rounded-3xl bg-white/5 p-2 shadow-xl backdrop-blur-sm transition-all duration-500 group-hover:scale-105">
                  <img
                    src={member.img}
                    alt={member.name}
                    loading="lazy"
                    className="h-95 w-full rounded-2xl object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                </div>
                <div className="relative mt-4">
                  <p className="text-xl font-semibold transition-colors duration-300 group-hover:text-white">
                    {member.name}
                  </p>
                  <div className="absolute bottom-0 left-0 h-px w-0 bg-white transition-all duration-300 ease-out group-hover:w-full" />
                </div>
                <p className="text-sm text-brand/70 transition-all duration-300 group-hover:mt-2">
                  + {member.role}
                </p>
              </div>
            ))}
          </div>

          {showRightArrow && (
            <button
              onClick={scrollNext}
              onKeyDown={handleKeyDown}
              className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-black/90 p-4 text-white shadow-2xl backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:border-white/40 hover:bg-black"
              aria-label="Next team members"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
