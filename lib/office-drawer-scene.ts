import type * as Three from "three";
import { buildDrawerItem, shadeInside } from "@/lib/office-drawer-models";
import { DrawerSim, DrawerState, maxOpenOf } from "@/lib/office-drawers";
import {
  OFFICE_CABINET,
  OFFICE_PROJECTION,
  OFFICE_SCENE,
} from "@/lib/office-objects";
import { deskToScene, SCENE_AXES } from "@/lib/office-projection";
import type { OfficeDrawer, Point } from "@/types";

/**
 * The drawers drawn in 3D on top of the illustration. The camera's projection
 * is the scene's own dimetric projection, so a closed drawer lands exactly on
 * its painted front (which is also its texture), and invisible depth-only
 * copies of the cabinet hide whatever is still inside it.
 */

type ThreeModule = typeof Three;

const VIEWPORT_MARGIN = 16;
/** Depth range of the orthographic camera, in centimeters */
const DEPTH_RANGE = 300;
/** Lighting measured on the cabinet: the right side is lit 2.5× the front, the top 2× */
const AMBIENT = 0.94;
const SUN = { intensity: 2.2, direction: [0.819, -0.071, 0.57] as const };
/** Shadow map of the room light, sized to cover the open drawers */
const SHADOW = {
  distance: 120,
  extent: 60,
  mapSize: 1024,
  softness: 4,
  normalBias: 0.06,
};
/** The scene's lamp-off overlay (15% of a dark navy) on the painted fronts */
const LAMP_OFF_TINT = [0.86, 0.87, 0.9] as const;
/** The room light without the lamp, a little dimmer and cooler on the 3D wood */
const LAMP_OFF_LIGHT = [0.78, 0.8, 0.86] as const;
const WHITE = [1, 1, 1] as const;
/**
 * The drawer boxes reuse the painted wood: a patch of the bottom drawer's front
 * (below its groove), unskewed into a texture. It was painted lit like a
 * front face, which gets about 0.35 of the light, so the albedo is that ×2.86.
 */
const WOOD_PATCH = { minX: -40, maxX: -5, top: -47, bottom: -59 };
const WOOD_GAIN = 2.86;
const WOOD_TEXTURE_SIZE = { width: 256, height: 96 };
/** Soft shadow an open drawer casts on the carpet below it */
const FLOOR_SHADOW = { margin: 3, opacity: 0.55, fadeHeight: 45 };
const CAVITY = "#2a170b";
/** The drawer box sits a little inside the front's outline */
const BOX_INSET = { side: 0.8, bottom: 0.6, top: 1.6, floor: 1 };

const DRAWER_GEOMETRY = {
  boxMinX: OFFICE_CABINET.frontMinX + BOX_INSET.side,
  boxMaxX: OFFICE_CABINET.frontMaxX - BOX_INSET.side,
  innerCenterX: (OFFICE_CABINET.frontMinX + OFFICE_CABINET.frontMaxX) / 2,
};

/** Corners of everything a drawer draws, closed or all the way out: its front and its shadow on the carpet */
function drawerCorners(drawer: OfficeDrawer): Point[] {
  const { frontMinX, frontMaxX, floor } = OFFICE_CABINET;
  const margin = FLOOR_SHADOW.margin * 2;
  const corners: Point[] = [];
  for (const open of [0, maxOpenOf(drawer)]) {
    for (const x of [frontMinX - margin * 2, frontMaxX + margin]) {
      for (const z of [drawer.top, drawer.bottom]) {
        corners.push(deskToScene({ x, y: -open, z }));
      }
      corners.push(deskToScene({ x, y: -open - margin, z: floor }));
    }
  }
  return corners;
}

/** Scene-pixel rectangle the drawers can reach */
function computeViewport() {
  const corners = OFFICE_CABINET.drawers.flatMap(drawerCorners);
  const xs = corners.map((corner) => corner.x);
  const ys = corners.map((corner) => corner.y);
  const x = Math.floor(Math.min(...xs) - VIEWPORT_MARGIN);
  const y = Math.floor(Math.min(...ys) - VIEWPORT_MARGIN);
  return {
    x,
    y,
    width: Math.ceil(Math.max(...xs) + VIEWPORT_MARGIN) - x,
    height: Math.ceil(Math.max(...ys) + VIEWPORT_MARGIN) - y,
  };
}

export const DRAWER_VIEWPORT = computeViewport();

/** Desk frame → clip space for the viewport, as the scene's own projection */
function projectionMatrix(THREE: ThreeModule) {
  const { x: vx, y: vy, width, height } = DRAWER_VIEWPORT;
  const { origin } = OFFICE_PROJECTION;
  const { x: ax, y: ay, z: az } = SCENE_AXES;
  const right = new THREE.Vector3(ax.x, ay.x, az.x);
  const down = new THREE.Vector3(ax.y, ay.y, az.y);
  // The direction that doesn't move on screen points at the camera
  const towardCamera = new THREE.Vector3()
    .crossVectors(right, down)
    .normalize();
  if (towardCamera.z < 0) towardCamera.negate();
  const depth = towardCamera.clone().divideScalar(-DEPTH_RANGE / 2);
  const matrix = new THREE.Matrix4().set(
    (2 * right.x) / width,
    (2 * right.y) / width,
    (2 * right.z) / width,
    (2 * (origin.x - vx)) / width - 1,
    (-2 * down.x) / height,
    (-2 * down.y) / height,
    (-2 * down.z) / height,
    1 - (2 * (origin.y - vy)) / height,
    depth.x,
    depth.y,
    depth.z,
    0,
    0,
    0,
    0,
    1
  );
  return { matrix, towardCamera };
}

/** A camera looking along the scene's view direction, so lighting sees the right view vector */
function createCamera(THREE: ThreeModule) {
  const { matrix, towardCamera } = projectionMatrix(THREE);
  const camera = new THREE.OrthographicCamera();
  const xAxis = new THREE.Vector3(1, 1, 0).normalize();
  const yAxis = new THREE.Vector3().crossVectors(towardCamera, xAxis);
  camera.matrixAutoUpdate = false;
  camera.matrix.makeBasis(xAxis, yAxis, towardCamera);
  camera.updateMatrixWorld(true);
  camera.projectionMatrix.multiplyMatrices(matrix, camera.matrixWorld);
  camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
  return camera;
}

/** A box spanning two corners on the desk frame */
function boxBetween(
  THREE: ThreeModule,
  min: [number, number, number],
  max: [number, number, number],
  material: Three.Material | Three.Material[]
) {
  const size = max.map((value, index) => value - min[index]) as [
    number,
    number,
    number,
  ];
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.position.set(
    (min[0] + max[0]) / 2,
    (min[1] + max[1]) / 2,
    (min[2] + max[2]) / 2
  );
  return mesh;
}

/** UVs of a closed drawer front: the scene pixels it covers */
function mapFrontToScene(mesh: Three.Mesh) {
  const { position, uv } = mesh.geometry.attributes;
  // BoxGeometry faces go +x, −x, +y, −y, +z, −z with four vertices each
  for (let vertex = 12; vertex < 16; vertex++) {
    const scene = deskToScene({
      x: position.getX(vertex) + mesh.position.x,
      y: position.getY(vertex) + mesh.position.y,
      z: position.getZ(vertex) + mesh.position.z,
    });
    uv.setXY(
      vertex,
      scene.x / OFFICE_SCENE.width,
      1 - scene.y / OFFICE_SCENE.height
    );
  }
  uv.needsUpdate = true;
}

interface Materials {
  floorShadow: Three.MeshBasicMaterial[];
  wood: Three.Material;
  front: Three.MeshBasicMaterial;
  cavity: Three.Material;
  occluder: Three.Material;
}

function buildDrawer(
  THREE: ThreeModule,
  config: OfficeDrawer,
  materials: Materials,
  floorShadow: Three.Material
) {
  const { frontMinX, frontMaxX, frontThickness, drawerDepth, wallThickness } =
    OFFICE_CABINET;
  const { boxMinX, boxMaxX } = DRAWER_GEOMETRY;
  const group = new THREE.Group();
  const { wood } = materials;
  const front = boxBetween(
    THREE,
    [frontMinX, 0, config.bottom + 0.1],
    [frontMaxX, frontThickness, config.top - 0.1],
    [wood, wood, wood, materials.front, wood, wood]
  );
  mapFrontToScene(front);
  const bottom = config.bottom + BOX_INSET.bottom;
  const top = config.top - BOX_INSET.top;
  const floorTop = bottom + BOX_INSET.floor;
  group.add(
    front,
    boxBetween(
      THREE,
      [boxMinX, frontThickness, bottom],
      [boxMaxX, drawerDepth, floorTop],
      wood
    ),
    boxBetween(
      THREE,
      [boxMinX, frontThickness, floorTop],
      [boxMinX + wallThickness, drawerDepth, top],
      wood
    ),
    boxBetween(
      THREE,
      [boxMaxX - wallThickness, frontThickness, floorTop],
      [boxMaxX, drawerDepth, top],
      wood
    ),
    boxBetween(
      THREE,
      [boxMinX, drawerDepth - wallThickness, floorTop],
      [boxMaxX, drawerDepth, top],
      wood
    )
  );
  const item = buildDrawerItem(THREE, config.item);
  item.position.z = floorTop;
  group.add(item);
  // Solid parts cast and catch shadows; the soft blob shadows only darken
  group.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    const solid = !(object.material as Three.Material).transparent;
    object.castShadow = solid;
    object.receiveShadow = solid;
  });
  const { margin } = FLOOR_SHADOW;
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(
      frontMaxX - frontMinX + margin * 4,
      drawerDepth + margin * 4
    ),
    floorShadow
  );
  shadow.position.set(
    (frontMinX + frontMaxX) / 2 - margin,
    drawerDepth / 2,
    OFFICE_CABINET.floor + 0.05
  );
  group.add(shadow);
  return { group, item, floorTop };
}

/** The cabinet's front with the drawer openings cut out, as a depth-only plane at y = 0 */
function frontOccluder(THREE: ThreeModule, material: Three.Material) {
  const { minX, maxX, floor, frontMinX, frontMaxX, drawers } = OFFICE_CABINET;
  const shape = new THREE.Shape();
  shape.moveTo(minX, floor);
  shape.lineTo(maxX, floor);
  shape.lineTo(maxX, 0);
  shape.lineTo(minX, 0);
  shape.closePath();
  for (const drawer of drawers) {
    const hole = new THREE.Path();
    hole.moveTo(frontMinX, drawer.bottom);
    hole.lineTo(frontMinX, drawer.top);
    hole.lineTo(frontMaxX, drawer.top);
    hole.lineTo(frontMaxX, drawer.bottom);
    hole.closePath();
    shape.holes.push(hole);
  }
  const geometry = new THREE.ShapeGeometry(shape);
  // The shape is drawn in x/z: lay it into the y = 0 plane
  geometry.rotateX(Math.PI / 2);
  return new THREE.Mesh(geometry, material);
}

function buildCabinet(THREE: ThreeModule, materials: Materials) {
  const { minX, maxX, depth, floor, frontMinX, frontMaxX, drawers } =
    OFFICE_CABINET;
  const group = new THREE.Group();
  const { occluder } = materials;
  const thin = 0.01;
  const occluders = [
    frontOccluder(THREE, occluder),
    boxBetween(THREE, [maxX, 0, floor], [maxX + thin, depth, 0], occluder),
    boxBetween(THREE, [minX, 0, 0], [maxX, depth, thin], occluder),
  ];
  occluders.forEach((mesh) => {
    mesh.renderOrder = -1;
    group.add(mesh);
  });
  // Dark hollows behind each opening, seen once a drawer is pulled out
  for (const drawer of drawers) {
    group.add(
      boxBetween(
        THREE,
        [frontMinX, 0, drawer.bottom],
        [frontMaxX, depth - 2, drawer.top],
        materials.cavity
      )
    );
  }
  return group;
}

export interface DrawerScene {
  update: (sim: DrawerSim) => void;
  setLamp: (on: boolean) => void;
  resize: () => void;
  dispose: () => void;
}

/** Draws a patch of a drawer front into a canvas, as if seen straight on */
function woodTexture(THREE: ThreeModule, image: CanvasImageSource) {
  const { width, height } = WOOD_TEXTURE_SIZE;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return null;
  const { minX, maxX, top, bottom } = WOOD_PATCH;
  const corner = deskToScene({ x: minX, y: 0, z: top });
  // Scene pixels per canvas pixel along the patch's width and height
  const across = {
    x: (SCENE_AXES.x.x * (maxX - minX)) / width,
    y: (SCENE_AXES.x.y * (maxX - minX)) / width,
  };
  const down = {
    x: (SCENE_AXES.z.x * (bottom - top)) / height,
    y: (SCENE_AXES.z.y * (bottom - top)) / height,
  };
  // Canvas = inverse(across, down) × (scene − corner)
  const determinant = across.x * down.y - across.y * down.x;
  const a = down.y / determinant;
  const b = -across.y / determinant;
  const c = -down.x / determinant;
  const d = across.x / determinant;
  context.setTransform(
    a,
    b,
    c,
    d,
    -(a * corner.x + c * corner.y),
    -(b * corner.x + d * corner.y)
  );
  context.drawImage(image, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** A soft dark rectangle, for the shadow under an open drawer */
function floorShadowTexture(THREE: ThreeModule) {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const context = canvas.getContext("2d");
  if (context) {
    context.filter = "blur(7px)";
    context.fillStyle = "rgba(25,14,6,1)";
    context.fillRect(12, 12, 40, 40);
  }
  return new THREE.CanvasTexture(canvas);
}

function createMaterials(
  THREE: ThreeModule,
  frontMap: Three.Texture & { image: CanvasImageSource }
) {
  const wood = new THREE.MeshLambertMaterial({
    map: woodTexture(THREE, frontMap.image),
  });
  wood.color.setScalar(WOOD_GAIN);
  return {
    wood: shadeInside(wood),
    front: new THREE.MeshBasicMaterial({ map: frontMap }),
    cavity: shadeInside(
      new THREE.MeshLambertMaterial({ color: CAVITY, side: THREE.BackSide })
    ),
    occluder: new THREE.MeshBasicMaterial({ colorWrite: false }),
    floorShadow: OFFICE_CABINET.drawers.map((drawer) => {
      const height = drawer.bottom - OFFICE_CABINET.floor;
      return new THREE.MeshBasicMaterial({
        map: floorShadowTexture(THREE),
        transparent: true,
        depthWrite: false,
        opacity:
          FLOOR_SHADOW.opacity *
          Math.max(0, 1 - height / FLOOR_SHADOW.fadeHeight),
      });
    }),
  };
}

async function loadSceneTexture(THREE: ThreeModule, src: string) {
  const texture = await new THREE.TextureLoader().loadAsync(src);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function placeItem(
  object: Three.Object3D,
  drawer: DrawerState,
  THREE: ThreeModule
) {
  const { item } = drawer;
  object.position.x = DRAWER_GEOMETRY.innerCenterX + item.position.x;
  object.position.y = OFFICE_CABINET.frontThickness + item.position.y;
  object.rotation.z = item.angle;
  const spin = object.getObjectByName("spin");
  if (spin) spin.quaternion.copy(new THREE.Quaternion(...item.spin));
}

/** Room light from the right, casting soft shadows inside the open drawers */
function createSun(THREE: ThreeModule) {
  const sun = new THREE.DirectionalLight("#ffffff", SUN.intensity);
  const target = { x: -22, y: -18, z: -35 };
  sun.target.position.set(target.x, target.y, target.z);
  sun.position
    .set(...SUN.direction)
    .multiplyScalar(SHADOW.distance)
    .add(sun.target.position);
  sun.castShadow = true;
  const { camera, mapSize } = sun.shadow;
  camera.left = -SHADOW.extent;
  camera.right = SHADOW.extent;
  camera.top = SHADOW.extent;
  camera.bottom = -SHADOW.extent;
  camera.near = 1;
  camera.far = SHADOW.distance * 2;
  mapSize.set(SHADOW.mapSize, SHADOW.mapSize);
  sun.shadow.radius = SHADOW.softness;
  sun.shadow.normalBias = SHADOW.normalBias;
  return sun;
}

export async function createDrawerScene(
  canvas: HTMLCanvasElement
): Promise<DrawerScene> {
  const THREE = await import("three");
  const [onMap, offMap] = await Promise.all([
    loadSceneTexture(THREE, OFFICE_SCENE.src),
    loadSceneTexture(THREE, OFFICE_SCENE.srcLampOff),
  ]);
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  const camera = createCamera(THREE);
  const ambient = new THREE.AmbientLight("#ffffff", AMBIENT);
  const sun = createSun(THREE);
  scene.add(ambient, sun, sun.target);

  const materials = createMaterials(THREE, onMap);
  scene.add(buildCabinet(THREE, materials));
  const drawers = OFFICE_CABINET.drawers.map((config, index) => {
    const built = buildDrawer(
      THREE,
      config,
      materials,
      materials.floorShadow[index]
    );
    scene.add(built.group);
    return built;
  });

  const resize = () => {
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  };
  resize();

  return {
    update: (sim) => {
      sim.drawers.forEach((state, index) => {
        drawers[index].group.position.y = -state.open;
        placeItem(drawers[index].item, state, THREE);
      });
      renderer.render(scene, camera);
    },
    setLamp: (on) => {
      const light = on ? WHITE : LAMP_OFF_LIGHT;
      const tint = on ? WHITE : LAMP_OFF_TINT;
      materials.front.map = on ? onMap : offMap;
      materials.front.color.setRGB(tint[0], tint[1], tint[2]);
      ambient.color.setRGB(light[0], light[1], light[2]);
      sun.color.setRGB(light[0], light[1], light[2]);
    },
    resize,
    dispose: () => {
      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        object.geometry.dispose();
        const list = Array.isArray(object.material)
          ? object.material
          : [object.material];
        list.forEach((material: Three.Material) => material.dispose());
      });
      onMap.dispose();
      offMap.dispose();
      renderer.dispose();
    },
  };
}
