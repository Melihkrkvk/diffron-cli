export type Pm = "pnpm" | "npm" | "yarn";

export type FeatureKey =
  | "state-zustand"
  | "state-redux"
  | "anim-framer"
  | "anim-gsap"
  | "auth-google";

export type FeatureDef = {
  overlayDir: FeatureKey;
  deps?: string[];
  envAppend?: boolean;
};

export const featureRegistry: Record<FeatureKey, FeatureDef> = {
  "state-zustand": {
    overlayDir: "state-zustand",
    deps: ["zustand"],
  },
  "state-redux": {
    overlayDir: "state-redux",
    deps: ["@reduxjs/toolkit", "react-redux"],
  },
  "anim-framer": {
    overlayDir: "anim-framer",
    deps: ["framer-motion"],
  },
  "anim-gsap": {
    overlayDir: "anim-gsap",
    deps: ["gsap"],
  },
  "auth-google": {
    overlayDir: "auth-google",
    envAppend: true,
  },
};