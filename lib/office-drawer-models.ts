import type * as Three from "three";
import { BALL_RADIUS } from "@/lib/office-drawers";
import type { DrawerItemKind } from "@/types";

/**
 * Procedural models of what's in the drawers, built in centimeters on the
 * desk frame (x across, y towards the back, z up), standing on z = 0.
 */

type ThreeModule = typeof Three;

/** Inside the cabinet (y > 0) it gets dark quickly: little light gets in */
const INSIDE_DARKNESS = 0.16;
const INSIDE_FADE = 9;

/** Darkens a material the deeper it is inside the cabinet */
export function shadeInside<T extends Three.Material>(material: T): T {
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace("void main() {", "varying float vInside;\nvoid main() {")
      .replace(
        "#include <project_vertex>",
        "#include <project_vertex>\nvInside = (modelMatrix * vec4(transformed, 1.0)).y;"
      );
    shader.fragmentShader = shader.fragmentShader
      .replace("void main() {", "varying float vInside;\nvoid main() {")
      .replace(
        "#include <dithering_fragment>",
        `gl_FragColor.rgb *= mix(1.0, ${INSIDE_DARKNESS.toFixed(2)}, smoothstep(0.0, ${INSIDE_FADE.toFixed(1)}, vInside));\n#include <dithering_fragment>`
      );
  };
  return material;
}

const lambert = (THREE: ThreeModule, color: string) =>
  shadeInside(new THREE.MeshLambertMaterial({ color }));

/* Soccer ball */

/** Face planes of a truncated icosahedron: 12 pentagons (icosahedron vertices), 20 hexagons */
function truncatedIcosahedronFaces() {
  const phi = (1 + Math.sqrt(5)) / 2;
  const vertices = [
    [-1, phi, 0],
    [1, phi, 0],
    [-1, -phi, 0],
    [1, -phi, 0],
    [0, -1, phi],
    [0, 1, phi],
    [0, -1, -phi],
    [0, 1, -phi],
    [phi, 0, -1],
    [phi, 0, 1],
    [-phi, 0, -1],
    [-phi, 0, 1],
  ].map(normalize);
  const edge = Math.min(
    ...vertices.slice(1).map((vertex) => distance3(vertices[0], vertex))
  );
  const hexagons: number[][] = [];
  vertices.forEach((a, i) =>
    vertices.forEach((b, j) =>
      vertices.forEach((c, k) => {
        if (i >= j || j >= k) return;
        const close = [distance3(a, b), distance3(b, c), distance3(a, c)].every(
          (gap) => gap < edge * 1.01
        );
        if (close)
          hexagons.push(
            normalize([
              a[0] + b[0] + c[0],
              a[1] + b[1] + c[1],
              a[2] + b[2] + c[2],
            ])
          );
      })
    )
  );
  return { pentagons: vertices, hexagons };
}

function normalize(vector: number[]) {
  const length = Math.hypot(...vector);
  return vector.map((value) => value / length);
}

const distance3 = (a: number[], b: number[]) =>
  Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

const dot3 = (a: number[], b: number[]) =>
  a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/** Inradius of a truncated icosahedron's pentagons over its hexagons' */
const PENTAGON_DEPTH = 2.32744 / 2.26728;
const SEAM_WIDTH = 0.012;
const BALL_COLORS = {
  pentagon: [28, 28, 30],
  hexagon: [238, 238, 234],
  seam: [120, 120, 118],
};

/**
 * Which face a direction on the sphere falls in: the face plane its ray hits
 * first. Close calls are the stitched seams between panels.
 */
function panelColor(
  direction: number[],
  faces: ReturnType<typeof truncatedIcosahedronFaces>
) {
  const scores = [
    ...faces.pentagons.map((normal) => ({
      score: dot3(normal, direction) * PENTAGON_DEPTH,
      pentagon: true,
    })),
    ...faces.hexagons.map((normal) => ({
      score: dot3(normal, direction),
      pentagon: false,
    })),
  ].sort((a, b) => b.score - a.score);
  if (scores[0].score - scores[1].score < SEAM_WIDTH) return BALL_COLORS.seam;
  return scores[0].pentagon ? BALL_COLORS.pentagon : BALL_COLORS.hexagon;
}

/** Equirectangular texture of the classic black-and-white panels */
function ballTexture(THREE: ThreeModule) {
  const width = 512;
  const height = 256;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return null;
  const image = context.createImageData(width, height);
  const faces = truncatedIcosahedronFaces();
  for (let row = 0; row < height; row++) {
    const polar = (row / height) * Math.PI;
    for (let column = 0; column < width; column++) {
      const azimuth = (column / width) * Math.PI * 2;
      // Same convention as THREE.SphereGeometry's UVs
      const direction = [
        -Math.cos(azimuth) * Math.sin(polar),
        Math.cos(polar),
        Math.sin(azimuth) * Math.sin(polar),
      ];
      const color = panelColor(direction, faces);
      image.data.set([...color, 255], (row * width + column) * 4);
    }
  }
  context.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function buildBall(THREE: ThreeModule) {
  const material = shadeInside(
    new THREE.MeshLambertMaterial({ map: ballTexture(THREE) })
  );
  const ball = new THREE.Mesh(
    new THREE.SphereGeometry(BALL_RADIUS, 48, 32),
    material
  );
  // The spin group turns around the ball's center
  const spin = new THREE.Group();
  spin.position.z = BALL_RADIUS;
  spin.add(ball);
  spin.name = "spin";
  return spin;
}

/* PlayStation-style controller */

const CONTROLLER = {
  gray: "#b8b7b2",
  dark: "#3b3b3d",
  thickness: 2.4,
  bevel: 0.6,
};

/** Top-down outline: a straight back, shoulders, and two grips towards the front (−y) */
function controllerOutline(THREE: ThreeModule) {
  const shape = new THREE.Shape();
  shape.moveTo(-5.4, 3.3);
  shape.lineTo(5.4, 3.3);
  shape.quadraticCurveTo(7.9, 3.3, 7.9, 0.8);
  shape.quadraticCurveTo(7.9, -2.4, 7.2, -5.6);
  shape.quadraticCurveTo(6.6, -7.4, 5, -7.1);
  shape.quadraticCurveTo(3.9, -6.8, 3.4, -4.2);
  shape.quadraticCurveTo(2.9, -2.4, 0, -2.4);
  shape.quadraticCurveTo(-2.9, -2.4, -3.4, -4.2);
  shape.quadraticCurveTo(-3.9, -6.8, -5, -7.1);
  shape.quadraticCurveTo(-6.6, -7.4, -7.2, -5.6);
  shape.quadraticCurveTo(-7.9, -2.4, -7.9, 0.8);
  shape.quadraticCurveTo(-7.9, 3.3, -5.4, 3.3);
  return shape;
}

function addBox(
  THREE: ThreeModule,
  group: Three.Group,
  size: [number, number, number],
  position: [number, number, number],
  material: Three.Material,
  angle = 0
) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.position.set(...position);
  mesh.rotation.z = angle;
  group.add(mesh);
  return mesh;
}

function addCylinder(
  THREE: ThreeModule,
  group: Three.Group,
  radius: number,
  height: number,
  position: [number, number, number],
  material: Three.Material
) {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, height, 24),
    material
  );
  mesh.rotation.x = Math.PI / 2;
  mesh.position.set(...position);
  group.add(mesh);
  return mesh;
}

/** △ ○ ✕ □ in their colors, as thin shapes on top of the face buttons */
function addFaceSymbols(THREE: ThreeModule, group: Three.Group, top: number) {
  const symbol = (color: string) => lambert(THREE, color);
  const z = top + 0.42;
  const triangle = new THREE.Mesh(
    new THREE.TorusGeometry(0.24, 0.045, 4, 3),
    symbol("#3fbf8f")
  );
  triangle.position.set(4.7, 1.4, z);
  triangle.rotation.z = Math.PI / 2;
  const circle = new THREE.Mesh(
    new THREE.TorusGeometry(0.22, 0.045, 6, 20),
    symbol("#e0475a")
  );
  circle.position.set(5.7, 0.4, z);
  group.add(triangle, circle);
  [Math.PI / 4, -Math.PI / 4].forEach((angle) =>
    addBox(
      THREE,
      group,
      [0.5, 0.08, 0.04],
      [4.7, -0.6, z],
      symbol("#6f9fe0"),
      angle
    )
  );
  const pink = symbol("#e389c4");
  [
    [0.36, 0.08, 0, 0.18],
    [0.36, 0.08, 0, -0.18],
    [0.08, 0.36, 0.18, 0],
    [0.08, 0.36, -0.18, 0],
  ].forEach(([w, h, dx, dy]) =>
    addBox(THREE, group, [w, h, 0.04], [3.7 + dx, 0.4 + dy, z], pink)
  );
}

function addControllerDetails(THREE: ThreeModule, group: Three.Group) {
  // The body spans the extrusion plus a bevel above and below
  const top = CONTROLLER.thickness + 2 * CONTROLLER.bevel;
  const dark = lambert(THREE, CONTROLLER.dark);
  const pad = lambert(THREE, "#c6c5c0");
  // Raised discs under the d-pad and the face buttons
  addCylinder(THREE, group, 2, 0.24, [-4.7, 0.4, top + 0.1], pad);
  addCylinder(THREE, group, 2, 0.24, [4.7, 0.4, top + 0.1], pad);
  addBox(THREE, group, [2.6, 0.8, 0.36], [-4.7, 0.4, top + 0.38], dark);
  addBox(THREE, group, [0.8, 2.6, 0.36], [-4.7, 0.4, top + 0.38], dark);
  [
    [4.7, 1.4],
    [5.7, 0.4],
    [4.7, -0.6],
    [3.7, 0.4],
  ].forEach(([x, y]) =>
    addCylinder(THREE, group, 0.42, 0.36, [x, y, top + 0.38], dark)
  );
  addFaceSymbols(THREE, group, top);
  // SELECT and START
  addBox(THREE, group, [0.9, 0.35, 0.2], [-0.8, -0.6, top + 0.1], dark, 0.35);
  addBox(THREE, group, [0.9, 0.35, 0.2], [0.8, -0.6, top + 0.1], dark, -0.35);
  // Shoulder buttons along the back edge
  addBox(THREE, group, [2.6, 0.8, 0.9], [-5.3, 4.1, top - 1], dark);
  addBox(THREE, group, [2.6, 0.8, 0.9], [5.3, 4.1, top - 1], dark);
}

/** The controller's cable, out of the back and coiled loosely beside it */
function addControllerCable(THREE: ThreeModule, group: Three.Group) {
  const points = [
    new THREE.Vector3(0, 3.3, 1.6),
    new THREE.Vector3(0.3, 5, 0.5),
  ];
  const center = { x: 6.5, y: 10.5 };
  for (let step = 0; step <= 28; step++) {
    const angle = Math.PI * 0.9 - (step / 28) * Math.PI * 3.6;
    const radius = 4.6 - step * 0.035;
    points.push(
      new THREE.Vector3(
        center.x + Math.cos(angle) * radius,
        center.y + Math.sin(angle) * radius,
        0.35 + (step % 14 > 7 ? 0.5 : 0)
      )
    );
  }
  const curve = new THREE.CatmullRomCurve3(points);
  const cable = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 160, 0.3, 8),
    lambert(THREE, "#2f2f31")
  );
  group.add(cable);
}

function buildController(THREE: ThreeModule) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.ExtrudeGeometry(controllerOutline(THREE), {
      depth: CONTROLLER.thickness,
      bevelEnabled: true,
      bevelThickness: CONTROLLER.bevel,
      bevelSize: CONTROLLER.bevel,
      bevelSegments: 4,
      curveSegments: 16,
    }),
    lambert(THREE, CONTROLLER.gray)
  );
  body.position.z = CONTROLLER.bevel;
  group.add(body);
  addControllerDetails(THREE, group);
  addControllerCable(THREE, group);
  return group;
}

/* Retro remote */

const REMOTE = { length: 14, width: 6.6, height: 3.2, bevel: 0.7 };
const REMOTE_PANEL = { x: -1.8, width: 8, depth: 5 };

function remoteLabel(THREE: ThreeModule) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 320;
  const context = canvas.getContext("2d");
  if (!context) return null;
  context.fillStyle = "#8c6440";
  context.fillRect(0, 0, 512, 320);
  context.strokeStyle = "#3b2414";
  context.fillStyle = "#3b2414";
  context.lineWidth = 6;
  context.font = "bold 34px Helvetica, Arial, sans-serif";
  context.textAlign = "center";
  context.fillText("FORWARD", 256, 146);
  context.fillText("REVERSE", 256, 202);
  // ↑ above and ↓ below the words, between the buttons
  context.beginPath();
  context.moveTo(256, 50);
  context.lineTo(256, 108);
  context.moveTo(240, 68);
  context.lineTo(256, 50);
  context.lineTo(272, 68);
  context.moveTo(256, 222);
  context.lineTo(256, 280);
  context.moveTo(240, 262);
  context.lineTo(256, 280);
  context.lineTo(272, 262);
  context.stroke();
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
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

function buildRemote(THREE: ThreeModule) {
  const group = new THREE.Group();
  const { length, width, height, bevel } = REMOTE;
  const body = new THREE.Mesh(
    new THREE.ExtrudeGeometry(
      roundedRect(THREE, length - 2 * bevel, width - 2 * bevel, 1.6),
      {
        depth: height - 2 * bevel,
        bevelEnabled: true,
        bevelThickness: bevel,
        bevelSize: bevel,
        bevelSegments: 5,
        curveSegments: 12,
      }
    ),
    lambert(THREE, "#e4d7bd")
  );
  body.position.z = bevel;
  group.add(body);

  const top = height;
  // The brown label panel near one end, the words running along the remote
  const panel = new THREE.Mesh(
    new THREE.PlaneGeometry(REMOTE_PANEL.width, REMOTE_PANEL.depth),
    shadeInside(new THREE.MeshLambertMaterial({ map: remoteLabel(THREE) }))
  );
  panel.position.set(REMOTE_PANEL.x, 0, top + 0.01);
  group.add(panel);

  const red = lambert(THREE, "#d3262b");
  const { x, width: panelWidth, depth } = REMOTE_PANEL;
  [
    [x - panelWidth * 0.32, depth * 0.3],
    [x + panelWidth * 0.32, depth * 0.3],
    [x - panelWidth * 0.32, -depth * 0.3],
    [x + panelWidth * 0.32, -depth * 0.3],
  ].forEach(([bx, by]) =>
    addCylinder(THREE, group, 0.6, 0.7, [bx, by, top + 0.3], red)
  );
  // The metal clip on the far end
  addBox(
    THREE,
    group,
    [0.4, 1.6, 0.5],
    [length / 2 + 0.05, 0, 0.9],
    lambert(THREE, "#c9c9c9")
  );
  return group;
}

/* Soft contact shadow on the drawer's floor */

function blobShadow(THREE: ThreeModule, width: number, depth: number) {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const context = canvas.getContext("2d");
  if (context) {
    const gradient = context.createRadialGradient(32, 32, 4, 32, 32, 32);
    gradient.addColorStop(0, "rgba(20,10,4,0.55)");
    gradient.addColorStop(1, "rgba(20,10,4,0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 64, 64);
  }
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(width, depth),
    shadeInside(
      new THREE.MeshBasicMaterial({
        map: new THREE.CanvasTexture(canvas),
        transparent: true,
        depthWrite: false,
      })
    )
  );
  shadow.position.z = 0.05;
  return shadow;
}

const SHADOW_SIZE: Record<DrawerItemKind, [number, number]> = {
  controller: [19, 13],
  remote: [17, 9],
  ball: [17, 17],
};

/** An item and its contact shadow, ready to sit on a drawer's floor */
export function buildDrawerItem(THREE: ThreeModule, kind: DrawerItemKind) {
  const group = new THREE.Group();
  group.add(blobShadow(THREE, ...SHADOW_SIZE[kind]));
  const builders = {
    controller: buildController,
    remote: buildRemote,
    ball: buildBall,
  };
  group.add(builders[kind](THREE));
  return group;
}
