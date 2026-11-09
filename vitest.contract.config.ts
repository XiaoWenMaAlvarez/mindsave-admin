import { configDefaults, defineConfig } from 'vitest/config'
import viteConfig from './vite.config.ts'

// Pruebas de contrato del panel contra el backend real (VITE_API_URL). Requiere el backend en ejecución
// y las variables ADMIN_EMAIL y ADMIN_PASSWORD de una cuenta administradora.
export default defineConfig({
  ...viteConfig,
  test: {
    ...viteConfig.test,
    include: ['tests/contract/**/*.contract.test.ts'],
    exclude: configDefaults.exclude,
    // El origen del navegador simulado es el del panel, para que jsdom aplique las reglas CORS reales.
    environmentOptions: { jsdom: { url: 'http://localhost:5173' } },
    testTimeout: 30000,
    fileParallelism: false,
  },
})
