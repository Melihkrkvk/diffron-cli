"use client";

import gsap from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;

export function getGsap() {
  if (!registered) {
    registered = true;

    // If you need ScrollTrigger:
    // gsap.registerPlugin(ScrollTrigger);
  }

  return gsap;
}