"use client";

import React from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion";
import { ArrowUpRight, X } from "lucide-react";
import { listGallery } from "@/lib/firestoreHelpers";

type GalleryItem = {
  id?: string;
  imageUrl?: string;
  image?: string;
  title?: string;
  alt?: string;
};

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "asset-1",
    image: "/Alchemy logo ai-01.png",
    title: "Alchemy Image 01",
    alt: "Alchemy gallery image 01",
  },
  {
    id: "asset-2",
    image: "/Alchemy logo ai-02.png",
    title: "Alchemy Image 02",
    alt: "Alchemy gallery image 02",
  },
  {
    id: "asset-3",
    image: "/android-chrome-192x192.png",
    title: "Alchemy Image 03",
    alt: "Alchemy gallery image 03",
  },
  {
    id: "asset-4",
    image: "/android-chrome-512x512.png",
    title: "Alchemy Image 04",
    alt: "Alchemy gallery image 04",
  },
  {
    id: "asset-5",
    image: "/apple-touch-icon.png",
    title: "Alchemy Image 05",
    alt: "Alchemy gallery image 05",
  },
  {
    id: "asset-6",
    image: "/favicon-16x16.png",
    title: "Alchemy Image 06",
    alt: "Alchemy gallery image 06",
  },
  {
    id: "asset-7",
    image: "/favicon-32x32.png",
    title: "Alchemy Image 07",
    alt: "Alchemy gallery image 07",
  },
];

const FALLBACK_GALLERY_ITEMS: GalleryItem[] = GALLERY_ITEMS;

type FirestoreGalleryDoc = {
  id?: string;
  title?: string;
  alt?: string;
  image?: string;
  imageUrl?: string;
  url?: string;
  secure_url?: string;
  src?: string;
  mainImage?: string | { secure_url?: string; url?: string };
  name?: string;
  caption?: string;
};

const pickString = (value: unknown) =>
  typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;

const resolveImageUrl = (item: FirestoreGalleryDoc) => {
  if (typeof item.mainImage === "string") {
    return pickString(item.mainImage);
  }

  if (item.mainImage && typeof item.mainImage === "object") {
    return pickString(item.mainImage.secure_url) || pickString(item.mainImage.url);
  }

  return (
    pickString(item.imageUrl) ||
    pickString(item.image) ||
    pickString(item.url) ||
    pickString(item.secure_url) ||
    pickString(item.src)
  );
};

const normalizeGalleryItem = (item: FirestoreGalleryDoc, index: number): GalleryItem | null => {
  const imageUrl = resolveImageUrl(item);
  if (!imageUrl) return null;

  const label = pickString(item.title) || pickString(item.name) || pickString(item.caption);
  const title = label || `Gallery Image ${index + 1}`;

  return {
    id: pickString(item.id) || `gallery-${index + 1}`,
    imageUrl,
    title,
    alt: pickString(item.alt) || title,
  };
};

const disableScroll = () => {
  const scrollBarWidth =
    window.innerWidth - document.documentElement.clientWidth;
  document.body.style.overflow = "hidden";
  document.body.style.paddingRight = `${scrollBarWidth}px`;
};

const enableScroll = () => {
  document.body.style.overflow = "";
  document.body.style.paddingRight = "";
};

const notifyGalleryExpandedChange = (expanded: boolean) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("gallery:expanded-change", { detail: { expanded } }),
  );
};

type ExpandedViewProps = {
  isOpen: boolean;
  onClose: () => void;
  galleryItems: GalleryItem[];
  currentIndex: number;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
};

const ExpandedView = ({
  isOpen,
  onClose,
  galleryItems,
  currentIndex,
  setCurrentIndex,
}: ExpandedViewProps) => {
  React.useEffect(() => {
    if (isOpen) {
      disableScroll();
    } else {
      enableScroll();
    }

    return () => {
      enableScroll();
    };
  }, [isOpen]);

  const goToNext = React.useCallback(() => {
    if (!galleryItems.length) return;
    setCurrentIndex((prevIndex) => (prevIndex + 1) % galleryItems.length);
  }, [galleryItems.length, setCurrentIndex]);

  const goToPrevious = React.useCallback(() => {
    if (!galleryItems.length) return;
    setCurrentIndex(
      (prevIndex) =>
        (prevIndex - 1 + galleryItems.length) % galleryItems.length,
    );
  }, [galleryItems.length, setCurrentIndex]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "ArrowRight") {
        goToNext();
      } else if (e.key === "ArrowLeft") {
        goToPrevious();
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, goToNext, goToPrevious, onClose]);

  const currentItem =
    galleryItems && galleryItems.length ? galleryItems[currentIndex] : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
        >
          <button
            onClick={onClose}
            aria-label="Close expanded image"
            className="absolute top-4 right-4 z-50 rounded-full bg-black/50 p-3 text-white transition-colors duration-200 hover:bg-black/80"
          >
            <X size={24} />
          </button>

          {galleryItems.length > 1 && (
            <button
              onClick={goToPrevious}
              aria-label="Previous image"
              className="absolute top-1/2 left-4 z-50 -translate-y-1/2 rounded-full bg-black/50 p-4 text-white transition-colors duration-200 hover:bg-black/80"
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}

          {galleryItems.length > 1 && (
            <button
              onClick={goToNext}
              aria-label="Next image"
              className="absolute top-1/2 right-4 z-50 -translate-y-1/2 rounded-full bg-black/50 p-4 text-white transition-colors duration-200 hover:bg-black/80"
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}

          {galleryItems.length > 1 && (
            <div className="absolute bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full bg-black/50 px-4 py-2 text-lg font-medium text-white">
              {`${currentIndex + 1} / ${galleryItems.length}`}
            </div>
          )}

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative flex max-h-[95vh] max-w-[95vw] items-center justify-center"
          >
            <img
              src={currentItem?.imageUrl || currentItem?.image}
              alt={currentItem?.title || currentItem?.alt || "Gallery image"}
              className="max-h-full max-w-full object-contain"
              style={{
                maxWidth: "min(95vw, 1200px)",
                maxHeight: "min(95vh, 800px)",
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

type GalleryCardProps = {
  item: GalleryItem;
  index: number;
  onExpand: (item: GalleryItem) => void;
};

const GalleryCard = ({ item, index, onExpand }: GalleryCardProps) => {
  const [, setIsHovered] = React.useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleClick = () => {
    onExpand(item);
  };

  const cardVariants: Variants = {
    offscreen: { y: 50, opacity: 0 },
    onscreen: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        bounce: 0.4,
        duration: 0.8,
        delay: index * 0.1,
      },
    },
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="offscreen"
      whileInView="onscreen"
      viewport={{ once: true, amount: 0.5 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="group relative h-80 w-full cursor-pointer rounded-xl border border-slate-800 bg-black"
      onClick={handleClick}
    >
      <div
        style={{ transform: "translateZ(50px)", transformStyle: "preserve-3d" }}
        className="absolute inset-4 flex flex-col justify-end overflow-hidden rounded-lg p-6"
      >
        <img
          src={item.imageUrl || item.image}
          alt={item.title || item.alt || "Gallery image"}
          className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            const target = e.currentTarget;
            target.onerror = null;
            target.src =
              "https://placehold.co/400x400/000000/ffffff?text=Error";
          }}
        />

        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="absolute top-4 right-4 opacity-0 transition-all duration-300 group-hover:scale-110 group-hover:opacity-100">
          <div className="flex items-center justify-center rounded-full bg-white p-2 shadow-lg">
            <ArrowUpRight size={20} className="text-black" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

type GenerativeArtGalleryProps = {
  onExpandChange?: (expanded: boolean) => void;
};

const GenerativeArtGallery = ({
  onExpandChange,
}: GenerativeArtGalleryProps) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [galleryItems, setGalleryItems] = React.useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;

    const loadGallery = async () => {
      try {
        const docs = (await listGallery()) as FirestoreGalleryDoc[];
        if (!isMounted) return;

        const normalized = docs
          .map((item, index) => normalizeGalleryItem(item, index))
          .filter((item): item is GalleryItem => item !== null);

        setGalleryItems(normalized.length ? normalized : FALLBACK_GALLERY_ITEMS);
      } catch (error) {
        console.warn("Failed to load gallery from Firestore:", error);
        if (isMounted) {
          setGalleryItems(FALLBACK_GALLERY_ITEMS);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadGallery();

    return () => {
      isMounted = false;
    };
  }, []);

  React.useEffect(() => {
    notifyGalleryExpandedChange(isExpanded);
    onExpandChange?.(isExpanded);

    return () => {
      notifyGalleryExpandedChange(false);
      onExpandChange?.(false);
    };
  }, [isExpanded, onExpandChange]);

  const handleExpand = (item: GalleryItem) => {
    const index = galleryItems.findIndex((i) =>
      i.id ? i.id === item.id : i.imageUrl === item.imageUrl,
    );

    setCurrentIndex(index >= 0 ? index : 0);
    setIsExpanded(true);
  };

  const handleClose = () => {
    setIsExpanded(false);
    setTimeout(() => {
      setCurrentIndex(0);
    }, 300);
  };

  return (
    <>
      <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-black p-8 md:p-16">
        <div className="relative z-10 grid w-full max-w-6xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <div className="col-span-full text-center text-gray-400">
              Loading gallery images...
            </div>
          ) : galleryItems.length > 0 ? (
            galleryItems.map((item, index) => (
              <GalleryCard
                key={item.id || item.imageUrl || index}
                item={item}
                index={index}
                onExpand={handleExpand}
              />
            ))
          ) : (
            <div className="col-span-full text-center text-gray-400">
              No gallery images yet.
            </div>
          )}
        </div>
      </div>

      <ExpandedView
        isOpen={isExpanded}
        onClose={handleClose}
        galleryItems={galleryItems}
        currentIndex={currentIndex}
        setCurrentIndex={setCurrentIndex}
      />
    </>
  );
};

export default GenerativeArtGallery;
