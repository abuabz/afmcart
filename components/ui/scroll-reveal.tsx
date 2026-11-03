"use client";

import { useEffect, useRef, useState } from "react";

interface ScrollRevealProps {
    children: React.ReactNode;
    animation?: "fade-in-up" | "fade-in-left" | "fade-in-right" | "zoom-in";
    delay?: number;
    duration?: number;
    className?: string;
    enableReAnimate?: boolean;
}

export default function ScrollReveal({
    children,
    animation = "fade-in-up", // Keeping prop for API compatibility, but we'll focus on smooth up-fade
    delay = 0,
    duration = 600,
    className = "",
    enableReAnimate = true,
}: ScrollRevealProps) {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                // Only toggle if the state actually changes to avoid unnecessary renders
                if (entry.isIntersecting) {
                    setIsVisible(true);
                } else if (enableReAnimate) {
                    // Add a small buffer/check to ensure we don't flicker at the exact edge
                    // But for "always re-animate", we must simply set false
                    setIsVisible(false);
                }
            },
            {
                threshold: 0.05, // Trigger as soon as 5% is visible
                rootMargin: "0px 0px -20px 0px", // Trigger earlier
            }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, [enableReAnimate]);

    // CSS Transition Styles based on state
    // We use transitions instead of keyframe animations for smoother interruptions/reverse
    const getTransformStyle = () => {
        if (isVisible) return "translateY(0) scale(1)";
        // Default hidden state
        return "translateY(50px) scale(0.98)"; // Subtle scale for modern feel, move down
    };

    const getOpacityStyle = () => {
        return isVisible ? 1 : 0;
    };

    return (
        <div
            ref={ref}
            className={className}
            style={{
                opacity: getOpacityStyle(),
                transform: getTransformStyle(),
                transition: `opacity ${duration}ms cubic-bezier(0.2, 0.8, 0.2, 1), transform ${duration}ms cubic-bezier(0.2, 0.8, 0.2, 1)`,
                transitionDelay: `${isVisible ? delay : 0}ms`, // Only delay entry, exit should be instant or fast
                // Removed will-change to prevent memory issues and layer glitches on completion
                backfaceVisibility: "hidden", // Fix for potential flickering
                WebkitFontSmoothing: "antialiased",
            }}
        >
            {children}
        </div>
    );
}
