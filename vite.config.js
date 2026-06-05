import { defineConfig } from 'vite';

export default defineConfig({
  // Set base to './' to make the build portable and work in subfolders
  base: './',
  build: {
    // Optional: Change output directory for built assets to avoid collision with public/assets
    assetsDir: 'static',
  },
});
