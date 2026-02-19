import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src/',
  build: {
    outDir: '../dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
        about: resolve(__dirname, 'src/about-us/index.html'),
        mentors: resolve(__dirname, 'src/mentors/index.html'),
        register: resolve(__dirname, 'src/register/index.html'),
        login: resolve(__dirname, 'src/login/index.html'),
        hub: resolve(__dirname, 'src/tys-hub/index.html'),
      },
    },
  },
});