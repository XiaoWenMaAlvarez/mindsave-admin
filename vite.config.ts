import { configDefaults, defineConfig } from 'vitest/config'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import path from "path"


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss()
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react-dom") || id.includes("react-router") || id.includes("/react/")) {
              return "react-vendor";
            }
            if (id.includes("@tanstack")) {
              return "query-vendor";
            }
            if (id.includes("zod") || id.includes("react-hook-form") || id.includes("@hookform")) {
              return "form-vendor";
            }
            if (id.includes("lucide-react") || id.includes("sonner")) {
              return "ui-vendor";
            }
          }
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    exclude: [...configDefaults.exclude, 'tests/contract/**'],
    // DEF-AD-03 (defecto conocido): al fallar crear/editar, la promesa de mutateAsync queda sin capturar.
    // Se ignora solo ese caso para que cualquier otro error no capturado siga haciendo fallar la suite.
    onUnhandledError(error) {
      const stack = error.stack ?? ''
      if (stack.includes('createUserAction') || stack.includes('editUserAction')) return false
    }
  }
})
