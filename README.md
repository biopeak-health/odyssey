# Biopeak Event Landing

QR → splash → name/phone → Google Sheet row + brochure download (base64 from Apps Script).

## Quick start

```bash
npm install
cp .env.example .env
# set VITE_GAS_URL after Apps Script deploy (see apps-script/README.md)
npm run dev
```

## Deploy (GitHub Pages)

1. Push this repo to GitHub as `odyssey` (or change `base` in `vite.config.js` to match the repo name).
2. Repo **Settings → Pages → Source: GitHub Actions**.
3. Add secret `VITE_GAS_URL` = your Apps Script `/exec` URL.
4. Push to `main` (or run the **Deploy GitHub Pages** workflow).
5. Site URL: `https://biopeak-health.github.io/odyssey/`
6. Point the event QR at that URL.

Repo: [github.com/biopeak-health/odyssey](https://github.com/biopeak-health/odyssey)

## Apps Script

Follow [apps-script/README.md](apps-script/README.md):

- Sheet + web app deploy
- Upload brochure to Drive + set `BROCHURE_FILE_ID` script property
- Redeploy web app after `Code.gs` changes

PDF lives in [`apps-script/CXO brochure.pdf`](apps-script/CXO%20brochure.pdf) for upload only — **not** served by Pages.

## Smoke-test checklist

- [ ] Splash Lottie plays, then form appears
- [ ] Empty submit shows field errors
- [ ] Non-10-digit phone rejected on form
- [ ] Valid submit writes Sheet row **and** downloads brochure
- [ ] Direct `/assets/CXO brochure.pdf` URL is 404 (PDF not public)
- [ ] Same phone again → no second row; brochure still downloads
- [ ] Sheet/GAS failure → error on form, **no** brochure download
- [ ] Double-tap Submit does not create two rows
- [ ] `prefers-reduced-motion`: splash skipped, form shows
