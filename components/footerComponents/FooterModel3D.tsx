"use client";
// FooterModel3D.tsx
import { Suspense, useEffect, useMemo, useRef, useState, lazy } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, useGLTF } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import {
  detectPerformanceTier,
  getPerformanceSettings,
  PerformanceSettings,
} from "../utils/performanceSettings";

const ModelLazy = lazy(() =>
  import("./canvas/Base").then((m) => ({ default: m.Model }))
);

interface FooterModel3DProps {
  scale?: number;
  positionY?: number;
  pitchLimitDeg?: number;
  yawLimitDeg?: number;
}

export default function FooterModel3D({
  scale,
  positionY,
  pitchLimitDeg,
  yawLimitDeg,
}: FooterModel3DProps) {
  const [settings, setSettings] = useState<PerformanceSettings>(
    getPerformanceSettings("medium")
  );
  const [tier, setTier] = useState<string | null>(null);
  const [visible, setVisible] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // ✅ Performance tier detection
  useEffect(() => {
    (async () => {
      const t = await detectPerformanceTier();
      setTier(t);
      setSettings(getPerformanceSettings(t));
    })();
  }, []);

  // ✅ Only mount Canvas when footer enters viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "600px 0px", threshold: 0.05 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // ✅ Preload model files during idle
  useEffect(() => {
    const idle = (cb: () => void): number => {
      if ("requestIdleCallback" in window) {
        return window.requestIdleCallback(cb, { timeout: 1500 });
      }
      return (window as Window).setTimeout(cb, 300);
    };
    const id = idle(() => {
      try {
        useGLTF.preload("/models/Robot_V5.glb");
      } catch {
        // ignore preload errors
      }
    });
    return () => {
      if ("cancelIdleCallback" in window && typeof id === "number") {
        window.cancelIdleCallback(id);
      } else {
        clearTimeout(id);
      }
    };
  }, []);

  const adaptiveDpr = useMemo<number>(() => {
    const base = window.devicePixelRatio || 1;
    return Math.min(base, settings.dprMax ?? 1.5);
  }, [settings]);

  return (
    <div ref={containerRef} style={{ position: "absolute", inset: 0 }}>
      {!visible || !tier ? (
        <div
          style={{ position: "absolute", inset: 0, background: "transparent" }}
        />
      ) : (
        <Canvas
          camera={{ position: [0, -0.5, 5], fov: 40 }}
          style={{ width: "100%", height: "100%", background: "transparent" }}
          dpr={adaptiveDpr}
          shadows={settings.shadows}
          gl={{
            antialias: settings.antialias,
            alpha: true,
            powerPreference: settings.powerPreference,
            stencil: false,
          }}
        >
          <Suspense fallback={null}>
            <ambientLight intensity={settings.ambient} />
            <directionalLight position={[0, 0, 0]} intensity={0.5} />
            <pointLight
              position={[0, 2, 5]}
              intensity={1}
              distance={15}
              color="#ff6600"
            />
            <pointLight
              position={[0, -2, 0]}
              intensity={20}
              distance={15}
              color="#3399ff"
            />

            <Environment
              preset={settings.env}
              resolution={settings.envResolution}
            />

            <ModelLazy
              modelUrl="/models/Robot_V5.glb"
              position={[0, positionY ?? -1.5, 0]}
              scale={scale ?? settings.scale}
              pitchLimitDeg={pitchLimitDeg}
              yawLimitDeg={yawLimitDeg}
            />

            {settings.bloom && (
              <EffectComposer multisampling={settings.multisampling}>
                <Bloom
                  intensity={settings.bloomIntensity}
                  luminanceThreshold={settings.bloomThreshold}
                  luminanceSmoothing={settings.bloomSmoothing}
                />
              </EffectComposer>
            )}

            <OrbitControls enabled={false} />
          </Suspense>
        </Canvas>
      )}
    </div>
  );
}
