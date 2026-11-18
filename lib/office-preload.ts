import { OFFICE_SCENE } from "@/lib/office-objects";

let loading: Promise<void> | null = null;

function decodeImage(src: string) {
  const image = new Image();
  image.src = src;
  // A failed decode still lets the scene show: the <img> will load it itself
  return image.decode().catch(() => undefined);
}

/**
 * Downloads and decodes both scene images (lamp on and off) ahead of time, so
 * the office opens already painted. Safe to call any number of times.
 */
export function preloadOfficeScene() {
  loading ??= Promise.all(
    [OFFICE_SCENE.src, OFFICE_SCENE.srcLampOff].map(decodeImage)
  ).then(() => undefined);
  return loading;
}
