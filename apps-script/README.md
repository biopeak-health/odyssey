# Google Apps Script setup

## 1. Create the sheet

1. New Google Sheet.
2. Header row: `Time` | `Name` | `Phone`
3. Keep the first tab named `Sheet1` (or change `SHEET_NAME` in `Code.gs` — default tab name used here is `Leads`).

## 2. Upload the brochure

1. Upload [`CXO brochure.pdf`](./CXO%20brochure.pdf) to Google Drive (same account as the script).
2. Open the file → copy the **file id** from the URL:
   `https://drive.google.com/file/d/<FILE_ID>/view`

## 3. Add the script

1. **Extensions → Apps Script** (from the Sheet)
2. Delete any stub code; paste [`Code.gs`](Code.gs)
3. Save

## 4. Script property

1. Apps Script → **Project Settings** (gear) → **Script properties**
2. Add property:
   - Key: `BROCHURE_FILE_ID`
   - Value: the Drive file id from step 2

## 5. Deploy web app

1. **Deploy → New deployment**
2. Type: **Web app**
3. Description: `biopeak-event`
4. Execute as: **Me**
5. Who has access: **Anyone**
6. Deploy → authorize Google account (Drive + Sheets scopes) → copy the URL ending in `/exec`

After code changes: **Deploy → Manage deployments → Edit (pencil) → New version → Deploy**.

## 6. Wire the site

In the repo root:

```bash
cp .env.example .env
```

Set:

```
VITE_GAS_URL=https://script.google.com/macros/s/YOUR_ID/exec
```

Rebuild / redeploy Pages so the URL is baked into the build (`import.meta.env.VITE_GAS_URL`).

## 7. Smoke test

```bash
curl -s -X POST -H 'Content-Type: text/plain;charset=utf-8' \
  -d '{"name":"Test User","phone":"9999999999","time":"2026-07-31T00:00:00.000Z"}' \
  "$VITE_GAS_URL"
```

Expect JSON with `ok: true`, `duplicate: false`, and a long `brochure` base64 string. Same phone again → `duplicate: true` + brochure again.

Invalid phone (not 10 digits) → `{"ok":false,"error":"invalid_phone"}`.

## Notes

- Phone must be exactly **10 digits** (digits-only after normalize). Matches the form.
- Brochure is **not** on GitHub Pages. GAS reads it from Drive and returns base64 only after a valid submit (or duplicate).
- Dedup key = digits-only phone (server is source of truth).
- `LockService` prevents double-append under concurrent submits.
- Errors returned to the client are codes only (`invalid_phone`, `server_error`, …) — no stack traces.
