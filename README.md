# WWWD

Static website for WWWD (What Would We Do?), deployed on Vercel: https://wwwd-theta.vercel.app

## Project naming conventions

This project uses a `wwwd-` prefix for major CSS classes and design tokens to avoid confusion with other website projects and make future maintenance easier.

## Files

- `index.html` — the homepage: a hero card, then the Index of all projects, then a deck of project cards. Styles and script are inline.
- `bio.html` — bio and contact.
- `wwwd-img/` — project images. The `.jpg` files are the untouched originals.
  - `wwwd-img/web/` — WebP copies the site actually serves (same images, smaller files).
  - `wwwd-img/thumbs/` — 160px WebP thumbnails for the view buttons.
  - `wwwd-img/cards/` — 720px WebP of each project's lead image, for the Index.
  - `wwwd-img/og.png` — the link-preview image (1200×630).
- `objects/` — WWWD Objects sub-platform prototype (see `objects/README.md`).
- `vercel.json` — cache headers for images and assets.
- `publish-wwwd.ps1` — commits and pushes to `main`.

## Adding or replacing an image

1. Put the original `.jpg` in `wwwd-img/`.
2. Make the WebP copy and thumbnail with the same base name, e.g. with Python + Pillow:

   ```python
   from PIL import Image
   im = Image.open("wwwd-img/name.jpg").convert("RGB")
   im.save("wwwd-img/web/name.webp", "WEBP", quality=84, method=6)
   im.thumbnail((160, 160)); im.save("wwwd-img/thumbs/name.webp", "WEBP", quality=78, method=6)
   ```

3. Reference `wwwd-img/web/name.webp` in the thumb button's `data-src` (and the card's main `data-lazy`), and `wwwd-img/thumbs/name.webp` in the thumb's `data-lazy`. Set `data-w`/`data-h` to the image's pixel size.

Images load only when their card is current or adjacent, so card images use `data-lazy` instead of `src`.

## Project details and the Index

Each card has one details line right under its title:

```html
<div class="meta"><span class="place">Chankillo, Peru</span><span class="with">Dash Marshall</span></div>
```

Fill in `place` and/or `with` (the collaborator; "with" is added automatically). Leave a span empty and it disappears. The Index (`/#index`) is built from the cards, so it updates on its own; it shows `wwwd-img/cards/<lead image>.webp` (720px), so a new card's lead image needs one there too.

## Project links

Each project has its own address from its title, e.g. `/#glass-pavilion`. Renaming a project's `<h3>` changes its link.

## Local preview

Open `index.html` in a browser, or run `npx serve .`.

## Deploy

Vercel deploys `main` to production; pushing any other branch creates a preview deployment.
