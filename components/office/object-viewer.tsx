"use client";

import { useEffect, useRef } from "react";
import type * as Three from "three";
import { ObjectViewerProps, OfficeObjectModel } from "@/types";

type ThreeModule = typeof Three;

const PENNANT_TEXTURE = "/office/pennant.png";
// The pennant texture is 873×618 px; the triangle keeps that ratio
const PENNANT_HEIGHT = 1.3;
const PENNANT_WIDTH = PENNANT_HEIGHT * (873 / 618);

const TIN = { width: 1.6, height: 1.15, radius: 0.24, base: 0.14, lid: 0.1 };

const CAMERA_POSITION: Record<OfficeObjectModel, [number, number, number]> = {
  pennant: [0, 0.2, 4.6],
  mints: [0, 2.6, 3.2],
  mug: [0, 1.1, 4.2],
};

const MUG = { radius: 0.62, height: 1.45, wall: 0.035 };

/** Maps every vertex to UVs that span the shape's bounding box */
function fitUvs(geometry: Three.BufferGeometry) {
  geometry.computeBoundingBox();
  const box = geometry.boundingBox;
  if (!box) return;

  const { position } = geometry.attributes;
  const { uv } = geometry.attributes;
  const width = box.max.x - box.min.x;
  const height = box.max.y - box.min.y;

  for (let i = 0; i < position.count; i++) {
    uv.setXY(
      i,
      (position.getX(i) - box.min.x) / width,
      (position.getY(i) - box.min.y) / height
    );
  }
  uv.needsUpdate = true;
}

function roundedRect(
  THREE: ThreeModule,
  width: number,
  height: number,
  radius: number
) {
  const x = -width / 2;
  const y = -height / 2;
  const shape = new THREE.Shape();
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);
  return shape;
}

function buildPennant(THREE: ThreeModule) {
  const group = new THREE.Group();
  const shape = new THREE.Shape();
  shape.moveTo(0, -PENNANT_HEIGHT / 2);
  shape.lineTo(PENNANT_WIDTH, 0);
  shape.lineTo(0, PENNANT_HEIGHT / 2);
  shape.closePath();

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.015,
    bevelEnabled: false,
  });
  fitUvs(geometry);

  // A soft wave so it reads as felt rather than a flat card
  const { position } = geometry.attributes;
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    position.setZ(i, position.getZ(i) + 0.07 * Math.sin(x * 2.4));
  }
  geometry.computeVertexNormals();

  const texture = new THREE.TextureLoader().load(PENNANT_TEXTURE);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;

  const felt = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.95,
      side: THREE.DoubleSide,
    })
  );

  const stick = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.03, PENNANT_HEIGHT + 0.35, 24),
    new THREE.MeshStandardMaterial({ color: "#b98a57", roughness: 0.7 })
  );
  stick.position.set(-0.03, 0, 0.01);

  group.add(felt, stick);
  group.position.x = -PENNANT_WIDTH / 2;
  return group;
}

function buildLogoTexture(THREE: ThreeModule) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = Math.round(1024 * (TIN.height / TIN.width));
  const context = canvas.getContext("2d");
  if (!context) return null;

  const centerY = canvas.height / 2;
  context.fillStyle = "#ffffff";
  context.beginPath();
  context.moveTo(170, centerY + 70);
  context.lineTo(250, centerY - 70);
  context.lineTo(330, centerY + 70);
  context.closePath();
  context.fill();

  context.font = "600 170px -apple-system, 'Helvetica Neue', Arial, sans-serif";
  context.textBaseline = "middle";
  context.fillText("Vercel", 370, centerY + 8);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function buildMints(THREE: ThreeModule) {
  const group = new THREE.Group();
  const outline = roundedRect(THREE, TIN.width, TIN.height, TIN.radius);
  const bevel = {
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.02,
    bevelSegments: 4,
    curveSegments: 32,
  };

  const base = new THREE.Mesh(
    new THREE.ExtrudeGeometry(outline, { depth: TIN.base, ...bevel }),
    new THREE.MeshStandardMaterial({
      color: "#c8ccd2",
      metalness: 0.9,
      roughness: 0.28,
    })
  );

  const lid = new THREE.Mesh(
    new THREE.ExtrudeGeometry(
      roundedRect(
        THREE,
        TIN.width + 0.03,
        TIN.height + 0.03,
        TIN.radius + 0.015
      ),
      {
        depth: TIN.lid,
        ...bevel,
      }
    ),
    new THREE.MeshStandardMaterial({
      color: "#111113",
      metalness: 0.35,
      roughness: 0.5,
    })
  );
  lid.position.z = TIN.base;

  group.add(base, lid);

  const logoTexture = buildLogoTexture(THREE);
  if (logoTexture) {
    const logoGeometry = new THREE.ShapeGeometry(outline, 32);
    fitUvs(logoGeometry);
    const logo = new THREE.Mesh(
      logoGeometry,
      new THREE.MeshStandardMaterial({
        map: logoTexture,
        transparent: true,
        roughness: 0.5,
      })
    );
    logo.position.z = TIN.base + TIN.lid + 0.025;
    group.add(logo);
  }

  // Lie the tin flat with the lid facing up
  group.rotation.x = -Math.PI / 2;
  group.position.y = -(TIN.base + TIN.lid) / 2;
  return group;
}

function buildBandTexture(THREE: ThreeModule) {
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 128;
  const context = canvas.getContext("2d");
  if (!context) return null;

  context.fillStyle = "#111113";
  context.fillRect(0, 0, 1560, canvas.height);
  context.fillStyle = "#f2f2f2";
  context.font = "500 50px ui-monospace, 'SF Mono', Menlo, monospace";
  context.textBaseline = "middle";
  const label = "B U I L D I N G   T H E   F U T U R E";
  context.fillText(label, 40, canvas.height / 2 + 2);

  // Small smile logo at the end of the band
  context.strokeStyle = "#f2f2f2";
  context.lineWidth = 12;
  context.lineCap = "round";
  context.beginPath();
  context.arc(1480, 50, 24, 0.15 * Math.PI, 0.85 * Math.PI);
  context.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function buildMug(THREE: ThreeModule) {
  const group = new THREE.Group();
  const steel = new THREE.MeshStandardMaterial({
    color: "#cfd3d8",
    metalness: 1,
    roughness: 0.32,
    side: THREE.DoubleSide,
  });

  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(
      MUG.radius,
      MUG.radius * 0.97,
      MUG.height,
      64,
      1,
      true
    ),
    steel
  );
  const bottom = new THREE.Mesh(
    new THREE.CircleGeometry(MUG.radius * 0.97, 64),
    steel
  );
  bottom.rotation.x = Math.PI / 2;
  bottom.position.y = -MUG.height / 2;

  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(MUG.radius - MUG.wall / 2, MUG.wall, 12, 64),
    steel
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.y = MUG.height / 2;

  const coffee = new THREE.Mesh(
    new THREE.CircleGeometry(MUG.radius - MUG.wall, 64),
    new THREE.MeshStandardMaterial({ color: "#2b1a10", roughness: 0.15 })
  );
  coffee.rotation.x = -Math.PI / 2;
  coffee.position.y = MUG.height / 2 - 0.18;

  group.add(body, bottom, rim, coffee);

  const bandTexture = buildBandTexture(THREE);
  if (bandTexture) {
    const band = new THREE.Mesh(
      new THREE.CylinderGeometry(
        MUG.radius + 0.004,
        MUG.radius + 0.004,
        0.18,
        64,
        1,
        true,
        -Math.PI * 0.55,
        Math.PI * 1.1
      ),
      new THREE.MeshStandardMaterial({
        map: bandTexture,
        transparent: true,
        roughness: 0.6,
      })
    );
    band.position.y = -0.05;
    group.add(band);
  }

  // Carabiner handle: a stretched ring with a small gate bar
  const carabiner = new THREE.Mesh(
    new THREE.TorusGeometry(0.34, 0.035, 16, 48),
    new THREE.MeshStandardMaterial({
      color: "#e4e7ea",
      metalness: 1,
      roughness: 0.2,
    })
  );
  carabiner.scale.set(0.62, 1.15, 1);
  carabiner.position.set(-(MUG.radius + 0.18), 0.05, 0);
  group.add(carabiner);

  group.rotation.y = 0.35;
  return group;
}

const BUILDERS: Record<OfficeObjectModel, (THREE: ThreeModule) => Three.Group> =
  {
    pennant: buildPennant,
    mints: buildMints,
    mug: buildMug,
  };

export default function ObjectViewer({ model }: ObjectViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
    let cleanup = () => {};

    const setup = async () => {
      const THREE = await import("three");
      const { OrbitControls } =
        await import("three/examples/jsm/controls/OrbitControls.js");
      const { RoomEnvironment } =
        await import("three/examples/jsm/environments/RoomEnvironment.js");
      if (disposed) return;

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      container.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const environment = new THREE.PMREMGenerator(renderer).fromScene(
        new RoomEnvironment(),
        0.04
      ).texture;
      scene.environment = environment;
      scene.add(new THREE.AmbientLight("#ffffff", 0.6));
      const keyLight = new THREE.DirectionalLight("#ffffff", 1.6);
      keyLight.position.set(2, 4, 3);
      scene.add(keyLight);
      scene.add(BUILDERS[model](THREE));

      const camera = new THREE.PerspectiveCamera(
        35,
        container.clientWidth / container.clientHeight,
        0.1,
        100
      );
      camera.position.set(...CAMERA_POSITION[model]);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableZoom = false;
      controls.enablePan = false;
      controls.enableDamping = true;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 1.6;

      let frame = 0;
      const render = () => {
        controls.update();
        renderer.render(scene, camera);
        frame = requestAnimationFrame(render);
      };
      render();

      const resizeObserver = new ResizeObserver(() => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
      });
      resizeObserver.observe(container);

      cleanup = () => {
        cancelAnimationFrame(frame);
        resizeObserver.disconnect();
        controls.dispose();
        environment.dispose();
        scene.traverse((object) => {
          if (!(object instanceof THREE.Mesh)) return;
          object.geometry.dispose();
          const material = object.material as Three.MeshStandardMaterial;
          material.map?.dispose();
          material.dispose();
        });
        renderer.dispose();
        renderer.domElement.remove();
      };
    };

    void setup();

    return () => {
      disposed = true;
      cleanup();
    };
  }, [model]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full cursor-grab active:cursor-grabbing"
    />
  );
}
