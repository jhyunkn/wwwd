import { defineConfig } from 'astro/config';

export default defineConfig({
  site: process.env.SITE_URL ?? 'https://wwwd-theta.vercel.app',
  output: 'static',
});
