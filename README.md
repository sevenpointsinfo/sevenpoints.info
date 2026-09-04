# Seven Points website

An original, responsive portfolio website for Seven Points, built with the company’s real Zakho Conference Hall and Jade Touch Salon project assets.

## Included

- Responsive desktop, tablet and phone layouts
- Scroll-scrubbed About Us story with live Who We Are / Values / Team / Founders tracking
- Genuine image-textured CSS 3D service cube on desktop and a touch carousel on mobile
- Complete project galleries and the Zakho project film
- Partner section and WhatsApp project-inquiry flow
- Accessible navigation, keyboard controls and reduced-motion support
- Search and social-sharing metadata
- Zero-dependency static build and GitHub Pages workflow

## Preview locally

```bash
npm run dev
```

Open `http://127.0.0.1:3000`.

## Build

```bash
npm run build
```

The deployable website is created in `dist/`.

## Replace project media

Project files live in `assets/projects/`. Replace an image while keeping its filename to update every place it is used. The four About images are marked with `data-about-image` in `index.html`; the four cube faces are marked with `data-service-image`. Full project galleries are defined near the top of `script.js`, so more photos or videos can be added without changing the layout.

## Deploy on GitHub Pages

Push the project to a GitHub repository with `main` as the default branch, then choose **GitHub Actions** under **Settings → Pages → Build and deployment**. The included workflow publishes the `dist/` site automatically.

The custom domain is set to `www.sevenpoints.info` through `CNAME`. Confirm the domain’s DNS records point to GitHub Pages before enabling HTTPS.
