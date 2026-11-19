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
FoundIS-Lost-and-Found-System/
├── assets/
│   ├── icons/                  # Favicons and home-screen icons
│   └── images/                 # Logo, campus hero image
│       └── items/              # Photos of the default found items
├── css/
│   └── styles.css              # Site styles
├── js/
│   ├── app.js                  # Routing, rendering, storage, and actions
│   └── data.js                 # Starting data: staff login, categories, default items
├── index.html                  # Page shell that loads css/ and js/
└── README.md                   # This file
```
