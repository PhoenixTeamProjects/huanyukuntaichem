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

        const oilFlow = gsap.timeline({
          repeat: -1,
          yoyo: true,
          defaults: { ease: 'sine.inOut' }
        });
        oilFlow
          .fromTo('[data-oil-layer="primary"]',
            { xPercent: -4, yPercent: -2, scale: 1.02 },
            { xPercent: 4.5, yPercent: 2.1, scale: 1.08, duration: desktop ? 4 : 5.2 },
            0
          )
          .fromTo('[data-oil-layer="secondary"]',
            { xPercent: 3.5, yPercent: 2, scale: 1.07 },
            { xPercent: -3.5, yPercent: -2, scale: 1.01, duration: desktop ? 5.6 : 7 },
            0
          )
          .fromTo('[data-oil-sheen]',
            { xPercent: -10, autoAlpha: 0.12 },
            { xPercent: 10, autoAlpha: 0.72, duration: desktop ? 3.2 : 4.6 },
            0
          );

        ScrollTrigger.create({
          trigger: '[data-hero]',
          start: 'top bottom',
          end: 'bottom top',
          onToggle: ({ isActive }) => isActive ? oilFlow.play() : oilFlow.pause()
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
