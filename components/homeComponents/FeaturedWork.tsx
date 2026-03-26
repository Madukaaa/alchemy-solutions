"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import CircularGallery from "../ui/CircularGallery";
import { listFeaturedWork } from "../../lib/firestoreHelpers";

const defaultFeaturedItems = [
  {
    image: "https://picsum.photos/seed/1/800/600",
    text: "Sample Project 1",
    description: "Add your projects through the admin panel",
    tag: "Web Development"
  },
  {
    image: "https://picsum.photos/seed/2/800/600",
    text: "Sample Project 2", 
    description: "Add your projects through the admin panel",
    tag: "Web Development"
  }
];

export default function FeaturedWork({
  title = "OUR RECENT PROJECTS",
  subtitle = "We thrive on creativity and love turning ideas into experiences that inspire.",
  textStyles = {
    position: 'below',
    titleColor: '#E2791D',
    descriptionColor: '#ffffff',
    tagColor: '#b7b8bbff',
    titleSize: '1.5rem',
    descriptionSize: '1rem',
    tagSize: '0.875rem',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: '1rem',
    borderRadius: '0.5rem',
    maxWidth: '400px'
  },
  showText = true
}: any) {
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const textOverlayRef = useRef<HTMLDivElement>(null);
  const [featuredItems, setFeaturedItems] = useState<any[]>(defaultFeaturedItems);
  const [loading, setLoading] = useState(true);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  // Use useCallback to prevent infinite re-renders
  const handleMediaPositionUpdate = useCallback((index: number, position: any, scale: any) => {
    // Only update if this media is centered (close to x=0)
    if (Math.abs(position.x) < 2) {
      setActiveMediaIndex(index);
    }
  }, []);

  useEffect(() => {
    async function loadFeaturedWork() {
      try {
        const items = await listFeaturedWork();
        if (items && items.length > 0) {
          const transformedItems = items.map(item => ({
            image: item.imageUrl,
            title: item.title,
            description: item.description,
            category: item.tag
          }));
          setFeaturedItems(transformedItems);
        }
      } catch (error) {
        console.error('Error loading featured work:', error);
      } finally {
        setLoading(false);
      }
    }

    loadFeaturedWork();
  }, []);

  if (loading) {
    return (
      <section className="bg-black text-white py-2 font-poppins relative pt-20">
        <div className="text-center mb-8 pt-[100px]">
          <h2 className="text-2xl md:text-4xl font-bold text-brand tracking-wide text-center">
            {title}
          </h2>
          <p className="text-gray-300 mt-4 text-sm md:text-lg max-w-xl mx-auto px-4 md:px-0">
            {subtitle}
          </p>
        </div>

        <div className="relative h-72 sm:h-[600px]">
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-400">Loading featured work...</div>
          </div>
        </div>
      </section>
    );
  }

  const activeMediaData = featuredItems[activeMediaIndex % featuredItems.length] || featuredItems[0];

  return (
    <section className="bg-black text-white py-2 pb-0 font-poppins relative pt-20">
      <div className="text-center mb-8 sm:mb-1">
        <h2 className="text-2xl md:text-4xl font-bold text-brand tracking-wide text-center">
          {title}
        </h2>
        <p className="text-gray-300 mt-4 text-sm md:text-lg max-w-xl mx-auto px-4 md:px-0">
          {subtitle}
        </p>
      </div>

      <div className="relative min-h-[28rem] sm:min-h-[600px]">
        {/* Carousel Container - Fixed height with bottom margin */}
        <div
          ref={cardsContainerRef}
          className="relative h-[350px] py-8 sm:py-0 sm:h-[600px]" // mobile larger, larger screens keep 600px
        >
          <CircularGallery
            items={featuredItems}
            bend={0}
            borderRadius={0.05}
            // @ts-ignore
            scrollEase={0.02}
            scrollSpeed={2}
          />
        </div>
      </div>
    </section>
  );
}
