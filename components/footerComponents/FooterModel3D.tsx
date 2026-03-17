"use client";

import { JSX, Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useAnimations, useGLTF } from "@react-three/drei";
import * as THREE from "three";

function Model(props: JSX.IntrinsicElements["group"]) {
  const group = useRef<THREE.Group>(null);
  const { nodes, materials, animations } = useGLTF(
    "/models/Robot_V5.glb",
  ) as any;
  const { actions } = useAnimations(animations, group);

  const leftEyeRef = useRef<THREE.Object3D | null>(null);
  const rightEyeRef = useRef<THREE.Object3D | null>(null);
  const blinkState = useRef({
    timer: 0,
    nextBlinkAt: 1.2,
    active: false,
    progress: 0,
  });

  useEffect(() => {
    leftEyeRef.current = nodes.eye_l_ctrl01 ?? null;
    rightEyeRef.current = nodes.eye_r_ctrl01 ?? null;

    if (actions) {
      Object.values(actions).forEach((action) => {
        action?.reset().play();
      });
    }
  }, [actions, nodes]);

  useFrame((state, delta) => {
    if (!group.current) {
      return;
    }

    const t = state.clock.getElapsedTime();

    // Slight breathing movement.
    group.current.position.y = Math.sin(t * 1.7) * 0.02;
    const breathingScale = 1 + Math.sin(t * 1.7) * 0.006;
    group.current.scale.setScalar(breathingScale);

    // Randomized blinking.
    blinkState.current.timer += delta;

    if (
      !blinkState.current.active &&
      blinkState.current.timer >= blinkState.current.nextBlinkAt
    ) {
      blinkState.current.active = true;
      blinkState.current.progress = 0;
      blinkState.current.nextBlinkAt = 2 + Math.random() * 2.6;
      blinkState.current.timer = 0;
    }

    let eyeScaleY = 1;

    if (blinkState.current.active) {
      blinkState.current.progress += delta / 0.14;
      const p = blinkState.current.progress;

      if (p < 0.5) {
        eyeScaleY = Math.max(0.04, 1 - p * 1.9);
      } else if (p < 1) {
        eyeScaleY = Math.max(0.04, 0.05 + (p - 0.5) * 1.9);
      } else {
        blinkState.current.active = false;
        blinkState.current.progress = 0;
        eyeScaleY = 1;
      }
    }

    if (leftEyeRef.current) {
      leftEyeRef.current.scale.y = eyeScaleY;
    }
    if (rightEyeRef.current) {
      rightEyeRef.current.scale.y = eyeScaleY;
    }
  });

  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Scene">
        <group
          name="Poddy_Geo01"
          rotation={[Math.PI / 2, 0, 0]}
          scale={0.155}
        />
        <group name="Master_ctrl01" rotation={[Math.PI / 2, 0, 0]} scale={0.01}>
          <group name="joints01">
            <skinnedMesh
              name="body01"
              geometry={nodes.body01.geometry}
              material={materials.body}
              skeleton={nodes.body01.skeleton}
            />
            <skinnedMesh
              name="details01"
              geometry={nodes.details01.geometry}
              material={materials.body}
              skeleton={nodes.details01.skeleton}
            />
            <skinnedMesh
              name="lights01"
              geometry={nodes.lights01.geometry}
              material={materials.Lightys}
              skeleton={nodes.lights01.skeleton}
            />
            <skinnedMesh
              name="screen01"
              geometry={nodes.screen01.geometry}
              material={materials.screen}
              skeleton={nodes.screen01.skeleton}
            />
            <primitive object={nodes.root_a01} />
          </group>
          <group name="root_g_ctrl_a01">
            <group name="root_ctrl_a01">
              <group name="root_g_ctrl_b01">
                <group name="root_ctrl_b01">
                  <group name="arm_l_g_ctrl01">
                    <group name="arm_l_ctrl01" />
                  </group>
                  <group name="arm_r_g_ctrl01">
                    <group name="arm_r_ctrl01" />
                  </group>
                  <group name="head_g_ctrl01">
                    <group name="head_ctrl01">
                      <group name="antenna_l_g_ctrl01">
                        <group name="antenna_l_ctrl01" />
                      </group>
                      <group name="antenna_r_g_ctrl01">
                        <group name="antenna_r_ctrl01" />
                      </group>
                      <group name="eye_l_g_ctrl01">
                        <group name="eye_l_ctrl01" />
                      </group>
                      <group name="eye_r_g_ctrl01">
                        <group name="eye_r_ctrl01" />
                      </group>
                    </group>
                  </group>
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

export default function FooterModel3D() {
  return (
    <div className="h-full w-full">
      <Canvas camera={{ position: [0, 95, 4.2], fov: 34 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.8} />
        <directionalLight
          intensity={1.3}
          color="#f6aa67"
          position={[3, 4, 3]}
        />
        <directionalLight
          intensity={0.5}
          color="#77a5ff"
          position={[-2, 3, -2]}
        />
        <Suspense fallback={null}>
          <Model position={[0, 1.5, 0]} rotation={[0, -0.28, 0]} />
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload("/models/Robot_V5.glb");
