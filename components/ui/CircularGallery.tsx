"use client";

import { Camera, Mesh, Plane, Program, Renderer, Texture, Transform } from "ogl";
import { useEffect, useMemo, useRef, useState } from "react";

type GL = Renderer["gl"];

interface GalleryItem {
  image: string;
  title: string;
  description: string;
  category: string;
}

interface GalleryItemInput {
  image: string;
  text?: string;
  title?: string;
  description?: string;
  category?: string;
}

interface ScreenSize {
  width: number;
  height: number;
}

interface Viewport {
  width: number;
  height: number;
}

interface MediaProps {
  geometry: Plane;
  gl: GL;
  image: string;
  index: number;
  length: number;
  scene: Transform;
  screen: ScreenSize;
  viewport: Viewport;
  bend: number;
  borderRadius: number;
  gapPx: number;
  cardsOnScreen: number;
}

interface LayoutMetrics {
  cardWidthPx: number;
}

interface AppConfig {
  items: GalleryItem[];
  bend: number;
  borderRadius: number;
  scrollSpeed: number;
  scrollEase: number;
  cardsOnScreen: number;
  gapPx: number;
  onActiveItemChange?: (index: number) => void;
  onLayoutChange?: (metrics: LayoutMetrics) => void;
}

function debounce<T extends (...args: any[]) => void>(func: T, wait: number) {
  let timeout = 0;
  return function (this: any, ...args: Parameters<T>) {
    window.clearTimeout(timeout);
    timeout = window.setTimeout(() => func.apply(this, args), wait);
  };
}

function lerp(p1: number, p2: number, t: number): number {
  return p1 + (p2 - p1) * t;
}

function defaultItems(): GalleryItem[] {
  return [
    {
      image: "https://picsum.photos/seed/kidzcare1/1400/900",
      title: "Kidzcare Brand Awareness",
      description: "Produced a showcase video that significantly increased Kidzcare's brand reach.",
      category: "Baby & Mother Care Retail Promotion",
    },
    {
      image: "https://picsum.photos/seed/kidzcare2/1400/900",
      title: "Community Initiative Campaign",
      description: "Built narrative visuals that made public health programs easier to understand.",
      category: "Community Engagement Media",
    },
    {
      image: "https://picsum.photos/seed/kidzcare3/1400/900",
      title: "Healthcare Team Spotlight",
      description: "Captured authentic client interactions to strengthen trust and brand credibility.",
      category: "Healthcare Brand Storytelling",
    },
  ];
}

function normalizeItems(items?: GalleryItemInput[]): GalleryItem[] {
  if (!items || items.length === 0) return defaultItems();

  return items.map((item, index) => ({
    image: item.image,
    title: item.title ?? item.text ?? `Gallery Item ${index + 1}`,
    description: item.description ?? "Campaign content for this featured gallery item.",
    category: item.category ?? "Brand Promotion",
  }));
}

class Media {
  extra = 0;
  geometry: Plane;
  gl: GL;
  image: string;
  index: number;
  length: number;
  scene: Transform;
  screen: ScreenSize;
  viewport: Viewport;
  bend: number;
  borderRadius: number;
  gapPx: number;
  cardsOnScreen: number;

  program!: Program;
  plane!: Mesh;
  width = 0;
  widthTotal = 0;
  x = 0;
  speed = 0;
  isBefore = false;
  isAfter = false;

  constructor({
    geometry,
    gl,
    image,
    index,
    length,
    scene,
    screen,
    viewport,
    bend,
    borderRadius,
    gapPx,
    cardsOnScreen,
  }: MediaProps) {
    this.geometry = geometry;
    this.gl = gl;
    this.image = image;
    this.index = index;
    this.length = length;
    this.scene = scene;
    this.screen = screen;
    this.viewport = viewport;
    this.bend = bend;
    this.borderRadius = borderRadius;
    this.gapPx = gapPx;
    this.cardsOnScreen = cardsOnScreen;

    this.createShader();
    this.createMesh();
    this.onResize();
  }

  createShader() {
    const texture = new Texture(this.gl, { generateMipmaps: true });

    this.program = new Program(this.gl, {
      depthTest: false,
      depthWrite: false,
      vertex: `
        precision highp float;
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform float uTime;
        uniform float uSpeed;
        varying vec2 vUv;

        void main() {
          vUv = uv;
          vec3 p = position;
          p.z = (sin(p.x * 3.0 + uTime) * 0.15 + cos(p.y * 2.0 + uTime) * 0.15) * (0.02 + abs(uSpeed) * 0.08);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform vec2 uImageSizes;
        uniform vec2 uPlaneSizes;
        uniform sampler2D tMap;
        uniform float uBorderRadius;
        varying vec2 vUv;

        float roundedBoxSDF(vec2 p, vec2 b, float r) {
          vec2 d = abs(p) - b;
          return length(max(d, vec2(0.0))) + min(max(d.x, d.y), 0.0) - r;
        }

        void main() {
          vec2 ratio = vec2(
            min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
            min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
          );

          vec2 uv = vec2(
            vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
            vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
          );

          vec4 color = texture2D(tMap, uv);

          float d = roundedBoxSDF(vUv - 0.5, vec2(0.5 - uBorderRadius), uBorderRadius);
          float edgeSmooth = 0.002;
          float alpha = 1.0 - smoothstep(-edgeSmooth, edgeSmooth, d);

          gl_FragColor = vec4(color.rgb, alpha);
        }
      `,
      uniforms: {
        tMap: { value: texture },
        uPlaneSizes: { value: [0, 0] },
        uImageSizes: { value: [0, 0] },
        uSpeed: { value: 0 },
        uTime: { value: 100 * Math.random() },
        uBorderRadius: { value: this.borderRadius },
      },
      transparent: true,
    });

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = this.image;
    img.onload = () => {
      texture.image = img;
      this.program.uniforms.uImageSizes.value = [img.naturalWidth, img.naturalHeight];
    };
  }

  createMesh() {
    this.plane = new Mesh(this.gl, {
      geometry: this.geometry,
      program: this.program,
    });
    this.plane.setParent(this.scene);
  }

  update(scroll: { current: number; last: number }, direction: "right" | "left") {
    this.plane.position.x = this.x - scroll.current - this.extra;

    const x = this.plane.position.x;
    const halfViewport = this.viewport.width / 2;

    if (this.bend === 0) {
      this.plane.position.y = 0;
      this.plane.rotation.z = 0;
    } else {
      const bendAbs = Math.abs(this.bend);
      const radius = (halfViewport * halfViewport + bendAbs * bendAbs) / (2 * bendAbs);
      const effectiveX = Math.min(Math.abs(x), halfViewport);
      const arc = radius - Math.sqrt(radius * radius - effectiveX * effectiveX);

      if (this.bend > 0) {
        this.plane.position.y = -arc;
        this.plane.rotation.z = -Math.sign(x) * Math.asin(effectiveX / radius);
      } else {
        this.plane.position.y = arc;
        this.plane.rotation.z = Math.sign(x) * Math.asin(effectiveX / radius);
      }
    }

    this.speed = scroll.current - scroll.last;
    this.program.uniforms.uTime.value += 0.03;
    this.program.uniforms.uSpeed.value = this.speed;

    const planeOffset = this.plane.scale.x / 2;
    const viewportOffset = this.viewport.width / 2;

    this.isBefore = this.plane.position.x + planeOffset < -viewportOffset;
    this.isAfter = this.plane.position.x - planeOffset > viewportOffset;

    if (direction === "right" && this.isBefore) {
      this.extra -= this.widthTotal;
      this.isBefore = false;
      this.isAfter = false;
    }

    if (direction === "left" && this.isAfter) {
      this.extra += this.widthTotal;
      this.isBefore = false;
      this.isAfter = false;
    }
  }

  onResize({ screen, viewport }: { screen?: ScreenSize; viewport?: Viewport } = {}) {
    if (screen) this.screen = screen;
    if (viewport) this.viewport = viewport;

    const isMobile = this.screen.width < 768;
    const cards = isMobile ? 1 : this.cardsOnScreen;
    const gapPx = isMobile ? 12 : this.gapPx;

    const cardWidthPxBase = (this.screen.width - gapPx * (cards - 1)) / cards;
    const cardWidthPx = isMobile ? cardWidthPxBase : cardWidthPxBase * 0.92;
    const cardHeightPx = cardWidthPx / 1.56;

    const worldPerPxX = this.viewport.width / this.screen.width;
    const worldPerPxY = this.viewport.height / this.screen.height;

    this.plane.scale.x = cardWidthPx * worldPerPxX;
    this.plane.scale.y = cardHeightPx * worldPerPxY;
    this.program.uniforms.uPlaneSizes.value = [this.plane.scale.x, this.plane.scale.y];

    const gapWorld = gapPx * worldPerPxX;
    this.width = this.plane.scale.x + gapWorld;
    this.widthTotal = this.width * this.length;
    this.x = this.width * this.index;
  }

  getCardWidthPx() {
    return this.plane.scale.x * (this.screen.width / this.viewport.width);
  }
}

class App {
  container: HTMLElement;
  renderer!: Renderer;
  gl!: GL;
  camera!: Camera;
  scene!: Transform;
  planeGeometry!: Plane;

  scrollSpeed: number;
  scroll: {
    ease: number;
    current: number;
    target: number;
    last: number;
    position?: number;
  };

  medias: Media[] = [];
  mediasImages: GalleryItem[] = [];
  baseItemLength = 0;
  activeIndex = -1;

  onActiveItemChange?: (index: number) => void;
  onLayoutChange?: (metrics: LayoutMetrics) => void;

  screen!: ScreenSize;
  viewport!: Viewport;
  raf = 0;

  boundOnResize!: () => void;
  boundOnWheel!: (e: Event) => void;
  boundOnTouchDown!: (e: MouseEvent | TouchEvent) => void;
  boundOnTouchMove!: (e: MouseEvent | TouchEvent) => void;
  boundOnTouchUp!: () => void;

  onCheckDebounce: (...args: any[]) => void;

  isDown = false;
  start = 0;

  constructor(
    container: HTMLElement,
    {
      items,
      bend,
      borderRadius,
      scrollSpeed,
      scrollEase,
      cardsOnScreen,
      gapPx,
      onActiveItemChange,
      onLayoutChange,
    }: AppConfig
  ) {
    this.container = container;
    this.scrollSpeed = scrollSpeed;
    this.scroll = { ease: scrollEase, current: 0, target: 0, last: 0 };
    this.onActiveItemChange = onActiveItemChange;
    this.onLayoutChange = onLayoutChange;
    this.onCheckDebounce = debounce(this.onCheck.bind(this), 140);

    this.createRenderer();
    this.createCamera();
    this.createScene();
    this.onResize();
    this.createGeometry();
    this.createMedias(items, bend, borderRadius, cardsOnScreen, gapPx);
    this.emitActiveItem();
    this.emitLayoutMetrics();
    this.update();
    this.addEventListeners();
  }

  createRenderer() {
    this.renderer = new Renderer({
      alpha: true,
      antialias: true,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
    });

    this.gl = this.renderer.gl;
    this.gl.clearColor(0, 0, 0, 0);
    this.container.appendChild(this.renderer.gl.canvas as HTMLCanvasElement);
  }

  createCamera() {
    this.camera = new Camera(this.gl);
    this.camera.fov = 45;
    this.camera.position.z = 20;
  }

  createScene() {
    this.scene = new Transform();
  }

  createGeometry() {
    this.planeGeometry = new Plane(this.gl, {
      heightSegments: 40,
      widthSegments: 72,
    });
  }

  createMedias(items: GalleryItem[], bend: number, borderRadius: number, cardsOnScreen: number, gapPx: number) {
    const sourceItems = items.length ? items : defaultItems();
    this.baseItemLength = sourceItems.length;

    this.mediasImages = sourceItems.concat(sourceItems);

    this.medias = this.mediasImages.map((item, index) =>
      new Media({
        geometry: this.planeGeometry,
        gl: this.gl,
        image: item.image,
        index,
        length: this.mediasImages.length,
        scene: this.scene,
        screen: this.screen,
        viewport: this.viewport,
        bend,
        borderRadius,
        gapPx,
        cardsOnScreen,
      })
    );
  }

  emitActiveItem() {
    if (!this.onActiveItemChange || !this.medias[0] || this.baseItemLength === 0) return;

    const width = this.medias[0].width;
    const rawIndex = Math.round(this.scroll.current / width);
    const normalizedIndex = ((rawIndex % this.baseItemLength) + this.baseItemLength) % this.baseItemLength;

    if (normalizedIndex !== this.activeIndex) {
      this.activeIndex = normalizedIndex;
      this.onActiveItemChange(normalizedIndex);
    }
  }

  emitLayoutMetrics() {
    if (!this.onLayoutChange || !this.medias[0]) return;
    this.onLayoutChange({ cardWidthPx: this.medias[0].getCardWidthPx() });
  }

  onTouchDown(e: MouseEvent | TouchEvent) {
    this.isDown = true;
    this.scroll.position = this.scroll.current;
    this.start = "touches" in e ? e.touches[0].clientX : e.clientX;
  }

  onTouchMove(e: MouseEvent | TouchEvent) {
    if (!this.isDown) return;
    const x = "touches" in e ? e.touches[0].clientX : e.clientX;
    const distance = (this.start - x) * (this.scrollSpeed * 0.02);
    this.scroll.target = (this.scroll.position ?? 0) + distance;
  }

  onTouchUp() {
    this.isDown = false;
    this.onCheck();
  }

  onWheel(e: Event) {
    const wheelEvent = e as WheelEvent;
    const delta = wheelEvent.deltaY || (wheelEvent as any).wheelDelta || (wheelEvent as any).detail;
    this.scroll.target += (delta > 0 ? this.scrollSpeed : -this.scrollSpeed) * 0.2;
    this.onCheckDebounce();
  }

  onCheck() {
    if (!this.medias[0]) return;

    const width = this.medias[0].width;
    const itemIndex = Math.round(Math.abs(this.scroll.target) / width);
    const item = width * itemIndex;
    this.scroll.target = this.scroll.target < 0 ? -item : item;
  }

  onResize() {
    this.screen = {
      width: this.container.clientWidth,
      height: this.container.clientHeight,
    };

    this.renderer.setSize(this.screen.width, this.screen.height);
    this.camera.perspective({
      aspect: this.screen.width / this.screen.height,
    });

    const fov = (this.camera.fov * Math.PI) / 180;
    const viewportHeight = 2 * Math.tan(fov / 2) * this.camera.position.z;
    const viewportWidth = viewportHeight * this.camera.aspect;

    this.viewport = {
      width: viewportWidth,
      height: viewportHeight,
    };

    if (this.medias.length) {
      this.medias.forEach((media) => media.onResize({ screen: this.screen, viewport: this.viewport }));
      this.emitLayoutMetrics();
    }
  }

  update() {
    this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease);
    const direction = this.scroll.current > this.scroll.last ? "right" : "left";

    if (this.medias.length) {
      this.medias.forEach((media) => media.update(this.scroll, direction));
    }

    this.renderer.render({ scene: this.scene, camera: this.camera });
    this.scroll.last = this.scroll.current;
    this.emitActiveItem();
    this.raf = window.requestAnimationFrame(this.update.bind(this));
  }

  addEventListeners() {
    this.boundOnResize = this.onResize.bind(this);
    this.boundOnWheel = this.onWheel.bind(this);
    this.boundOnTouchDown = this.onTouchDown.bind(this);
    this.boundOnTouchMove = this.onTouchMove.bind(this);
    this.boundOnTouchUp = this.onTouchUp.bind(this);

    window.addEventListener("resize", this.boundOnResize);
    window.addEventListener("mousewheel", this.boundOnWheel);
    window.addEventListener("wheel", this.boundOnWheel);
    window.addEventListener("mousedown", this.boundOnTouchDown);
    window.addEventListener("mousemove", this.boundOnTouchMove);
    window.addEventListener("mouseup", this.boundOnTouchUp);
    window.addEventListener("touchstart", this.boundOnTouchDown);
    window.addEventListener("touchmove", this.boundOnTouchMove);
    window.addEventListener("touchend", this.boundOnTouchUp);
  }

  destroy() {
    window.cancelAnimationFrame(this.raf);
    window.removeEventListener("resize", this.boundOnResize);
    window.removeEventListener("mousewheel", this.boundOnWheel);
    window.removeEventListener("wheel", this.boundOnWheel);
    window.removeEventListener("mousedown", this.boundOnTouchDown);
    window.removeEventListener("mousemove", this.boundOnTouchMove);
    window.removeEventListener("mouseup", this.boundOnTouchUp);
    window.removeEventListener("touchstart", this.boundOnTouchDown);
    window.removeEventListener("touchmove", this.boundOnTouchMove);
    window.removeEventListener("touchend", this.boundOnTouchUp);

    if (this.renderer?.gl?.canvas?.parentNode) {
      this.renderer.gl.canvas.parentNode.removeChild(this.renderer.gl.canvas as HTMLCanvasElement);
    }
  }
}

interface CircularGalleryProps {
  items?: GalleryItemInput[];
  bend?: number;
  borderRadius?: number;
  scrollSpeed?: number;
  scrollEase?: number;
  cardsOnScreen?: number;
  gapPx?: number;
}

export default function CircularGallery({
  items,
  bend = 0.8,
  borderRadius = 0.055,
  scrollSpeed = 2.2,
  scrollEase = 0.06,
  cardsOnScreen = 3,
  gapPx = 24,
}: CircularGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const data = useMemo(() => normalizeItems(items), [items]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [captionWidth, setCaptionWidth] = useState<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const app = new App(containerRef.current, {
      items: data,
      bend,
      borderRadius,
      scrollSpeed,
      scrollEase,
      cardsOnScreen,
      gapPx,
      onActiveItemChange: setActiveIndex,
      onLayoutChange: ({ cardWidthPx }) => setCaptionWidth(cardWidthPx),
    });

    return () => app.destroy();
  }, [data, bend, borderRadius, scrollSpeed, scrollEase, cardsOnScreen, gapPx]);

  const activeItem = data[activeIndex] ?? data[0];
  const captionStyle = captionWidth ? { maxWidth: `${Math.round(captionWidth)}px` } : undefined;

  return (
    <section className="h-full w-full bg-black flex flex-col justify-center">
      <div ref={containerRef} className="h-[50%] min-h-[300px] w-full overflow-hidden cursor-grab active:cursor-grabbing" />

      <div className="mx-auto px-5 pb-16 pt-0 text-center sm:pt-2 md:pb-24" style={captionStyle}>
        <h3 className="text-lg font-bold tracking-wider text-brand md:text-2xl">
          {activeItem.title}
        </h3>
        <p className="mt-2 text-base leading-[1.3] text-white/92 sm:text-xl">
          {activeItem.description}
        </p>
        <p className="mt-2 text-sm leading-[1.3] text-white/60 sm:text-base">{activeItem.category}</p>
      </div>
    </section>
  );
}
