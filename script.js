/* =========================================================================
   SEVEN POINTS — interactions
   Plain JavaScript, no libraries. Everything degrades gracefully:
   without JS the page is fully readable, just without motion.
   ========================================================================= */
(() => {
  'use strict';

  const doc = document;
  const html = doc.documentElement;
  const $ = (s, c = doc) => c.querySelector(s);
  const $$ = (s, c = doc) => Array.from(c.querySelectorAll(s));
  const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------------
     Small things
  --------------------------------------------------------------------- */
  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  // Tickers: duplicate the words once so the loop is seamless
  if (!reduceMotion) {
    $$('.ticker__track').forEach((track) => { track.innerHTML += track.innerHTML; });
  }

  /* ---------------------------------------------------------------------
     Reveal on scroll — headlines rise line by line, text fades, images unmask
  --------------------------------------------------------------------- */
  $$('[data-reveal="lines"]').forEach((el) => {
    $$('.ln > span', el).forEach((line, i) => line.style.setProperty('--i', i));
  });

  const revealTargets = $$('[data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const revealer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          revealer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.01 });
    revealTargets.forEach((el) => revealer.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add('is-in'));
  }

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
    if (e.matches) setMenu(false);
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
        // keep the active item visible in the horizontal (mobile) bar
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
     - nav condenses
     - hero image drifts and scales 1.04 → 1.08, copy lifts away
     - About panel widens from 92% to full width as it rises
     - Stories: pinned sequence, each photo revealed from below
  --------------------------------------------------------------------- */
  const nav = $('#nav');
  const hero = $('.hero');
  const heroMedia = $('.hero__media');
  const heroContent = $('.hero__content');
  const about = $('.about');
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
  pinQuery.addEventListener('change', () => { setPinned(); requestUpdate(); });

  let ticking = false;
  const requestUpdate = () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  };

  function update() {
    ticking = false;
    const y = window.scrollY;
    const vh = window.innerHeight;

    nav.classList.toggle('is-scrolled', y > 40);

    if (!reduceMotion) {
      // Hero
      const p = clamp(y / vh);
      if (p < 1) {
        heroMedia.style.transform = `translate3d(0, ${(p * 16).toFixed(2)}vh, 0) scale(${(1.04 + p * 0.04).toFixed(4)})`;
        heroContent.style.transform = `translate3d(0, ${(-p * 70).toFixed(1)}px, 0)`;
        heroContent.style.opacity = String(clamp(1 - p * 1.25));
        hero.style.setProperty('--shade', (p * 0.65).toFixed(3));
      }

      // About panel
      const aTop = about.getBoundingClientRect().top;
      const a = clamp((vh - aTop) / (vh * 0.85));
      about.style.setProperty('--s', (0.92 + 0.08 * a).toFixed(4));
    }

    // Stories
    if (stories.classList.contains('is-pinned')) {
      const r = stories.getBoundingClientRect();
      const run = r.height - vh;
      const sp = clamp(-r.top / run);
      const n = storyEls.length;
      const t = sp * n; // 0 → 3
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
     Project gallery (full-screen dialog)
     Images come from the hidden <ul class="project__gallery"> in each project
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

      dialog.showModal();
      dialog.scrollTop = 0;
      html.classList.add('gallery-open');
    });
  });

  $('.gallery__close', dialog).addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    html.classList.remove('gallery-open');
    if (lastTrigger) lastTrigger.focus({ preventScroll: true });
  });
})();
