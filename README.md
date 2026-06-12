# various pixels

Landing page for [variouspixels.com](https://www.variouspixels.com) — an independent design & front-end development company.

A gold canvas ruled into a 30px pixel lattice; the cursor paints temporary colored pixels sampled from a hidden warm conic gradient.

## Stack

- Vite + React 18 + Tailwind CSS 4
- Deployed to GitHub Pages via GitHub Actions on push to `main`

## Develop

```sh
npm install
npm run dev
```

## Deploy

Push to `main`. The workflow builds `dist/` and publishes it to GitHub Pages at `www.variouspixels.com` (see `public/CNAME`).
