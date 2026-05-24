import { defineConfig } from 'astro/config'

// When deployed to GitHub Pages without a custom domain, the site lives at
// https://commit451.github.io/skyhook/. To switch to a custom domain later:
//   1) Drop a CNAME file in public/ with the desired hostname.
//   2) Set `site` to the full URL and `base` to '/'.
//   3) Configure the domain under repo Settings → Pages.
export default defineConfig({
    site: 'https://commit451.github.io',
    base: '/skyhook/',
})
