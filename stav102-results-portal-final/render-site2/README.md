# STAV102 — Test 1 Results Portal

A single-page, no-backend results lookup site for STAV102 (Nelson Mandela University).
The cover page is your own supplied image (`assets/cover.png`), used as-is, with a real
student-number input and "View results" button positioned exactly over the search box
drawn in that image. Students enter their student number and see their own Long
Question mark, MCQ mark, final mark and percentage for Test 1.

## Files

```
index.html          — page (cover image + overlay controls + result card)
assets/cover.png     — your cover image, used as the hero graphic
assets/style.css     — styling (overlay positioning + result card)
assets/script.js     — lookup logic, comment bank, pass/fail rendering
data/students.xlsx   — marks data, one row per registered student
render.yaml          — Render Blueprint (optional, for one-click deploy)
```

There is no server or database — the page loads `data/students.xlsx` directly in the
browser using [SheetJS](https://sheetjs.com/) and looks up the row matching the number
typed. The input and button are real HTML controls positioned with percentage-based
coordinates so they line up with the search box drawn in `cover.png` at any screen size.

## 1. Push to GitHub

```bash
git init
git add .
git commit -m "STAV102 Test 1 results portal"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

## 2. Deploy on Render

**Option A — Dashboard (recommended)**
1. Go to [render.com](https://render.com) → **New** → **Static Site**.
2. Connect the GitHub repo you just pushed.
3. Settings:
   - **Build Command:** leave blank
   - **Publish Directory:** `.` (repo root, since `index.html` is at the top level)
4. Click **Create Static Site**. Render will give you a URL like
   `https://stav102-results-portal.onrender.com`.

**Option B — Blueprint**
This repo includes a `render.yaml`. In Render, choose **New → Blueprint**, point it at
this repo, and Render will read `render.yaml` and configure the static site automatically.

Share the resulting Render URL with students via Funda.

## Updating the marks data

`data/students.xlsx` needs these exact column headers in row 1:

| StudentNumber | Surname | LongQuestion | MCQ | FinalMark | Percentage | Status | Campus |
|---|---|---|---|---|---|---|---|

`Status` must be one of: `PASS`, `FAIL`, `PENDING` (partial marks — student is
directed to see Mr N. Ngcobo), or `DID NOT WRITE`. For `PENDING` and
`DID NOT WRITE` rows, `LongQuestion` / `MCQ` / `FinalMark` / `Percentage` can be left blank.

After replacing the file, commit and push — Render redeploys automatically on every
push to `main`.

## If you replace `assets/cover.png` with a different image

The input and button are positioned as percentages of the image's own box, calibrated
to the search box drawn in the current `cover.png` (left: 59.5%, width: 31.51%, input
top: 52.34%/height 6.54%, button top: 62.01%/height 7.42% — see `.cover__input` and
`.cover__btn` in `assets/style.css`). If you swap in a redesigned image with the search
box in a different position, update those four values to match.

## Local testing

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser. (Opening `index.html` directly via
`file://` won't work, since the browser blocks the `fetch` of `data/students.xlsx`
under that protocol.)
