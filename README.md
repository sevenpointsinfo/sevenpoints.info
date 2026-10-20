# Seven Points — sevenpoints.info

**Editing:** open https://app.pagescms.org, sign in with GitHub, choose this repository.
Every Save in Pages CMS is stored here, and GitHub Pages then rebuilds and publishes
https://sevenpoints.info by itself (usually 1–2 minutes). Nothing to install or run.

| What | Where |
|---|---|
| Homepage texts and photos | `_data/homepage.yml` |
| About Us | `_data/about.yml` |
| Services | `_data/services.yml` |
| Contact & social media | `_data/contact.yml` |
| Projects (one file each) | `_projects/<slug>.md` |
| Clients & testimonials (one file each) | `_clients/<name>.md` |
| Photos | `assets/images/home`, `company`, `services`, `clients`, `projects/<slug>/` |
| Logos & favicon | `assets/logos/` |
| Arabic and Kurdish (Sorani) texts | `_data/i18n/ar.yml`, `_data/i18n/ckb.yml` (edit on GitHub) |
| Page template (reads the files above) | `_layouts/home.html`, `_includes/lines.html`, `_includes/lang-switch.html` |
| The three pages: English, Arabic, Kurdish | `index.html`, `ar/index.html`, `ckb/index.html` (short; they use the template) |
| Design | `sp-style.css` |
| Language switch, Arabic/Kurdish fonts and right-to-left layout | `sp-i18n.css`, `sp-i18n.js`, `assets/fonts/` |
| Interaction & motion | `sp-script.js` |
| Pages CMS setup | `.pages.yml` |
| Jekyll / GitHub Pages settings | `_config.yml` |

**Photos:** upload web-ready WebP files only (from `03_WEB_READY`), never the original archive.

**Arabic and Kurdish:** photos, numbers, links and contact details always come from the English
files. Texts come from `ar.yml` / `ckb.yml`; anything missing there shows in English. When an
English text changes in Pages CMS, update the same text in both files. When items in a list are
added, removed or reordered, make the same change there too.

**Note:** `_layouts/home.html` is a template. Opened straight from a computer it shows `{{ … }}`
codes; the finished pages are the ones GitHub Pages builds.

Older files from previous versions of the site (`admin/`, `content/`, `css/`, `js/`, `docs/`
and the photos in the main folder) are no longer used. They are listed under `exclude` in
`_config.yml`, so they are not published, and can be deleted from the repository at any time.
