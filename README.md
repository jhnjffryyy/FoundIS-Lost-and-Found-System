# FoundIS: Lost and Found System

FoundIS is a lost and found web app for the TUP Manila community, managed by the Office of Student Affairs (OSA). Students search found items, file a claim, and pick the item up in person after OSA checks their ID.

**Live site:** https://jhnjffryyy.github.io/FoundIS-Lost-and-Found-System/

> **Note:** this is a front-end prototype. It has no server. Every visitor's data (accounts, claims, lost reports, staff edits) is saved only in that visitor's own browser, so students and staff on different devices do not see each other's records. A shared online database (for example Firebase or Supabase) is needed before real use.

## Features

### Students
- Browse and search the found-items catalog by keyword and category.
- Privacy screening: ID photos and photos marked sensitive are hidden from the public.
- Sign up and sign in with a TUP student number.
- File a claim with private ownership details and get a 4-digit claim ticket.
- Track a claim's status with the ticket code.
- Report a lost item.

### OSA staff
- Dashboard overview with item, claim, and lost-report counts.
- Item records: view, archive, and restore found items.
- Archive: restore items or delete them permanently (with confirmation).
- Claim requests: verify, reject, and record physical release.
- Lost reports: review and resolve student reports.
- Categories: add and remove categories.
- Add found item, with an optional photo and a "hide photo from public" option.

## Project structure

```
index.html          Page shell (header, footer, app container)
css/styles.css      All styles
js/data.js          Starting data: staff login, categories, the 10 default items
js/app.js           App logic: routing, rendering, storage, actions
assets/icons/       Favicons and app icons
assets/images/      Logo, hero image, item photos (see items/CREDITS.txt)
.nojekyll           Tells GitHub Pages to serve files as-is
```

## Run locally

No build step and no dependencies. Open `index.html` in a browser, or serve the folder:

```
python -m http.server 8000
```

Then open http://localhost:8000.

## Data

| What | Where |
|---|---|
| Default items, categories, staff login | `js/data.js` |
| Saved records (accounts, claims, reports, staff changes) | Browser localStorage, key `foundis-osa-v3` |

To change the starting data, edit `js/data.js`. Then change `STORE_KEY` in `js/app.js` to a new version (for example `foundis-osa-v4`) and set the `removeItem` line below it to the old key. Browsers with older saved data then reset to the new starting data.

To view or clear saved records in one browser: press `F12`, open **Application** > **Local Storage**, and select `foundis-osa-v3`.

## Staff access

The OSA staff sign-in is set in `js/data.js`. Because the site has no server, that file is public, so the password is not secret. Change it before sharing the link, and move to real server-side sign-in before real use.

## Deploy

GitHub Pages serves the `main` branch from the repository root. Push to `main` and the live site updates within a few minutes.

## Credits

Item photos are from Wikimedia Commons under free licenses. See `assets/images/items/CREDITS.txt`.
