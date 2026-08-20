# Mindsave Design System

## Propósito

Esta skill define el sistema de diseño oficial de **Mindsave**, una aplicación de bienestar mental basada en TCC (Terapia Cognitivo-Conductual). Aplica estas directrices cada vez que construyas una interfaz web, pantalla, componente, email HTML o página estática para Mindsave.

---

## Identidad de marca

- **Nombre del producto:** Mind Save
- **Tagline implícito:** calma, claridad, cuidado
- **Tono visual:** sereno, clínico-cálido, nocturno
- **Paleta base:** fondos muy oscuros con acento teal vibrante. Nunca uses fondos blancos ni paletas "startup" brillantes.

---

## Tipografía

### Fuentes

| Rol | Familia | Clasificación | Fuente |
|-----|---------|---------------|--------|
| Titulares | **Lora** | Serif | Google Fonts |
| Cuerpo / UI | **Inter** | Sans-serif | Google Fonts |

### Carga (HTML estático)

```html
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600&family=Inter:wght@400;500&display=swap" rel="stylesheet"/>
```

### Carga (React / CSS)

```css
@import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
```

### Jerarquía tipográfica

| Nivel | Fuente | Peso | Tamaño | Color |
|-------|--------|------|--------|-------|
| Display / hero | Lora | 600 | 32–40 px | `#D5ECEC` |
| H1 | Lora | 600 | 26–30 px | `#D5ECEC` |
| H2 | Lora | 500 | 20–24 px | `#D5ECEC` |
| H3 / label de sección | Inter | 600 | 11–12 px | `#4A8080` — uppercase, letter-spacing 1.5–2px |
| Cuerpo | Inter | 400 | 15 px | `#7A9E9E` |
| UI / botones | Inter | 500 | 13–15 px | varía según contexto |
| Caption / metadata | Inter | 400 | 11–12 px | `#4A7070` |
| Nombre de marca en UI | Lora | 400 | 13 px | `#4A8080` — uppercase, letter-spacing 2.5px |

**Regla:** usa Lora únicamente para titulares y momentos de énfasis emocional. Todo el resto de la UI (etiquetas, inputs, botones, navegación) usa Inter.

---

## Paleta de colores

### Fondos (en orden de profundidad)

| Token | Hex | Uso |
|-------|-----|-----|
| `bg` | `#080F0F` | Fondo de página / pantalla principal (modo oscuro) |
| `bg-alt` | `#0A1818` | Fondo alternativo, shell de app |
| `card` | `#0F1E1E` | Superficie de tarjeta |
| `input-bg` | `#0A1A1A` | Fondo de campos de texto |
| `bg-light` | `#EAF4F4` | Fondo de página en modo claro |
| `card-light` | `#FFFFFF` | Superficie de tarjeta en modo claro |

### Bordes

| Token | Hex | Uso |
|-------|-----|-----|
| `border` | `#1C3838` | Borde de tarjeta, separadores, inputs (oscuro) |
| `border-light` | `#C8DEDE` | Borde en modo claro |

### Texto

| Token | Hex | Uso |
|-------|-----|-----|
| `text` | `#D5ECEC` | Texto principal (oscuro) |
| `text-muted` | `#7A9E9E` | Texto secundario, cuerpo de párrafo |
| `text-dim` | `#4A7070` | Captions, metadatos, placeholders |
| `text-light` | `#1A3232` | Texto principal (claro) |

### Acento

| Token | Hex | Uso |
|-------|-----|-----|
| `accent` | `#00B2B3` | Color primario de marca |
| `accent-bright` | `#00CACB` | Hover, estados activos, CTA principal |
| `accent-dim` | `#00CACB22` | Fondo de badges, chips, estados hover suaves |
| `accent-glow` | `#00B2B314` | Gradientes de fondo decorativos |

### Estados semánticos

| Estado | Color | Uso |
|--------|-------|-----|
| Éxito | `#10B981` | Checkmarks, confirmaciones |
| Error / peligro | `#EF4444` | Acciones destructivas, alertas |
| Advertencia | `#F59E0B` | Avisos, estados pendientes |

### Reglas de uso de color

1. **Nunca uses fondos blancos** en pantallas completas del producto.
2. El acento `#00B2B3` / `#00CACB` es exclusivo para acciones primarias, iconografía de marca y elementos de énfasis. No lo uses como color de texto de cuerpo.
3. Los textos sobre fondos oscuros siguen la jerarquía: `#D5ECEC` → `#7A9E9E` → `#4A7070`.
4. Las acciones destructivas usan siempre `#EF4444` — nunca el acento teal.

---

## Espaciado y geometría

### Border radius

| Elemento | Radio |
|----------|-------|
| Tarjetas principales | 20–24 px |
| Botones primarios | 12–16 px |
| Botones pequeños / chips | 20–24 px (píldora) |
| Inputs | 12 px |
| Badges / tags | 20 px (píldora) |
| Avatares | 50 % (círculo) |

### Espaciado interno de tarjetas

- Padding estándar: `40–48 px` vertical, `40 px` horizontal en desktop
- Padding compacto (mobile / modal): `24–32 px`

### Sombras

```css
/* Tarjeta estándar */
box-shadow: 0 24px 64px rgba(0, 0, 0, 0.5);

/* Elevación ligera */
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);

/* Acento de botón CTA */
box-shadow: 0 4px 16px rgba(0, 178, 179, 0.35);
```

---

## Componentes

### Tarjeta (Card)

```css
background: #0F1E1E;
border: 1px solid #1C3838;
border-radius: 24px;
box-shadow: 0 24px 64px rgba(0,0,0,.5);
```

**Detalle de acento opcional** — franja horizontal teal en el borde superior:

```css
/* Pseudoelemento ::before de la tarjeta */
position: absolute;
top: 0; left: 40px; right: 40px;
height: 3px;
background: linear-gradient(90deg, transparent, #00B2B3, transparent);
border-radius: 0 0 3px 3px;
```

### Botón primario (CTA)

```css
background: #00B2B3;
color: #080F0F;
font-family: Inter, sans-serif;
font-weight: 600;
font-size: 15px;
border: none;
border-radius: 14px;
padding: 14px 24px;
box-shadow: 0 4px 16px rgba(0,178,179,.35);
cursor: pointer;
```

Hover: `background: #00CACB`

### Botón secundario (outlined)

```css
background: transparent;
border: 1px solid #1C3838;
color: #7A9E9E;
border-radius: 14px;
padding: 13px 24px;
```

### Botón de peligro (outlined)

```css
background: transparent;
border: 1px solid #EF444433;
color: #EF4444;
border-radius: 14px;
```

### Input / Campo de texto

```css
background: #0A1A1A;
border: 1px solid #1C3838;
border-radius: 12px;
color: #D5ECEC;
font-family: Inter, sans-serif;
font-size: 15px;
padding: 14px 16px;
```

Focus: `border-color: #00B2B3; outline: none;`

### Divider de acento

Separador horizontal decorativo que refuerza la identidad de marca:

```css
width: 48px;
height: 2px;
background: linear-gradient(90deg, transparent, #00B2B3, transparent);
border-radius: 2px;
margin: 0 auto;
```

### Etiqueta de sección (Section label)

```css
font-family: Inter, sans-serif;
font-size: 11px;
font-weight: 600;
letter-spacing: 1.5px;
text-transform: uppercase;
color: #4A8080;
```

### Badge / Chip

```css
background: #00CACB22;
color: #00CACB;
font-family: Inter, sans-serif;
font-size: 11px;
font-weight: 500;
padding: 3px 10px;
border-radius: 20px;
```

---

## Logo

El logo de Mindsave es un **corazón teal** (`#00B2B3`) con la silueta de una persona de brazos en alto en negativo interior. Se usa en:

- Pantallas de autenticación (64–80 px)
- Páginas estáticas web (64–72 px)
- Emails HTML (48–56 px)
- Splash / loading screen (80–100 px)

Cuando no esté disponible como archivo de imagen, usa el siguiente SVG inline:

```html
<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M50 88 C50 88 8 62 8 34 C8 18 21 8 35 8 C42 8 48 11 50 14 C52 11 58 8 65 8 C79 8 92 18 92 34 C92 62 50 88 50 88Z" fill="#00B2B3"/>
  <path d="M50 80 L38 56 C36 52 34 46 36 42 C38 37 44 35 50 38 C56 35 62 37 64 42 C66 46 64 52 62 56 Z" fill="#080F0F"/>
  <circle cx="50" cy="28" r="8" fill="#080F0F"/>
</svg>
```

---

## Fondos y texturas decorativas

Usa estos recursos CSS para dar profundidad sin ruido visual:

### Gradiente de halo superior (hero / pantallas de auth)

```css
background-color: #080F0F;
background-image: radial-gradient(ellipse 60% 40% at 50% 0%, #00B2B314 0%, transparent 70%);
```

### Anillos concéntricos (páginas estáticas)

```css
/* Anillo exterior */
position: fixed; top: 50%; left: 50%;
translate: -50% -50%;
width: 520px; height: 520px;
border-radius: 50%;
border: 1px solid #00B2B30C;
pointer-events: none;

/* Anillo interior */
width: 360px; height: 360px;
border: 1px solid #00B2B312;
```

---

## Composición de página / pantalla

### Centrado vertical (páginas de estado, auth, confirmación)

```
┌─────────────────────────────────┐
│         [halo gradient]         │
│                                 │
│         [logo 72px]             │
│      MIND SAVE (brand label)    │
│         [divider teal]          │
│                                 │
│    Título en Lora 600           │
│    Párrafo en Inter 400         │
│                                 │
│         [CTA button]            │
│                                 │
│      footer · copyright         │
└─────────────────────────────────┘
```

- Contenedor máximo: `440–480 px` de ancho
- Alineación: centrado horizontal y vertical en viewport
- Padding lateral mínimo en mobile: `24 px`

### Jerarquía de elementos dentro de una tarjeta

1. Logo / icono ilustrativo
2. Nombre de marca (Lora, uppercase, muted)
3. Divider teal
4. Título (Lora, bold)
5. Descripción (Inter, muted)
6. Acción primaria (botón teal)
7. Acciones secundarias / links

---

## Modo claro vs. modo oscuro

El sistema soporta ambos modos. La identidad teal permanece idéntica en los dos.

| Propiedad | Oscuro | Claro |
|-----------|--------|-------|
| `bg` | `#0A1818` | `#EAF4F4` |
| `card` | `#0F2020` | `#FFFFFF` |
| `border` | `#1C3838` | `#C8DEDE` |
| `text` | `#D5ECEC` | `#1A3232` |
| `text-muted` | `#7A9E9E` | `#3A6060` |
| `accent` | `#00B2B3` | `#00B2B3` |

**Pantallas de autenticación:** siempre modo oscuro (`#080F0F`), independientemente del modo del sistema.

---

## Emails HTML

Los emails usan el sistema de diseño pero con restricciones propias del cliente de correo:

- **Sin CSS externo** — todo debe ser inline o en `<style>` dentro del `<head>`
- Fondo del email: `#080F0F` (body y wrapper table)
- Fuentes: declaradas en `<style>` con fallback `Georgia, serif` para Lora y `Arial, sans-serif` para Inter
- Ancho máximo del contenedor: `560 px`
- El botón CTA de email usa `background-color: #00B2B3`, texto negro, `border-radius: 10px`, sin box-shadow
- Nunca uses `position`, `flexbox` ni `grid` en emails — usa tablas HTML para layout

---

## Principios de diseño

1. **Oscuridad intencional.** El fondo oscuro no es una preferencia: es parte de la identidad terapéutica. Transmite seguridad, intimidad y calma.
2. **El teal es acento, no relleno.** Úsalo para guiar la atención hacia acciones y momentos clave, no como color dominante.
3. **Lora para emoción, Inter para función.** La transición entre fuentes crea contraste tipográfico que separa contenido emocional de UI operativa.
4. **Jerarquía clara sobre decoración.** Cada elemento decorativo (anillos, gradientes, franjas) debe tener una justificación compositiva.
5. **Sin blanco puro en pantallas completas.** Si necesitas un contexto claro, usa `#EAF4F4` como fondo, nunca `#FFFFFF`.
6. **Consistencia entre plataformas.** App móvil, página web, email y documentos comparten los mismos tokens de color y tipografía.
