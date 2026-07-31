# Google Apps Script setup

## 1. Create the sheet

1. New Google Sheet.
2. Header row: `Time` | `Name` | `Phone`
3. Keep the first tab named `Sheet1` (or change `SHEET_NAME` in `Code.gs`).

## 2. Add the script

1. **Extensions → Apps Script**
2. Delete any stub code; paste [`Code.gs`](Code.gs)
3. Save

## 3. Deploy web app

1. **Deploy → New deployment**
2. Type: **Web app**
3. Description: `biopeak-event`
4. Execute as: **Me**
5. Who has access: **Anyone**
6. Deploy → authorize Google account → copy the URL ending in `/exec`

## 4. Wire the site

In the repo root:

```bash
cp .env.example .env
```

Set:

```
VITE_GAS_URL=https://script.google.com/macros/s/YOUR_ID/exec
```

Rebuild / redeploy Pages so the URL is baked into the build (`import.meta.env.VITE_GAS_URL`).

## 5. Smoke test

```bash
curl -s -X POST -H 'Content-Type: text/plain;charset=utf-8' \
  -d '{"name":"Test User","phone":"9999999999","time":"2026-07-31T00:00:00.000Z"}' \
  "$VITE_GAS_URL"
```

Expect `{"ok":true,"duplicate":false}` then the same again → `{"ok":true,"duplicate":true}`.

## Notes

- Dedup key = digits-only phone (server is source of truth).
- `LockService` prevents double-append under concurrent submits.
- Frontend also stores `localStorage` per phone to stop repeat taps on the same device.
