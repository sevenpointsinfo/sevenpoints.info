/* =========================================================
   Seven Points — content loader
   ---------------------------------------------------------
   Fetches content/settings.json, content/projects.json and
   content/clients.json and renders them into the containers
   already present in index.html (#workGrid, #statsGrid, etc).
   Once rendering is done it calls initSite(projectsData, settings),
   the function defined in the big inline <script> above this
   file, which wires up the nav, modal, carousel, counters and
   contact form exactly as before.

   Editing photos/text should always happen through the CMS
   at /admin/ — this file only ever *reads* the JSON files.

   FALLBACK_* below is a safety net only — a copy of the content
   that was live when this file was last published. It is used
   only if content/*.json can't be fetched or fails to parse
   (e.g. a brief hiccup right after a CMS publish), so the site
   still works instead of showing a blank page. The JSON files
   are always the real source of truth; this is not meant to be
   edited by hand.
========================================================= */

var FALLBACK_SETTINGS = {
  hero: {
    kicker: "Seven Points · Duhok, Kurdistan Region",
    titleLine1Gold: "Precision",
    titleLine1Rest: "in Construction.",
    titleLine2Gold: "Power",
    titleLine2Rest: "in Execution.",
    subtitle: "Construction, design and project delivery for commercial, institutional and private developments across the Kurdistan Region.",
    backgroundImage: "sevenpointsbg.png",
  },
  about: {
    lead: "Seven Points is based in Duhok and delivers construction, design, fit-out and project solutions across the Kurdistan Region.",
    body: "Our team coordinates planning, site execution, finishing and handover under one direction, working across commercial, corporate, institutional and private projects.",
  },
  stats: [
    { type: "number", value: 150, suffix: "+", label: "Projects Completed" },
    { type: "number", value: 5, suffix: "+", label: "Years Operating" },
    { type: "number", value: 50, suffix: "+", label: "Clients Served" },
    { type: "text", value: "Duhok", label: "Based in Kurdistan Region" },
  ],
  contact: {
    phone: "+964 750 220 5577",
    whatsappMessage: "Hi Seven Points! I'm interested in your services. Can you provide more information?",
    email: "email@sevenpoints.info",
    addressLine1: "Zirka Road, Duhok",
    addressLine2: "Kurdistan Region, Iraq",
  },
  social: [],
};

var FALLBACK_PROJECTS = [
  {
    name: "Zakho Conference Hall", slug: "zakho-conference-hall",
    location: "Zakho, Kurdistan Region", year: "", category: "Construction",
    services: ["Architecture", "Construction", "Interior"],
    shortDescription: "Exterior & Interior Design",
    longDescription: "Conference hall project combining exterior and interior design with spaces planned for large-scale gatherings and corporate events.",
    duration: "18 months", clientType: "Corporate",
    hero: "zakhoconferencehall1.jpg",
    gallery: ["zakhoconferencehall1.jpg","zakhoconferencehall2.jpg","zakhoconferencehall3.jpg","zakhoconferencehall4.jpg","zakhoconferencehall5.jpg","zakhoconferencehall6.jpg","zakhoconferencehall7.jpg","zakhoconferencehall8.jpg","zakhoconferencehall9.jpg"],
    video: "zakhoconferencehallvideol.mp4", featured: true, order: 1,
  },
  {
    name: "Jade Touch Salon", slug: "jade-touch-salon",
    location: "", year: "", category: "Construction and Interior Design",
    services: ["Construction", "Interior"],
    shortDescription: "Construction & Interior Design",
    longDescription: "Salon project delivered from construction works through interior finishing, with the layout and finishes coordinated as one complete scope.",
    duration: "6 months", clientType: "Private",
    hero: "saloon.jpg",
    gallery: ["saloon.jpg","saloon2.jpg","saloon3.jpg","saloon4.jpg","saloon5.jpg","saloon6.jpg","saloon7.jpg","saloon8.jpg","saloon9.jpg"],
    video: "", featured: true, order: 2,
  },
];

var FALLBACK_CLIENTS = [];

(function () {
  "use strict";

  function phoneDigits(phone) {
    return (phone || "").replace(/[^\d]/g, "");
  }

  function el(tag, opts) {
    opts = opts || {};
    var node = document.createElement(tag);
    if (opts.className) node.className = opts.className;
    if (opts.text != null) node.textContent = opts.text;
    if (opts.html != null) node.innerHTML = opts.html;
    if (opts.attrs) {
      Object.keys(opts.attrs).forEach(function (k) {
        node.setAttribute(k, opts.attrs[k]);
      });
    }
    return node;
  }

  function initials(name) {
    return (name || "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(function (w) { return w[0].toUpperCase(); })
      .join("");
  }

  /* ---------- HERO ---------- */
  function renderHero(hero) {
    if (!hero) return;

    var kicker = document.getElementById("heroKicker");
    if (kicker && hero.kicker) kicker.textContent = hero.kicker;

    var title = document.getElementById("heroTitle");
    if (title) {
      title.innerHTML = "";
      title.appendChild(el("span", { className: "gold", text: hero.titleLine1Gold || "" }));
      title.appendChild(document.createTextNode(" " + (hero.titleLine1Rest || "")));
      title.appendChild(document.createElement("br"));
      title.appendChild(el("span", { className: "gold", text: hero.titleLine2Gold || "" }));
      title.appendChild(document.createTextNode(" " + (hero.titleLine2Rest || "")));
    }

    var subtitle = document.getElementById("heroSubtitle");
    if (subtitle && hero.subtitle) subtitle.textContent = hero.subtitle;

    var heroSection = document.getElementById("hero");
    if (heroSection && hero.backgroundImage) {
      // Mirrors the layered gradient in the CSS .hero rule so only the
      // photo changes — if that gradient is ever redesigned in style.css,
      // update it here too so the two stay in sync.
      heroSection.style.backgroundImage =
        "linear-gradient(90deg, rgba(0,0,0,.82) 0%, rgba(0,0,0,.58) 48%, rgba(0,0,0,.24) 100%), " +
        "linear-gradient(180deg, rgba(0,0,0,.1), rgba(0,0,0,.58)), " +
        "url('" + hero.backgroundImage + "')";
      heroSection.style.backgroundPosition = "center";
      heroSection.style.backgroundSize = "cover";
      heroSection.style.backgroundRepeat = "no-repeat";
    }
  }

  /* ---------- ABOUT ---------- */
  function renderAbout(about) {
    if (!about) return;
    var lead = document.getElementById("aboutLead");
    if (lead && about.lead) lead.textContent = about.lead;
    var body = document.getElementById("aboutBody");
    if (body && about.body) body.textContent = about.body;
  }

  /* ---------- STATS ---------- */
  function renderStats(stats) {
    var grid = document.getElementById("statsGrid");
    if (!grid || !Array.isArray(stats)) return;
    grid.innerHTML = "";
    stats.forEach(function (stat) {
      var isNumber = stat.type === "number";
      var card = el("div", {
        className: "stat-card reveal" + (isNumber ? "" : " stat-location"),
      });
      if (isNumber) {
        card.setAttribute("data-target", stat.value);
        card.setAttribute("data-suffix", stat.suffix || "");
      }
      var numberText = isNumber ? String(stat.value) + (stat.suffix || "") : String(stat.value);
      card.appendChild(el("span", { className: "stat-number", text: numberText }));
      card.appendChild(el("div", { className: "stat-label", text: stat.label || "" }));
      grid.appendChild(card);
    });
  }

  /* ---------- PROJECTS ---------- */
  function renderProjects(projects) {
    var grid = document.getElementById("workGrid");
    var projectsMap = {};
    if (!Array.isArray(projects)) return projectsMap;

    projects.forEach(function (p) {
      projectsMap[p.slug] = {
        title: p.name,
        category: p.category,
        duration: p.duration || "",
        clientType: p.clientType || "",
        description: p.longDescription || "",
        photos: Array.isArray(p.gallery) && p.gallery.length ? p.gallery : [p.hero].filter(Boolean),
        video: p.video || "",
      };
    });

    if (!grid) return projectsMap;
    grid.innerHTML = "";

    var visible = projects
      .filter(function (p) { return p.featured !== false; })
      .slice()
      .sort(function (a, b) { return (a.order || 0) - (b.order || 0); });

    visible.forEach(function (p, i) {
      var categorySlug = (p.category || "").toLowerCase().split(/\s+/)[0] || "project";
      var article = el("article", {
        className: "project-feature work reveal",
        attrs: {
          "data-category": categorySlug,
          "data-project": p.slug,
          tabindex: "0",
          role: "button",
          "aria-label": "Open " + p.name + " project",
        },
      });

      var imageWrap = el("div", { className: "project-image" });
      imageWrap.appendChild(
        el("img", {
          attrs: {
            src: p.hero || (p.gallery && p.gallery[0]) || "",
            alt: p.name,
            loading: i === 0 ? "eager" : "lazy",
          },
        })
      );
      article.appendChild(imageWrap);

      var copy = el("div", { className: "project-copy" });
      copy.appendChild(
        el("span", { className: "project-index", text: String(i + 1).padStart(2, "0") })
      );
      var titleWrap = el("div");
      titleWrap.appendChild(el("h3", { text: p.name }));
      titleWrap.appendChild(el("p", { text: p.shortDescription || "" }));
      copy.appendChild(titleWrap);

      var link = el("span", { className: "project-link" });
      link.appendChild(document.createTextNode("View project "));
      link.appendChild(el("i", { className: "fa-solid fa-arrow-right" }));
      copy.appendChild(link);

      article.appendChild(copy);
      grid.appendChild(article);
    });

    return projectsMap;
  }

  /* ---------- CONTACT ---------- */
  function renderContact(contact) {
    if (!contact) return;
    var dial = "+" + phoneDigits(contact.phone);
    var wa = phoneDigits(contact.phone);

    var list = document.getElementById("contactList");
    if (list) {
      list.innerHTML = "";

      var phoneItem = el("div", { className: "contact-item" });
      phoneItem.appendChild(
        el("div", { className: "contact-ic", html: '<i class="fa-solid fa-phone"></i>' })
      );
      var phoneBody = el("div");
      phoneBody.appendChild(el("h3", { text: "Phone" }));
      var phoneP = el("p");
      phoneP.appendChild(el("a", { text: contact.phone, attrs: { href: "tel:" + dial } }));
      phoneBody.appendChild(phoneP);
      phoneItem.appendChild(phoneBody);
      list.appendChild(phoneItem);

      var waItem = el("div", { className: "contact-item" });
      waItem.appendChild(
        el("div", { className: "contact-ic", html: '<i class="fa-brands fa-whatsapp"></i>' })
      );
      var waBody = el("div");
      waBody.appendChild(el("h3", { text: "WhatsApp" }));
      var waP = el("p");
      waP.appendChild(
        el("a", {
          text: "Message Seven Points",
          attrs: { href: "https://wa.me/" + wa, target: "_blank", rel: "noopener" },
        })
      );
      waBody.appendChild(waP);
      waItem.appendChild(waBody);
      list.appendChild(waItem);

      var emailItem = el("div", { className: "contact-item" });
      emailItem.appendChild(
        el("div", { className: "contact-ic", html: '<i class="fa-solid fa-envelope"></i>' })
      );
      var emailBody = el("div");
      emailBody.appendChild(el("h3", { text: "Email" }));
      var emailP = el("p");
      emailP.appendChild(el("a", { text: contact.email, attrs: { href: "mailto:" + contact.email } }));
      emailBody.appendChild(emailP);
      emailItem.appendChild(emailBody);
      list.appendChild(emailItem);

      var officeItem = el("div", { className: "contact-item" });
      officeItem.appendChild(
        el("div", { className: "contact-ic", html: '<i class="fa-solid fa-location-dot"></i>' })
      );
      var officeBody = el("div");
      officeBody.appendChild(el("h3", { text: "Office" }));
      var officeP = el("p");
      officeP.appendChild(document.createTextNode(contact.addressLine1 || ""));
      officeP.appendChild(document.createElement("br"));
      officeP.appendChild(document.createTextNode(contact.addressLine2 || ""));
      officeBody.appendChild(officeP);
      officeItem.appendChild(officeBody);
      list.appendChild(officeItem);
    }

    var fabPhone = document.getElementById("fabPhone");
    if (fabPhone) fabPhone.setAttribute("href", "tel:" + dial);

    var whatsappBtn = document.getElementById("whatsappBtn");
    if (whatsappBtn) whatsappBtn.setAttribute("href", "https://wa.me/" + wa);

    var footerPhone = document.getElementById("footerPhone");
    if (footerPhone) {
      footerPhone.textContent = contact.phone;
      footerPhone.setAttribute("href", "tel:" + dial);
    }
    var footerEmail = document.getElementById("footerEmail");
    if (footerEmail) {
      footerEmail.textContent = contact.email;
      footerEmail.setAttribute("href", "mailto:" + contact.email);
    }
    var footerAddress1 = document.getElementById("footerAddress1");
    if (footerAddress1) footerAddress1.textContent = contact.addressLine1 || "";
    var footerAddress2 = document.getElementById("footerAddress2");
    if (footerAddress2) footerAddress2.textContent = contact.addressLine2 || "";

    // Enrich settings.contact so initSite() (the inline script) can use
    // these without re-deriving them.
    contact.whatsappNumber = wa;
    contact.phoneDial = dial;
  }

  /* ---------- TESTIMONIALS (section only exists when there's content) ---------- */
  function renderClients(clients) {
    var mount = document.getElementById("testimonialsMount");
    if (!mount) return;
    mount.innerHTML = "";
    if (!Array.isArray(clients) || clients.length === 0) return;

    var section = el("section", {
      className: "section testimonials-section",
      attrs: { id: "testimonials" },
    });
    var container = el("div", { className: "container" });

    var heading = el("div", { className: "section-heading reveal" });
    heading.appendChild(el("span", { className: "eyebrow", text: "Client feedback" }));
    var h2 = el("h2", { className: "section-title" });
    h2.appendChild(document.createTextNode("What clients "));
    h2.appendChild(el("span", { className: "gold", text: "say." }));
    heading.appendChild(h2);
    container.appendChild(heading);

    var wrap = el("div", { className: "testimonials" });
    var inner = el("div", { className: "testimonials-container" });
    var grid = el("div", { className: "testimonials-grid" });

    clients.forEach(function (c) {
      var quote = el("div", { className: "quote reveal" });
      quote.appendChild(el("p", { text: '"' + (c.testimonial || "") + '"' }));

      var author = el("div", { className: "quote-author" });
      var avatar = el("div", { className: "quote-avatar" });
      if (c.logo) {
        avatar.appendChild(
          el("img", {
            attrs: {
              src: c.logo,
              alt: c.name || "",
              style: "width:100%;height:100%;border-radius:50%;object-fit:cover;",
            },
          })
        );
      } else {
        avatar.textContent = initials(c.name);
      }
      author.appendChild(avatar);

      var info = el("div", { className: "quote-info" });
      info.appendChild(el("strong", { text: c.name || "" }));
      info.appendChild(el("span", { text: c.role || "" }));
      author.appendChild(info);

      quote.appendChild(author);
      grid.appendChild(quote);
    });

    inner.appendChild(grid);
    wrap.appendChild(inner);
    container.appendChild(wrap);
    section.appendChild(container);
    mount.appendChild(section);
  }

  /* ---------- BOOT ---------- */
  function fetchJSON(path) {
    return fetch(path, { cache: "no-store" }).then(function (res) {
      if (!res.ok) throw new Error("Failed to load " + path + " (" + res.status + ")");
      return res.json();
    });
  }

  Promise.all([
    fetchJSON("content/settings.json"),
    fetchJSON("content/projects.json"),
    fetchJSON("content/clients.json"),
  ])
    .then(function (results) {
      var settings = results[0];
      var projectsFile = results[1];
      var clientsFile = results[2];

      renderHero(settings.hero);
      renderAbout(settings.about);
      renderStats(settings.stats);
      var projectsMap = renderProjects(projectsFile.projects || []);
      renderContact(settings.contact);
      renderClients(clientsFile.clients || []);

      if (typeof window.initSite === "function") {
        window.initSite(projectsMap, settings);
      } else if (typeof initSite === "function") {
        initSite(projectsMap, settings);
      }
    })
    .catch(function (err) {
      console.error("Seven Points: failed to load content/*.json — using last-known content instead.", err);
      renderHero(FALLBACK_SETTINGS.hero);
      renderAbout(FALLBACK_SETTINGS.about);
      renderStats(FALLBACK_SETTINGS.stats);
      var projectsMap = renderProjects(FALLBACK_PROJECTS);
      renderContact(FALLBACK_SETTINGS.contact);
      renderClients(FALLBACK_CLIENTS);
      if (typeof window.initSite === "function") {
        window.initSite(projectsMap, FALLBACK_SETTINGS);
      } else if (typeof initSite === "function") {
        initSite(projectsMap, FALLBACK_SETTINGS);
      }
    });
})();
