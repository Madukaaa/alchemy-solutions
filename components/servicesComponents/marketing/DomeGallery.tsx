// @ts-nocheck
import { useEffect, useMemo, useRef, useCallback, useState } from "react";
import { useGesture } from "@use-gesture/react";
import { listDomeImages } from "../../../lib/firestoreHelpers";

const DEFAULTS = {
  maxVerticalRotationDeg: 0,
  dragSensitivity: 20,
  enlargeTransitionMs: 300,
  segments: 35,
};

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
const normalizeAngle = (d) => ((d % 360) + 360) % 360;
const wrapAngleSigned = (deg) => {
  const a = (((deg + 180) % 360) + 360) % 360;
  return a - 180;
};
const getDataNumber = (el, name, fallback) => {
  const attr = el.dataset[name] ?? el.getAttribute(`data-${name}`);
  const n = attr == null ? NaN : parseFloat(attr);
  return Number.isFinite(n) ? n : fallback;
};

function buildItems(pool, seg) {
  const xCols = Array.from({ length: seg }, (_, i) => -37 + i * 2);
  const evenYs = [-4, -2, 0, 2, 4];
  const oddYs = [-3, -1, 1, 3, 5];

  const coords = xCols.flatMap((x, c) => {
    const ys = c % 2 === 0 ? evenYs : oddYs;
    return ys.map((y) => ({ x, y, sizeX: 2, sizeY: 2 }));
  });

  const totalSlots = coords.length;

  if (pool.length === 0) {
    return coords.map((c) => ({ ...c, src: "", alt: "" }));
  }

  // Normalize images
  const normalizedImages = pool.map((image) => {
    if (typeof image === "string") {
      return { src: image, alt: "" };
    }
    return { src: image.src || "", alt: image.alt || "" };
  });

  // If we have more slots than images, distribute images evenly
  if (normalizedImages.length < totalSlots) {
    const repetitionFactor = Math.ceil(totalSlots / normalizedImages.length);
    const repeatedImages = [];

    for (let i = 0; i < repetitionFactor; i++) {
      // Shuffle each repetition to avoid patterns
      const shuffled = [...normalizedImages].sort(() => Math.random() - 0.5);
      repeatedImages.push(...shuffled);
    }

    // Trim to exact slot count
    return coords.map((c, i) => ({
      ...c,
      src: repeatedImages[i % repeatedImages.length].src,
      alt: repeatedImages[i % repeatedImages.length].alt,
    }));
  }

  // If we have more images than slots, use unique images and warn
  if (normalizedImages.length > totalSlots) {
    console.warn(
      `[DomeGallery] Provided image count (${normalizedImages.length}) exceeds available tiles (${totalSlots}). Some images will not be shown.`,
    );

    // Use first 'totalSlots' unique images
    const usedImages = normalizedImages.slice(0, totalSlots);

    // Shuffle to distribute images randomly
    const shuffledImages = [...usedImages].sort(() => Math.random() - 0.5);

    return coords.map((c, i) => ({
      ...c,
      src: shuffledImages[i].src,
      alt: shuffledImages[i].alt,
    }));
  }

  // Perfect match - use all images shuffled
  const shuffledImages = [...normalizedImages].sort(() => Math.random() - 0.5);
  return coords.map((c, i) => ({
    ...c,
    src: shuffledImages[i].src,
    alt: shuffledImages[i].alt,
  }));
}

function computeItemBaseRotation(offsetX, offsetY, sizeX, sizeY, segments) {
  const unit = 360 / segments / 2;
  const rotateY = unit * (offsetX + (sizeX - 1) / 2);
  const rotateX = unit * (offsetY - (sizeY - 1) / 2);
  return { rotateX, rotateY };
}

export default function DomeGallery({
  images = [],
  fit = 1.5,
  fitBasis = "auto",
  minRadius = 600,
  maxRadius = Infinity,
  padFactor = 0.25,
  overlayBlurColor = "#000000",
  maxVerticalRotationDeg = DEFAULTS.maxVerticalRotationDeg,
  dragSensitivity = DEFAULTS.dragSensitivity,
  enlargeTransitionMs = DEFAULTS.enlargeTransitionMs,
  segments = DEFAULTS.segments,
  dragDampening = 2,
  openedImageWidth = "400px",
  openedImageHeight = "400px",
  imageBorderRadius = "30px",
  openedImageBorderRadius = "30px",
  grayscale = false,
  onExpandChange,
  autoSpinSpeed = 0.1, // Default speed for desktop
  mobileAutoSpinSpeed = 0.05, // Slower speed for mobile
}) {
  // Load remote images if no images provided via props
  const [remoteImages, setRemoteImages] = useState(null);
  const [isVerticalScrolling, setIsVerticalScrolling] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice =
        window.innerWidth <= 768 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent,
        );
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const all = await listDomeImages();
        if (!mounted) return;
        const mapped = (all || []).map((it) => ({
          src: it.imageUrl || it.url || "",
          alt: it.title || "",
        }));
        setRemoteImages(mapped);
      } catch (err) {
        console.error("Failed to load dome images", err);
        if (mounted) setRemoteImages([]);
      }
    }
    if ((!images || images.length === 0) && remoteImages == null) load();
    return () => {
      mounted = false;
    };
  }, [images]);

  const effectiveImages =
    images && images.length > 0 ? images : remoteImages || [];
  const rootRef = useRef(null);
  const mainRef = useRef(null);
  const sphereRef = useRef(null);
  const frameRef = useRef(null);
  const viewerRef = useRef(null);
  const scrimRef = useRef(null);
  const focusedElRef = useRef(null);
  const originalTilePositionRef = useRef(null);

  const rotationRef = useRef({ x: 0, y: 0 });
  const startRotRef = useRef({ x: 0, y: 0 });
  const startPosRef = useRef(null);
  const draggingRef = useRef(false);
  const cancelTapRef = useRef(false);
  const movedRef = useRef(false);
  const inertiaRAF = useRef(null);
  const autoSpinRAF = useRef(null);
  const pointerTypeRef = useRef("mouse");
  const tapTargetRef = useRef(null);
  const openingRef = useRef(false);
  const openStartedAtRef = useRef(0);
  const lastDragEndAt = useRef(0);
  const lastUserInteraction = useRef(Date.now());

  const scrollLockedRef = useRef(false);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [isClosing, setIsClosing] = useState(false);

  const lockScroll = useCallback(() => {
    if (scrollLockedRef.current) return;
    scrollLockedRef.current = true;
    document.body.classList.add("dg-scroll-lock");
  }, []);
  const unlockScroll = useCallback(() => {
    if (!scrollLockedRef.current) return;
    if (rootRef.current?.getAttribute("data-enlarging") === "true") return;
    scrollLockedRef.current = false;
    document.body.classList.remove("dg-scroll-lock");
  }, []);

  const items = useMemo(
    () => buildItems(effectiveImages, segments),
    [effectiveImages, segments],
  );

  const applyTransform = (xDeg, yDeg) => {
    const el = sphereRef.current;
    if (el) {
      el.style.transform = `translateZ(calc(var(--radius) * -1)) rotateX(${xDeg}deg) rotateY(${yDeg}deg)`;
    }
  };

  const lockedRadiusRef = useRef(null);

  // Auto-spin functionality with different speeds for mobile/desktop
  const startAutoSpin = useCallback(() => {
    const spin = () => {
      if (!draggingRef.current && !focusedElRef.current && !fullscreenImage) {
        // Only auto-spin if no user interaction for 1 second
        if (Date.now() - lastUserInteraction.current > 1000) {
          const currentSpeed = isMobile ? mobileAutoSpinSpeed : autoSpinSpeed;
          rotationRef.current.y = wrapAngleSigned(
            rotationRef.current.y + currentSpeed,
          );
          applyTransform(rotationRef.current.x, rotationRef.current.y);
        }
      }
      autoSpinRAF.current = requestAnimationFrame(spin);
    };

    stopAutoSpin();
    autoSpinRAF.current = requestAnimationFrame(spin);
  }, [autoSpinSpeed, mobileAutoSpinSpeed, isMobile, fullscreenImage]);

  const stopAutoSpin = useCallback(() => {
    if (autoSpinRAF.current) {
      cancelAnimationFrame(autoSpinRAF.current);
      autoSpinRAF.current = null;
    }
  }, []);

  // Start auto-spin on component mount and when fullscreen closes
  useEffect(() => {
    startAutoSpin();
    return () => stopAutoSpin();
  }, [startAutoSpin, stopAutoSpin]);

  // Restart auto-spin when mobile detection changes
  useEffect(() => {
    if (!fullscreenImage && !draggingRef.current) {
      startAutoSpin();
    }
  }, [isMobile, startAutoSpin, fullscreenImage]);

  // Stop auto-spin when fullscreen is open, resume when closed
  useEffect(() => {
    if (fullscreenImage) {
      stopAutoSpin();
    } else {
      const timer = setTimeout(() => {
        startAutoSpin();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [fullscreenImage, startAutoSpin, stopAutoSpin]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0].contentRect;
      const w = Math.max(1, cr.width),
        h = Math.max(1, cr.height);
      const minDim = Math.min(w, h),
        maxDim = Math.max(w, h),
        aspect = w / h;
      let basis;
      switch (fitBasis) {
        case "min":
          basis = minDim;
          break;
        case "max":
          basis = maxDim;
          break;
        case "width":
          basis = w;
          break;
        case "height":
          basis = h;
          break;
        default:
          basis = aspect >= 1.3 ? w : minDim;
      }
      let radius = basis * fit;
      const heightGuard = h * 1.35;
      radius = Math.min(radius, heightGuard);
      radius = clamp(radius, minRadius, maxRadius);
      lockedRadiusRef.current = Math.round(radius);

      const viewerPad = Math.max(8, Math.round(minDim * padFactor));
      root.style.setProperty("--radius", `${lockedRadiusRef.current}px`);
      root.style.setProperty("--viewer-pad", `${viewerPad}px`);
      root.style.setProperty("--overlay-blur-color", overlayBlurColor);
      root.style.setProperty("--tile-radius", imageBorderRadius);
      root.style.setProperty("--enlarge-radius", openedImageBorderRadius);
      root.style.setProperty(
        "--image-filter",
        grayscale ? "grayscale(1)" : "none",
      );
      applyTransform(rotationRef.current.x, rotationRef.current.y);

      const enlargedOverlay = viewerRef.current?.querySelector(".enlarge");
      if (enlargedOverlay && frameRef.current && mainRef.current) {
        const frameR = frameRef.current.getBoundingClientRect();
        const mainR = mainRef.current.getBoundingClientRect();

        const hasCustomSize = openedImageWidth && openedImageHeight;
        if (hasCustomSize) {
          const tempDiv = document.createElement("div");
          tempDiv.style.cssText = `position: absolute; width: ${openedImageWidth}; height: ${openedImageHeight}; visibility: hidden;`;
          document.body.appendChild(tempDiv);
          const tempRect = tempDiv.getBoundingClientRect();
          document.body.removeChild(tempDiv);

          const centeredLeft =
            frameR.left - mainR.left + (frameR.width - tempRect.width) / 2;
          const centeredTop =
            frameR.top - mainR.top + (frameR.height - tempRect.height) / 2;

          enlargedOverlay.style.left = `${centeredLeft}px`;
          enlargedOverlay.style.top = `${centeredTop}px`;
        } else {
          enlargedOverlay.style.left = `${frameR.left - mainR.left}px`;
          enlargedOverlay.style.top = `${frameR.top - mainR.top}px`;
          enlargedOverlay.style.width = `${frameR.width}px`;
          enlargedOverlay.style.height = `${frameR.height}px`;
        }
      }
    });
    ro.observe(root);
    return () => ro.disconnect();
  }, [
    fit,
    fitBasis,
    minRadius,
    maxRadius,
    padFactor,
    overlayBlurColor,
    grayscale,
    imageBorderRadius,
    openedImageBorderRadius,
    openedImageWidth,
    openedImageHeight,
  ]);

  useEffect(() => {
    applyTransform(rotationRef.current.x, rotationRef.current.y);
  }, []);

  const stopInertia = useCallback(() => {
    if (inertiaRAF.current) {
      cancelAnimationFrame(inertiaRAF.current);
      inertiaRAF.current = null;
    }
  }, []);

  const startInertia = useCallback(
    (vx, vy) => {
      const MAX_V = 1.4;
      let vX = clamp(vx, -MAX_V, MAX_V) * 80;
      let vY = clamp(vy, -MAX_V, MAX_V) * 80;
      let frames = 0;
      const d = clamp(dragDampening ?? 0.6, 0, 1);
      const frictionMul = 0.94 + 0.055 * d;
      const stopThreshold = 0.015 - 0.01 * d;
      const maxFrames = Math.round(90 + 270 * d);
      const step = () => {
        vX *= frictionMul;
        vY *= frictionMul;
        if (Math.abs(vX) < stopThreshold && Math.abs(vY) < stopThreshold) {
          inertiaRAF.current = null;
          return;
        }
        if (++frames > maxFrames) {
          inertiaRAF.current = null;
          return;
        }
        const nextX = clamp(
          rotationRef.current.x - vY / 200,
          -maxVerticalRotationDeg,
          maxVerticalRotationDeg,
        );
        const nextY = wrapAngleSigned(rotationRef.current.y + vX / 200);
        rotationRef.current = { x: nextX, y: nextY };
        applyTransform(nextX, nextY);
        inertiaRAF.current = requestAnimationFrame(step);
      };
      stopInertia();
      inertiaRAF.current = requestAnimationFrame(step);
    },
    [dragDampening, maxVerticalRotationDeg, stopInertia],
  );

  // Enhanced gesture handling with better tap detection for mobile/tablets
  useGesture(
    {
      onDragStart: ({ event }) => {
        if (focusedElRef.current) return;
        stopInertia();
        stopAutoSpin();

        pointerTypeRef.current = event.pointerType || "mouse";
        if (pointerTypeRef.current === "touch") {
          event.preventDefault();
          lockScroll();
        }

        draggingRef.current = true;
        cancelTapRef.current = false;
        movedRef.current = false;
        startRotRef.current = { ...rotationRef.current };
        startPosRef.current = { x: event.clientX, y: event.clientY };
        const potential = event.target.closest?.(".item__image");
        tapTargetRef.current = potential || null;

        setIsVerticalScrolling(false);
        lastUserInteraction.current = Date.now();
      },
      onDrag: ({
        event,
        last,
        velocity: velArr = [0, 0],
        direction: dirArr = [0, 0],
        movement,
      }) => {
        if (
          focusedElRef.current ||
          !draggingRef.current ||
          !startPosRef.current
        )
          return;

        if (pointerTypeRef.current === "touch") event.preventDefault();

        const [dirX, dirY] = dirArr;
        const isVerticalScroll = Math.abs(dirY) > Math.abs(dirX);
        const verticalMovement = Math.abs(movement[1]);
        const horizontalMovement = Math.abs(movement[0]);

        if (
          pointerTypeRef.current === "touch" &&
          isVerticalScroll &&
          verticalMovement > 25 &&
          verticalMovement > horizontalMovement * 2
        ) {
          setIsVerticalScrolling(true);
          draggingRef.current = false;
          startPosRef.current = null;
          cancelTapRef.current = true;
          unlockScroll();
          return;
        }

        const dxTotal = event.clientX - startPosRef.current.x;
        const dyTotal = event.clientY - startPosRef.current.y;

        if (!movedRef.current) {
          const dist2 = dxTotal * dxTotal + dyTotal * dyTotal;
          const MOVEMENT_THRESHOLD =
            pointerTypeRef.current === "touch" ? 100 : 25;
          if (dist2 > MOVEMENT_THRESHOLD) {
            movedRef.current = true;
            cancelTapRef.current = true;
          }
        }

        if (!isVerticalScrolling) {
          const nextX = clamp(
            startRotRef.current.x - dyTotal / dragSensitivity,
            -maxVerticalRotationDeg,
            maxVerticalRotationDeg,
          );
          const nextY = startRotRef.current.y + dxTotal / dragSensitivity;

          const cur = rotationRef.current;
          if (cur.x !== nextX || cur.y !== nextY) {
            rotationRef.current = { x: nextX, y: nextY };
            applyTransform(nextX, nextY);
          }
        }

        if (last) {
          draggingRef.current = false;
          let isTap = false;

          if (startPosRef.current && !cancelTapRef.current) {
            const dx = event.clientX - startPosRef.current.x;
            const dy = event.clientY - startPosRef.current.y;
            const dist2 = dx * dx + dy * dy;
            const TAP_THRESH_PX = pointerTypeRef.current === "touch" ? 20 : 8;
            if (dist2 <= TAP_THRESH_PX * TAP_THRESH_PX && !movedRef.current) {
              isTap = true;
            }
          }

          if (!isVerticalScrolling) {
            let [vMagX, vMagY] = velArr;
            const [dirX, dirY] = dirArr;
            let vx = vMagX * dirX;
            let vy = vMagY * dirY;

            if (
              !isTap &&
              Math.abs(vx) < 0.001 &&
              Math.abs(vy) < 0.001 &&
              Array.isArray(movement)
            ) {
              const [mx, my] = movement;
              vx = (mx / dragSensitivity) * 0.02;
              vy = (my / dragSensitivity) * 0.02;
            }

            if (!isTap && (Math.abs(vx) > 0.005 || Math.abs(vy) > 0.005)) {
              startInertia(vx, vy);
            }
          }

          startPosRef.current = null;

          if (
            isTap &&
            tapTargetRef.current &&
            !focusedElRef.current &&
            !cancelTapRef.current
          ) {
            requestAnimationFrame(() => {
              if (!cancelTapRef.current && tapTargetRef.current) {
                openItemFromElement(tapTargetRef.current);
              }
            });
          }
          tapTargetRef.current = null;

          if (cancelTapRef.current)
            setTimeout(() => (cancelTapRef.current = false), 100);
          if (movedRef.current) lastDragEndAt.current = performance.now();
          movedRef.current = false;
          if (pointerTypeRef.current === "touch") unlockScroll();

          lastUserInteraction.current = Date.now();
          setTimeout(() => {
            if (
              !draggingRef.current &&
              !focusedElRef.current &&
              !fullscreenImage
            ) {
              startAutoSpin();
            }
          }, 1000);
        }
      },
    },
    {
      target: mainRef,
      eventOptions: { passive: false },
      drag: {
        filterTaps: true,
        threshold: 15,
        delay: 150,
      },
    },
  );

  // Reset vertical scrolling state after a delay
  useEffect(() => {
    if (isVerticalScrolling) {
      const timer = setTimeout(() => {
        setIsVerticalScrolling(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isVerticalScrolling]);

  useEffect(() => {
    const scrim = scrimRef.current;
    if (!scrim) return;

    const close = () => {
      if (performance.now() - openStartedAtRef.current < 250) return;

      handleCloseFullscreen();

      const el = focusedElRef.current;
      if (!el) return;
      const parent = el.parentElement;
      const overlay = viewerRef.current?.querySelector(".enlarge");
      if (!overlay) return;

      const refDiv = parent.querySelector(".item__image--reference");

      const originalPos = originalTilePositionRef.current;
      if (!originalPos) {
        overlay.remove();
        if (refDiv) refDiv.remove();
        parent.style.setProperty("--rot-y-delta", `0deg`);
        parent.style.setProperty("--rot-x-delta", `0deg`);
        el.style.visibility = "";
        el.style.zIndex = 0;
        focusedElRef.current = null;
        rootRef.current?.removeAttribute("data-enlarging");
        openingRef.current = false;
        return;
      }

      const currentRect = overlay.getBoundingClientRect();
      const rootRect = rootRef.current.getBoundingClientRect();

      const originalPosRelativeToRoot = {
        left: originalPos.left - rootRect.left,
        top: originalPos.top - rootRect.top,
        width: originalPos.width,
        height: originalPos.height,
      };

      const overlayRelativeToRoot = {
        left: currentRect.left - rootRect.left,
        top: currentRect.top - rootRect.top,
        width: currentRect.width,
        height: currentRect.height,
      };

      const animatingOverlay = document.createElement("div");
      animatingOverlay.className = "enlarge-closing";
      animatingOverlay.style.cssText = `
        position: absolute;
        left: ${overlayRelativeToRoot.left}px;
        top: ${overlayRelativeToRoot.top}px;
        width: ${overlayRelativeToRoot.width}px;
        height: ${overlayRelativeToRoot.height}px;
        z-index: 9999;
        border-radius: ${openedImageBorderRadius};
        overflow: hidden;
        box-shadow: 0 10px 30px rgba(0,0,0,.35);
        transition: all ${enlargeTransitionMs}ms ease-out;
        pointer-events: none;
        margin: 0;
        transform: none;
        filter: ${grayscale ? "grayscale(1)" : "none"};
      `;

      const originalImg = overlay.querySelector("img");
      if (originalImg) {
        const img = originalImg.cloneNode();
        img.style.cssText = "width: 100%; height: 100%; object-fit: cover;";
        animatingOverlay.appendChild(img);
      }

      overlay.remove();
      rootRef.current.appendChild(animatingOverlay);

      void animatingOverlay.getBoundingClientRect();

      requestAnimationFrame(() => {
        animatingOverlay.style.left = originalPosRelativeToRoot.left + "px";
        animatingOverlay.style.top = originalPosRelativeToRoot.top + "px";
        animatingOverlay.style.width = originalPosRelativeToRoot.width + "px";
        animatingOverlay.style.height = originalPosRelativeToRoot.height + "px";
        animatingOverlay.style.opacity = "0";
      });

      const cleanup = () => {
        animatingOverlay.remove();
        originalTilePositionRef.current = null;

        if (refDiv) refDiv.remove();
        parent.style.transition = "none";
        el.style.transition = "none";

        parent.style.setProperty("--rot-y-delta", `0deg`);
        parent.style.setProperty("--rot-x-delta", `0deg`);

        requestAnimationFrame(() => {
          el.style.visibility = "";
          el.style.opacity = "0";
          el.style.zIndex = 0;
          focusedElRef.current = null;
          rootRef.current?.removeAttribute("data-enlarging");

          requestAnimationFrame(() => {
            parent.style.transition = "";
            el.style.transition = "opacity 300ms ease-out";

            requestAnimationFrame(() => {
              el.style.opacity = "1";
              setTimeout(() => {
                el.style.transition = "";
                el.style.opacity = "";
                openingRef.current = false;
                if (
                  !draggingRef.current &&
                  rootRef.current?.getAttribute("data-enlarging") !== "true"
                )
                  document.body.classList.remove("dg-scroll-lock");
              }, 300);
            });
          });
        });
      };

      animatingOverlay.addEventListener("transitionend", cleanup, {
        once: true,
      });
    };

    scrim.addEventListener("click", close);
    const onKey = (e) => {
      if (e.key === "Escape") {
        if (fullscreenImage) {
          handleCloseFullscreen();
        } else {
          close();
        }
      }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      scrim.removeEventListener("click", close);
      window.removeEventListener("keydown", onKey);
    };
  }, [
    enlargeTransitionMs,
    openedImageBorderRadius,
    grayscale,
    fullscreenImage,
  ]);

  const openItemFromElement = (el) => {
    if (!el || cancelTapRef.current) return;
    if (openingRef.current) return;
    openingRef.current = true;
    openStartedAtRef.current = performance.now();
    lockScroll();

    const parent = el.parentElement;
    const rawSrc = parent.dataset.src || el.querySelector("img")?.src || "";
    const rawAlt = parent.dataset.alt || el.querySelector("img")?.alt || "";

    setFullscreenImage({ src: rawSrc, alt: rawAlt });
    setIsClosing(false);

    if (onExpandChange) onExpandChange(true);

    openingRef.current = false;
    unlockScroll();
  };

  const handleCloseFullscreen = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setFullscreenImage(null);
      setIsClosing(false);

      if (onExpandChange) onExpandChange(false);
    }, enlargeTransitionMs);
  }, [enlargeTransitionMs, onExpandChange]);

  const FullscreenView = () => {
    if (!fullscreenImage) return null;

    return (
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm ${
          isClosing ? "fullscreen-closing" : "fullscreen-opening"
        }`}
        onClick={handleCloseFullscreen}
      >
        <button
          className={`absolute top-6 right-6 z-10 text-white bg-black/50 hover:bg-black/70 rounded-full p-3 transition-all duration-200 hover:scale-110 ${
            isClosing ? "close-btn-closing" : "close-btn-opening"
          }`}
          onClick={handleCloseFullscreen}
          aria-label="Close image"
        >
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div
          className="relative max-w-4xl max-h-[85vh] w-full mx-8 flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={fullscreenImage.src}
            alt={fullscreenImage.alt}
            className={`w-auto h-auto max-w-full max-h-full object-contain rounded-lg shadow-2xl ${
              isClosing ? "image-closing" : "image-opening"
            }`}
            style={{
              maxHeight: "85vh",
              filter: grayscale ? "grayscale(1)" : "none",
            }}
          />
        </div>
      </div>
    );
  };

  const cssStyles = `
    .sphere-root {
      --radius: 520px;
      --viewer-pad: 72px;
      --circ: calc(var(--radius) * 3.14);
      --rot-y: calc((360deg / var(--segments-x)) / 2);
      --rot-x: calc((360deg / var(--segments-y)) / 2);
      --item-width: calc(var(--circ) / var(--segments-x));
      --item-height: calc(var(--circ) / var(--segments-y));
    }

    /* Enable vertical scrolling for ALL touch devices (mobile + tablets) */
    @media (hover: none) and (pointer: coarse) {
      .sphere-root main {
        touch-action: pan-y !important;
        -webkit-overflow-scrolling: touch !important;
        overscroll-behavior: contain !important;
      }
      
      /* Additional optimization for tablets */
      @media (min-width: 769px) and (max-width: 1024px) {
        .sphere-root main {
          touch-action: pan-y !important;
        }
        
        .item__image {
          touch-action: manipulation;
        }
      }
    }

    /* Alternative detection for touch devices */
    @media (pointer: coarse) {
      .sphere-root main {
        touch-action: pan-y !important;
      }
    }

    /* Fix shadow visibility on mobile */
    @media (max-width: 768px) {
      .sphere-root .item__image {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
        -webkit-box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
      }
      
      .sphere-root .enlarge-closing {
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4) !important;
        -webkit-box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4) !important;
      }
      
      /* Enhanced gradients for better visibility on mobile */
      .sphere-root .absolute.inset-0.m-auto.z-\\[3\\] {
        background-image: radial-gradient(rgba(235, 235, 235, 0) 55%, var(--overlay-blur-color, #000000) 95%) !important;
      }
      
      .sphere-root .absolute.left-0.right-0.top-0.h-\\[120px\\],
      .sphere-root .absolute.left-0.right-0.bottom-0.h-\\[120px\\] {
        background: linear-gradient(to bottom, transparent, var(--overlay-blur-color, #000000) 80%) !important;
        opacity: 0.8 !important;
      }
    }

    /* Fullscreen Open Animations */
    .fullscreen-opening {
      animation: fadeIn ${enlargeTransitionMs}ms ease-out;
    }

    .close-btn-opening {
      animation: slideInTop ${enlargeTransitionMs}ms ease-out 0.1s both;
    }

    .image-opening {
      animation: scaleIn ${enlargeTransitionMs}ms ease-out;
    }

    /* Fullscreen Close Animations */
    .fullscreen-closing {
      animation: fadeOut ${enlargeTransitionMs}ms ease-out;
    }

    .close-btn-closing {
      animation: slideOutTop ${enlargeTransitionMs}ms ease-out;
    }

    .image-closing {
      animation: scaleOut ${enlargeTransitionMs}ms ease-out;
    }

    @keyframes fadeIn {
      0% {
        opacity: 0;
      }
      100% {
        opacity: 1;
      }
    }

    @keyframes fadeOut {
      0% {
        opacity: 1;
      }
      100% {
        opacity: 0;
      }
    }

    @keyframes scaleIn {
      0% {
        opacity: 0;
        transform: scale(0.5);
      }
      100% {
        opacity: 1;
        transform: scale(1);
      }
    }

    @keyframes scaleOut {
      0% {
        opacity: 1;
        transform: scale(1);
      }
      100% {
        opacity: 0;
        transform: scale(0.5);
      }
    }

    @keyframes slideInTop {
      0% {
        opacity: 0;
        transform: translateY(-20px);
      }
      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes slideOutTop {
      0% {
        opacity: 1;
        transform: translateY(0);
      }
      100% {
        opacity: 0;
        transform: translateY(-20px);
      }
    }
    
    .sphere-root * {
      box-sizing: border-box;
    }
    .sphere, .sphere-item, .item__image { transform-style: preserve-3d; }
    
    .stage {
      width: 100%;
      height: 100%;
      display: grid;
      place-items: center;
      position: absolute;
      inset: 0;
      margin: auto;
      perspective: calc(var(--radius) * 2);
      perspective-origin: 50% 50%;
    }
    
    .sphere {
      transform: translateZ(calc(var(--radius) * -1));
      will-change: transform;
      position: absolute;
    }
    
    .sphere-item {
      width: calc(var(--item-width) * var(--item-size-x));
      height: calc(var(--item-height) * var(--item-size-y));
      position: absolute;
      top: -999px;
      bottom: -999px;
      left: -999px;
      right: -999px;
      margin: auto;
      transform-origin: 50% 50%;
      backface-visibility: hidden;
      transition: transform 300ms;
      transform: rotateY(calc(var(--rot-y) * (var(--offset-x) + ((var(--item-size-x) - 1) / 2)) + var(--rot-y-delta, 0deg))) 
                 rotateX(calc(var(--rot-x) * (var(--offset-y) - ((var(--item-size-y) - 1) / 2)) + var(--rot-x-delta, 0deg))) 
                 translateZ(var(--radius));
    }
    
    .sphere-root[data-enlarging="true"] .scrim {
      opacity: 1 !important;
      pointer-events: all !important;
    }
    
    @media (max-aspect-ratio: 1/1) {
      .viewer-frame {
        height: auto !important;
        width: 100% !important;
      }
    }
    
    .item__image {
      position: absolute;
      inset: 10px;
      border-radius: var(--tile-radius, 12px);
      overflow: hidden;
      cursor: pointer;
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
      transition: transform 300ms;
      pointer-events: auto;
      -webkit-transform: translateZ(0);
      transform: translateZ(0);
      touch-action: manipulation;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
      -webkit-box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
    }
    .item__image--reference {
      position: absolute;
      inset: 10px;
      pointer-events: none;
    }
  `;

  return (
    <>
      <FullscreenView />
      <style dangerouslySetInnerHTML={{ __html: cssStyles }} />
      <div
        ref={rootRef}
        className="sphere-root relative w-full h-full overflow-hidden"
        style={{
          ["--segments-x"]: segments,
          ["--segments-y"]: segments,
          ["--overlay-blur-color"]: overlayBlurColor,
          ["--tile-radius"]: imageBorderRadius,
          ["--enlarge-radius"]: openedImageBorderRadius,
          ["--image-filter"]: grayscale ? "grayscale(1)" : "none",
        }}
      >
        <main
          ref={mainRef}
          className="absolute inset-0 grid place-items-center overflow-hidden select-none bg-transparent my-5 mb-10"
          style={{
            touchAction: "none",
            WebkitUserSelect: "none",
          }}
        >
          <div className="stage">
            <div ref={sphereRef} className="sphere">
              {items.map((it, i) => (
                <div
                  key={`${it.x},${it.y},${i}`}
                  className="sphere-item absolute m-auto"
                  data-src={it.src}
                  data-alt={it.alt}
                  data-offset-x={it.x}
                  data-offset-y={it.y}
                  data-size-x={it.sizeX}
                  data-size-y={it.sizeY}
                  style={{
                    ["--offset-x"]: it.x,
                    ["--offset-y"]: it.y,
                    ["--item-size-x"]: it.sizeX,
                    ["--item-size-y"]: it.sizeY,
                    top: "-999px",
                    bottom: "-999px",
                    left: "-999px",
                    right: "-999px",
                  }}
                >
                  <div
                    className="item__image absolute block overflow-hidden cursor-pointer bg-gray-200 transition-transform duration-300"
                    role="button"
                    tabIndex={0}
                    aria-label={it.alt || "Open image"}
                    onTouchStart={(e) => {
                      e.preventDefault();
                    }}
                    onTouchEnd={(e) => {
                      if (performance.now() - lastDragEndAt.current < 150)
                        return;
                      if (cancelTapRef.current) return;

                      const touch = e.changedTouches[0];
                      const startTouch = startPosRef.current;

                      if (startTouch) {
                        const dx = touch.clientX - startTouch.x;
                        const dy = touch.clientY - startTouch.y;
                        const dist2 = dx * dx + dy * dy;

                        if (dist2 <= 225) {
                          openItemFromElement(e.currentTarget);
                        }
                      } else {
                        openItemFromElement(e.currentTarget);
                      }
                    }}
                    onClick={(e) => {
                      if (performance.now() - lastDragEndAt.current < 150)
                        return;
                      if (pointerTypeRef.current === "touch") {
                        e.preventDefault();
                        return;
                      }
                      openItemFromElement(e.currentTarget);
                    }}
                    style={{
                      inset: "10px",
                      borderRadius: `var(--tile-radius, ${imageBorderRadius})`,
                      backfaceVisibility: "hidden",
                    }}
                  >
                    {it.src && (
                      <img
                        src={it.src}
                        draggable={false}
                        alt={it.alt}
                        className="w-full h-full object-cover pointer-events-none"
                        style={{
                          backfaceVisibility: "hidden",
                          filter: `var(--image-filter, ${grayscale ? "grayscale(1)" : "none"})`,
                        }}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            className="absolute inset-0 m-auto z-3 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(rgba(235, 235, 235, 0) 65%, var(--overlay-blur-color, ${overlayBlurColor}) 100%)`,
            }}
          />

          <div
            className="absolute inset-0 m-auto z-3 pointer-events-none"
            style={{
              WebkitMaskImage: `radial-gradient(rgba(235, 235, 235, 0) 70%, var(--overlay-blur-color, ${overlayBlurColor}) 90%)`,
              maskImage: `radial-gradient(rgba(235, 235, 235, 0) 70%, var(--overlay-blur-color, ${overlayBlurColor}) 90%)`,
              backdropFilter: "blur(3px)",
            }}
          />

          <div
            className="absolute left-0 right-0 top-0 h-30 z-5 pointer-events-none rotate-180"
            style={{
              background: `linear-gradient(to bottom, transparent, var(--overlay-blur-color, ${overlayBlurColor}))`,
            }}
          />
          <div
            className="absolute left-0 right-0 bottom-0 h-30 z-5 pointer-events-none"
            style={{
              background: `linear-gradient(to bottom, transparent, var(--overlay-blur-color, ${overlayBlurColor}))`,
            }}
          />

          <div
            ref={viewerRef}
            className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center"
            style={{ padding: "var(--viewer-pad)" }}
          >
            <div
              ref={scrimRef}
              className="scrim absolute inset-0 z-10 pointer-events-none opacity-0 transition-opacity duration-500"
              style={{
                background: "rgba(0, 0, 0, 0.4)",
                backdropFilter: "blur(3px)",
              }}
            />
            <div
              ref={frameRef}
              className="viewer-frame h-full aspect-square flex"
              style={{
                borderRadius: `var(--enlarge-radius, ${openedImageBorderRadius})`,
              }}
            />
          </div>
        </main>
      </div>
    </>
  );
}
