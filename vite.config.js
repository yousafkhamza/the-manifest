import { defineConfig } from "vite";

// Set VITE_BASE at build time in CI to "/<repo-name>/" for GitHub Pages
// project sites. Defaults to "/" for local dev and custom-domain deploys.
export default defineConfig({
  base: process.env.VITE_BASE || "/",
  build: {
    outDir: "dist",
  },
});
