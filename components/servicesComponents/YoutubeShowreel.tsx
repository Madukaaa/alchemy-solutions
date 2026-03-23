"use client";

import { useState } from "react";
import { Play, X } from "lucide-react";

type YoutubeShowreelProps = {
  videoId?: string;
  title?: string;
  description?: string;
};

export default function YoutubeShowreel({
  videoId = "PP2NszjOEBA",
  title = "Watch Our AV Production Showcase",
  description = "See how we bring visions to life through captivating audiovisual storytelling",
}: YoutubeShowreelProps) {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <div className="relative">
      <div className="glass-card rounded-2xl p-6 pt-20 pb-20 transition-all duration-300 hover:shadow-2xl">
        {!showVideo ? (
          <div
            onClick={() => setShowVideo(true)}
            className="group relative mx-auto h-80 w-full max-w-5xl cursor-pointer overflow-hidden rounded-xl transition-transform duration-300 hover:scale-105 md:h-120"
            style={{
              backgroundImage: `url("https://img.youtube.com/vi/${videoId}/maxresdefault.jpg")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors group-hover:bg-black/20">
              <div className="rounded-full bg-orange-500 p-4 shadow-2xl transition-colors hover:bg-orange-600 sm:p-5">
                <Play className="h-10 w-10 fill-white text-white sm:h-12 sm:w-12" />
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 overflow-hidden bg-linear-to-t from-black/80 via-black/40 to-transparent p-3 text-left text-white sm:p-4">
              <div className="max-w-full whitespace-normal wrap-break-word">
                <h3 className="mb-3 text-sm font-bold leading-tight drop-shadow-lg sm:text-lg">
                  {title}
                </h3>
                <p className="mb-5 wrap-break-word text-xs leading-snug text-gray-200 drop-shadow-md sm:text-sm">
                  {description}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative mx-auto w-full max-w-5xl py-12 md:py-20">
            <div className="overflow-hidden rounded-xl">
              <iframe
                className="h-80 w-full md:h-120"
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                title={title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>

            <button
              onClick={() => setShowVideo(false)}
              className="absolute right-6 top-6 z-10 rounded-full bg-black/70 p-2 text-white transition-all duration-300 hover:bg-black/90"
              aria-label="Close video"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
