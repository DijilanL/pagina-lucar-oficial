import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';           // ⬅️ Ojo: sin /serverless
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'server',                              // ⬅️ SSR
  adapter: vercel(),
  vite: {
    plugins: [tailwindcss()],
    resolve: { alias: { '@': '/src' } },
  },
});