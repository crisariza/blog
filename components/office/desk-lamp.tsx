"use client";

import { OFFICE_LAMP, OFFICE_SCENE } from "@/lib/office-objects";
import { DeskLampProps } from "@/types";

const toPercent = (value: number, total: number) => `${(value / total) * 100}%`;

/**
 * The switch itself is painted in both scene images (lever up when on, down when off);
 * this is the click target on top of it.
 */
export default function DeskLamp({ isOn, onToggle }: DeskLampProps) {
  const { switchPosition, switchRadius } = OFFICE_LAMP;

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={isOn}
      aria-label={isOn ? "Turn the lamp off" : "Turn the lamp on"}
      className="group absolute -translate-x-1/2 -translate-y-1/2 rounded-full outline-none transition-shadow hover:shadow-[0_0_0_2px_rgba(255,255,255,0.75),0_0_14px_4px_rgba(255,255,255,0.45)] focus-visible:shadow-[0_0_0_2px_rgba(56,189,248,0.9)]"
      style={{
        left: toPercent(switchPosition.x, OFFICE_SCENE.width),
        top: toPercent(switchPosition.y, OFFICE_SCENE.height),
        width: toPercent(switchRadius * 2, OFFICE_SCENE.width),
        height: toPercent(switchRadius * 2, OFFICE_SCENE.height),
      }}
    >
      <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black px-1.5 py-0.5 font-mono text-[10px] text-neutral-200 opacity-0 transition-opacity group-hover:opacity-100">
        {isOn ? "lights off" : "lights on"}
      </span>
    </button>
  );
}
