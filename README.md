# Biopeak Event Landing

QR → splash → name/phone → brochure download + Google Sheet row.

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

Follow [apps-script/README.md](apps-script/README.md) for Sheet + web app setup.

## Smoke-test checklist

- [ ] Splash Lottie plays, then form appears
- [ ] Empty submit shows field errors
- [ ] Valid submit downloads `CXO brochure.pdf`
- [ ] Sheet gains a Time / Name / Phone row
- [ ] Same phone again → no second row; UI still shows success / download link
- [ ] Double-tap Submit does not create two rows
- [ ] `prefers-reduced-motion`: splash skipped, form shows

## Note on brochure size

Brochure lives at `public/assets/CXO brochure.pdf` (~1.8MB).
