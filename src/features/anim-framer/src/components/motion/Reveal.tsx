"use client";

import { motion, type MotionProps } from "framer-motion";
import { fadeInUp, transitionBase } from "@/src/lib/motion";

type Props = {
  children: React.ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
} & MotionProps;

export default function Reveal({
  children,
  className,
  ...props
}: Props) {
  return (
    <motion.div
      className={className}
      initial="initial"
      animate="animate"
      variants={fadeInUp}
      transition={transitionBase}
      {...props}
    >
      {children}
    </motion.div>
  );
}