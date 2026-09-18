/* ==========================================================
   SEVEN POINTS — script.js
   Vanilla JS only. No GSAP, no Three.js. Everything here is either
   a small state toggle, a CSS class swap, or an IntersectionObserver.
========================================================== */
(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. NAV SCROLL STATE ---------- */
  const nav = document.querySelector('.nav');
  let navTicking = false;
  function updateNav() {
    if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 40);
    navTicking = false;
  }
  window.addEventListener('scroll', () => {
    if (!navTicking) { navTicking = true; requestAnimationFrame(updateNav); }
  }, { passive: true });
  updateNav();

  /* ---------- 2. MOBILE NAV ---------- */
  const burger = document.querySelector('.nav-burger');
  const mobileNav = document.querySelector('.nav-mobile');
  function closeMobileNav() {
    burger?.classList.remove('is-active');
    burger?.setAttribute('aria-expanded', 'false');
    mobileNav?.classList.remove('is-open');
    document.body.style.overflow = '';
  }
  burger?.addEventListener('click', () => {
    const isOpen = mobileNav?.classList.toggle('is-open');
    burger.classList.toggle('is-active', isOpen);
    burger.setAttribute('aria-expanded', String(!!isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });
  mobileNav?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobileNav));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobileNav();
  });

  /* ---------- 3. HERO SUBTLE SCALE ON SCROLL ---------- */
  const heroImg = document.querySelector('.hero-media img');
  const heroEl = document.querySelector('.hero');
  let heroTicking = false;
  function updateHeroScale() {
    if (heroImg && heroEl && !reduceMotion) {
      const h = heroEl.offsetHeight;
      const progress = Math.min(Math.max(window.scrollY / h, 0), 1);
      const scale = 1.03 + progress * 0.05; // 1.03 -> 1.08
      heroImg.style.transform = `scale(${scale})`;
    }
    heroTicking = false;
  }
  window.addEventListener('scroll', () => {
    if (!heroTicking) { heroTicking = true; requestAnimationFrame(updateHeroScale); }
  }, { passive: true });
  updateHeroScale();

  /* ---------- 4. HERO HEADLINE LOAD-IN REVEAL ---------- */
  const heroHeadline = document.querySelector('.hero h1');
  if (heroHeadline && !reduceMotion) {
    heroHeadline.style.clipPath = 'inset(0 0 100% 0)';
    heroHeadline.style.transition = 'clip-path 1s cubic-bezier(.4,0,.2,1)';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => { heroHeadline.style.clipPath = 'inset(0 0 0 0)'; });
    });
  }

  /* ---------- 5. SECTION-HEADING REVEALS ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(el => {
      if (reduceMotion) { el.classList.add('is-visible'); }
      else { revealObserver.observe(el); }
    });
  }

  /* ---------- 6. ABOUT US — TABS ---------- */
  const tabList = document.querySelector('.about-tabs');
  const tabs = document.querySelectorAll('.about-tab');
  const panels = document.querySelectorAll('.about-panel');

  function activateTab(tab) {
    if (!tab) return;
    tabs.forEach(t => t.setAttribute('aria-selected', 'false'));
    panels.forEach(p => p.classList.remove('is-active'));
    tab.setAttribute('aria-selected', 'true');
    const panel = document.getElementById(tab.getAttribute('aria-controls'));
    panel?.classList.add('is-active');
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => activateTab(tab));
    tab.addEventListener('keydown', (e) => {
      let newIndex = null;
      if (e.key === 'ArrowRight') newIndex = (i + 1) % tabs.length;
      if (e.key === 'ArrowLeft') newIndex = (i - 1 + tabs.length) % tabs.length;
      if (newIndex !== null) {
        e.preventDefault();
        tabs[newIndex].focus();
        activateTab(tabs[newIndex]);
      }
    });
  });

  /* ---------- 7. SERVICES — STICKY SCROLL-DRIVEN STAGES ---------- */
  const stages = document.querySelectorAll('.stage');
  const serviceImages = document.querySelectorAll('.services-media img');

  function setActiveStage(stageName) {
    stages.forEach(s => s.classList.toggle('is-active', s.dataset.stage === stageName));
    serviceImages.forEach(img => img.classList.toggle('is-active', img.dataset.stage === stageName));
  }

  if (stages.length && serviceImages.length) {
    const stageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) setActiveStage(entry.target.dataset.stage);
      });
    }, { root: null, rootMargin: '-45% 0px -45% 0px', threshold: 0 });
    stages.forEach(s => stageObserver.observe(s));
  }

  /* ---------- 8. FOOTER YEAR (safety net if copy ever needs it) ---------- */
  const yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();
