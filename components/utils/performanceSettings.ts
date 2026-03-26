// utils/performanceSettings.ts

export type PerformanceTier = "low" | "medium" | "high";

export interface PerformanceSettings {
  antialias: boolean;
  bloom: boolean;
  shadows: boolean;
  ambient: number;
  env:
    | "sunset"
    | "city"
    | "dawn"
    | "night"
    | "warehouse"
    | "forest"
    | "apartment"
    | "studio"
    | "park"
    | "lobby";
  scale: number;
  dprMax: number;
  multisampling: number;
  powerPreference: "low-power" | "default" | "high-performance";
  envResolution: number;
  bloomIntensity: number;
  bloomThreshold: number;
  bloomSmoothing: number;
}

export async function detectPerformanceTier(): Promise<PerformanceTier> {
  const canvas = document.createElement("canvas");
  const gl =
    (canvas.getContext("webgl2") ??
      canvas.getContext("webgl")) as WebGLRenderingContext | null;

  if (!gl) {
    canvas.remove();
    return "low";
  }

  const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
  const renderer: string = debugInfo
    ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
    : "";

  const rendererLower = renderer.toLowerCase();

  // Clean up the temporary canvas and context
  const loseContext = gl.getExtension("WEBGL_lose_context");
  if (loseContext) {
    loseContext.loseContext();
  }
  canvas.remove();

  // 🔹 High-end GPUs
  if (
    rendererLower.includes("rtx") ||
    rendererLower.includes("gtx") ||
    rendererLower.includes("radeon") ||
    rendererLower.includes("rx ") ||
    rendererLower.includes("vega") ||
    rendererLower.includes("navi") ||
    rendererLower.includes("rdna") ||
    rendererLower.includes("arc")
  ) {
    return "high";
  }

  // 🔹 Low-end GPUs
  if (
    rendererLower.includes("iris xe") ||
    rendererLower.includes("iris plus") ||
    (rendererLower.includes("uhd graphics") &&
      (rendererLower.includes("620") ||
        rendererLower.includes("630") ||
        rendererLower.includes("640") ||
        rendererLower.includes("650"))) ||
    (rendererLower.includes("intel") &&
      (rendererLower.includes("hd graphics") ||
        rendererLower.includes("hd 4000") ||
        rendererLower.includes("hd 5000")))
  ) {
    return "low";
  }

  // 🔹 Default → Medium
  return "medium";
}

export function getPerformanceSettings(tier: string): PerformanceSettings {
  const presets: Record<PerformanceTier, PerformanceSettings> = {
    low: {
      antialias: false,
      bloom: false,
      shadows: false,
      ambient: 1,
      env: "warehouse",
      scale: 6.5,
      dprMax: 1.2,
      multisampling: 0,
      powerPreference: "low-power",
      envResolution: 128,
      bloomIntensity: 0.0,
      bloomThreshold: 0.3,
      bloomSmoothing: 0.9,
    },
    medium: {
      antialias: true,
      bloom: true,
      shadows: true,
      ambient: 3.5,
      env: "warehouse",
      scale: 6.5,
      dprMax: 1.5,
      multisampling: 2,
      powerPreference: "high-performance",
      envResolution: 256,
      bloomIntensity: 0.05,
      bloomThreshold: 0.25,
      bloomSmoothing: 0.9,
    },
    high: {
      antialias: true,
      bloom: true,
      shadows: true,
      ambient: 5,
      env: "warehouse",
      scale: 6.5,
      dprMax: 2,
      multisampling: 4,
      powerPreference: "high-performance",
      envResolution: 512,
      bloomIntensity: 0.06,
      bloomThreshold: 0.2,
      bloomSmoothing: 0.9,
    },
  };

  return presets[(tier as PerformanceTier)] ?? presets["medium"];
}
