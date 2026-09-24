import { Variants } from 'framer-motion';

// Motion Tokens & Shared Framer Motion Variants
// Luxury Aesop/Kinfolk easing and physics tokens

export const LUXURY_EASE = [0.22, 1, 0.36, 1] as const;
export const EXIT_EASE = [0.32, 0, 0.67, 0] as const;

export const SPRING_GENTLE = {
  type: 'spring' as const,
  stiffness: 260,
  damping: 24,
  mass: 0.8,
};

export const SPRING_SNAPPY = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 30,
  mass: 0.6,
};

// Route Page Transition Variants
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 12,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: LUXURY_EASE,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.25,
      ease: EXIT_EASE,
    },
  },
};

// Scroll Reveal Stagger Variants
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

export const itemFadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: LUXURY_EASE,
    },
  },
};
