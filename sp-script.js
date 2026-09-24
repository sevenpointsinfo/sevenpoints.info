/* =========================================================================
   SEVEN POINTS — interactions
   Plain JavaScript. The optional Lenis library adds inertial smooth
   scrolling on desktop; everything works without it.
   Without JavaScript the page is fully readable, just without motion.
   ========================================================================= */
(() => {
  'use strict';

  const doc = document;
  const html = doc.documentElement;
  const $ = (s, c = doc) => c.querySelector(s);
  const $$ = (s, c = doc) => Array.from(c.querySelectorAll(s));
  const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------------------------------------------------------------------
     Small things
  --------------------------------------------------------------------- */
  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  // Tickers: duplicate the words once so the loop is seamless
  if (!reduceMotion) {
    $$('.ticker__track').forEach((track) => { track.innerHTML += track.innerHTML; });
  }

  /* ---------------------------------------------------------------------
     Smooth scrolling (desktop only, if the library loaded)
  --------------------------------------------------------------------- */
  let lenis = null;
  if (window.Lenis && !reduceMotion && finePointer) {
    try {
      lenis = new window.Lenis({
        duration: 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        prevent: (node) => !!(node.closest && node.closest('dialog, .chapters')),
      });
      const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    } catch (e) { lenis = null; }
  }

  // Anchor links: smooth, and respect each target's scroll-margin-top
  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (!lenis || id.length < 2) return;
      const target = doc.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
      lenis.scrollTo(target, { offset: -margin });
      if (history.replaceState) history.replaceState(null, '', id);
    });
  });

  /* ---------------------------------------------------------------------
     Reveal on scroll — headlines rise line by line, text fades, images unmask
     (starts after the intro screen has left)
  --------------------------------------------------------------------- */
  $$('[data-reveal="lines"]').forEach((el) => {
    $$('.ln > span', el).forEach((line, i) => line.style.setProperty('--i', i));
  });

  const startReveals = () => {
    const targets = $$('[data-reveal]');
    if (!('IntersectionObserver' in window) || reduceMotion) {
      targets.forEach((el) => el.classList.add('is-in'));
      return;
    }
    const revealer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          revealer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.01 });
    targets.forEach((el) => revealer.observe(el));
  };

  /* ---------------------------------------------------------------------
     Count-up numbers (150+, 5+, 50+)
  --------------------------------------------------------------------- */
  const countTargets = $$('[data-count]');
  const prepareCount = (el) => {
    const node = Array.from(el.childNodes).find((n) => n.nodeType === 3 && /\d/.test(n.nodeValue));
    if (!node) return null;
    const m = node.nodeValue.match(/^(\D*)(\d+)(.*)$/);
    if (!m) return null;
    return { node, pre: m[1], value: Number(m[2]), post: m[3] };
  };
  const runCount = (el) => {
    const c = prepareCount(el);
    if (!c) return;
    const t0 = performance.now();
    const dur = 1800;
    const step = (now) => {
      const t = clamp((now - t0) / dur);
      const eased = 1 - Math.pow(2, -10 * t);
      c.node.nodeValue = c.pre + Math.round(c.value * (t >= 1 ? 1 : eased)) + c.post;
      if (t < 1) requestAnimationFrame(step);
    };
    c.node.nodeValue = c.pre + '0' + c.post;
    requestAnimationFrame(step);
  };
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const counter = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { runCount(entry.target); counter.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    countTargets.forEach((el) => counter.observe(el));
  }

  /* ---------------------------------------------------------------------
     Intro screen — counts to 100 while the hero photo loads, then lifts away
  --------------------------------------------------------------------- */
  const loader = $('.loader');
  const runIntro = (done) => {
    if (!loader || !html.classList.contains('is-loading')) { if (loader) loader.remove(); done(); return; }
    if (lenis) lenis.stop();

    let seen = null;
    try { seen = sessionStorage.getItem('sp-intro'); } catch (e) { /* storage blocked */ }
    const minTime = seen ? 700 : 1900;         // shorter on a second visit in the same session
    const start = performance.now();
    const countEl = $('.loader__count', loader);
    const heroImg = $('.hero__media img');
    let loaded = !heroImg || heroImg.complete;
    let p = 0;
    let finished = false;

    const markLoaded = () => { loaded = true; };
    if (!loaded) {
      heroImg.addEventListener('load', markLoaded, { once: true });
      heroImg.addEventListener('error', markLoaded, { once: true });
    }
    setTimeout(markLoaded, 4500);

    const finish = () => {
      if (finished) return;
      finished = true;
      try { sessionStorage.setItem('sp-intro', '1'); } catch (e) { /* ignore */ }
      loader.classList.add('is-leaving');
      html.classList.remove('is-loading');
      if (lenis) lenis.start();
      done();
      setTimeout(() => loader.remove(), 1500);
    };

    const tick = (now) => {
      if (!html.classList.contains('is-loading')) { finish(); return; }  // safety net fired
      const t = clamp((now - start) / minTime);
      const goal = loaded ? t : Math.min(t, 0.86);
      p += (goal - p) * 0.14;
      if (loaded && t >= 1 && p > 0.992) p = 1;
      loader.style.setProperty('--p', p.toFixed(4));
      countEl.textContent = String(Math.round(p * 100)).padStart(2, '0');
      if (p < 1) requestAnimationFrame(tick); else setTimeout(finish, 250);
    };
    requestAnimationFrame(tick);
  };

  /* ---------------------------------------------------------------------
     Mobile menu
  --------------------------------------------------------------------- */
  const burger = $('#burger');
  const menu = $('#menu');
  menu.inert = true;

  const setMenu = (open) => {
    html.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.setAttribute('aria-hidden', String(!open));
    menu.inert = !open;
    if (lenis) { open ? lenis.stop() : lenis.start(); }
    if (open) $('a', menu).focus({ preventScroll: true });
  };

  burger.addEventListener('click', () => setMenu(!html.classList.contains('menu-open')));
  $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  doc.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && html.classList.contains('menu-open')) {
      setMenu(false);
      burger.focus();
    }
  });
  window.matchMedia('(min-width: 1100px)').addEventListener('change', (e) => {
    if (e.matches && html.classList.contains('menu-open')) setMenu(false);
  });

  /* ---------------------------------------------------------------------
     Scroll spies (navigation, About chapters, Services stages)
  --------------------------------------------------------------------- */
  const spy = (targets, onActive, rootMargin) => {
    if (!('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) onActive(entry.target); });
    }, { rootMargin, threshold: 0 });
    targets.forEach((t) => t && io.observe(t));
  };

  // Main navigation
  const navLinks = $$('[data-spy]');
  const navSections = navLinks.map((a) => doc.getElementById(a.dataset.spy));
  spy(navSections, (section) => {
    navLinks.forEach((a) => a.classList.toggle('is-current', a.dataset.spy === section.id));
  }, '-45% 0px -54% 0px');

  // About chapters
  const chapterNav = $('.chapters');
  const chapterLinks = $$('.chapters a');
  spy($$('.chapter'), (chapter) => {
    chapterLinks.forEach((a) => {
      const on = a.getAttribute('href') === '#' + chapter.id;
      a.classList.toggle('is-active', on);
      if (on) {
        a.setAttribute('aria-current', 'true');
        if (chapterNav.scrollWidth > chapterNav.clientWidth) {
          chapterNav.scrollTo({ left: a.offsetLeft - 20, behavior: reduceMotion ? 'auto' : 'smooth' });
        }
      } else {
        a.removeAttribute('aria-current');
      }
    });
  }, '-38% 0px -58% 0px');

  // Services: the sticky photo follows the active stage
  const stageImgs = $$('.services__frame img');
  const stageCount = $('.services__current');
  const stages = $$('.stage');
  spy(stages, (stage) => {
    const n = stage.dataset.stage;
    stages.forEach((s) => s.classList.toggle('is-active', s === stage));
    stageImgs.forEach((img) => img.classList.toggle('is-active', img.dataset.stage === n));
    if (stageCount) stageCount.textContent = String(Number(n) + 1).padStart(2, '0');
  }, '-45% 0px -50% 0px');

  /* ---------------------------------------------------------------------
     Scroll-driven motion (one rAF loop)
  --------------------------------------------------------------------- */
  const nav = $('#nav');
  const hero = $('.hero');
  const heroMedia = $('.hero__media');
  const heroContent = $('.hero__content');
  const about = $('.about');
  const aboutBody = $('.about__chapters');
  const progress = $('.chapters__progress');
  const statement = $('[data-drift]');
  const statementLines = statement ? $$('.statement__title .ln', statement) : [];
  const stories = $('.stories');
  const storyEls = $$('.story');
  const storyBars = $$('.stories__bar i');
  const pinQuery = window.matchMedia('(min-width: 900px)');

  const setPinned = () => {
    stories.classList.toggle('is-pinned', pinQuery.matches && !reduceMotion);
    if (!stories.classList.contains('is-pinned')) {
      storyEls.forEach((s) => { s.style.removeProperty('--clip'); s.style.removeProperty('--zoom'); s.classList.add('is-active'); });
    }
  };
  setPinned();

  let ticking = false;
  let lastY = window.scrollY;
  const requestUpdate = () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  };
  pinQuery.addEventListener('change', () => { setPinned(); requestUpdate(); });

  function update() {
    ticking = false;
    const y = window.scrollY;
    const vh = window.innerHeight;

    // Navigation: condense after the first scroll, hide while reading down, return on scroll up
    nav.classList.toggle('is-scrolled', y > 40);
    if (!html.classList.contains('menu-open')) {
      if (y > vh * 0.9 && y > lastY + 6) nav.classList.add('is-hidden');
      else if (y < lastY - 6 || y <= vh * 0.9) nav.classList.remove('is-hidden');
    }
    lastY = y;

    if (!reduceMotion) {
      // Hero: image drifts and scales 1.04 → 1.08, copy lifts away
      const p = clamp(y / vh);
      if (p < 1) {
        heroMedia.style.transform = `translate3d(0, ${(p * 16).toFixed(2)}vh, 0) scale(${(1.04 + p * 0.04).toFixed(4)})`;
        heroContent.style.transform = `translate3d(0, ${(-p * 70).toFixed(1)}px, 0)`;
        heroContent.style.opacity = String(clamp(1 - p * 1.25));
        hero.style.setProperty('--shade', (p * 0.65).toFixed(3));
      }

      // About: light panel widens from 92% to full width as it rises
      const aTop = about.getBoundingClientRect().top;
      about.style.setProperty('--s', (0.92 + 0.08 * clamp((vh - aTop) / (vh * 0.85))).toFixed(4));

      // About: reading progress along the chapter list
      if (progress && aboutBody) {
        const r = aboutBody.getBoundingClientRect();
        const ap = clamp((vh * 0.4 - r.top) / (r.height - vh * 0.5));
        progress.style.setProperty('--p', ap.toFixed(4));
      }

      // Statement: lines slide sideways in alternating directions
      if (statementLines.length) {
        const r = statement.getBoundingClientRect();
        if (r.top < vh && r.bottom > 0) {
          const sp = clamp((vh - r.top) / (vh + r.height)) - 0.5;
          statementLines.forEach((line, i) => {
            const dir = i % 2 === 0 ? 1 : -1;
            line.style.transform = `translate3d(${(sp * dir * 9).toFixed(2)}vw, 0, 0)`;
          });
        }
      }
    }

    // Stories: pinned sequence, each photo revealed from below
    if (stories.classList.contains('is-pinned')) {
      const r = stories.getBoundingClientRect();
      const run = r.height - vh;
      const t = clamp(-r.top / run) * storyEls.length;
      let active = 0;
      storyEls.forEach((story, i) => {
        const local = clamp(t - i + 0.35, 0, 1.35);
        story.style.setProperty('--zoom', (1.08 - local * 0.05).toFixed(4));
        if (i > 0) {
          const reveal = clamp((t - (i - 0.3)) / 0.6);
          story.style.setProperty('--clip', ((1 - reveal) * 100).toFixed(2) + '%');
          if (reveal > 0.55) active = i;
        }
      });
      storyEls.forEach((story, i) => story.classList.toggle('is-active', i === active));
      storyBars.forEach((bar, i) => bar.style.setProperty('--f', clamp(t - i).toFixed(3)));
    }
  }

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  update();

  /* ---------------------------------------------------------------------
     Project hover label ("View") follows the pointer
  --------------------------------------------------------------------- */
  if (finePointer) {
    $$('.project__media').forEach((media) => {
      const label = $('.project__cursor', media);
      if (!label) return;
      media.addEventListener('pointermove', (e) => {
        const r = media.getBoundingClientRect();
        label.style.left = (e.clientX - r.left) + 'px';
        label.style.top = (e.clientY - r.top) + 'px';
      });
    });
  }

  /* ---------------------------------------------------------------------
     Project gallery (full-screen dialog)
  --------------------------------------------------------------------- */
  const dialog = $('#gallery');
  const gList = $('.gallery__list', dialog);
  const gTitle = $('.gallery__title', dialog);
  const gCount = $('.gallery__count', dialog);
  let lastTrigger = null;

  $$('[data-gallery]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const source = doc.getElementById('gallery-' + btn.dataset.gallery);
      if (!source || typeof dialog.showModal !== 'function') return;
      const items = $$('li', source);

      lastTrigger = btn;
      gTitle.textContent = source.dataset.title || '';
      gCount.textContent = items.length + (items.length === 1 ? ' image' : ' images');
      gList.innerHTML = '';

      items.forEach((li, i) => {
        const fig = doc.createElement('figure');
        const img = new Image();
        img.src = li.dataset.src;
        img.alt = li.dataset.alt || '';
        img.decoding = 'async';
        img.loading = i < 2 ? 'eager' : 'lazy';
        fig.append(img);
        if (li.dataset.alt) {
          const cap = doc.createElement('figcaption');
          cap.textContent = String(i + 1).padStart(2, '0') + ' — ' + li.dataset.alt;
          fig.append(cap);
        }
        gList.append(fig);
      });

      if (lenis) lenis.stop();
      dialog.showModal();
      dialog.scrollTop = 0;
      html.classList.add('gallery-open');
    });
  });

  $('.gallery__close', dialog).addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    html.classList.remove('gallery-open');
    if (lenis) lenis.start();
    if (lastTrigger) lastTrigger.focus({ preventScroll: true });
  });

  /* ---------------------------------------------------------------------
     Go
  --------------------------------------------------------------------- */
  runIntro(startReveals);
})();
