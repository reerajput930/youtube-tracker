# Upload Tracker

Tracks YouTube uploads and brand collabs for the **Coding with Ree** channel:
monthly goal progress, a weekly posting streak, an upload calendar, and
brand-deal status from pitch to payment. Version 1 runs entirely in the
browser and saves data to `localStorage` on the current device.

Built from the [Upload Tracker build spec](.) v1.0.

## Stack

- React + Vite
- React Router
- date-fns (weeks start Monday)
- SheetJS for Excel/CSV export
- lucide-react for icons
- Plain CSS with theme variables — six mood color themes

## Getting started

```bash
npm install
npm run dev
```

Open the app and go to **Settings → Load sample data** to see it populated,
or add your first video directly.

## Scripts

- `npm run dev` – start the dev server
- `npm run build` – production build
- `npm run test` – run the `lib/stats.js` unit tests
- `npm run lint` – lint with oxlint

## Project layout

```
src/
  main.jsx, App.jsx        router + layout shell
  styles/theme.css         design tokens + mood colors
  context/AppDataContext   the app's data (videos, collabs, settings)
  lib/storage.js           the ONLY place that reads/writes localStorage
  lib/stats.js             every number the app shows, with tests
  lib/export.js            Excel / CSV builders
  lib/sampleData.js        "Load sample data"
  components/              Sidebar, TabBar, Calendar, VideoPanel, …
  pages/                   Dashboard, Videos, Collabs, Export, Settings
```

## Data

Everything goes through `src/lib/storage.js`, which exposes async
`listVideos` / `saveVideo` / `deleteVideo`, `listCollabs` / `saveCollab` /
`deleteCollab`, `getSettings` / `saveSettings`, and `exportAll` /
`importAll` / `clearAll`. That shape is designed so a v2 (Firebase Auth +
Firestore + YouTube Data API auto-pull) can swap the implementation without
touching any page or component.
