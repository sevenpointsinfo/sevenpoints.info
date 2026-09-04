(() => {
  'use strict';

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const siteHeader = $('#siteHeader');
  const backToTop = $('#backToTop');
  const hero = $('.hero');
  const heroImage = $('#heroImage');
  const heroTransition = $('#heroTransition');
  const discover = $('.discover');
  let scrollFrame = 0;
  let updateScrollScenes = () => {};

  const updateScrollEffects = () => {
    scrollFrame = 0;
    const y = window.scrollY;
    siteHeader?.classList.toggle('scrolled', y > 34);
    backToTop?.classList.toggle('show', y > 720);

    if (hero && heroImage && heroTransition && !reducedMotion.matches) {
      const heroHeight = Math.max(hero.offsetHeight, 1);
      const progress = clamp(y / heroHeight);

      if (window.innerWidth > 680) {
        heroImage.style.transform = `translate3d(0, ${Math.min(y * 0.075, 72)}px, 0)`;

        const bridgeProgress = clamp((progress - 0.58) / 0.25);
        const eased = 1 - Math.pow(1 - bridgeProgress, 3);
        const fadeProgress = clamp((progress - 0.88) / 0.1);
        heroTransition.style.setProperty('--bridge-scale', String(1 + eased * 14));
        heroTransition.style.setProperty('--bridge-opacity', String(1 - fadeProgress));
        if (discover) discover.style.opacity = String(1 - clamp((progress - 0.48) / 0.22));
      } else {
        heroImage.style.transform = '';
        heroTransition.style.removeProperty('--bridge-scale');
        heroTransition.style.removeProperty('--bridge-opacity');
        if (discover) discover.style.opacity = '';
      }
    } else if (heroImage && heroTransition) {
      heroImage.style.transform = '';
      heroTransition.style.removeProperty('--bridge-scale');
      heroTransition.style.removeProperty('--bridge-opacity');
      if (discover) discover.style.opacity = '';
    }

    updateScrollScenes();
  };

  const requestScrollUpdate = () => {
    if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateScrollEffects);
  };

  window.addEventListener('scroll', requestScrollUpdate, { passive: true });
  window.addEventListener('resize', requestScrollUpdate, { passive: true });
  reducedMotion.addEventListener?.('change', requestScrollUpdate);
  updateScrollEffects();

  backToTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
  });

  const revealItems = $$('.reveal');
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.08 },
    );
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('visible'));
  }

  const menuToggle = $('#menuToggle');
  const mobileMenu = $('#mobileMenu');

  const setMenu = (open) => {
    if (!menuToggle || !mobileMenu) return;
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    mobileMenu.setAttribute('aria-hidden', String(!open));
    mobileMenu.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open);
    if (open) $('nav a', mobileMenu)?.focus();
  };

  menuToggle?.addEventListener('click', () => {
    setMenu(menuToggle.getAttribute('aria-expanded') !== 'true');
  });

  $$('a[href^="#"]', mobileMenu || document).forEach((link) => {
    link.addEventListener('click', () => setMenu(false));
  });

  const aboutTabs = $$('[data-about]');
  const aboutPanes = $$('[data-pane]');
  const aboutImages = $$('[data-about-image]');
  const aboutCounters = $$('[data-count-to]');
  const aboutScroll = $('#aboutScroll');
  const aboutRail = $('.about-rail');
  const aboutImageCaption = $('#aboutImageCaption');
  const aboutCaptions = {
    who: '01 · One integrated delivery team',
    values: '02 · Detail, discipline and accountability',
    team: '03 · Different disciplines, one direction',
    founders: '04 · Design and execution kept together',
  };
  let activeAboutKey = '';

  let proofHasAnimated = false;
  const animateAboutCounters = () => {
    if (proofHasAnimated || !aboutCounters.length) return;
    proofHasAnimated = true;

    if (reducedMotion.matches) {
      aboutCounters.forEach((counter) => {
        counter.textContent = String(Number(counter.dataset.countTo) || 0);
      });
      return;
    }

    const startTime = performance.now();
    const duration = 1080;
    const stagger = 70;
    const drawFrame = (now) => {
      let animationComplete = true;
      aboutCounters.forEach((counter, index) => {
        const target = Number(counter.dataset.countTo) || 0;
        const progress = clamp((now - startTime - index * stagger) / duration);
        const easedProgress = 1 - Math.pow(1 - progress, 4);
        counter.textContent = String(Math.round(target * easedProgress));
        if (progress < 1) animationComplete = false;
      });
      if (!animationComplete) window.requestAnimationFrame(drawFrame);
    };
    window.requestAnimationFrame(drawFrame);
  };

  const proofStats = $('.proof-stats');
  if (proofStats && 'IntersectionObserver' in window) {
    const proofObserver = new IntersectionObserver(
      (entries, observer) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        animateAboutCounters();
        observer.disconnect();
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.32 },
    );
    proofObserver.observe(proofStats);
  } else {
    animateAboutCounters();
  }

  const activateAbout = (key, focusTab = false, centerTab = false) => {
    activeAboutKey = key;
    aboutTabs.forEach((tab) => {
      const active = tab.dataset.about === key;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-current', String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && focusTab) tab.focus();
      if (active && centerTab && window.innerWidth <= 900) {
        const tabList = tab.parentElement;
        tabList?.scrollTo({
          left: tab.offsetLeft - (tabList.clientWidth - tab.offsetWidth) / 2,
          behavior: reducedMotion.matches ? 'auto' : 'smooth',
        });
      }
    });
    aboutPanes.forEach((pane) => {
      const active = pane.dataset.pane === key;
      pane.classList.toggle('active', active);
      if (window.innerWidth > 900) pane.setAttribute('aria-hidden', String(!active));
      else pane.removeAttribute('aria-hidden');
    });
    aboutImages.forEach((image) => {
      const active = image.dataset.aboutImage === key;
      image.classList.toggle('active', active);
      image.setAttribute('aria-hidden', String(!active));
    });
    if (aboutImageCaption) aboutImageCaption.textContent = aboutCaptions[key] || '';
  };

  const scrollToAboutChapter = (index, focusTab = false) => {
    const tab = aboutTabs[index];
    const pane = aboutPanes[index];
    if (!tab || !pane) return;
    activateAbout(tab.dataset.about, focusTab, true);

    if (window.innerWidth > 900 && aboutScroll) {
      const headerHeight = siteHeader?.offsetHeight || 0;
      const stickyHeight = Math.max(window.innerHeight - headerHeight, 1);
      const scrollTravel = Math.max(aboutScroll.offsetHeight - stickyHeight, 1);
      const start = window.scrollY + aboutScroll.getBoundingClientRect().top - headerHeight;
      const ratio = aboutTabs.length > 1 ? index / (aboutTabs.length - 1) : 0;
      window.scrollTo({
        top: start + scrollTravel * ratio,
        behavior: reducedMotion.matches ? 'auto' : 'smooth',
      });
    } else {
      pane.scrollIntoView({
        block: 'start',
        behavior: reducedMotion.matches ? 'auto' : 'smooth',
      });
    }
  };

  aboutTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => scrollToAboutChapter(index));
    tab.addEventListener('keydown', (event) => {
      let nextIndex = index;
      if (event.key === 'ArrowRight') nextIndex = (index + 1) % aboutTabs.length;
      else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + aboutTabs.length) % aboutTabs.length;
      else if (event.key === 'Home') nextIndex = 0;
      else if (event.key === 'End') nextIndex = aboutTabs.length - 1;
      else return;
      event.preventDefault();
      scrollToAboutChapter(nextIndex, true);
    });
  });

  const serviceSteps = $$('[data-service-step]');
  const serviceImages = $$('[data-service-image]');
  const serviceCaption = $('#serviceCaption');
  const serviceVisual = $('#serviceVisual');
  const serviceCube = $('#serviceCube');
  const serviceNames = ['01 / 04', '02 / 04', '03 / 04', '04 / 04'];
  let activeServiceIndex = -1;

  const activateService = (index) => {
    if (index === activeServiceIndex) return;
    activeServiceIndex = index;
    serviceSteps.forEach((step, itemIndex) => step.classList.toggle('active', itemIndex === index));
    serviceImages.forEach((image, itemIndex) => image.classList.toggle('active', itemIndex === index));
    if (serviceCaption) serviceCaption.textContent = serviceNames[index];
  };

  updateScrollScenes = () => {
    if (aboutScroll && aboutPanes.length) {
      if (window.innerWidth > 900) {
        const headerHeight = siteHeader?.offsetHeight || 0;
        const stickyHeight = Math.max(window.innerHeight - headerHeight, 1);
        const scrollTravel = Math.max(aboutScroll.offsetHeight - stickyHeight, 1);
        const rect = aboutScroll.getBoundingClientRect();
        const rawProgress = clamp((headerHeight - rect.top) / scrollTravel);
        const lastChapter = aboutPanes.length - 1;
        const timeline = rawProgress * lastChapter;
        const segmentIndex = Math.min(Math.floor(timeline), Math.max(lastChapter - 1, 0));
        const segmentPhase = timeline >= lastChapter ? 1 : timeline - Math.floor(timeline);
        const transitionProgress = clamp((segmentPhase - 0.18) / 0.64);
        const easedTransition = transitionProgress * transitionProgress * (3 - 2 * transitionProgress);
        const chapterProgress = timeline >= lastChapter ? lastChapter : segmentIndex + easedTransition;
        const visualProgress = reducedMotion.matches ? Math.round(chapterProgress) : chapterProgress;
        const activeIndex = clamp(Math.floor(chapterProgress + 0.58), 0, lastChapter);

        aboutPanes.forEach((pane, index) => {
          const distance = index - visualProgress;
          const absoluteDistance = Math.abs(distance);
          const visibility = clamp(1 - absoluteDistance * 1.2);
          pane.style.transform = `translate3d(0, ${distance * 92}%, 0)`;
          pane.style.opacity = String(visibility);
          pane.style.zIndex = String(10 - Math.round(absoluteDistance * 2));
          pane.style.visibility = absoluteDistance >= 0.96 ? 'hidden' : 'visible';
          pane.setAttribute('aria-hidden', String(index !== activeIndex));
        });

        aboutImages.forEach((image, index) => {
          const distance = Math.abs(index - visualProgress);
          image.style.opacity = String(clamp(1 - distance * 1.45));
          image.style.transform = `scale(${1 + Math.min(distance, 1) * 0.055})`;
          image.style.clipPath = `inset(${Math.min(distance, 1) * 7}% 0 ${Math.min(distance, 1) * 7}% 0)`;
        });

        aboutRail?.style.setProperty('--about-dot-y', `${8 + rawProgress * 84}%`);
        const nextKey = aboutTabs[activeIndex]?.dataset.about;
        if (nextKey && nextKey !== activeAboutKey) activateAbout(nextKey);
      } else {
        aboutPanes.forEach((pane) => {
          pane.style.removeProperty('transform');
          pane.style.removeProperty('opacity');
          pane.style.removeProperty('z-index');
          pane.style.removeProperty('visibility');
          pane.removeAttribute('aria-hidden');
        });
        aboutImages.forEach((image) => {
          image.style.removeProperty('opacity');
          image.style.removeProperty('transform');
          image.style.removeProperty('clip-path');
        });

        const viewportMarker = window.innerHeight * 0.42;
        let nearestIndex = 0;
        let nearestDistance = Number.POSITIVE_INFINITY;
        aboutPanes.forEach((pane, index) => {
          const paneRect = pane.getBoundingClientRect();
          const distance = Math.abs(paneRect.top + Math.min(paneRect.height * 0.3, 180) - viewportMarker);
          if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestIndex = index;
          }
        });
        const nextKey = aboutTabs[nearestIndex]?.dataset.about;
        if (nextKey && nextKey !== activeAboutKey) activateAbout(nextKey, false, true);
      }
    }

    if (serviceCube && serviceSteps.length && window.innerWidth > 900) {
      const marker = window.innerHeight * 0.5;
      const centers = serviceSteps.map((step) => {
        const rect = step.getBoundingClientRect();
        return rect.top + rect.height / 2;
      });
      let serviceProgress = 0;

      if (marker >= centers[centers.length - 1]) {
        serviceProgress = serviceSteps.length - 1;
      } else if (marker > centers[0]) {
        for (let index = 0; index < centers.length - 1; index += 1) {
          if (marker < centers[index] || marker > centers[index + 1]) continue;
          const span = Math.max(centers[index + 1] - centers[index], 1);
          serviceProgress = index + (marker - centers[index]) / span;
          break;
        }
      }

      const lastService = serviceSteps.length - 1;
      const segmentIndex = Math.min(Math.floor(serviceProgress), Math.max(lastService - 1, 0));
      const segmentPhase = serviceProgress >= lastService ? 1 : serviceProgress - Math.floor(serviceProgress);
      const transitionProgress = clamp((segmentPhase - 0.2) / 0.6);
      const easedTransition = transitionProgress * transitionProgress * (3 - 2 * transitionProgress);
      const stagedProgress = serviceProgress >= lastService ? lastService : segmentIndex + easedTransition;
      const visualProgress = reducedMotion.matches ? Math.round(stagedProgress) : stagedProgress;
      const localProgress = visualProgress - Math.floor(visualProgress);
      const arc = Math.sin(localProgress * Math.PI);
      serviceCube.style.setProperty('--cube-y', `${-14 - visualProgress * 90}deg`);
      serviceCube.style.setProperty('--cube-x', `${-8 - arc * 10}deg`);
      serviceCube.style.setProperty('--cube-shift-x', `${Math.sin(visualProgress * Math.PI) * 18}px`);
      serviceCube.style.setProperty('--cube-shift-y', `${-arc * 20}px`);
      serviceVisual?.style.setProperty('--service-glow-x', `${35 + (visualProgress / Math.max(serviceSteps.length - 1, 1)) * 30}%`);
      serviceSteps.forEach((step, index) => {
        const distance = Math.abs(index - visualProgress);
        step.style.opacity = String(clamp(1 - distance * 1.65));
        step.style.visibility = distance > 0.72 ? 'hidden' : 'visible';
        step.style.transform = `translate3d(0, ${(index - visualProgress) * 18}px, 0)`;
      });
      activateService(clamp(Math.floor(visualProgress + 0.58), 0, lastService));
    } else {
      serviceSteps.forEach((step) => {
        step.style.removeProperty('opacity');
        step.style.removeProperty('visibility');
        step.style.removeProperty('transform');
      });
    }
  };

  activateAbout('who');
  activateService(0);
  requestScrollUpdate();

  const mobileServices = $$('[data-mobile-service]');
  const mobileServiceTrack = $('#mobileServiceTrack');
  const serviceCount = $('#serviceCount');
  let mobileServiceIndex = 0;
  let serviceTouchStart = 0;

  const showMobileService = (index) => {
    mobileServiceIndex = (index + mobileServices.length) % mobileServices.length;
    mobileServices.forEach((service, itemIndex) => service.classList.toggle('active', itemIndex === mobileServiceIndex));
    if (serviceCount) serviceCount.textContent = `${String(mobileServiceIndex + 1).padStart(2, '0')} / ${String(mobileServices.length).padStart(2, '0')}`;
  };

  $('#servicePrev')?.addEventListener('click', () => showMobileService(mobileServiceIndex - 1));
  $('#serviceNext')?.addEventListener('click', () => showMobileService(mobileServiceIndex + 1));
  mobileServiceTrack?.addEventListener('touchstart', (event) => {
    serviceTouchStart = event.changedTouches[0]?.clientX || 0;
  }, { passive: true });
  mobileServiceTrack?.addEventListener('touchend', (event) => {
    const distance = (event.changedTouches[0]?.clientX || 0) - serviceTouchStart;
    if (Math.abs(distance) < 48) return;
    showMobileService(mobileServiceIndex + (distance < 0 ? 1 : -1));
  }, { passive: true });

  const trustContent = [
    {
      quote: 'Commercial and institutional projects need firm coordination between scope, programme, procurement and site delivery.',
      name: 'Seven Points',
      role: 'Delivery standard',
    },
    {
      quote: 'Architecture, interiors, materials and MEP decisions are coordinated before information is released to site.',
      name: 'Seven Points',
      role: 'Delivery standard',
    },
    {
      quote: 'Details are reviewed during drawing, procurement and installation—not only at final inspection.',
      name: 'Seven Points',
      role: 'Delivery standard',
    },
    {
      quote: 'Private work follows the same structured process, with direct communication and careful close-out.',
      name: 'Seven Points',
      role: 'Delivery standard',
    },
  ];

  const trustTabs = $$('[data-trust]');
  const trustQuote = $('#trustQuote');
  const trustName = $('#trustName');
  const trustRole = $('#trustRole');
  const trustCount = $('#trustCount');

  const activateTrust = (index) => {
    const content = trustContent[index];
    trustTabs.forEach((tab, itemIndex) => {
      const active = itemIndex === index;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    if (trustQuote) trustQuote.textContent = content.quote;
    if (trustName) trustName.textContent = content.name;
    if (trustRole) trustRole.textContent = content.role;
    if (trustCount) trustCount.textContent = `${String(index + 1).padStart(2, '0')} / 04`;
  };

  trustTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateTrust(index));
    tab.addEventListener('keydown', (event) => {
      let nextIndex = index;
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') nextIndex = (index + 1) % trustTabs.length;
      else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') nextIndex = (index - 1 + trustTabs.length) % trustTabs.length;
      else if (event.key === 'Home') nextIndex = 0;
      else if (event.key === 'End') nextIndex = trustTabs.length - 1;
      else return;
      event.preventDefault();
      activateTrust(nextIndex);
      trustTabs[nextIndex].focus();
    });
  });
  activateTrust(0);

  const hallBase = 'assets/projects/zakho-conference-hall/';
  const salonBase = 'assets/projects/jade-touch-salon/';
  const projectData = {
    zakho: {
      title: 'Zakho Conference Hall',
      description: 'Exterior and interior design carried through construction over 18 months. Explore the façade, arrival spaces, circulation and hall interiors.',
      meta: [
        ['Scope', 'Exterior / Interior / Construction'],
        ['Duration', '18 months'],
        ['Location', 'Zakho · Duhok Region'],
        ['Type', 'Corporate / Institutional'],
      ],
      images: Array.from({ length: 10 }, (_, index) => `${hallBase}zakhoconferencehall${index + 1}.jpg`),
      video: `${hallBase}film.mp4`,
    },
    jade: {
      title: 'Jade Touch Salon',
      description: 'A six-month private interior design and construction project. Explore the reception, styling areas, circulation, lighting and material details.',
      meta: [
        ['Scope', 'Interior Design / Fit-Out'],
        ['Duration', '6 months'],
        ['Client type', 'Private'],
        ['Discipline', 'Design / Construction'],
      ],
      images: [
        `${salonBase}saloon.jpg`,
        ...Array.from({ length: 8 }, (_, index) => `${salonBase}saloon${index + 2}.jpg`),
      ],
    },
  };

  const projectModal = $('#projectModal');
  const modalClose = $('#modalClose');
  const modalTitle = $('#modalTitle');
  const modalEyebrow = $('#modalEyebrow');
  const modalMeta = $('#modalMeta');
  const modalDescription = $('#modalDescription');
  const modalGallery = $('#modalGallery');
  let lastProjectTrigger = null;

  const openProject = (key, trigger) => {
    const project = projectData[key];
    if (!project || !projectModal) return;
    lastProjectTrigger = trigger || document.activeElement;
    if (modalTitle) modalTitle.textContent = project.title;
    if (modalEyebrow) modalEyebrow.textContent = project.title;
    if (modalDescription) modalDescription.textContent = project.description;
    if (modalMeta) {
      modalMeta.innerHTML = project.meta.map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join('');
    }
    if (modalGallery) {
      const video = project.video
        ? `<figure class="video-frame"><video controls preload="metadata" poster="${project.images[1] || project.images[0]}"><source src="${project.video}" type="video/mp4">Your browser does not support embedded video.</video></figure>`
        : '';
      const images = project.images.map((src, index) => `<figure><img src="${src}" alt="${project.title} project view ${index + 1}" loading="${index < 2 ? 'eager' : 'lazy'}"></figure>`).join('');
      modalGallery.innerHTML = `${images}${video}`;
    }
    projectModal.hidden = false;
    projectModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    window.requestAnimationFrame(() => {
      projectModal.classList.add('open');
      modalClose?.focus();
    });
  };

  const closeProject = () => {
    if (!projectModal || projectModal.hidden) return;
    projectModal.classList.remove('open');
    projectModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    $$('video', projectModal).forEach((video) => video.pause());
    window.setTimeout(() => {
      projectModal.hidden = true;
      if (modalGallery) modalGallery.innerHTML = '';
      lastProjectTrigger?.focus?.();
    }, reducedMotion.matches ? 0 : 380);
  };

  $$('[data-project]').forEach((trigger) => {
    trigger.addEventListener('click', () => openProject(trigger.dataset.project, trigger));
  });
  modalClose?.addEventListener('click', closeProject);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (projectModal && !projectModal.hidden) closeProject();
      else if (menuToggle?.getAttribute('aria-expanded') === 'true') setMenu(false);
      return;
    }

    if (event.key === 'Tab' && projectModal && !projectModal.hidden) {
      const focusable = $$('button, a[href], input, select, textarea, video[controls], [tabindex]:not([tabindex="-1"])', projectModal)
        .filter((item) => !item.hasAttribute('disabled'));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  const inquiryForm = $('#inquiryForm');
  const formStatus = $('#formStatus');
  const inquiryFields = {
    projectType: $('#projectType'),
    projectLocation: $('#projectLocation'),
    projectTimeline: $('#projectTimeline'),
    projectDetails: $('#projectDetails'),
  };

  const clearFieldError = (field) => field?.removeAttribute('aria-invalid');
  Object.values(inquiryFields).forEach((field) => field?.addEventListener('input', () => clearFieldError(field)));

  inquiryForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const required = [inquiryFields.projectType, inquiryFields.projectLocation, inquiryFields.projectDetails];
    const invalid = required.filter((field) => !field?.value.trim());
    required.forEach((field) => field?.setAttribute('aria-invalid', String(invalid.includes(field))));
    if (invalid.length) {
      if (formStatus) formStatus.textContent = 'Please complete the project type, location and details.';
      invalid[0]?.focus();
      return;
    }

    const message = [
      'Hello Seven Points, I would like to discuss a project.',
      `Project type: ${inquiryFields.projectType.value.trim()}`,
      `Location: ${inquiryFields.projectLocation.value.trim()}`,
      `Timeline: ${inquiryFields.projectTimeline.value.trim() || 'To be discussed'}`,
      `Details: ${inquiryFields.projectDetails.value.trim()}`,
    ].join('\n');

    if (formStatus) formStatus.textContent = 'Your inquiry is ready. Opening WhatsApp…';
    window.open(`https://wa.me/9647502205577?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  });

  const registerWebMcp = () => {
    const context = document.modelContext;
    if (!context?.registerTool || !inquiryForm) return;

    const allowedProjectTypes = $$('option', inquiryFields.projectType)
      .map((option) => option.value)
      .filter(Boolean);

    try {
      void Promise.resolve(context.registerTool({
        name: 'prepare_project_inquiry',
        title: 'Prepare project inquiry',
        description: 'Fill the visible Seven Points project inquiry form for the visitor to review before continuing to WhatsApp.',
        inputSchema: {
          type: 'object',
          properties: {
            projectType: { type: 'string', enum: allowedProjectTypes },
            location: { type: 'string', minLength: 1 },
            timeline: { type: 'string' },
            details: { type: 'string', minLength: 1 },
          },
          required: ['projectType', 'location', 'details'],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute(input) {
          if (!input || typeof input !== 'object') throw new Error('Inquiry details are required.');
          const { projectType, location, timeline = '', details } = input;
          if (!allowedProjectTypes.includes(projectType)) throw new Error('Choose a supported project type.');
          if (typeof location !== 'string' || !location.trim()) throw new Error('Project location is required.');
          if (typeof details !== 'string' || !details.trim()) throw new Error('Project details are required.');
          if (typeof timeline !== 'string') throw new Error('Timeline must be text.');

          inquiryFields.projectType.value = projectType;
          inquiryFields.projectLocation.value = location.trim();
          inquiryFields.projectTimeline.value = timeline.trim();
          inquiryFields.projectDetails.value = details.trim();
          Object.values(inquiryFields).forEach(clearFieldError);
          if (formStatus) formStatus.textContent = 'Inquiry prepared. Review the details, then continue on WhatsApp when ready.';
          inquiryForm.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'center' });

          return {
            status: 'prepared',
            projectType,
            location: location.trim(),
            nextAction: 'Review the visible form and press Continue on WhatsApp.',
          };
        },
      })).catch(() => {});
    } catch {
      // WebMCP is optional; the visible inquiry form remains fully functional.
    }
  };

  registerWebMcp();
})();
