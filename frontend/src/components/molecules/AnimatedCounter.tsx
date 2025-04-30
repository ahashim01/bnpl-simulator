import { useState, useEffect, useRef } from "react";
import { Typography, Box, SxProps, Theme } from "@mui/material";
import { motion, useMotionValue, useTransform } from "framer-motion";

interface AnimatedCounterProps {
  readonly value: number;
  readonly prefix?: string;
  readonly suffix?: string;
  readonly duration?: number;
  readonly delay?: number;
  readonly variant?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "subtitle1" | "subtitle2" | "body1" | "body2";
  readonly color?: string;
  readonly sx?: SxProps<Theme>;
  readonly decimals?: number;
}

export default function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  duration = 1.5,
  delay = 0,
  variant = "h4",
  color,
  sx = {},
  decimals = 0,
}: AnimatedCounterProps) {
  const countRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  const count = useMotionValue(0);
  const roundedCount = useTransform(count, (latest: number) => {
    return decimals > 0
      ? latest.toFixed(decimals)
      : Math.round(latest).toLocaleString();
  });

  // Set up intersection observer to trigger animation when in view
  useEffect(() => {
    if (!countRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(countRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Update count when value changes or component becomes visible
  useEffect(() => {
    if (isInView) {
      // Correctly animate the value using direct manipulation
      const startValue = count.get();
      const animationDuration = duration * 1000;
      let animationId: number; // Declare animation ID variable

      let startTime: number | null = null;
      const animate = (timestamp: number) => {
        startTime ??= timestamp; // Use nullish coalescing assignment operator
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / animationDuration, 1);

        // Simple easing function
        const easedProgress = progress === 1 ? 1 : 1 - Math.pow(1 - progress, 3);
        const currentValue = startValue + (value - startValue) * easedProgress;

        count.set(currentValue);

        if (progress < 1) {
          animationId = requestAnimationFrame(animate);
        }
      };

      // Add delay if specified
      const timeoutId = setTimeout(() => {
        animationId = requestAnimationFrame(animate);
      }, delay * 1000);

      return () => {
        clearTimeout(timeoutId);
        if (animationId) {
          cancelAnimationFrame(animationId);
        }
      };
    }
  }, [value, isInView, count, duration, delay]);

  return (
    <Box ref={countRef} sx={{ ...sx }}>
      <Typography
        variant={variant}
        component={motion.p}
        color={color ?? "text.primary"}
      >
        {prefix}
        <motion.span>{roundedCount}</motion.span>
        {suffix}
      </Typography>
    </Box>
  );
}
