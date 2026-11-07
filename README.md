# WWWD

Static website for WWWD (What Would We Do?), deployed on Vercel: https://wwwd-theta.vercel.app

## Project naming conventions

This project uses a `wwwd-` prefix for major CSS classes and design tokens to avoid confusion with other website projects and make future maintenance easier.

## Files

- `index.html` — the homepage: a hero card, then the Index of all projects, then a deck of project cards. Styles and script are inline. Within a project, scrolling, clicking either half, swiping or the arrow keys step through its images; the "Next" arrow at the bottom right goes to the next project (from the last one, back to the Index).
- `bio.html` — bio and contact.
- `wwwd-img/` — project images. The `.jpg` files are the untouched originals.
  - `wwwd-img/web/` — WebP copies the site actually serves (same images, smaller files).
  - `wwwd-img/thumbs/` — 160px WebP thumbnails for the view buttons.
  - `wwwd-img/index/` — the image each project shows in the Index (up to 1000px; 1400px for wide ones), sometimes cropped from a sheet.
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

Fill in `place` and/or `with` (the collaborator; "with" is added automatically). Leave a span empty and it disappears. The Index (`/#index`) is built from the cards, so it updates on its own. Its image is chosen per project on the card: `<div class="slide" data-cover="wwwd-img/index/name.webp" data-cover-w="1000" data-cover-h="750">` — pick a full-bleed view (a photo, render or model) rather than a whole presentation sheet, or crop into the drawing.

In the Index, projects sit in equal-width columns (5 on desktop, 4 on tablet, 2 on phones); each image fills its column at its own shape (cropped slightly if taller than 0.7 or wider than 2 wide-to-tall), and each project goes, in order, under the shortest column, so every gap is the same.

## Project links

Each project has its own address from its title, e.g. `/#glass-pavilion`. Renaming a project's `<h3>` changes its link.

## Local preview

Open `index.html` in a browser, or run `npx serve .`.

## Deploy

Vercel deploys `main` to production; pushing any other branch creates a preview deployment.
