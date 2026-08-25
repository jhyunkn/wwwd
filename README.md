# WWWD

Static Astro site for WWWD.

## Current Structure

- `src/pages/index.astro` - crawler-visible homepage.
- `src/pages/investigations/` - investigation index and detail routes.
- `src/content/entries/` - Markdown entries validated by the publish gate.
- `src/content.config.ts` - content schema requiring the Claim -> Investigation -> Artifact -> Consequence chain. Entries marked `Investigation` must also define `externalConsequence`.
- `src/styles/wwwd.css` - site styles for the Astro build.
- `public/assets/portfolio/` - project imagery copied into the static build.
- `public/robots.txt` and `src/pages/sitemap.xml.ts` - crawler discovery.

## Local Development

```bash
npm install
npm run dev
```

Default local URL: `http://127.0.0.1:8844/`.

## Build

```bash
npm run build
```

The build runs `astro check` and `astro build`. The output should include:

- `/`
- `/investigations/`
- `/investigations/chankillo-in-between-scapes/`
- `/notes/`

## Verify

```bash
npm run verify
```

The verification script checks the generated static HTML for crawler-visible homepage, Investigation, and Notes content.

## Deploy Flow

1. Commit changes to GitHub.
2. Vercel detects Astro from `package.json`.
3. Vercel runs `npm run build`.
4. Vercel serves the generated `dist/` output.

## Next Recommended Steps

- Convert the next strongest project only after it clears the external-consequence rule.
- Replace the Vercel project URL in `SITE_URL` when a custom production domain is ready.
