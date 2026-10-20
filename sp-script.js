/* =========================================================================
   SEVEN POINTS — interactions
   Plain JavaScript. Scrolling is the browser's own; the effects that follow
   the scroll (hero drift, About panel, statement lines, pinned photos) are
   CSS scroll-driven animations in sp-style.css, section 23, so the browser
   runs them in step with the scroll without redrawing the page.
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
  // Browsers that can run scroll effects in CSS (Chrome, Edge, Safari 26+). In others the
  // script moves the hero, About panel and statement as before, and the photo section
  // stacks as on phones.
  const cssScroll = !!(window.CSS && CSS.supports && CSS.supports('animation-timeline: view()'));

  /* ---------------------------------------------------------------------
     Small things
  --------------------------------------------------------------------- */
  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  // Tickers: duplicate the words once so the loop is seamless
  if (!reduceMotion) {
    $$('.ticker__track').forEach((track) => { track.innerHTML += track.innerHTML; });
  }

  // Looping animations (tickers, hero scroll cue) pause while off screen
  if ('IntersectionObserver' in window) {
    const idle = new IntersectionObserver((entries) => {
      entries.forEach((e) => e.target.classList.toggle('is-offscreen', !e.isIntersecting));
    });
    $$('.ticker, .hero').forEach((el) => idle.observe(el));
  }

  /* ---------------------------------------------------------------------
     Smooth scrolling library — no longer loaded by index.html, because the
     browser's own scrolling is faster and smoother. This stays inactive
     unless the Lenis <script> is added back.
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
    }, { rootMargin: '0px 0px 0px 0px', threshold: 0.01 });   // start as soon as it appears
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
    const dur = 1200;
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
     Intro — Seven Points logo animation
     The drawing itself is pure CSS (sp-style.css, section 22). This part
     decides WHEN the loader lifts: after the solid logo has held (5.0s) and
     the hero photo is ready — never later than 6.0s, so the whole intro
     always ends before 8s. Afterwards nothing of the loader keeps running.
  --------------------------------------------------------------------- */
  const runIntro = (done) => {
    const loader = $('.loader');
    const mode = html.classList.contains('is-intro-full') ? 'full'
      : html.classList.contains('is-intro-short') ? 'short' : null;

    if (!loader || !mode || !html.classList.contains('is-intro')) {
      if (loader) loader.remove();
      done();
      return;
    }
    if (lenis) lenis.stop();

    const t0 = window.__spIntroStart || performance.now();
    const elapsed = () => performance.now() - t0;
    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, Math.max(0, ms)));
    const heroImg = $('.hero__media img');
    let stopWaiting = () => {};
    const heroReady = new Promise((resolve) => {
      if (!heroImg || heroImg.complete) { resolve(); return; }
      heroImg.addEventListener('load', resolve, { once: true });
      heroImg.addEventListener('error', resolve, { once: true });
      stopWaiting = () => {                         // tidy listeners if we stopped waiting
        heroImg.removeEventListener('load', resolve);
        heroImg.removeEventListener('error', resolve);
      };
    });

    const hold = mode === 'full' ? 5000 : 0;       // drawn, outline held, filled, solid hold
    const maxWait = mode === 'full' ? 6000 : 700;  // slow-connection safety
    const revealAt = mode === 'full' ? 1100 : 60;  // nav + headline, after the panel starts lifting
    const removeAt = mode === 'full' ? 2200 : 300; // loader removed from the page

    Promise.race([
      Promise.all([heroReady, wait(hold - elapsed())]),
      wait(maxWait - elapsed()),
    ]).then(() => {
      stopWaiting();
      try { sessionStorage.setItem('sevenPointsIntroPlayed', 'true'); } catch (e) { /* storage blocked */ }
      html.classList.add('is-intro-exit');
      if (lenis) lenis.start();
      setTimeout(() => { html.classList.add('is-intro-reveal'); done(); }, revealAt);
      setTimeout(() => {
        html.classList.remove('is-intro', 'is-intro-full', 'is-intro-short', 'is-intro-exit', 'is-intro-reveal');
        loader.remove();                            // CSS animations end with the element
        delete window.__spIntroStart;
      }, removeAt);
    });
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
    // labels come from the page in Arabic and Kurdish (data-label-open / data-label-close)
    burger.setAttribute('aria-label', open ? (burger.dataset.labelClose || 'Close menu') : (burger.dataset.labelOpen || 'Open menu'));
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
          if (html.dir === 'rtl') {
            // right-to-left pages: bring the chapter in from the right-hand edge
            const shift = a.getBoundingClientRect().right - chapterNav.getBoundingClientRect().right + 20;
            chapterNav.scrollBy({ left: shift, behavior: reduceMotion ? 'auto' : 'smooth' });
          } else {
            chapterNav.scrollTo({ left: a.offsetLeft - 20, behavior: reduceMotion ? 'auto' : 'smooth' });
          }
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
     Scroll state (one rAF per scroll frame, only small updates)
     The moving parts themselves — hero drift, About panel, statement lines
     and the pinned photos — are CSS scroll-driven animations
     (sp-style.css, section 23). This loop sets classes and two small
     progress indicators — and, only in browsers without CSS scroll
     effects, moves the hero, About panel and statement as before.
  --------------------------------------------------------------------- */
  const nav = $('#nav');
  const aboutBody = $('.about__chapters');
  const progress = $('.chapters__progress');
  // Only used by browsers without CSS scroll effects (older Safari, Firefox):
  const hero = $('.hero');
  const heroMedia = $('.hero__media');
  const heroContent = $('.hero__content');
  const about = $('.about');
  const statement = $('[data-drift]');
  const statementLines = statement ? $$('.statement__title .ln', statement) : [];
  let lastAboutScale = '';
  const stories = $('.stories');
  const storyEls = $$('.story');
  const storyBars = $$('.stories__bar i');
  const pinQuery = window.matchMedia('(min-width: 900px)');

  // Pinned photo sequence: desktop, motion allowed, and CSS scroll effects available
  const setPinned = () => {
    stories.classList.toggle('is-pinned', pinQuery.matches && !reduceMotion && cssScroll);
    if (!stories.classList.contains('is-pinned')) storyEls.forEach((s) => s.classList.add('is-active'));
  };
  setPinned();

  let ticking = false;
  let lastY = window.scrollY;
  let lastProgress = '';
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

    // Browsers without CSS scroll effects: the same hero / About panel / statement
    // motion, moved by this script as before
    if (!reduceMotion && !cssScroll) {
      const p = clamp(y / vh);
      if (p < 1) {
        heroMedia.style.transform = `translate3d(0, ${(p * 16).toFixed(2)}vh, 0) scale(${(1.04 + p * 0.04).toFixed(4)})`;
        heroContent.style.transform = `translate3d(0, ${(-p * 70).toFixed(1)}px, 0)`;
        heroContent.style.opacity = String(clamp(1 - p * 1.25));
        hero.style.setProperty('--shade', (p * 0.65).toFixed(3));
      }
      const aTop = about.getBoundingClientRect().top;
      const s = (0.92 + 0.08 * clamp((vh - aTop) / (vh * 0.85))).toFixed(4);
      if (s !== lastAboutScale) { about.style.setProperty('--s', s); lastAboutScale = s; }
      if (statementLines.length) {
        const r = statement.getBoundingClientRect();
        if (r.top < vh && r.bottom > 0) {
          const sp = clamp((vh - r.top) / (vh + r.height)) - 0.5;
          statementLines.forEach((line, i) => {
            line.style.transform = `translate3d(${(sp * (i % 2 === 0 ? 1 : -1) * 9).toFixed(2)}vw, 0, 0)`;
          });
        }
      }
    }

    // About: reading progress along the chapter list (desktop)
    if (!reduceMotion && progress && aboutBody) {
      const r = aboutBody.getBoundingClientRect();
      const ap = clamp((vh * 0.4 - r.top) / (r.height - vh * 0.5)).toFixed(4);
      if (ap !== lastProgress) { progress.style.setProperty('--p', ap); lastProgress = ap; }
    }

    // Pinned photos: which one is current (its words rise) and the small bars on the right
    if (stories.classList.contains('is-pinned')) {
      const r = stories.getBoundingClientRect();
      if (r.top < vh && r.bottom > 0) {
        const t = clamp(-r.top / (r.height - vh)) * storyEls.length;
        let active = 0;
        storyEls.forEach((story, i) => { if (i > 0 && clamp((t - (i - 0.3)) / 0.6) > 0.55) active = i; });
        storyEls.forEach((story, i) => story.classList.toggle('is-active', i === active));
        storyBars.forEach((bar, i) => bar.style.setProperty('--f', clamp(t - i).toFixed(3)));
      }
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
      gCount.textContent = items.length + (items.length === 1 ? (dialog.dataset.one || ' image') : (dialog.dataset.many || ' images'));
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
