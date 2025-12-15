import { useState, useRef, useEffect } from "react";

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export const Tooltip = ({
  content,
  children,
  position = "top",
  className = "",
}: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && tooltipRef.current && triggerRef.current) {
      const tooltip = tooltipRef.current;
      const trigger = triggerRef.current;
      const rect = trigger.getBoundingClientRect();

      // Position tooltip based on position prop
      switch (position) {
        case "top":
          tooltip.style.bottom = `${rect.height + 8}px`;
          tooltip.style.left = "50%";
          tooltip.style.transform = "translateX(-50%)";
          break;
        case "bottom":
          tooltip.style.top = `${rect.height + 8}px`;
          tooltip.style.left = "50%";
          tooltip.style.transform = "translateX(-50%)";
          break;
        case "left":
          tooltip.style.right = `${rect.width + 8}px`;
          tooltip.style.top = "50%";
          tooltip.style.transform = "translateY(-50%)";
          break;
        case "right":
          tooltip.style.left = `${rect.width + 8}px`;
          tooltip.style.top = "50%";
          tooltip.style.transform = "translateY(-50%)";
          break;
      }
    }
  }, [isVisible, position]);

  const isFullWidth = className.includes("w-full");
  
  return (
    <div
      ref={triggerRef}
      className={`relative ${isFullWidth ? "block" : "inline-block"} ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          className="absolute z-[9999] rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-lg"
          style={{
            whiteSpace: "nowrap",
            pointerEvents: "none",
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
};
