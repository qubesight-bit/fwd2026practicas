import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Renders a fixed 1920x1080 slide, scaled uniformly to fit its container.
 */
export function ScaledSlide({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const compute = () => {
      const { width, height } = el.getBoundingClientRect();
      setScale(Math.min(width / 1920, height / 1080));
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      <div className="slide-wrapper" style={{ transform: `scale(${scale})` }}>
        {children}
      </div>
    </div>
  );
}
