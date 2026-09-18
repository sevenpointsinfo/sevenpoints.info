# Seven Points Construction & General Trading — website

Static site. No build step, no backend. Works as soon as it's uploaded.

## Deploy to GitHub Pages

1. Push this whole folder's contents to the root of your repo (or to a
   `docs/` folder, whichever you point Pages at).
2. In the repo's Settings → Pages, set the source to that branch/folder.
3. Done — `index.html` loads directly, all paths are relative.

## What to add before launch

Every image the code expects is referenced by its final path, but the
actual files aren't included (see `IMPORTANT` in the original brief —
no stock photography was used as a stand-in). Each `assets/images/.../`
folder has a `README.txt` listing exactly which filenames that section
expects and roughly what size to export at.

Two sections are typography-only by design and don't need a photo:
**Our Team** (About tab) and, unless you add a real founder photo,
**Founders**. Look for the `<!-- Replace with real Seven Points photo -->`
style comments in `index.html` — each one shows the exact `<img>` tag
to uncomment once the file exists.

Also update before launch:
- `assets/logos/logo.png` and `logo-white.png` (currently the nav and
  footer show a text wordmark as a placeholder)
- The footer social links (`#` placeholders — search `footer-social`
  in `index.html`)
- Client logos in the Trusted Partnership section, if/when you have
  real ones to show (currently a plain typographic placeholder, not a
  fake logo)

## Structure

```
index.html
css/style.css
js/script.js
assets/
  logos/
  images/
    hero.webp                        (add this)
    company/                         (Who We Are / Founders photos)
    services/                        (4 files: planning/designing/construction/management)
    projects/
      zakho-conference-hall/
      jade-touch-salon/
    clients/
  videos/                            (not used yet — reserved per the brief)
```

## Notes on a few deliberate deviations from the brief

- **Contrast on the off-white background.** The brief's exact yellow
  (#FCAF41) and grey (#8E8E8E) both fail WCAG text-contrast against
  the exact off-white (#F5F4F0) — roughly 1.7:1 and 3:1 respectively,
  where body text needs 4.5:1. Rather than ship illegible copy:
  - Small "yellow numbers" (values list, stat call-outs, project
    index, active service stage) render as black text with a yellow
    underline/highlight instead of yellow fill — same accent, legible.
  - Grey body copy on the off-white sections uses a darker variant,
    `--grey-onlight: #5C5C5C` (defined in `css/style.css`), instead of
    the brand grey. The brand grey (#8E8E8E) is kept as-is everywhere
    it sits on black — footer, Trusted Partnership, nav.
  - Yellow used as plain text color is kept only where it's already
    legible: the hero (dark photo), the two full-bleed yellow
    sections (black text there, not yellow-on-yellow), and dark
    backgrounds (nav, marquee, footer).
  - All of this is commented in `css/style.css` where it happens, so
    it's easy to find and override if you'd rather have the literal
    hex values regardless.
- **Hero→About transition** uses a single angled off-white plane
  (`clip-path`) overlapping the hero, per the brief's fallback option,
  rather than a circular reveal — more robust across breakpoints.
