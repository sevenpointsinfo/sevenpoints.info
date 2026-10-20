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
| Arabic texts | Pages CMS → **Arabic — العربية** (`_data/i18n/ar.yml`) |
| Kurdish (Sorani) texts | Pages CMS → **Kurdish (Sorani) — کوردی** (`_data/i18n/ckb.yml`) |
| Page template (reads the files above) | `_layouts/home.html`, `_includes/lines.html`, `_includes/lang-switch.html` |
| The three pages: English, Arabic, Kurdish | `index.html`, `ar/index.html`, `ckb/index.html` (short; they use the template) |
| Design | `sp-style.css` |
| Language switch, Arabic/Kurdish fonts and right-to-left layout | `sp-i18n.css`, `sp-i18n.js`, `assets/fonts/` |
| Interaction & motion | `sp-script.js` |
| Pages CMS setup | `.pages.yml` |
| Jekyll / GitHub Pages settings | `_config.yml` |

**Photos:** upload web-ready WebP files only (from `03_WEB_READY`), never the original archive.

**Editing Arabic and Kurdish:**

1. Open [Pages CMS](https://app.pagescms.org), choose `sevenpointsinfo/sevenpoints.info`
   and the `main` branch. Refresh the CMS if the language entries are not visible yet.
2. Choose **Arabic — العربية** or **Kurdish (Sorani) — کوردی** in the menu.
3. Edit the relevant section: Homepage, About Us, Services, Office address,
   Project names & gallery captions, or Menu, buttons & accessibility.
4. Click **Save**. After GitHub Pages finishes rebuilding, check
   [Arabic](https://sevenpoints.info/ar/) or [Kurdish](https://sevenpoints.info/ckb/).

Existing translations are already filled in. Blank or missing text falls back to English.
Update each language separately when the English wording changes; saving English does not
automatically translate it. Photos, numeric statistics, phone, email and links are shared
with the English content. The office address and place names such as Duhok can be translated.

Keep repeated items (statistics, stories, values, founders, service stages and client
promises) in the same order and with the same number of rows as their English counterparts.
Gallery captions are matched by the exact **Existing photo path**, so they follow their
photo even if the English gallery is reordered. When adding a caption, copy the photo path
from the project's gallery. Keep `%title%` in the "Open gallery" description; the website
replaces it with the project name.

The project translation fields currently cover Zakho Conference Hall and Jade Touch Salon.
When adding a new project, add its slug to `components.translated_projects.fields` in
`.pages.yml` using `component: translated_project`; it will then be editable in both language
sections. Untranslated projects continue to use English.

**Note:** `_layouts/home.html` is a template. Opened straight from a computer it shows `{{ … }}`
codes; the finished pages are the ones GitHub Pages builds.

Older files from previous versions of the site (`admin/`, `content/`, `css/`, `js/`, `docs/`
and the photos in the main folder) are no longer used. They are listed under `exclude` in
`_config.yml`, so they are not published, and can be deleted from the repository at any time.
