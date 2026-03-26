"use client";
// canvas/Base.tsx
import React, { useRef, useEffect, useMemo } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";
import type { Group } from "three";

interface ModelProps {
  modelUrl?: string;
  fallbackUrl?: string;
  position?: [number, number, number];
  scale?: number;
  pitchLimitDeg?: number;
  yawLimitDeg?: number;
  [key: string]: unknown; // allow spread of extra r3f props
}

export function Model({
  modelUrl = "/models/Robot_V5.glb",
  position = [0, -1.5, 0],
  scale = 1.8,
  pitchLimitDeg,
  yawLimitDeg,
  ...props
}: ModelProps) {
  const group = useRef<Group>(null);
  const headBone = useRef<THREE.Bone | null>(null);

  // Load once from cache, deep-clone per instance to avoid shared skeleton/material state
  const gltf = useGLTF(modelUrl);
  const clonedScene = useMemo(
    () => SkeletonUtils.clone(gltf.scene),
    [gltf.scene]
  );
  const { actions } = useAnimations(gltf.animations, group);
  const { size } = useThree();

  // Find head bone after skeleton loads
  useEffect(() => {
    if (!group.current) return;
    let found: THREE.Bone | null = null;
    group.current.traverse((obj) => {
      if ((obj as THREE.Bone).isBone) {
        const name = obj.name?.toLowerCase() ?? "";
        if (name.includes("head") || name === "head01") {
          found = obj as THREE.Bone;
        }
      }
    });
    if (found) headBone.current = found;
  }, []);

  // Brand emissive glow on eye / light meshes
  useEffect(() => {
    if (!group.current) return;
    const brand = "#E2791D";

    const applyEmissive = (material: THREE.Material | THREE.Material[]) => {
      if (Array.isArray(material)) {
        material.forEach(applyEmissive);
        return;
      }
      const mat = material as THREE.MeshStandardMaterial;
      if (mat.emissive) mat.emissive.set(brand);
      if (mat.emissiveIntensity !== undefined) mat.emissiveIntensity = 2;
      if (mat.toneMapped !== undefined) mat.toneMapped = false;
    };

    group.current.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh || !mesh.material) return;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      const matName = (mat.name ?? "").toLowerCase();
      const objName = (obj.name ?? "").toLowerCase();
      if (
        matName === "lightys" ||
        objName === "lights01" ||
        objName.includes("light") ||
        objName.includes("eye")
      ) {
        applyEmissive(mesh.material);
      }
    });
  }, []);

  // Play all embedded animations
  useEffect(() => {
    if (!actions) return;
    const arr = Object.values(actions).filter(Boolean) as THREE.AnimationAction[];
    arr.forEach((action) => action.reset().fadeIn(0.5).play());
    return () => {
      arr.forEach((action) => action.fadeOut(0.2));
    };
  }, [actions]);

  // Normalised mouse position (-1 to 1)
  const mouse = useRef(new THREE.Vector2());
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / size.width) * 2 - 1;
      mouse.current.y = -(e.clientY / size.height) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [size]);

  // Head bone mouse tracking
  useFrame(() => {
    if (!headBone.current) return;
    const maxPitch = THREE.MathUtils.degToRad(pitchLimitDeg ?? 15);
    const maxYaw = THREE.MathUtils.degToRad(yawLimitDeg ?? 10);

    const targetQuat = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(
        THREE.MathUtils.clamp(mouse.current.x * maxPitch, -maxPitch, maxPitch),
        THREE.MathUtils.clamp(mouse.current.y * maxYaw, -maxYaw, maxYaw),
        0,
        "XYZ"
      )
    );

    headBone.current.quaternion.slerp(targetQuat, 0.1);
  });

  return (
    <group ref={group} position={position} scale={scale} {...props} dispose={null}>
      <primitive object={clonedScene} />
    </group>
  );
}

useGLTF.preload("/models/Robot_V5.glb");
