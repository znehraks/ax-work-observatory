"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { ResearchTrack } from "@/content/research";
import type { MachinePart, MachineVariant } from "@/content/research";

type ResearchMachineSceneProps = {
  activeTrack: ResearchTrack;
  isPrinting: boolean;
  focusPartId?: MachinePartId;
};

type MeshWithStandardMaterial = THREE.Mesh<
  THREE.BufferGeometry,
  THREE.Material | THREE.Material[]
>;

type MachinePartId = MachinePart["id"];
type Vec3Tuple = [number, number, number];

type ScenePreset = {
  camera: Vec3Tuple;
  lookAt: Vec3Tuple;
  ridePath: Vec3Tuple[];
  signalPath: Vec3Tuple[];
  feedbackPath: Vec3Tuple[];
  tokenOffsets: number[];
  feedbackOffsets: number[];
  pathSpeed: number;
  cameraSpeed: number;
  lookAhead: number;
  bank: number;
  shake: number;
  gearSpeed: number;
  gateSpeed: number;
  pressSpeed: number;
  sway: number;
  positions: Record<"intake" | "context" | "gearLarge" | "gearSmall" | "gate" | "press" | "output", Vec3Tuple>;
  focusAnchors: Record<MachinePartId, Vec3Tuple>;
};

type MachineMaterials = {
  darkMetal: THREE.Material;
  blackenedSteel: THREE.Material;
  brass: THREE.Material;
  paper: THREE.Material;
  paperDark: THREE.Material;
  glass: THREE.Material;
  glow: THREE.Material;
  accent: THREE.Color;
};

type NewspaperRig = {
  group: THREE.Group;
  rollers: THREE.Mesh[];
  sheets: THREE.Mesh[];
};

type ResearchObjectRig = {
  group: THREE.Group;
  floaters: THREE.Object3D[];
  rotators: THREE.Object3D[];
  sliders: THREE.Object3D[];
  pulses: THREE.Object3D[];
};

export function ResearchMachineScene({
  activeTrack,
  isPrinting,
  focusPartId,
}: ResearchMachineSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const focusPartIdRef = useRef<MachinePartId>(
    focusPartId ?? activeTrack.machine.focus,
  );

  useEffect(() => {
    focusPartIdRef.current = focusPartId ?? activeTrack.machine.focus;
  }, [activeTrack.machine.focus, focusPartId]);

  useEffect(() => {
    const mount = mountRef.current;

    if (!mount) {
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const motionEnabled = isPrinting && !reducedMotion;
    const preset = getScenePreset(activeTrack.machine.variant);
    const accent = new THREE.Color(resolveCssColor(activeTrack.accent));
    const mutedAccent = accent.clone().multiplyScalar(0.48);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(58, 1, 0.04, 100);
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
      powerPreference: "high-performance",
    });
    const startTime = performance.now();
    const root = new THREE.Group();

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.domElement.className = "machine-canvas";
    mount.appendChild(renderer.domElement);

    camera.position.set(...preset.camera);
    camera.lookAt(vectorFromTuple(preset.lookAt));

    scene.add(root);
    scene.add(new THREE.AmbientLight(0xf7efe0, 1.4));

    const keyLight = new THREE.DirectionalLight(0xffffff, 3.8);
    keyLight.position.set(-3.2, 5.4, 5.6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    scene.add(keyLight);

    const accentLight = new THREE.PointLight(accent, 4.4, 9, 1.7);
    accentLight.position.set(-2.8, 1.4, 2.6);
    scene.add(accentLight);

    const warmLight = new THREE.PointLight(0xffe2a8, 2.2, 8, 1.8);
    warmLight.position.set(3.8, 2.2, 2.4);
    scene.add(warmLight);

    const darkMetal = new THREE.MeshStandardMaterial({
      color: 0x191815,
      metalness: 0.55,
      roughness: 0.42,
    });
    const blackenedSteel = new THREE.MeshStandardMaterial({
      color: 0x282722,
      metalness: 0.74,
      roughness: 0.36,
    });
    const brass = new THREE.MeshStandardMaterial({
      color: 0xb49a65,
      metalness: 0.86,
      roughness: 0.32,
    });
    const paper = new THREE.MeshStandardMaterial({
      color: 0xf2ead8,
      metalness: 0.02,
      roughness: 0.9,
    });
    const paperDark = new THREE.MeshStandardMaterial({
      color: 0x6f6a5d,
      metalness: 0.04,
      roughness: 0.84,
    });
    const glass = new THREE.MeshPhysicalMaterial({
      color: accent,
      emissive: mutedAccent,
      emissiveIntensity: 0.52,
      metalness: 0.05,
      roughness: 0.18,
      transparent: true,
      opacity: 0.28,
      transmission: 0.24,
    });
    const glow = new THREE.MeshStandardMaterial({
      color: accent,
      emissive: accent,
      emissiveIntensity: 1.85,
      metalness: 0.28,
      roughness: 0.18,
    });
    const railMaterial = new THREE.MeshStandardMaterial({
      color: accent.clone().lerp(new THREE.Color(0xf6e2a8), 0.36),
      emissive: mutedAccent,
      emissiveIntensity: 0.38,
      metalness: 0.78,
      roughness: 0.24,
    });
    const returnMaterial = new THREE.MeshStandardMaterial({
      color: 0x747166,
      emissive: mutedAccent,
      emissiveIntensity: 0.16,
      metalness: 0.64,
      roughness: 0.45,
    });

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(11.2, 6.2),
      new THREE.MeshStandardMaterial({
        color: 0x11100e,
        metalness: 0.12,
        roughness: 0.88,
      }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.12;
    floor.receiveShadow = true;
    root.add(floor);

    const grid = new THREE.GridHelper(10.8, 22, 0x39362f, 0x26241f);
    grid.position.y = -1.1;
    grid.material.opacity = 0.22;
    grid.material.transparent = true;
    root.add(grid);

    const rideCurve = new THREE.CatmullRomCurve3(
      preset.ridePath.map(vectorFromTuple),
      true,
      "catmullrom",
      0.34,
    );
    const signalCurve = new THREE.CatmullRomCurve3(preset.signalPath.map(vectorFromTuple));
    const feedbackCurve = new THREE.CatmullRomCurve3(
      preset.feedbackPath.map(vectorFromTuple),
    );

    root.add(createTube(signalCurve, 0.045, railMaterial));
    root.add(createTube(feedbackCurve, 0.032, returnMaterial));

    const materials = {
      darkMetal,
      blackenedSteel,
      brass,
      paper,
      paperDark,
      glass,
      glow,
      accent,
    };
    const newspaperRig = createNewsprintTunnel(activeTrack.machine.variant, materials);
    root.add(newspaperRig.group);

    const semanticRig = createResearchObjectRig(
      activeTrack.machine.variant,
      materials,
      preset.focusAnchors,
    );
    root.add(semanticRig.group);

    const focusHalo = createFocusHalo(accent);
    focusHalo.position.copy(
      vectorFromTuple(preset.focusAnchors[focusPartIdRef.current]),
    );
    root.add(focusHalo);

    const stationLabels = activeTrack.machine.parts.map((part) => {
      const label = createStationLabel(part, accent);
      label.position.copy(vectorFromTuple(preset.focusAnchors[part.id]));
      label.position.y += part.id === "feedback" ? 0.48 : 0.62;
      label.position.z += part.id === "feedback" ? 0.1 : 0.2;
      root.add(label);
      return { label, partId: part.id };
    });

    const signalTokens = preset.tokenOffsets.map((offset) => {
      const token = createSignalToken(glow);
      root.add(token);
      return { token, offset };
    });
    const feedbackTokens = preset.feedbackOffsets.map((offset) => {
      const token = createSignalToken(glow, 0.07);
      root.add(token);
      return { token, offset };
    });

    const particles = createDustField(accent);
    root.add(particles);

    const stationLights = [
      createStationLight(-4.25, -0.94, 0.74, glow),
      createStationLight(-2.1, -0.94, 0.6, glow),
      createStationLight(0.15, -0.94, 0.68, glow),
      createStationLight(3.58, -0.94, 0.72, glow),
    ];
    stationLights.forEach((light) => root.add(light));

    let animationFrame = 0;

    const resize = () => {
      const width = Math.max(1, mount.clientWidth);
      const height = Math.max(1, mount.clientHeight);

      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    resize();

    const render = () => {
      const elapsed = motionEnabled
        ? ((performance.now() - startTime) / 1000) * activeTrack.machine.tempo
        : 8.4;
      const cycle = (elapsed * preset.pathSpeed) % 1;
      const ride = (elapsed * preset.cameraSpeed + 0.04) % 1;
      const pulse = (Math.sin(elapsed * 2.5) + 1) / 2;
      const intensity = activeTrack.machine.intensity;
      const cameraPoint = rideCurve.getPointAt(ride);
      const focusTarget = vectorFromTuple(
        preset.focusAnchors[focusPartIdRef.current],
      );
      const lookPoint = rideCurve
        .getPointAt((ride + preset.lookAhead) % 1)
        .lerp(focusTarget, 0.42);
      const shakeX = Math.sin(elapsed * 5.7) * preset.shake;
      const shakeY = Math.cos(elapsed * 4.9) * preset.shake * 0.56;

      camera.position.set(
        cameraPoint.x + shakeX,
        cameraPoint.y + shakeY,
        cameraPoint.z,
      );
      camera.lookAt(lookPoint);
      camera.rotation.z += Math.sin(elapsed * 1.85) * preset.bank;

      root.rotation.x = -0.04 + Math.sin(elapsed * 0.23) * 0.012;
      root.rotation.y = Math.sin(elapsed * 0.18) * preset.sway;
      particles.rotation.y = elapsed * 0.025 * intensity;
      focusHalo.position.lerp(focusTarget, motionEnabled ? 0.08 : 1);
      focusHalo.rotation.z = elapsed * (0.45 + intensity * 0.22);
      focusHalo.scale.setScalar(0.88 + pulse * 0.18 * intensity);
      accentLight.intensity = 3.1 + pulse * 1.8 * intensity;
      accentLight.position.copy(camera.position);
      accentLight.position.y += 0.42;

      semanticRig.group.rotation.y = Math.sin(elapsed * 0.32) * 0.025 * intensity;
      semanticRig.rotators.forEach((object, index) => {
        object.rotation.y += 0.012 * intensity + index * 0.0018;
      });
      semanticRig.floaters.forEach((object, index) => {
        object.position.y =
          object.userData.baseY + Math.sin(elapsed * 1.18 + index * 0.9) * 0.045;
      });
      semanticRig.sliders.forEach((object, index) => {
        object.position.x =
          object.userData.baseX + Math.sin(elapsed * 1.4 + index * 0.7) * 0.11;
      });
      semanticRig.pulses.forEach((object, index) => {
        const scale = 1 + Math.sin(elapsed * 2.2 + index) * 0.055;
        object.scale.setScalar(scale);
      });

      newspaperRig.rollers.forEach((roller, index) => {
        roller.rotation.x = elapsed * (1.55 + index * 0.12) * intensity;
      });
      newspaperRig.sheets.forEach((sheet, index) => {
        sheet.position.y = sheet.userData.baseY + Math.sin(elapsed * 1.25 + index) * 0.035;
        sheet.position.x = sheet.userData.baseX + Math.sin(elapsed * 0.72 + index) * 0.025;
      });
      stationLabels.forEach(({ label, partId }) => {
        label.visible = mount.clientWidth > 620 && partId === focusPartIdRef.current;
        label.lookAt(camera.position);
      });

      signalTokens.forEach(({ token, offset }) => {
        const t = (cycle + offset) % 1;
        const point = signalCurve.getPointAt(t);
        token.position.copy(point);
        token.rotation.x = elapsed * (3.2 + intensity * 0.6);
        token.rotation.z = elapsed * (2.1 + intensity * 0.5);
        const scale = 0.85 + Math.sin((t + elapsed) * Math.PI * 2) * 0.12;
        token.scale.setScalar(scale);
      });

      feedbackTokens.forEach(({ token, offset }) => {
        const t = (cycle * (1.08 + intensity * 0.14) + offset) % 1;
        token.position.copy(feedbackCurve.getPointAt(t));
        token.scale.setScalar(0.62 + Math.sin(t * Math.PI * 2) * 0.08);
      });

      stationLights.forEach((light, index) => {
        const phase = (cycle * 4 - index + 0.15 + 4) % 4;
        const strength = phase < 0.72 ? 1.18 : 0.58;
        light.scale.setScalar(strength);
      });

      renderer.render(scene, camera);
      animationFrame = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      renderer.domElement.remove();
      scene.traverse((object) => {
        if (isMesh(object)) {
          object.geometry.dispose();
          disposeMaterial(object.material);
        }
      });
      renderer.dispose();
    };
  }, [activeTrack.accent, activeTrack.id, activeTrack.machine, isPrinting]);

  return <div className="machine-scene-3d" ref={mountRef} aria-hidden="true" />;
}

function getScenePreset(variant: MachineVariant): ScenePreset {
  const presets: Record<MachineVariant, ScenePreset> = {
    observatory: {
      camera: [0.15, 4.4, 9.4],
      lookAt: [0, 0.15, 0],
      ridePath: [
        [-4.85, 0.28, 1.28],
        [-3.78, 0.62, 0.92],
        [-2.58, 0.76, 0.58],
        [-1.2, 0.44, 0.82],
        [0.18, 0.88, 0.64],
        [1.28, 0.5, 0.74],
        [2.42, 0.74, 0.62],
        [3.72, 0.28, 0.96],
        [4.72, 0.18, 1.3],
        [3.72, -0.48, -1.2],
        [1.08, -0.62, -1.34],
        [-1.45, -0.42, -1.24],
        [-3.85, 0.02, -1.02],
      ],
      signalPath: [
        [-4.55, -0.24, 0.28],
        [-3.65, 0.42, 0.12],
        [-2.52, 0.84, -0.04],
        [-1.42, 0.34, 0.04],
        [-0.42, 0.92, 0.02],
        [0.78, 0.76, -0.04],
        [1.58, 0.2, 0.08],
        [2.72, 0.62, 0.04],
        [3.78, 0.04, 0.18],
        [4.55, -0.32, 0.28],
      ],
      feedbackPath: [
        [4.2, -0.76, -0.72],
        [2.4, -0.98, -1.2],
        [0.25, -0.9, -1.38],
        [-2.35, -0.82, -1.12],
        [-4.3, -0.38, -0.56],
      ],
      tokenOffsets: [0, 0.33, 0.66],
      feedbackOffsets: [0, 0.5],
      pathSpeed: 0.105,
      cameraSpeed: 0.062,
      lookAhead: 0.052,
      bank: 0.12,
      shake: 0.006,
      gearSpeed: 1.55,
      gateSpeed: 1.9,
      pressSpeed: 2.7,
      sway: 0.075,
      positions: {
        intake: [-4.35, -0.54, 0.02],
        context: [-2.38, -0.18, 0],
        gearLarge: [-0.52, 0.42, 0.06],
        gearSmall: [0.46, 0.82, 0.1],
        gate: [1.62, -0.18, 0.06],
        press: [3.25, -0.52, 0.08],
        output: [4.28, -0.7, 0.34],
      },
      focusAnchors: {
        intake: [-4.35, -0.2, 0.34],
        context: [-2.38, 0.18, 0.34],
        engine: [-0.18, 0.62, 0.34],
        gate: [1.62, 0.24, 0.34],
        artifact: [3.78, -0.12, 0.46],
        feedback: [-1.4, -0.9, -0.94],
      },
    },
    memory: {
      camera: [0.05, 4.75, 9.7],
      lookAt: [0, 0.06, -0.12],
      ridePath: [
        [-4.9, 0.4, 1.18],
        [-3.92, 0.78, 0.72],
        [-2.92, 1.08, 0.42],
        [-1.6, 0.72, 0.68],
        [-0.34, 0.3, 1.0],
        [0.86, 0.78, 0.66],
        [2.02, 0.24, 0.72],
        [3.34, 0.56, 0.88],
        [4.58, 0.06, 1.24],
        [3.56, -0.54, -1.26],
        [1.15, -0.84, -1.52],
        [-1.72, -0.7, -1.34],
        [-3.98, -0.08, -0.94],
      ],
      signalPath: [
        [-4.7, 0.22, 0.12],
        [-3.85, 0.7, 0.3],
        [-2.78, 1.12, 0.18],
        [-1.68, 0.72, 0],
        [-0.62, 0.16, -0.1],
        [0.24, 0.84, 0.16],
        [1.14, 0.38, 0.1],
        [2.02, -0.06, 0.02],
        [3.18, 0.52, 0.18],
        [4.42, -0.06, 0.32],
      ],
      feedbackPath: [
        [4.1, -0.72, -0.9],
        [2.9, -1.02, -1.44],
        [1.05, -0.78, -1.56],
        [-1.2, -1.04, -1.34],
        [-3.3, -0.86, -1.02],
        [-4.45, -0.28, -0.42],
      ],
      tokenOffsets: [0, 0.24, 0.48, 0.72],
      feedbackOffsets: [0, 0.33, 0.66],
      pathSpeed: 0.088,
      cameraSpeed: 0.052,
      lookAhead: 0.048,
      bank: 0.09,
      shake: 0.004,
      gearSpeed: 1.05,
      gateSpeed: 1.15,
      pressSpeed: 1.72,
      sway: 0.052,
      positions: {
        intake: [-4.28, -0.34, 0.02],
        context: [-2.45, 0.22, 0],
        gearLarge: [-0.56, 0.36, 0.04],
        gearSmall: [0.34, 0.72, 0.08],
        gate: [1.7, -0.12, 0.06],
        press: [3.2, -0.46, 0.08],
        output: [4.18, -0.62, 0.34],
      },
      focusAnchors: {
        intake: [-4.3, 0.1, 0.4],
        context: [-2.44, 0.62, 0.34],
        engine: [-0.2, 0.58, 0.34],
        gate: [1.7, 0.18, 0.34],
        artifact: [4.18, -0.2, 0.48],
        feedback: [-0.4, -0.92, -1.15],
      },
    },
    content: {
      camera: [0.25, 4.9, 9.2],
      lookAt: [0.15, 0.08, 0],
      ridePath: [
        [-4.86, 0.92, 1.22],
        [-3.7, 0.46, 0.78],
        [-2.58, 0.98, 0.48],
        [-1.46, 0.2, 0.76],
        [-0.34, 0.8, 0.55],
        [0.72, 0.18, 0.78],
        [1.64, 0.9, 0.5],
        [2.64, 0.16, 0.76],
        [4.62, -0.58, 1.18],
        [3.64, -0.94, -1.26],
        [0.82, -0.98, -1.48],
        [-1.86, -0.66, -1.2],
        [-4.48, -0.02, -0.78],
      ],
      signalPath: [
        [-4.62, 1.02, 0.16],
        [-3.7, 0.58, 0.02],
        [-2.8, 0.98, -0.06],
        [-1.92, 0.28, 0],
        [-0.9, 0.74, 0.12],
        [0.12, 0.02, -0.02],
        [1.1, 0.74, 0.08],
        [2.02, 0.16, 0.18],
        [3.1, -0.18, 0.24],
        [4.52, -0.72, 0.36],
      ],
      feedbackPath: [
        [4.2, -0.92, -0.74],
        [2.6, -1.1, -1.24],
        [0.4, -1.0, -1.42],
        [-1.9, -0.78, -1.2],
        [-4.38, -0.18, -0.52],
      ],
      tokenOffsets: [0, 0.2, 0.4, 0.6, 0.8],
      feedbackOffsets: [0, 0.5],
      pathSpeed: 0.118,
      cameraSpeed: 0.072,
      lookAhead: 0.056,
      bank: 0.18,
      shake: 0.008,
      gearSpeed: 1.78,
      gateSpeed: 2.2,
      pressSpeed: 3.05,
      sway: 0.086,
      positions: {
        intake: [-4.22, -0.2, 0.02],
        context: [-2.4, -0.06, 0],
        gearLarge: [-0.46, 0.46, 0.06],
        gearSmall: [0.58, 0.38, 0.1],
        gate: [1.68, -0.2, 0.06],
        press: [3.1, -0.44, 0.08],
        output: [4.2, -0.58, 0.34],
      },
      focusAnchors: {
        intake: [-4.2, 0.26, 0.38],
        context: [-2.4, 0.32, 0.34],
        engine: [0.02, 0.58, 0.34],
        gate: [1.68, 0.2, 0.34],
        artifact: [3.8, -0.1, 0.48],
        feedback: [-1.0, -0.9, -1.06],
      },
    },
    response: {
      camera: [0.05, 4.55, 9.55],
      lookAt: [0.08, 0.04, 0.02],
      ridePath: [
        [-4.9, 0.82, 1.28],
        [-4.0, 0.18, 0.86],
        [-3.04, 0.86, 0.56],
        [-2.0, 0.18, 0.88],
        [-0.82, 0.82, 0.52],
        [0.36, 0.18, 0.82],
        [1.28, 1.02, 0.52],
        [1.92, 0.12, 0.74],
        [3.04, 0.22, 0.92],
        [4.62, -0.36, 1.28],
        [3.74, -0.84, -1.18],
        [0.88, -0.88, -1.48],
        [-2.18, -0.88, -1.14],
        [-4.62, -0.42, -0.72],
      ],
      signalPath: [
        [-4.62, 0.88, 0.18],
        [-3.82, 0.22, 0.1],
        [-3.0, 0.82, 0.08],
        [-2.1, 0.18, -0.04],
        [-1.0, 0.74, 0.08],
        [0.08, 0.22, 0.02],
        [1.18, 0.98, 0.12],
        [1.82, 0.1, 0.12],
        [2.88, 0.22, 0.24],
        [4.48, -0.42, 0.36],
      ],
      feedbackPath: [
        [4.32, -0.74, -0.78],
        [2.5, -1.08, -1.28],
        [0.1, -0.86, -1.46],
        [-2.15, -1.04, -1.12],
        [-4.44, -0.54, -0.48],
      ],
      tokenOffsets: [0, 0.18, 0.36, 0.54, 0.72],
      feedbackOffsets: [0, 0.33, 0.66],
      pathSpeed: 0.14,
      cameraSpeed: 0.088,
      lookAhead: 0.062,
      bank: 0.24,
      shake: 0.014,
      gearSpeed: 2.08,
      gateSpeed: 2.85,
      pressSpeed: 3.42,
      sway: 0.098,
      positions: {
        intake: [-4.3, -0.34, 0.02],
        context: [-2.35, -0.18, 0],
        gearLarge: [-0.42, 0.34, 0.06],
        gearSmall: [0.62, 0.76, 0.1],
        gate: [1.65, -0.08, 0.06],
        press: [3.1, -0.5, 0.08],
        output: [4.2, -0.66, 0.34],
      },
      focusAnchors: {
        intake: [-4.3, 0.42, 0.48],
        context: [-2.35, 0.18, 0.34],
        engine: [0.08, 0.56, 0.34],
        gate: [1.65, 0.3, 0.42],
        artifact: [3.88, -0.08, 0.48],
        feedback: [-1.1, -0.88, -1.0],
      },
    },
  };

  return presets[variant];
}

function vectorFromTuple([x, y, z]: Vec3Tuple) {
  return new THREE.Vector3(x, y, z);
}

function resolveCssColor(value: string) {
  const variableMatch = value.match(/var\((--[^)]+)\)/);

  if (!variableMatch) {
    return value;
  }

  return (
    getComputedStyle(document.documentElement).getPropertyValue(variableMatch[1]).trim() ||
    "#a9c716"
  );
}

function createTube(
  curve: THREE.CatmullRomCurve3,
  radius: number,
  material: THREE.Material,
) {
  const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 128, radius, 14, false), material);
  tube.castShadow = true;
  tube.receiveShadow = true;
  return tube;
}

function createNewsprintTunnel(
  variant: MachineVariant,
  materials: MachineMaterials,
): NewspaperRig {
  const group = new THREE.Group();
  const rollers: THREE.Mesh[] = [];
  const sheets: THREE.Mesh[] = [];
  const ink = new THREE.MeshStandardMaterial({
    color: 0x181713,
    metalness: 0.18,
    roughness: 0.74,
  });
  const railInk = new THREE.MeshStandardMaterial({
    color: materials.accent.clone().lerp(new THREE.Color(0x11100e), 0.52),
    emissive: materials.accent.clone().multiplyScalar(0.26),
    emissiveIntensity: variant === "response" ? 0.78 : 0.42,
    metalness: 0.42,
    roughness: 0.36,
  });
  const stationXs = [-4.7, -3.12, -1.52, 0.06, 1.66, 3.24, 4.72];
  const sideZ = variant === "content" ? 1.48 : 1.36;

  stationXs.forEach((x, index) => {
    const leftPage = box(0.74, 1.54, 0.035, materials.paper);
    const rightPage = box(0.74, 1.54, 0.035, materials.paper);
    const topSlug = box(0.54, 0.038, 0.045, ink);
    const roller = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.16, sideZ * 2.18, 32),
      index % 2 === 0 ? materials.blackenedSteel : materials.brass,
    );
    const floatingSheet = box(0.78, 0.014, 0.96, materials.paper);

    leftPage.position.set(x, 0.38 + Math.sin(index) * 0.08, -sideZ);
    leftPage.rotation.y = 0.16;
    rightPage.position.set(x + 0.2, 0.34 + Math.cos(index) * 0.08, sideZ);
    rightPage.rotation.y = -0.16;
    topSlug.position.set(x - 0.02, 1.18, -sideZ + 0.028);

    for (let lineIndex = 0; lineIndex < 8; lineIndex += 1) {
      const line = box(0.44 - (lineIndex % 3) * 0.08, 0.01, 0.012, ink);
      const mirrorLine = box(0.36 + (lineIndex % 2) * 0.08, 0.01, 0.012, ink);

      line.position.set(x, 0.88 - lineIndex * 0.12, -sideZ + 0.034);
      mirrorLine.position.set(x + 0.2, 0.82 - lineIndex * 0.12, sideZ - 0.034);
      group.add(line, mirrorLine);
    }

    roller.rotation.x = Math.PI / 2;
    roller.position.set(x + 0.08, 1.46 + Math.sin(index * 0.8) * 0.1, 0);
    rollers.push(roller);

    floatingSheet.position.set(x + 0.1, -0.88, 0);
    floatingSheet.rotation.x = -0.04;
    floatingSheet.rotation.z = (index % 2 === 0 ? 1 : -1) * 0.06;
    floatingSheet.userData.baseX = floatingSheet.position.x;
    floatingSheet.userData.baseY = floatingSheet.position.y;
    sheets.push(floatingSheet);

    group.add(leftPage, rightPage, topSlug, roller, floatingSheet);
  });

  const leftGuide = box(9.7, 0.05, 0.08, railInk);
  const rightGuide = box(9.7, 0.05, 0.08, railInk);
  const spine = box(9.8, 0.035, 0.035, ink);

  leftGuide.position.set(0, -0.72, -1.08);
  rightGuide.position.set(0, -0.72, 1.08);
  spine.position.set(0, -0.98, 0);
  group.add(leftGuide, rightGuide, spine);
  group.traverse(enableShadows);

  return { group, rollers, sheets };
}

function createStationLabel(part: MachinePart, accent: THREE.Color) {
  const canvas = document.createElement("canvas");
  const width = 512;
  const height = 170;
  const context = canvas.getContext("2d");

  canvas.width = width;
  canvas.height = height;

  if (context) {
    context.fillStyle = "rgba(8, 8, 7, 0.86)";
    context.fillRect(0, 0, width, height);
    context.strokeStyle = `#${accent.getHexString()}`;
    context.lineWidth = 5;
    context.strokeRect(8, 8, width - 16, height - 16);
    context.fillStyle = `#${accent.getHexString()}`;
    context.font = "900 40px Arial, sans-serif";
    context.fillText(part.code, 28, 58);
    context.fillStyle = "#f6f0e1";
    context.font = "700 26px Georgia, serif";
    context.fillText(truncateCanvasText(context, part.label, 310), 28, 98);
    context.fillStyle = "rgba(246, 240, 225, 0.78)";
    context.font = "700 22px Arial, sans-serif";
    context.fillText(truncateCanvasText(context, part.mappedTo, 420), 28, 132);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(1.18, 0.39),
    new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );

  label.renderOrder = 5;
  return label;
}

function truncateCanvasText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
) {
  if (context.measureText(text).width <= maxWidth) {
    return text;
  }

  let next = text;

  while (next.length > 1 && context.measureText(`${next}...`).width > maxWidth) {
    next = next.slice(0, -1);
  }

  return `${next}...`;
}

function createResearchObjectRig(
  variant: MachineVariant,
  materials: MachineMaterials,
  anchors: Record<MachinePartId, Vec3Tuple>,
): ResearchObjectRig {
  const rig: ResearchObjectRig = {
    group: new THREE.Group(),
    floaters: [],
    rotators: [],
    sliders: [],
    pulses: [],
  };
  const helperMaterials = createHelperMaterials(materials);
  const add = (
    object: THREE.Object3D,
    part: MachinePartId,
    offset: Vec3Tuple = [0, 0, 0],
  ) => {
    object.position.copy(anchorPosition(anchors, part, offset));
    rig.group.add(object);
    return object;
  };

  if (variant === "observatory") {
    const promptStack = add(
      createPaperBundle("PROMPT", materials, 0.88, 0.54, 4),
      "intake",
      [-0.06, -0.08, 0.08],
    );
    const scanner = add(createScannerFrame(materials), "intake", [-0.05, -0.08, 0.1]);
    const phaseBoard = add(createPhaseBoard(materials, ["Plan", "Run", "Review"]), "context");
    const runnerConsole = add(createTerminalConsole("AGENT RUN", materials), "engine");
    const approval = add(createApprovalCheckpoint("OK", materials), "gate");
    const artifactStack = add(createTimelineStack(materials), "artifact", [0.02, -0.06, 0.02]);
    const diffCards = add(createDiffReviewCards(materials, helperMaterials), "feedback");

    rig.floaters.push(rememberFloat(promptStack), rememberFloat(artifactStack));
    rig.rotators.push(scanner);
    rig.sliders.push(rememberSlide(phaseBoard), rememberSlide(diffCards));
    rig.pulses.push(runnerConsole, approval);
  }

  if (variant === "memory") {
    const chatStack = add(createChatBubbleStack(materials), "intake", [-0.1, -0.02, 0.08]);
    const tape = add(createTranscriptTape(materials), "context", [0, -0.04, 0.04]);
    const indexCabinet = add(createIndexCabinet(materials), "engine", [0, -0.06, 0.02]);
    const redaction = add(createRedactionSheet(materials, helperMaterials), "gate");
    const archive = add(createArchiveStack(materials), "artifact", [0.04, -0.08, 0]);
    const coaching = add(createCoachingTemplates(materials), "feedback", [0, 0.02, 0]);

    rig.floaters.push(rememberFloat(chatStack), rememberFloat(archive));
    rig.rotators.push(...tape.userData.rotators);
    rig.sliders.push(rememberSlide(coaching));
    rig.pulses.push(indexCabinet, redaction);
  }

  if (variant === "content") {
    const antenna = add(createSignalAntenna(materials), "intake", [-0.04, -0.08, 0.02]);
    const sieve = add(createStructureSieve(materials), "context", [0, -0.06, 0]);
    const desk = add(createSynthesisDesk(materials), "engine", [0.02, -0.08, 0.04]);
    const validation = add(createValidationCards(materials), "gate", [0, -0.06, 0.04]);
    const publication = add(createPublicationStack(materials), "artifact", [0, -0.08, 0]);
    const queue = add(createPublishingQueue(materials), "feedback", [0.02, 0, 0.02]);

    rig.floaters.push(rememberFloat(publication), rememberFloat(validation));
    rig.rotators.push(antenna);
    rig.sliders.push(rememberSlide(sieve), rememberSlide(queue));
    rig.pulses.push(desk);
  }

  if (variant === "response") {
    const beacon = add(createIncidentBeacon(materials), "intake", [0, -0.1, 0.04]);
    const triage = add(createTriageBoard(materials, helperMaterials), "context", [0, -0.08, 0]);
    const relay = add(createWorkerRelay(materials), "engine", [0, -0.05, 0.04]);
    const lock = add(createApprovalLock(materials), "gate", [0, -0.08, 0.02]);
    const draftPr = add(createDraftPrCard(materials), "artifact", [0, -0.08, 0.04]);
    const audit = add(createCiAuditPanel(materials, helperMaterials), "feedback", [0, 0, 0.02]);

    rig.floaters.push(rememberFloat(draftPr));
    rig.rotators.push(...relay.userData.rotators);
    rig.sliders.push(rememberSlide(triage), rememberSlide(audit));
    rig.pulses.push(beacon, lock);
  }

  rig.group.traverse(enableShadows);
  return rig;
}

function createHelperMaterials(materials: MachineMaterials) {
  return {
    red: new THREE.MeshStandardMaterial({
      color: 0xc5241f,
      emissive: 0x4d0907,
      emissiveIntensity: 0.38,
      metalness: 0.18,
      roughness: 0.48,
    }),
    green: new THREE.MeshStandardMaterial({
      color: 0xa8c717,
      emissive: 0x253300,
      emissiveIntensity: 0.42,
      metalness: 0.18,
      roughness: 0.45,
    }),
    cyan: new THREE.MeshStandardMaterial({
      color: materials.accent.clone().lerp(new THREE.Color(0xffffff), 0.18),
      emissive: materials.accent.clone().multiplyScalar(0.5),
      emissiveIntensity: 0.55,
      metalness: 0.2,
      roughness: 0.32,
    }),
  };
}

function anchorPosition(
  anchors: Record<MachinePartId, Vec3Tuple>,
  part: MachinePartId,
  offset: Vec3Tuple,
) {
  return vectorFromTuple(anchors[part]).add(vectorFromTuple(offset));
}

function rememberFloat<T extends THREE.Object3D>(object: T) {
  object.userData.baseY = object.position.y;
  return object;
}

function rememberSlide<T extends THREE.Object3D>(object: T) {
  object.userData.baseX = object.position.x;
  return object;
}

function createPaperBundle(
  label: string,
  materials: MachineMaterials,
  width: number,
  height: number,
  count: number,
) {
  const group = new THREE.Group();

  for (let index = 0; index < count; index += 1) {
    const card = createLinedCard(
      width - index * 0.04,
      height,
      materials.paper,
      materials.darkMetal,
      index === 0 ? materials.glow : materials.paperDark,
    );

    card.position.set(index * 0.06, index * 0.045, index * 0.018);
    card.rotation.z = -0.1 + index * 0.04;
    group.add(card);
  }

  const badge = createTextPlate(label, materials.accent, 0.64, 0.2);
  badge.position.set(0.08, 0.1, 0.09);
  group.add(badge);
  return group;
}

function createLinedCard(
  width: number,
  height: number,
  material: THREE.Material,
  inkMaterial: THREE.Material,
  accentMaterial: THREE.Material,
) {
  const group = new THREE.Group();
  const card = box(width, height, 0.04, material);
  const headline = box(width * 0.58, 0.026, 0.016, accentMaterial);

  headline.position.set(-width * 0.12, height * 0.3, 0.035);
  group.add(card, headline);

  for (let index = 0; index < 4; index += 1) {
    const line = box(width * (0.68 - index * 0.08), 0.012, 0.012, inkMaterial);

    line.position.set(-width * 0.08, height * (0.12 - index * 0.13), 0.038);
    group.add(line);
  }

  return group;
}

function createScannerFrame(materials: MachineMaterials) {
  const group = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.54, 0.018, 10, 56), materials.glow);
  const crossA = box(0.92, 0.018, 0.018, materials.glow);
  const crossB = box(0.018, 0.92, 0.018, materials.glow);

  ring.rotation.x = Math.PI / 2;
  crossA.position.z = 0.03;
  crossB.position.z = 0.03;
  group.add(ring, crossA, crossB);
  return group;
}

function createPhaseBoard(materials: MachineMaterials, stages: string[]) {
  const group = new THREE.Group();
  const board = box(1.18, 0.78, 0.08, materials.darkMetal);
  const badge = createTextPlate("PHASE", materials.accent, 0.52, 0.18);

  badge.position.set(-0.24, 0.28, 0.06);
  group.add(board, badge);

  stages.forEach((stage, index) => {
    const bar = box(0.12, 0.18 + index * 0.1, 0.055, materials.glow);
    const label = createTextPlate(stage.toUpperCase(), materials.accent, 0.34, 0.13);

    bar.position.set(-0.38 + index * 0.34, -0.1 + index * 0.04, 0.07);
    label.position.set(-0.38 + index * 0.34, -0.31, 0.075);
    group.add(bar, label);
  });

  return group;
}

function createTerminalConsole(label: string, materials: MachineMaterials) {
  const group = new THREE.Group();
  const body = box(1.16, 0.76, 0.12, materials.blackenedSteel);
  const screen = box(0.96, 0.5, 0.045, materials.glass);
  const badge = createTextPlate(label, materials.accent, 0.66, 0.18);

  screen.position.set(0, 0.05, 0.08);
  badge.position.set(0, 0.33, 0.105);
  group.add(body, screen, badge);

  for (let index = 0; index < 5; index += 1) {
    const line = box(0.62 - (index % 3) * 0.1, 0.018, 0.018, materials.glow);

    line.position.set(-0.1, 0.19 - index * 0.08, 0.112);
    group.add(line);
  }

  const cursor = box(0.05, 0.08, 0.018, materials.brass);
  cursor.position.set(0.36, -0.16, 0.115);
  group.add(cursor);
  return group;
}

function createApprovalCheckpoint(label: string, materials: MachineMaterials) {
  const group = new THREE.Group();
  const postA = box(0.09, 0.82, 0.12, materials.darkMetal);
  const postB = box(0.09, 0.82, 0.12, materials.darkMetal);
  const top = box(0.84, 0.08, 0.12, materials.brass);
  const badge = createTextPlate(label, materials.accent, 0.48, 0.22);
  const check = createCheckMark(materials.glow);

  postA.position.set(-0.42, 0, 0);
  postB.position.set(0.42, 0, 0);
  top.position.set(0, 0.4, 0);
  badge.position.set(0, 0.12, 0.08);
  check.position.set(0.02, -0.18, 0.09);
  group.add(postA, postB, top, badge, check);
  return group;
}

function createTimelineStack(materials: MachineMaterials) {
  const group = new THREE.Group();
  const base = box(1.12, 0.1, 0.64, materials.paperDark);

  base.position.y = -0.32;
  group.add(base);

  for (let index = 0; index < 4; index += 1) {
    const card = createLinedCard(0.94, 0.42, materials.paper, materials.darkMetal, materials.glow);
    const marker = box(0.04, 0.18 + index * 0.03, 0.018, materials.glow);

    card.position.set(index * 0.08, -0.18 + index * 0.16, index * 0.03);
    card.rotation.z = -0.08 + index * 0.03;
    marker.position.set(-0.38 + index * 0.18, card.position.y + 0.03, 0.08 + index * 0.03);
    group.add(card, marker);
  }

  const badge = createTextPlate("LIVE", materials.accent, 0.48, 0.18);
  badge.position.set(0.2, 0.36, 0.15);
  group.add(badge);
  return group;
}

function createDiffReviewCards(
  materials: MachineMaterials,
  helperMaterials: ReturnType<typeof createHelperMaterials>,
) {
  const group = new THREE.Group();
  const before = createLinedCard(0.78, 0.5, materials.paper, materials.darkMetal, helperMaterials.red);
  const after = createLinedCard(0.78, 0.5, materials.paper, materials.darkMetal, helperMaterials.green);
  const badge = createTextPlate("DIFF", materials.accent, 0.44, 0.18);

  before.position.set(-0.26, 0.02, 0);
  before.rotation.z = -0.09;
  after.position.set(0.28, -0.04, 0.08);
  after.rotation.z = 0.08;
  badge.position.set(0.02, 0.33, 0.12);
  group.add(before, after, badge);
  return group;
}

function createChatBubbleStack(materials: MachineMaterials) {
  const group = new THREE.Group();

  for (let index = 0; index < 4; index += 1) {
    const bubble = box(0.76, 0.28, 0.06, index % 2 === 0 ? materials.paper : materials.paperDark);
    const tail = box(0.16, 0.08, 0.06, index % 2 === 0 ? materials.paper : materials.paperDark);
    const line = box(0.42 + (index % 2) * 0.12, 0.014, 0.014, materials.darkMetal);

    bubble.position.set(index % 2 === 0 ? -0.1 : 0.1, 0.28 - index * 0.18, index * 0.04);
    tail.position.set(bubble.position.x + (index % 2 === 0 ? -0.34 : 0.34), bubble.position.y - 0.09, bubble.position.z);
    tail.rotation.z = index % 2 === 0 ? -0.5 : 0.5;
    line.position.set(bubble.position.x, bubble.position.y + 0.02, bubble.position.z + 0.04);
    group.add(bubble, tail, line);
  }

  const badge = createTextPlate("CHAT", materials.accent, 0.46, 0.18);
  badge.position.set(-0.03, 0.52, 0.1);
  group.add(badge);
  return group;
}

function createTranscriptTape(materials: MachineMaterials) {
  const group = new THREE.Group();
  const reelA = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.035, 10, 42), materials.brass);
  const reelB = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.035, 10, 42), materials.brass);
  const tape = box(1.1, 0.08, 0.045, materials.paperDark);
  const badge = createTextPlate("EVENTS", materials.accent, 0.52, 0.18);

  reelA.position.set(-0.42, 0.18, 0.04);
  reelB.position.set(0.42, 0.18, 0.04);
  reelA.rotation.x = Math.PI / 2;
  reelB.rotation.x = Math.PI / 2;
  tape.position.set(0, 0.18, 0.02);
  badge.position.set(0, -0.18, 0.08);
  group.add(reelA, reelB, tape, badge);

  for (let index = 0; index < 6; index += 1) {
    const eventBar = box(0.08, 0.16 + (index % 2) * 0.05, 0.025, materials.glow);

    eventBar.position.set(-0.46 + index * 0.18, 0.18, 0.07);
    group.add(eventBar);
  }

  group.userData.rotators = [reelA, reelB];
  return group;
}

function createIndexCabinet(materials: MachineMaterials) {
  const group = new THREE.Group();
  const body = box(0.96, 0.78, 0.5, materials.darkMetal);
  const lens = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.018, 8, 32), materials.glow);
  const handle = box(0.28, 0.035, 0.035, materials.brass);
  const badge = createTextPlate("INDEX", materials.accent, 0.5, 0.18);

  group.add(body);

  for (let index = 0; index < 4; index += 1) {
    const drawer = box(0.72, 0.1, 0.035, materials.paperDark);

    drawer.position.set(0, 0.24 - index * 0.17, 0.27);
    group.add(drawer);
  }

  lens.position.set(0.3, 0.24, 0.31);
  lens.rotation.x = Math.PI / 2;
  handle.position.set(0.42, 0.08, 0.31);
  handle.rotation.z = -0.7;
  badge.position.set(-0.12, -0.34, 0.31);
  group.add(lens, handle, badge);
  return group;
}

function createRedactionSheet(
  materials: MachineMaterials,
  helperMaterials: ReturnType<typeof createHelperMaterials>,
) {
  const group = new THREE.Group();
  const sheet = createLinedCard(0.78, 0.64, materials.paper, materials.darkMetal, helperMaterials.cyan);
  const lock = createTinyLock(materials);

  group.add(sheet);

  for (let index = 0; index < 3; index += 1) {
    const bar = box(0.48 - index * 0.06, 0.06, 0.018, materials.blackenedSteel);

    bar.position.set(0.04, 0.16 - index * 0.16, 0.08);
    group.add(bar);
  }

  lock.position.set(0.28, -0.24, 0.1);
  group.add(lock);
  return group;
}

function createArchiveStack(materials: MachineMaterials) {
  const group = new THREE.Group();

  ["OBS", "JSONL", "HTML"].forEach((label, index) => {
    const file = createLinedCard(0.72, 0.46, materials.paper, materials.darkMetal, materials.glow);
    const tab = box(0.22, 0.08, 0.035, materials.brass);
    const badge = createTextPlate(label, materials.accent, 0.38, 0.15);

    file.position.set(index * 0.1, -0.12 + index * 0.14, index * 0.04);
    file.rotation.z = -0.08 + index * 0.05;
    tab.position.set(file.position.x - 0.22, file.position.y + 0.24, file.position.z + 0.03);
    badge.position.set(file.position.x + 0.08, file.position.y, file.position.z + 0.08);
    group.add(file, tab, badge);
  });

  return group;
}

function createCoachingTemplates(materials: MachineMaterials) {
  const group = new THREE.Group();

  for (let index = 0; index < 3; index += 1) {
    const card = createLinedCard(0.78, 0.42, materials.paper, materials.darkMetal, materials.glow);

    card.position.set(-0.18 + index * 0.18, -0.1 + index * 0.12, index * 0.045);
    card.rotation.z = -0.08 + index * 0.07;
    group.add(card);
  }

  const badge = createTextPlate("NEXT", materials.accent, 0.44, 0.18);
  badge.position.set(0.08, 0.32, 0.14);
  group.add(badge);
  return group;
}

function createSignalAntenna(materials: MachineMaterials) {
  const group = new THREE.Group();
  const mast = box(0.08, 0.82, 0.08, materials.darkMetal);
  const dish = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.018, 8, 32, Math.PI), materials.glow);
  const node = new THREE.Mesh(new THREE.SphereGeometry(0.1, 18, 10), materials.glow);
  const badge = createTextPlate("SIGNAL", materials.accent, 0.58, 0.18);

  mast.position.set(0, -0.08, 0);
  dish.position.set(0, 0.36, 0.04);
  dish.rotation.z = Math.PI;
  node.position.set(0, 0.36, 0.05);
  badge.position.set(0, -0.52, 0.08);
  group.add(mast, dish, node, badge);

  for (let index = 0; index < 3; index += 1) {
    const pulse = new THREE.Mesh(
      new THREE.TorusGeometry(0.48 + index * 0.16, 0.012, 8, 32, Math.PI),
      materials.glow,
    );

    pulse.position.set(0, 0.36, 0.06 + index * 0.01);
    pulse.rotation.z = Math.PI;
    group.add(pulse);
  }

  return group;
}

function createStructureSieve(materials: MachineMaterials) {
  const group = new THREE.Group();
  const frame = box(1.08, 0.62, 0.08, materials.blackenedSteel);
  const badge = createTextPlate("SORT", materials.accent, 0.42, 0.16);

  group.add(frame);

  for (let index = 0; index < 4; index += 1) {
    const vertical = box(0.022, 0.54, 0.02, materials.brass);
    const horizontal = box(0.94, 0.018, 0.02, materials.brass);

    vertical.position.set(-0.36 + index * 0.24, 0, 0.07);
    horizontal.position.set(0, -0.21 + index * 0.14, 0.07);
    group.add(vertical, horizontal);
  }

  for (let index = 0; index < 3; index += 1) {
    const chip = box(0.16, 0.08, 0.05, materials.glow);

    chip.position.set(-0.26 + index * 0.24, 0.36 - index * 0.16, 0.12);
    chip.rotation.z = index % 2 === 0 ? 0.2 : -0.15;
    group.add(chip);
  }

  badge.position.set(0.28, -0.42, 0.1);
  group.add(badge);
  return group;
}

function createSynthesisDesk(materials: MachineMaterials) {
  const group = new THREE.Group();
  const table = box(1.18, 0.12, 0.7, materials.darkMetal);
  const screen = createTerminalConsole("SYNTH", materials);
  const docA = createLinedCard(0.42, 0.28, materials.paper, materials.darkMetal, materials.glow);
  const docB = createLinedCard(0.42, 0.28, materials.paper, materials.darkMetal, materials.brass);

  table.position.set(0, -0.42, 0);
  screen.position.set(0, 0.06, 0.06);
  screen.scale.setScalar(0.78);
  docA.position.set(-0.44, -0.3, 0.35);
  docA.rotation.z = -0.12;
  docB.position.set(0.44, -0.3, 0.35);
  docB.rotation.z = 0.14;
  group.add(table, screen, docA, docB);
  return group;
}

function createValidationCards(materials: MachineMaterials) {
  const group = new THREE.Group();

  ["?", "QA", "SCORE"].forEach((label, index) => {
    const card = createLinedCard(0.54, 0.42, materials.paper, materials.darkMetal, materials.glow);
    const badge = createTextPlate(label, materials.accent, 0.38, 0.16);

    card.position.set(-0.26 + index * 0.25, -0.04 + index * 0.12, index * 0.04);
    card.rotation.z = -0.1 + index * 0.1;
    badge.position.set(card.position.x, card.position.y + 0.05, card.position.z + 0.08);
    group.add(card, badge);
  });

  const prism = new THREE.Mesh(new THREE.OctahedronGeometry(0.22, 0), materials.glass);
  prism.position.set(0.42, 0.3, 0.12);
  group.add(prism);
  return group;
}

function createPublicationStack(materials: MachineMaterials) {
  const group = new THREE.Group();
  const foldedPaper = createLinedCard(0.96, 0.62, materials.paper, materials.darkMetal, materials.glow);
  const note = createLinedCard(0.62, 0.42, materials.paper, materials.darkMetal, materials.brass);
  const badge = createTextPlate("BRIEF", materials.accent, 0.5, 0.18);

  foldedPaper.position.set(-0.08, 0.04, 0);
  foldedPaper.rotation.z = -0.08;
  note.position.set(0.24, -0.08, 0.1);
  note.rotation.z = 0.12;
  badge.position.set(0.18, 0.24, 0.16);
  group.add(foldedPaper, note, badge);
  return group;
}

function createPublishingQueue(materials: MachineMaterials) {
  const group = new THREE.Group();

  for (let index = 0; index < 3; index += 1) {
    const tray = box(0.88, 0.08, 0.42, materials.paperDark);
    const sheet = createLinedCard(0.72, 0.28, materials.paper, materials.darkMetal, materials.glow);

    tray.position.set(0, -0.2 + index * 0.18, 0);
    sheet.position.set(0.08, -0.16 + index * 0.18, 0.08 + index * 0.03);
    group.add(tray, sheet);
  }

  const score = createTextPlate("REUSE", materials.accent, 0.5, 0.18);
  score.position.set(0.12, 0.42, 0.15);
  group.add(score);
  return group;
}

function createIncidentBeacon(materials: MachineMaterials) {
  const group = new THREE.Group();
  const mast = box(0.1, 0.76, 0.1, materials.darkMetal);
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.18, 24, 12), materials.glow);
  const slack = createTextPlate("SLACK", materials.accent, 0.5, 0.17);
  const jira = createTextPlate("JIRA", materials.accent, 0.42, 0.17);

  mast.position.set(0, -0.12, 0);
  beacon.position.set(0, 0.34, 0.04);
  slack.position.set(-0.36, -0.34, 0.12);
  slack.rotation.z = -0.1;
  jira.position.set(0.34, -0.2, 0.12);
  jira.rotation.z = 0.12;
  group.add(mast, beacon, slack, jira);

  for (let index = 0; index < 2; index += 1) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.34 + index * 0.18, 0.014, 8, 34),
      materials.glow,
    );

    ring.position.copy(beacon.position);
    ring.rotation.x = Math.PI / 2;
    group.add(ring);
  }

  return group;
}

function createTriageBoard(
  materials: MachineMaterials,
  helperMaterials: ReturnType<typeof createHelperMaterials>,
) {
  const group = new THREE.Group();
  const board = box(1.1, 0.72, 0.08, materials.blackenedSteel);
  const badge = createTextPlate("TRIAGE", materials.accent, 0.56, 0.18);

  group.add(board);

  [helperMaterials.red, materials.brass, helperMaterials.green].forEach((material, column) => {
    const divider = box(0.018, 0.55, 0.02, materials.paperDark);
    const ticket = box(0.2, 0.1, 0.04, material);

    divider.position.set(-0.18 + column * 0.34, 0, 0.07);
    ticket.position.set(-0.34 + column * 0.34, 0.18 - column * 0.12, 0.1);
    group.add(divider, ticket);
  });

  badge.position.set(0, -0.43, 0.1);
  group.add(badge);
  return group;
}

function createWorkerRelay(materials: MachineMaterials) {
  const group = new THREE.Group();
  const rotators: THREE.Object3D[] = [];

  for (let index = 0; index < 3; index += 1) {
    const node = new THREE.Mesh(new THREE.SphereGeometry(0.15, 20, 10), materials.glow);
    const halo = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.014, 8, 32), materials.brass);

    node.position.set(-0.46 + index * 0.46, -0.02 + index * 0.14, 0.06);
    halo.position.copy(node.position);
    halo.rotation.x = Math.PI / 2;
    rotators.push(halo);
    group.add(node, halo);

    if (index > 0) {
      const link = box(0.42, 0.025, 0.025, materials.brass);

      link.position.set(-0.68 + index * 0.46, 0.02 + index * 0.07, 0.04);
      link.rotation.z = 0.28;
      group.add(link);
    }
  }

  const badge = createTextPlate("WORKER", materials.accent, 0.56, 0.18);
  badge.position.set(0.08, -0.36, 0.1);
  group.add(badge);
  group.userData.rotators = rotators;
  return group;
}

function createApprovalLock(materials: MachineMaterials) {
  const group = createTinyLock(materials);
  const badge = createTextPlate("HUMAN OK", materials.accent, 0.64, 0.18);

  group.scale.setScalar(1.45);
  badge.position.set(0, -0.44, 0.12);
  group.add(badge);
  return group;
}

function createDraftPrCard(materials: MachineMaterials) {
  const group = new THREE.Group();
  const card = createLinedCard(0.98, 0.58, materials.paper, materials.darkMetal, materials.glow);
  const badge = createTextPlate("DRAFT PR", materials.accent, 0.62, 0.18);

  group.add(card, badge);
  badge.position.set(0, 0.23, 0.1);

  for (let index = 0; index < 3; index += 1) {
    const node = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 8), materials.glow);
    const link = box(0.22, 0.018, 0.018, materials.brass);

    node.position.set(-0.24 + index * 0.24, -0.12 + index * 0.06, 0.1);
    link.position.set(-0.12 + index * 0.16, -0.08 + index * 0.04, 0.09);
    link.rotation.z = 0.28;
    group.add(node);
    if (index < 2) {
      group.add(link);
    }
  }

  return group;
}

function createCiAuditPanel(
  materials: MachineMaterials,
  helperMaterials: ReturnType<typeof createHelperMaterials>,
) {
  const group = new THREE.Group();
  const panel = box(0.88, 0.62, 0.08, materials.darkMetal);
  const badge = createTextPlate("CI AUDIT", materials.accent, 0.58, 0.18);

  group.add(panel);

  for (let index = 0; index < 4; index += 1) {
    const checkbox = box(0.08, 0.08, 0.025, index < 3 ? helperMaterials.green : helperMaterials.red);
    const line = box(0.46 - index * 0.04, 0.018, 0.018, materials.paper);

    checkbox.position.set(-0.32, 0.18 - index * 0.13, 0.08);
    line.position.set(0.04, checkbox.position.y, 0.08);
    group.add(checkbox, line);
  }

  badge.position.set(0.02, -0.36, 0.1);
  group.add(badge);
  return group;
}

function createTinyLock(materials: MachineMaterials) {
  const group = new THREE.Group();
  const body = box(0.42, 0.34, 0.16, materials.darkMetal);
  const shackle = new THREE.Mesh(
    new THREE.TorusGeometry(0.24, 0.026, 10, 32, Math.PI),
    materials.brass,
  );

  body.position.set(0, -0.12, 0);
  shackle.position.set(0, 0.12, 0);
  shackle.rotation.z = Math.PI;
  group.add(body, shackle);
  return group;
}

function createCheckMark(material: THREE.Material) {
  const group = new THREE.Group();
  const shortStroke = box(0.22, 0.055, 0.035, material);
  const longStroke = box(0.45, 0.055, 0.035, material);

  shortStroke.position.set(-0.12, -0.02, 0);
  shortStroke.rotation.z = -0.72;
  longStroke.position.set(0.08, 0.06, 0);
  longStroke.rotation.z = 0.72;
  group.add(shortStroke, longStroke);
  return group;
}

function createTextPlate(
  text: string,
  accent: THREE.Color,
  width: number,
  height: number,
) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  canvas.width = 384;
  canvas.height = 128;

  if (context) {
    context.fillStyle = "rgba(8, 8, 7, 0.88)";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = `#${accent.getHexString()}`;
    context.lineWidth = 5;
    context.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);
    context.fillStyle = `#${accent.getHexString()}`;
    context.font = "900 42px Arial, sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(text, canvas.width / 2, canvas.height / 2 + 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  return new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
}

function createFocusHalo(accent: THREE.Color) {
  const halo = new THREE.Mesh(
    new THREE.TorusGeometry(0.58, 0.018, 8, 64),
    new THREE.MeshBasicMaterial({
      color: accent,
      transparent: true,
      opacity: 0.62,
      depthWrite: false,
    }),
  );
  halo.rotation.x = Math.PI / 2;
  return halo;
}

function createSignalToken(material: THREE.Material, radius = 0.095) {
  const group = new THREE.Group();
  const core = new THREE.Mesh(new THREE.SphereGeometry(radius, 24, 12), material);
  const shell = new THREE.Mesh(
    new THREE.TorusGeometry(radius * 1.38, radius * 0.12, 8, 24),
    material,
  );

  shell.rotation.x = Math.PI / 2;
  group.add(core, shell);
  group.traverse(enableShadows);
  return group;
}

function createStationLight(x: number, y: number, z: number, material: THREE.Material) {
  const light = new THREE.Mesh(new THREE.SphereGeometry(0.065, 16, 8), material);
  light.position.set(x, y, z);
  return light;
}

function createDustField(accent: THREE.Color) {
  const count = 180;
  const positions = new Float32Array(count * 3);

  for (let index = 0; index < count; index += 1) {
    positions[index * 3] = THREE.MathUtils.randFloatSpread(10.6);
    positions[index * 3 + 1] = THREE.MathUtils.randFloat(-0.8, 2.4);
    positions[index * 3 + 2] = THREE.MathUtils.randFloat(-1.8, 1.8);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      color: accent.clone().lerp(new THREE.Color(0xf6efe3), 0.5),
      size: 0.026,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
    }),
  );
}

function box(width: number, height: number, depth: number, material: THREE.Material) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function enableShadows(object: THREE.Object3D) {
  object.castShadow = true;
  object.receiveShadow = true;
}

function isMesh(object: THREE.Object3D): object is MeshWithStandardMaterial {
  return object instanceof THREE.Mesh;
}

function disposeMaterial(material: THREE.Material | THREE.Material[]) {
  if (Array.isArray(material)) {
    material.forEach((item) => disposeMaterial(item));
    return;
  }

  const materialWithTexture = material as THREE.Material & {
    map?: THREE.Texture | null;
    emissiveMap?: THREE.Texture | null;
    alphaMap?: THREE.Texture | null;
  };

  materialWithTexture.map?.dispose();
  materialWithTexture.emissiveMap?.dispose();
  materialWithTexture.alphaMap?.dispose();
  material.dispose();
}
