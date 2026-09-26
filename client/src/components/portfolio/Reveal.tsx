import type { PropsWithChildren } from 'react';
import { motion, useReducedMotion } from 'motion/react';
export function Reveal({
  children,
  className = '',
}: PropsWithChildren<{ className?: string }>) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.08 }}
      transition={{ duration: reduced ? 0 : 0.5 }}
    >
      {children}
    </motion.div>
  );
}
