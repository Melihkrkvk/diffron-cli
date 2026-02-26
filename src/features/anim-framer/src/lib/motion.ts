export const easeOut = [0.16, 1, 0.3, 1] as const;
export const easeInOut = [0.4, 0, 0.2, 1] as const;

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
};

export const fadeInUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
};

export const fadeInDown = {
  initial: { opacity: 0, y: -14 },
  animate: { opacity: 1, y: 0 },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
};

export const transitionFast = {
  duration: 0.2,
  ease: easeOut,
};

export const transitionBase = {
  duration: 0.35,
  ease: easeOut,
};

export const stagger = (staggerChildren = 0.06, delayChildren = 0) => ({
  animate: {
    transition: { staggerChildren, delayChildren },
  },
});