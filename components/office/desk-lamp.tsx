"use client";

import { OFFICE_LAMP, OFFICE_SCENE } from "@/lib/office-objects";
import { DeskLampProps } from "@/types";

const toPercent = (value: number, total: number) => `${(value / total) * 100}%`;

/**
 * The switch itself is painted in both scene images (lever up when on, down when off);
 * this is the click target on top of it. It sits above the mouse's layer, so
 * the lamp cut-out that hides the mouse behind it doesn't cover the label.
 */
export default function DeskLamp({ isOn, onToggle }: DeskLampProps) {
  const { switchPosition, switchRadius } = OFFICE_LAMP;

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={isOn}
      aria-label={isOn ? "Turn the lamp off" : "Turn the lamp on"}
      className="group absolute z-20 -translate-x-1/2 -translate-y-1/2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-sky-400/90"
      style={{
        left: toPercent(switchPosition.x, OFFICE_SCENE.width),
        top: toPercent(switchPosition.y, OFFICE_SCENE.height),
        width: toPercent(switchRadius * 2, OFFICE_SCENE.width),
        height: toPercent(switchRadius * 2, OFFICE_SCENE.height),
      }}
    >
      {/* Same soft white glow as the other hover targets, no outline */}
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-[70%] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.65)_0%,rgba(255,255,255,0.25)_40%,rgba(255,255,255,0)_70%)] opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
      />
      {/* Below the switch, clear of the lamp */}
      <span className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 -translate-y-1 whitespace-nowrap rounded bg-black px-1.5 py-0.5 font-mono text-[10px] text-neutral-200 opacity-0 transition duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
        {isOn ? "lights off" : "lights on"}
      </span>
    </button>
  );
}
