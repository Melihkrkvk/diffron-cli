"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

type UseGsapOptions = {
  /**
   * If true, gsap.context will be scoped to the returned ref.
   * Recommended for component-scoped selectors.
   */
  scope?: boolean;
};

export function useGsap<T extends HTMLElement = HTMLDivElement>(
  animate: (gsapInstance: typeof gsap, el: T) => void,
  deps: any[] = [],
  options: UseGsapOptions = { scope: true }
) {
  const ref = useRef<T | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (options.scope) {
      const ctx = gsap.context(() => animate(gsap, el), el);
      return () => ctx.revert();
    }

    animate(gsap, el);
    return () => {
      // if user creates tweens without context, they should handle cleanup
      gsap.killTweensOf(el);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return ref;
}