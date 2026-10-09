# Seven Points — Content Admin Setup

## 0. What's in this package
```
index.html              updated — pulls content from content/*.json instead of hardcoded HTML
js/content.js           new — loads the JSON and fills in the page
content/settings.json   new — hero text/image, About Us, stats, contact info
content/projects.json   new — your two existing projects, migrated
content/clients.json    new — empty, ready for your first testimonial
admin/index.html        new — the admin page itself
admin/config.yml        new — tells the admin what fields to show
```
Nothing in css/ or the rest of the page's design was touched.

## 1. Get these files into your GitHub repo
Either:
- Wait for me to push them directly once your GitHub account is connected, or
- Upload them yourself now via github.com → your repo → "Add file" → "Upload files", keeping the same folder names shown above (don't flatten the folders).

## 2. Create your login token (one-time, ~2 minutes)
1. Go to https://github.com/settings/personal-access-tokens/new
2. Give it a name like "Seven Points CMS".
3. Under "Repository access", choose **"Only select repositories"** and pick `sevenpointsinfo/sevenpoints.info`.
4. Under "Permissions" → "Repository permissions", set **Contents** to **Read and write**.
5. Click "Generate token" and **copy it immediately** — GitHub only shows it once. Save it somewhere private (a password manager, not a text file on your desktop).

## 3. Log in to the admin
1. Visit `https://sevenpoints.info/admin/`
2. Click **"Sign In with Token"**.
3. Paste the token from step 2.

You're in. From here, everything in the chat's 8-step guide applies.

## 4. If something looks wrong after your first save
- Open your repo on GitHub and check the latest commit — every save/publish from the admin shows up there as a real commit, so you can always see exactly what changed.
- If a photo doesn't appear where expected, open that commit and check which folder it actually landed in under `assets/images/projects/<project-slug>/` — then tell me and I'll adjust `admin/config.yml`.
