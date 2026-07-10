/* =====================================================
   main.js — homepage scroll narrative engine
   ===================================================== */

gsap.registerPlugin(ScrollTrigger);

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---- Nav: transparent → solid after hero ---- */
const nav = document.getElementById('site-nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('site-nav--solid', window.scrollY > window.innerHeight * 0.75);
}, { passive: true });


/* =====================================================
   Entry animations (run once on load)
   ===================================================== */

if (!reducedMotion) {
  const entryTl = gsap.timeline({ delay: 0.2 });

  /* Umbrella intro: appear → spin twice → pause → disappear → title */
  entryTl
    .from('.intro-umbrella__img', {
      opacity: 0, scale: 0.3, duration: 0.5, ease: 'back.out(1.7)',
    })
    .to('.intro-umbrella__img', {
      rotation: 720, duration: 1.3, ease: 'power2.inOut',
    })
    .to('.intro-umbrella__img', {
      scale: 2.2, duration: 0.4, ease: 'power2.out',
    }, '+=0.4')
    .to('.intro-umbrella__img', {
      scale: 0, opacity: 0, duration: 0.3, ease: 'power3.in',
    })
    .from('.hero__title', {
      scale: 0.3, opacity: 0, duration: 1.0, ease: 'expo.out',
      transformOrigin: 'center center',
    }, '-=0.05')
    .from('.hero__line', {
      scaleX: 0, transformOrigin: 'left center', duration: 0.7, ease: 'power2.inOut',
    }, '-=0.5')
    .from('.hero__subtitle', {
      y: 20, opacity: 0, duration: 0.8, ease: 'power2.out',
    }, '-=0.4')
    .from('.hero__scroll-hint', {
      opacity: 0, duration: 0.6,
    }, '-=0.1');

  /* Hero title slow parallax */
  gsap.to('.hero__title', {
    y: '-20%',
    ease: 'none',
    scrollTrigger: {
      trigger : '.hero',
      start   : 'top top',
      end     : 'bottom top',
      scrub   : true,
    },
  });

  /* ─── Quote section — phrase-by-phrase reveal ─── */
  const phrases = gsap.utils.toArray('.quote__phrase');

  /* Force initial hidden state so `to()` has a known starting point.
     Using `from()` was broken: it animates toward the CSS value (opacity:0),
     so the last phrase—which has no subsequent `to()` override—never appeared. */
  gsap.set(phrases, { opacity: 0, y: 22 });

  const quoteTl = gsap.timeline({
    scrollTrigger: {
      trigger : '.section-quote',
      start   : 'top top',
      end     : 'bottom bottom',
      scrub   : 0.6,
    },
  });

  quoteTl
    .from('.quote__label',  { opacity: 0, x: -20, duration: 0.3 }, 0)
    .from('.quote__source', { opacity: 0, x: -20, duration: 0.3 }, 0.2);

  phrases.forEach((phrase, i) => {
    const t = 0.5 + i * 0.6;
    if (i > 0) {
      quoteTl.to(phrases.slice(0, i), { opacity: 0.22, duration: 0.2 }, t - 0.12);
    }
    quoteTl.to(phrase, { opacity: 1, y: 0, duration: 0.28, ease: 'power2.out' }, t);
  });

  /* Final phrase: dim all previous for maximum contrast */
  quoteTl.to(
    phrases.slice(0, -1),
    { opacity: 0.12, duration: 0.3 },
    0.5 + (phrases.length - 1) * 0.6 + 0.15
  );

  /* ─── Ack CTA reveal ─── */
  const ackTl = gsap.timeline({
    scrollTrigger: {
      trigger       : '.section-ack-cta',
      start         : 'top 65%',
      toggleActions : 'play none none none',
    },
  });

  ackTl
    .from('.ack-cta__pre', {
      opacity: 0, y: 20, duration: 0.9, ease: 'power2.out',
    })
    .from('.ack-cta__title', {
      opacity: 0, scale: 1.05, duration: 1.3, ease: 'power2.out',
    }, '-=0.5')
    .from('.ack-cta__link', {
      opacity: 0, y: 16, duration: 0.7, ease: 'power2.out',
    }, '-=0.4');

} else {
  /* Reduced motion: reveal all static elements immediately */
  gsap.set([
    '.hero__title', '.hero__line', '.hero__subtitle', '.hero__scroll-hint',
    '.quote__label', '.quote__source', '.quote__phrase',
    '.ack-cta__pre', '.ack-cta__title', '.ack-cta__link',
  ], { opacity: 1, y: 0, x: 0, scale: 1 });
}
