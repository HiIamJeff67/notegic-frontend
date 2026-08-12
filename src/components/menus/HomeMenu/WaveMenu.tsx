import { useEffect, useRef, useState } from "react";

const sampleCount = 48;
const sampleInterval = 45;
const waveBaseline = 30;

export const WaveMenu = ({ active }: { active: boolean }) => {
  const activeRef = useRef(active);
  const samplesRef = useRef<number[]>(Array(sampleCount).fill(waveBaseline));
  const [samples, setSamples] = useState(samplesRef.current);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    let frame = 0;
    let accumulated = 0;
    let previousTime = performance.now();

    const animate = (now: number) => {
      accumulated += now - previousTime;
      previousTime = now;

      if (accumulated >= sampleInterval) {
        const shiftCount = Math.min(
          4,
          Math.floor(accumulated / sampleInterval)
        );
        accumulated %= sampleInterval;
        const nextSamples = samplesRef.current.slice(shiftCount);
        const time = now / 1_000;

        for (let index = 0; index < shiftCount; index += 1) {
          const noise =
            Math.sin(time * 4.2) * 1.2 +
            Math.sin(time * 8.5 + index) * 0.8 +
            Math.sin(time * 15.5 - index * 0.4) * 0.35;
          const terrainSignal = activeRef.current
            ? Math.max(
                0,
                6 +
                  Math.abs(Math.sin(time * 1.9 + index)) * 6 +
                  Math.sin(time * 5.2 - index * 0.6) * 1.5 +
                  noise * 0.25
              )
            : noise;

          nextSamples.push(
            Math.max(3, Math.min(37, waveBaseline - terrainSignal))
          );
        }

        samplesRef.current = nextSamples;
        setSamples(nextSamples);
      }

      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  const points = samples
    .map((sample, index) => `${(index / (sampleCount - 1)) * 100},${sample}`)
    .join(" ");

  return (
    <div
      aria-label="Terrain height waveform"
      className="h-30 w-full border border-foreground/20 px-2 py-2"
    >
      <svg
        aria-hidden="true"
        className="size-full overflow-visible text-foreground"
        preserveAspectRatio="none"
        viewBox="0 0 100 40"
      >
        <polyline
          fill="none"
          points={points}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
};
