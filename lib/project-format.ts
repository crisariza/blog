import { Project } from "@/types";

const PROJECT_NUMBER_DIGITS = 3;
const PRIVATE_FRAME_LABEL = "private repo";

export const formatProjectNumber = (order: number): string =>
  `№ ${String(order).padStart(PROJECT_NUMBER_DIGITS, "0")}`;

// Shows the public domain in the browser frame, or a neutral label for private work
export const frameLabel = (project: Project): string =>
  project.frame ?? project.links[0]?.label ?? PRIVATE_FRAME_LABEL;
