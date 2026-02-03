# Sistema de Diseño Atómico (Design System) - PUCMM Band App v2.0

## 1. Fundamentos de Diseño (Design Tokens)

### 1.1 Sistema de Espaciado y Grilla

Utilizamos una escala basada en **4px (0.25rem)**. Todo espaciado, margen o padding debe ser múltiplo de 4.

- `space-1`: 4px
- `space-2`: 8px (Base para gap de iconos/texto)
- `space-3`: 12px
- `space-4`: 16px (Padding estándar de contenedores)
- `space-6`: 24px (Separación de secciones)
- `space-8`: 32px
- `space-12`: 48px

**Grilla:** 12 columnas fluida.

- **Mobile:** 4 columnas, margen 16px.
- **Tablet:** 8 columnas, margen 24px.
- **Desktop:** 12 columnas, max-width 1280px, centrado.

### 1.2 Tipografía Avanzada

Familia: **'Inter'** (Google Fonts) para UI, **'Helvetica Now Display'** (opcional, licenciada) para Brand Headers. Si no, fallback a Inter.

| Token          | Size (px/rem)   | Weight      | Line Height | Tracking | Uso                           |
| :------------- | :-------------- | :---------- | :---------- | :------- | :---------------------------- |
| `text-display` | 48px / 3rem     | 900 (Black) | 1.1         | -0.02em  | Títulos de Landing/Dashboard  |
| `text-h1`      | 30px / 1.875rem | 700 (Bold)  | 1.2         | -0.01em  | Encabezados de Página         |
| `text-h2`      | 24px / 1.5rem   | 600 (Semi)  | 1.3         | 0        | Títulos de Tarjetas/Secciones |
| `text-h3`      | 20px / 1.25rem  | 600 (Semi)  | 1.4         | 0        | Subtítulos modales            |
| `text-body-lg` | 18px / 1.125rem | 400 (Reg)   | 1.5         | 0        | Intro text, destacados        |
| `text-body`    | 16px / 1rem     | 400 (Reg)   | 1.5         | 0        | Texto general                 |
| `text-sm`      | 14px / 0.875rem | 500 (Med)   | 1.4         | 0.01em   | Metadatos, botones densos     |
| `text-xs`      | 12px / 0.75rem  | 500 (Med)   | 1.4         | 0.02em   | Badges, captions              |

### 1.3 Paleta Cromática Extendida (Semántica)

**Brand Colors (Institucional)**

- `brand-blue-primary`: `#0033A0` (Botones, Links Activos, Headers)
- `brand-blue-hover`: `#002270` (Estados Hover/Active)
- `brand-yellow`: `#FFD200` (Focos, Iconos destacados, Estado 'Ensayando')
- `brand-red`: `#D22630` (Errores, Borrar, Estado 'Pendiente')

**Neutral Colors (Dark Mode Interfaces)**

- `surface-0`: `#0F172A` (Background Principal - Slate 900)
- `surface-50`: `#1E293B` (Cards, Sidebars - Slate 800)
- `surface-100`: `#334155` (Inputs, Borders suaves - Slate 700)
- `surface-200`: `#475569` (Divisores fuertes - Slate 600)
- `text-primary`: `#F1F5F9` (Slate 100 - Alto contraste)
- `text-secondary`: `#94A3B8` (Slate 400 - Metadatos)
- `text-tertiary`: `#64748B` (Slate 500 - Placeholders)

**Feedback Colors (Functional)**

- `success`: `#10B981` (Emerald 500) - Para 'Montada/Ready'.
- `warning`: `#F59E0B` (Amber 500) - Para alertas no críticas.
- `info`: `#3B82F6` (Blue 500) - Para información neutral.

## 2. Biblioteca de Componentes (Atomic Design)

### 2.1 Átomos

**Botones:**

- **Primary:** Background `brand-blue-primary`, Text White, Rounded-md. Hover: `brand-blue-hover`. Shadow-lg `shadow-blue-900/50`.
- **Secondary:** Border 1px `surface-200`, Background Transparent, Text `text-primary`. Hover: `surface-100`.
- **Ghost:** Transparent, Text `text-secondary`. Hover: `text-primary` + `bg-white/5`.
- **Icon Button:** Circular, p-2.

**Inputs:**

- Background `surface-0` (dentro de cards) o `surface-50` (fuera).
- Border 1px `surface-200`. Focus: Border `brand-yellow` + Ring 2px `brand-yellow/20`.
- Height: 40px (Small), 48px (Medium).

**Avatars:**

- Círculo perfecto. Fallback con iniciales: Bg `brand-blue-primary`, Text `brand-yellow`.
- Borde opcional 2px `surface-0` para superposición.

### 2.2 Moléculas

**Song Card (Grid View):**

- **Container:** `bg-surface-50`, rounded-xl, overflow-hidden.
- **Image:** Aspect Ratio 1:1. Overlay gradiente negro al hover con botón Play centrado.
- **Content:** Título (truncate 1 línea), Artista (truncate 1 línea).
- **Interaction:** `hover:scale-[1.02]`, `transition-all duration-200`.

**Song Row (List View):**

- **Grid Layout:** `# | Cover+Title | Album | Date | Duration | Actions`.
- **Hover:** Background `white/5`. Mostrar acciones ocultas (Like, Menu).
- **Playing State:** Título en `brand-yellow`, ecualizador animado en lugar del número #.

**Search Bar Global:**

- Input con icono de lupa a la izquierda.
- Kbd shortcut (Ctrl+K) visual a la derecha.

### 2.3 Organismos

**Sidebar de Navegación:**

- Sticky left. Width: 240px (Desktop), 64px (Collapsed).
- Secciones: "Tu Biblioteca", "Eventos", "Admin".
- User Profile en el bottom.

**Detail Modal (Overlay):**

- **Backdrop:** `bg-black/80` + `backdrop-blur-sm`.
- **Panel:** `bg-surface-50`, border `surface-100`, shadow-2xl.
- **Header:** con Hero Image (Cover difuminado).
- **Tabs de contenido:** "Info General", "Partituras", "Video/Audio", "Historial".

**Player Bar (Footer):**

- Fixed bottom. Height 80px. `bg-surface-50` border-t `surface-100`.
- Z-index: 50 (máximo).

## 3. Patrones de Interacción y Accesibilidad

### 3.1 Estados de Carga (Skeletons)

Nunca mostrar spinners bloqueantes para cargas de contenido. Usar "Shimmer Effects" (esqueletos animados) que imitan la estructura de la tarjeta o fila de la tabla.

- **Color base:** `surface-100`.
- **Color highlight:** `surface-200`.
- **Animación:** `pulse`.

### 3.2 Feedback de Usuario (Toasts)

Notificaciones flotantes no intrusivas en la esquina inferior derecha.

- **Success:** Icono Check verde, borde izquierdo verde.
- **Error:** Icono X rojo, borde izquierdo rojo.
- **Loading:** Spinner pequeño, texto "Procesando...".

### 3.3 Accesibilidad (A11y)

- **Contraste:** Todo texto `text-muted` debe pasar al menos ratio 4.5:1 sobre `surface-50`.
- **Foco:** Todos los elementos interactivos deben tener un estado `:focus-visible` definido (outline 2px solid `brand-yellow`).
- **Teclado:** Navegación completa por teclado en listas de canciones (Flechas Arriba/Abajo para selección, Enter para reproducir).

## 4. Responsividad (Breakpoints)

- **Mobile (<640px):**
  - Sidebar desaparece -> Bottom Navigation Bar (4 items: Inicio, Buscar, Biblioteca, Perfil).
  - Tablas se convierten en listas de tarjetas verticales.
  - Modales ocupan 100% de pantalla (Full Screen Sheets).
- **Tablet (640px - 1024px):**
  - Sidebar colapsado (solo iconos).
  - Grillas de 3 columnas.
- **Desktop (>1024px):**
  - Sidebar expandido.
  - Grillas de 5+ columnas.
  - Modales centrados con overlay.
