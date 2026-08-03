'use client';

import { useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function HomeMotion({ children }: { children: ReactNode }) {
  const scope = useRef<HTMLElement>(null);

  useGSAP(() => {
    const media = gsap.matchMedia();

    media.add(
      { motion: '(prefers-reduced-motion: no-preference)', desktop: '(min-width: 1024px)' },
      (context) => {
        const { motion, desktop } = context.conditions ?? {};
        if (!motion) return;

        gsap.timeline({ defaults: { ease: 'power3.out' } })
          .from('[data-hero-reveal]', { autoAlpha: 0, y: 34, duration: 0.9, stagger: 0.1 })
          .from('[data-trust-item]', { autoAlpha: 0, y: 16, duration: 0.55, stagger: 0.08 }, '-=0.45');

        gsap.fromTo('[data-hero-image]', { scale: 1.06 }, {
          scale: 1.13,
          yPercent: 5,
          ease: 'none',
          scrollTrigger: { trigger: '[data-hero]', start: 'top top', end: 'bottom top', scrub: 1 }
        });

        gsap.utils.toArray<HTMLElement>('[data-scroll-reveal]').forEach((item) => {
          gsap.from(item, {
            autoAlpha: 0,
            y: 42,
            duration: 0.85,
            ease: 'power3.out',
            scrollTrigger: { trigger: item, start: 'top 86%', once: true }
          });
        });

        if (desktop) {
          const rail = scope.current?.querySelector<HTMLElement>('[data-product-rail]');
          const stage = scope.current?.querySelector<HTMLElement>('[data-product-stage]');
          if (rail && stage) {
            const distance = () => Math.max(0, rail.scrollWidth - window.innerWidth + 64);
            gsap.to(rail, {
              x: () => -distance(),
              ease: 'none',
              scrollTrigger: {
                trigger: stage,
                start: 'top top',
                end: () => `+=${distance()}`,
                pin: true,
                scrub: 1,
                invalidateOnRefresh: true
              }
            });
          }
        }
      }
    );

    return () => media.revert();
  }, { scope });

  return <main ref={scope}>{children}</main>;
}
