import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { LUXURY_EASE } from '../../utils/motion';

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
}

export const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  children,
  className = '',
  delay = 0,
  direction = 'up',
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const offset = 24;
  const initial = {
    opacity: 0,
    x: direction === 'left' ? -offset : direction === 'right' ? offset : 0,
    y: direction === 'up' ? offset : direction === 'down' ? -offset : 0,
  };

  return (
    <motion.div
      initial={initial}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
        transition: {
          duration: 0.6,
          delay,
          ease: LUXURY_EASE,
        },
      }}
      viewport={{ once: true, margin: '-40px' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
