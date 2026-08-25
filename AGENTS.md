# AGENTS.md

## Alcance y propósito

Estas instrucciones aplican a todo el repositorio. Este proyecto es el panel web de administración de MindSave: una SPA de navegador, en español, para autenticar administradores y consultar, crear, editar, desactivar y restaurar usuarios. El backend no forma parte de este repositorio; no inventes respuestas, rutas ni campos para compensar un contrato que falte.

Antes de modificar código, revisa el flujo afectado de extremo a extremo (ruta, página, hook, action y contrato HTTP). Haz cambios pequeños y coherentes con la arquitectura existente; no aproveches una tarea acotada para reorganizar carpetas, renombrar contratos o actualizar dependencias sin necesidad.

## Mapa del repositorio

- `src/main.tsx`: arranque de React en `StrictMode`.
- `src/App.tsx`: proveedores globales, `QueryClient`, comprobación de sesión, router, toasts y devtools.
- `src/router/app.router.tsx`: árbol de rutas y protecciones de autenticación.
- `src/api/mindsave.backend.ts`: instancia única de Axios, cabecera Bearer y normalización central de errores.
- `src/auth/`: actions HTTP, tipos, página de login y store global de Zustand.
- `src/users/`: feature principal, separada en `actions`, `hooks`, `interfaces`, `pages`, `layout`, `components`, `utils` y `validators`.
- `src/components/ui/`: primitivas reutilizables de Base UI/shadcn adaptadas a MindSave.
- `src/components/shared/`: estados de carga/error, marca y diálogo de confirmación.
- `src/components/routes/ProtectedRoutes.tsx`: guards declarativos para rutas autenticadas y públicas.
- `src/lib/utils.ts`: composición de clases mediante `clsx` y `tailwind-merge`.
- `src/index.css`: Tailwind CSS v4, tokens globales, fuentes, animaciones y utilidades `ms-*`.
- `skills/DESIGN_SYSTEM.md`: fuente de verdad visual de MindSave; es obligatoria para cualquier cambio de interfaz.
- `tests/`: pruebas Vitest. La cobertura actual es mínima y el test existente solo comprueba la configuración básica.
- `public/`: activos estáticos. `dist/` y `node_modules/` son generados y no se editan.

## Stack y configuración

- React 19, TypeScript 6 y Vite 8 con React Compiler habilitado mediante Babel/Rolldown.
- React Router 8; este repositorio importa desde `react-router`.
- TanStack Query para estado remoto y Zustand exclusivamente para la sesión global.
- Axios para HTTP, React Hook Form para formularios, Zod disponible para esquemas, Sonner para notificaciones y Lucide para iconos.
- Las primitivas visuales combinan Base UI, el registro shadcn `base-nova`, `class-variance-authority`, `clsx` y `tailwind-merge`.
- Tailwind CSS v4 se integra con `@tailwindcss/vite`. `tailwind.config.js` está vacío; los tokens activos viven en `src/index.css`.
- El alias `@/*` apunta a `src/*`. Úsalo al cruzar features; dentro de una misma feature se aceptan imports relativos.
- La única variable requerida es `VITE_API_URL`. Copia `.env.template` a `.env` y usa la URL base del backend, sin añadir `/admin`: la instancia Axios lo agrega.
- Nunca confirmes `.env`, tokens, contraseñas ni otros secretos.

## Comandos

Usa npm y conserva `package-lock.json`.

```bash
npm ci
npm run dev
npm run lint
npm test -- --run
npm run build
npm run preview
```

- `npm test` abre Vitest en modo watch; para una validación finita usa `npm test -- --run`.
- Los scripts `test:ui` y `coverage` están declarados, pero el proyecto no instala todavía `@vitest/ui` ni un proveedor de cobertura. No dependas de ellos hasta añadir y confirmar esas dependencias en una tarea que lo requiera.
- La línea base comprobada al crear este archivo pasa lint, pruebas y build. El build emite una advertencia no bloqueante porque el chunk principal supera 500 kB; evita aumentarlo innecesariamente y considera carga diferida al añadir secciones grandes.

## Contrato de autenticación y API

- `VITE_API_URL` se transforma en `${VITE_API_URL}/admin` dentro de `mindsaveAPI`.
- El token de sesión se guarda con la clave exacta `token` en `localStorage`; el interceptor lo envía como `Authorization: Bearer <token>`.
- La regla de negocio del panel exige el rol literal `PROFESIONAL_ROL`; `USER_ROL` es el otro rol reconocido. El login ya rechaza otros roles. Si modificas autenticación, aplica la misma autorización al revalidar la sesión con `check-status` y añade pruebas; no cambies estos literales solo para mejorar etiquetas de UI.
- Las respuestas de login y comprobación de sesión contienen `id`, `email`, `name`, `role` y `token`. Una comprobación correcta renueva `token`; una comprobación fallida debe eliminarlo y dejar la sesión como no autenticada.
- Rutas de autenticación actuales: `POST /auth/login` y `GET /auth/check-status`.
- Rutas de usuarios actuales: `GET /user`, `GET /user/:id`, `POST /user`, `PUT /user/:id`, `DELETE /user/:id` y `PUT /user/restore-user/:id`.
- Los cuerpos de alta y edición usan los nombres exactos `email`, `password`, `name`, `emailVerified` y `role`; la edición identifica al usuario mediante el parámetro de ruta `id`.
- Centraliza llamadas HTTP en archivos `*.action.ts`. Devuelve datos tipados y pasa los errores de Axios por `handleError`, salvo el tratamiento específico de expiración de sesión de `checkAuthAction`; no muestres detalles sin normalizar ni ocultes fallos con datos ficticios. `handleError` siempre lanza, por lo que no añadas retornos de éxito o datos vacíos para continuar después de llamarlo.
- No registres credenciales, tokens, respuestas completas de autenticación ni el campo `password`.
- Conserva la protección que impide al administrador autenticado desactivar o restaurar su propia cuenta.

## Flujo de estado y datos

- `App.tsx` comprueba la sesión con la query key `["auth"]`. Las rutas privadas esperan a que `authStatus` deje de ser `checking`.
- La lista usa la query key `["users", { page, limit, query, rol, state, emailVerify }]`; el detalle usa `["user", { id }]`.
- Tras crear, editar, desactivar o restaurar, invalida las queries afectadas. No actualices solo la vista local dejando cachés obsoletos.
- La búsqueda, filtros y paginación son estado de URL. Mantén los parámetros exactos `page`, `limit`, `query`, `rol`, `state` y `emailVerify`, preserva los parámetros no relacionados y reinicia `page` a `1` al cambiar una búsqueda o filtro.
- Conserva también los valores que espera el backend: `rol` usa `PROFESIONAL_ROL` o `USER_ROL`; `state` usa `active` o `inactive`; `emailVerify` usa `verify` o `unverify`.
- Valida los números obtenidos de la URL y no solicites páginas menores que 1.
- Los formularios compartidos viven en `UserForm.tsx`; los adaptadores de alta y edición deben seguir resolviendo sus diferencias sin duplicar toda la UI. En edición, una contraseña vacía significa “mantener la actual”.
- `src/users/validators/userValidator.ts` existe, pero el formulario actual valida con React Hook Form. No mantengas dos fuentes de validación divergentes: si conectas Zod, migra las reglas de forma completa y añade pruebas.

## Rutas y comportamiento visible

- `/login` solo está disponible sin sesión.
- `/`, `/users`, `/users/:id` y `/new-user` requieren autenticación y comparten `UsersLayout`.
- Las rutas desconocidas redirigen a `/`.
- Toda operación asíncrona visible debe contemplar carga, error, estado pendiente y confirmación/toast de éxito o fallo.
- Desactivar y restaurar requieren diálogo de confirmación; crear y editar informan el resultado con Sonner y regresan a `/users` solo después del éxito.
- El producto y sus mensajes están en español. Mantén textos claros y consistentes con los existentes.

## Código y organización

- Escribe TypeScript con tipos precisos, usa imports de tipo con `import type` y evita `any`, aserciones innecesarias y estados imposibles. Respeta todos los checks activos de los `tsconfig`.
- Componentes y archivos de componentes: `PascalCase`; hooks: prefijo `use`; actions: función en camelCase dentro de `*.action.ts`; interfaces de dominio en `src/<feature>/interfaces`.
- Mantén lógica HTTP fuera de componentes y lógica de navegación/presentación fuera de actions.
- Reutiliza `Button`, `Input`, `Label`, `Card`, `ConfirmDialog`, `LoadingPage`, `ErrorPage`, `BrandLogo` y `cn` antes de crear equivalentes.
- Respeta el estilo del archivo tocado. ESLint es la autoridad automática; no hagas un reformateo global ajeno al cambio.
- Algunos imports existentes terminan en `.js` o `.jsx` aunque apunten a TypeScript. No normalices esos sufijos de manera masiva dentro de una tarea no relacionada.
- No edites manualmente `package-lock.json`; deja que npm lo actualice únicamente cuando cambien dependencias.
- `README.md` todavía conserva texto del template de Vite. Verifica comportamiento y arquitectura en el código y en este archivo; actualiza el README solo cuando la tarea incluya documentación de uso o instalación.

## Interfaz, diseño y accesibilidad

- Lee `skills/DESIGN_SYSTEM.md` completo antes de tocar estilos o componentes visibles.
- Conserva la identidad oscura y serena: fondo `#080f0f`, superficies profundas, acento teal, Lora para titulares e Inter para UI/cuerpo. Usa primero los tokens de `src/index.css` y las clases semánticas de Tailwind.
- No introduzcas fondos blancos de página, una segunda paleta, fuentes nuevas o colores arbitrarios si ya existe un token.
- Mantén el patrón responsive existente: tabla en desktop y tarjetas en pantallas pequeñas.
- Las acciones destructivas usan el estilo `destructive`; restaurar usa semántica de éxito. Ambas requieren confirmación.
- Conserva etiquetas accesibles, foco visible, HTML semántico, `aria-*` cuando corresponda, navegación por teclado y compatibilidad con `prefers-reduced-motion`.
- Al añadir iconos decorativos, ocúltalos del árbol accesible; los botones solo con icono necesitan un nombre accesible.

## Pruebas

- Usa Vitest con entorno `jsdom` y Testing Library para comportamiento de componentes. Para HTTP, usa `axios-mock-adapter` o mocks de actions; las pruebas no deben depender de un backend real.
- No existe todavía un archivo global de setup de pruebas. Añádelo únicamente cuando haya una necesidad compartida y configúralo explícitamente en Vitest.
- Limpia `localStorage`, mocks y cachés entre pruebas de autenticación.
- Prioriza casos de usuario y regresiones: protección de rutas, rol autorizado, propagación de errores, parámetros de filtros/paginación, invalidación de queries, validación de formularios y bloqueo de auto-desactivación.
- Añade pruebas cuando corrijas un bug o cambies lógica. Evita snapshots grandes como única comprobación.

## Criterio de finalización

Antes de entregar un cambio de código:

1. Revisa el diff y elimina cambios accidentales, logs y secretos.
2. Ejecuta `npm run lint`.
3. Ejecuta `npm test -- --run`.
4. Ejecuta `npm run build` si cambias TypeScript, rutas, configuración, dependencias o código de producción.
5. Verifica manualmente los estados responsive, loading/error/pending y el flujo de sesión cuando la tarea los afecte.
6. Documenta cualquier variable de entorno, contrato de backend o decisión nueva que el siguiente agente necesite conocer.
