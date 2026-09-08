# Biblioteca — Frontend

SPA en **Angular 21** (standalone, sin NgModules) para el sistema de préstamos de la
biblioteca: catálogo de libros con búsqueda, flujo de préstamos y reservas, y un panel de
administración. Consume la API REST del backend (Spring Boot) y persiste la sesión del
usuario en el navegador.

> Este README documenta el frontend de forma autónoma. Para levantar todo el stack
> (backend + PostgreSQL + MailHog + este frontend) con un solo comando, ver el
> [`README.md` de la raíz](../README.md).

---

## Tabla de contenidos

- [Stack](#stack)
- [Cómo correrlo](#cómo-correrlo)
- [Arquitectura](#arquitectura)
- [Estructura de carpetas](#estructura-de-carpetas)
- [Rutas](#rutas)
- [Guards e interceptor HTTP](#guards-e-interceptor-http)
- [Servicios (`core/services`)](#servicios-coreservices)
- [Features y sus componentes](#features-y-sus-componentes)
- [Design system (`shared/ui`)](#design-system-sharedui)
- [Gestión de estado](#gestión-de-estado)
- [Estilos](#estilos)
- [Configuración por entorno](#configuración-por-entorno)
- [Testing](#testing)
- [Build y despliegue (Docker + nginx)](#build-y-despliegue-docker--nginx)
- [Convenciones](#convenciones)

---

## Stack

| Área | Tecnología |
|---|---|
| Framework | Angular 21 — componentes **standalone**, `bootstrapApplication`, sin `AppModule` |
| Reactividad | **Signals** (`signal` / `computed`) para estado, `input()` / `output()` en componentes |
| Ruteo | `@angular/router` con **lazy loading** por `loadComponent` y guards funcionales |
| HTTP | `provideHttpClient` + interceptor funcional (`HttpInterceptorFn`) |
| Formularios | Reactive Forms (`FormGroup` / `FormControl` tipados, `nonNullable`) |
| UI | **PrimeNG 21** (tema Aura) + **PrimeIcons**. Overlays globales (`Toast`, `ConfirmDialog`) montados una sola vez en el layout raíz |
| Estilos | **Tailwind CSS 4** (vía `@tailwindcss/postcss`) + plugin `tailwindcss-primeui` |
| Testing | **Vitest 4** (vía `@angular/build:unit-test`) + `jsdom` |
| Formato | Prettier (`printWidth: 100`, comillas simples, parser `angular` para HTML) |
| Build/serve | `@angular/build` (esbuild) |

Detección de cambios **zoneless-friendly**: todos los componentes usan
`ChangeDetectionStrategy.OnPush` y el estado se expone como signals, de modo que la vista
reacciona a cambios de señal sin depender de que `zone.js` decida revisar el componente.

---

## Cómo correrlo

### Requisitos

- Node.js 22+ y npm (solo para desarrollo local; para producción basta Docker)
- El backend corriendo en `http://localhost:8080` (ver README de la raíz)

### Desarrollo

```bash
npm install
npm start            # ng serve — http://localhost:4200, recarga en caliente
```

En modo desarrollo, `apiUrl` apunta directamente a `http://localhost:8080/api`
(ver [`environment.development.ts`](src/environments/environment.development.ts)).

### Otros comandos

```bash
npm run build        # build de producción -> dist/frontend/browser
npm run watch        # build incremental en modo desarrollo
npm test             # tests unitarios con Vitest
```

---

## Arquitectura

El proyecto sigue **Atomic Design** combinado con una organización **por features**:

```
src/app/
├── core/          Lógica transversal sin UI: servicios de datos, guards, interceptores.
│                  Es el único lugar que conoce la URL de la API y el shape de las respuestas.
├── features/      Una carpeta por área funcional (auth, catalog, loans, admin).
│                  Cada feature tiene sus "pages" (rutas) y sus "components" (piezas de esa feature).
└── shared/ui/     Design system reutilizable, agrupado por nivel atómico:
                   atoms → molecules → organisms.
```

**Regla de dependencias:** `features` y `shared` dependen de `core`, nunca al revés.
Las **pages** son los únicos componentes que inyectan servicios; los componentes hijos son
"tontos" (reciben datos por `input()`, comunican acciones por `output()`). Esto mantiene la
lógica de negocio concentrada y hace los componentes triviales de testear de forma aislada.

---

## Estructura de carpetas

```
src/
├── main.ts                         Bootstrap de la aplicación standalone
├── index.html                      Shell HTML (lang="es", <app-root>)
├── styles.css                      Estilos globales: Tailwind + PrimeIcons + plugin PrimeUI
├── environments/
│   ├── environment.ts              Producción  → apiUrl: '/api'  (nginx hace de proxy)
│   └── environment.development.ts  Desarrollo  → apiUrl: 'http://localhost:8080/api'
└── app/
    ├── app.ts / app.html           Layout raíz: <app-header> global + <router-outlet> + overlays <p-toast>/<p-confirmdialog> (montados una sola vez)
    ├── app.config.ts               Providers: router, HttpClient + interceptor, animaciones, PrimeNG (tema Aura, dark mode con selector .dark), MessageService + ConfirmationService (instancia única)
    ├── app.routes.ts               Definición de rutas (ver más abajo)
    │
    ├── core/
    │   ├── guards/
    │   │   ├── auth-guard.ts        ¿Hay sesión? si no → /login
    │   │   └── admin-guard.ts       ¿El rol es ADMIN? si no → /
    │   ├── interceptors/
    │   │   └── api-interceptor.ts   Añade el Bearer token; ante un 401 cierra sesión y va a /login
    │   └── services/
    │       ├── auth.ts   / auth.types.ts
    │       ├── book.ts   / book.types.ts
    │       ├── loan.ts   / loan.types.ts
    │       ├── reservation.ts / reservation.types.ts
    │       ├── admin.ts  / admin.types.ts
    │       └── ui-feedback.ts       Envoltorio sobre Toast + ConfirmDialog de PrimeNG (ningún componente habla con MessageService/ConfirmationService directo)
    │
    ├── features/
    │   ├── auth/
    │   │   ├── pages/login-page/            Ruta /login
    │   │   └── components/login-form/       Formulario reactivo de credenciales
    │   ├── catalog/
    │   │   ├── pages/catalog-page/          Ruta / (home)
    │   │   └── components/
    │   │       ├── catalog-search/          Filtros: título, autor, estado
    │   │       ├── catalog-table/           Tabla (data-table) + acciones por fila
    │   │       └── book-form/               Alta de libro (ADMIN) con "Autocompletar por ISBN"
    │   ├── loans/
    │   │   ├── pages/my-loans-page/         Ruta /my-loans
    │   │   └── components/
    │   │       ├── loans-table/             Préstamos del usuario + "Devolver"
    │   │       └── reservations-table/      Reservas del usuario + "Cancelar"
    │   └── admin/
    │       ├── pages/admin-page/            Ruta /admin
    │       └── components/
    │           ├── users-table/             Todas las cuentas: rol, estado, acciones (editar/bloquear/desbloquear/eliminar)
    │           ├── user-form/               Alta y edición de cuenta (con selector de rol)
    │           ├── admin-loans-table/       Todos los préstamos + "Devolver" (el ADMIN devuelve el de cualquier usuario)
    │           ├── activity-log-table/      Bitácora de actividad (acciones exitosas del sistema)
    │           └── error-log-table/         Bitácora de errores del backend
    │
    └── shared/ui/
        ├── atoms/      button, text-input, status-badge, overdue-badge, stat-card
        ├── molecules/  form-field (label + input + mensaje de error)
        └── organisms/
            ├── app-header/    marca + navegación + usuario + cerrar sesión
            └── data-table/    tabla genérica (DataTable<T>) + directiva appColumnTemplate para celdas custom
```

Cada componente vive en su propia carpeta con 4 archivos: `*.ts`, `*.html`, `*.css` y
`*.spec.ts` (y `*.types.ts` cuando tiene tipos propios). Todo se generó con
`ng generate` — de ahí la convención de nombres de archivo sin sufijo (`auth.ts`, no
`auth.service.ts`).

---

## Rutas

Definidas en [`app.routes.ts`](src/app/app.routes.ts). Todas las páginas se cargan con
**lazy loading** (`loadComponent`), así cada ruta es su propio chunk.

| Ruta | Componente | Guards | Acceso | Propósito y contenido |
|---|---|---|---|---|
| `/login` | `LoginPage` | — | Público | Pantalla de inicio de sesión. Tarjeta centrada con `<app-login-form>`. Al autenticarse correctamente redirige a `/`. |
| `/` | `CatalogPage` | `authGuard` | Cualquier usuario con sesión | **Catálogo de libros** (home). Cabecera + buscador (`catalog-search`) + tabla (`catalog-table`). Por fila, según el estado del libro: **Pedir préstamo** (DISPONIBLE), **Reservar** (PRESTADO). Si el usuario es ADMIN, además: botón **Registrar libro** que despliega `book-form`, y acción **Eliminar** en libros disponibles. |
| `/my-loans` | `MyLoansPage` | `authGuard` | Cualquier usuario con sesión | **Mis préstamos y mis reservas**. Sección "Mis préstamos": tabla con libro, ISBN, fechas de préstamo y límite, estado (`Al día` / `Vencido` / `Devuelto`), aviso "✉️ recordatorio enviado" cuando corresponde, y acción **Devolver**. Sección "Mis reservas": tabla con libro, estado de la reserva y acción **Cancelar**. |
| `/admin` | `AdminPage` | `authGuard`, `adminGuard` | Solo ADMIN | **Panel de administración**. Cinco bloques: (1) **Resumen** — 4 `stat-card`: préstamos activos, préstamos vencidos, reservas activas, cuentas bloqueadas. (2) **Usuarios** — botón **Crear usuario** (despliega `user-form`) + tabla con *todas* las cuentas (nombre, correo, rol, estado activa/bloqueada, alta) y acciones por fila: **Editar**, **Bloquear** (abre un diálogo donde el ADMIN elige los días) / **Desbloquear**, **Eliminar**. (3) **Préstamos** — tabla de todos los préstamos (con el prestatario) y acción **Devolver** por fila: el ADMIN puede cerrar el préstamo de *cualquier* usuario si esa persona se olvidó. Un checkbox "Incluir devueltos" amplía la lista al historial. (4) **Actividad** — bitácora de acciones exitosas (login, préstamo, devolución, reserva, altas/bajas, bloqueos), con filtro por tipo de acción. (5) **Bitácora de errores** — nivel (`INFO`/`WARN`/`ERROR` como `p-tag` coloreado), mensaje, excepción, método y ruta HTTP, fecha. Toda acción destructiva pasa por un `ConfirmDialog`; el resultado se informa con un `Toast`. |
| `**` | — | — | — | Cualquier ruta desconocida redirige a `/`. |

El `<app-header>` (marca + navegación + "cerrar sesión") vive en el **layout raíz**
(`app.ts`), no en cada página: se ve igual en `/`, `/my-loans` y `/admin`. `/login` es
la única vista sin sesión y usa su propio layout centrado.

**Flujo de acceso típico:** sin sesión, cualquier ruta protegida rebota a `/login`. Tras
el login la sesión queda en `localStorage`, así que un refresh de página mantiene al
usuario dentro. Si el backend responde `401` en cualquier petición (token vencido), el
interceptor cierra la sesión y devuelve a `/login` automáticamente.

---

## Guards e interceptor HTTP

### `authGuard` — [`core/guards/auth-guard.ts`](src/app/core/guards/auth-guard.ts)

`CanActivateFn` funcional. Devuelve `true` si `Auth.isAuthenticated()`; si no, devuelve un
`UrlTree` hacia `/login`. Protege `/`, `/my-loans` y `/admin`.

### `adminGuard` — [`core/guards/admin-guard.ts`](src/app/core/guards/admin-guard.ts)

`CanActivateFn` funcional. Devuelve `true` si `Auth.isAdmin()`; si no, redirige a `/`.
Se combina con `authGuard` en el array `canActivate` de la ruta `/admin`
(`[authGuard, adminGuard]`) en lugar de reimplementar la comprobación de sesión: una ruta
de admin necesita las dos cosas, y así cada guard tiene una sola responsabilidad.

### `apiInterceptor` — [`core/interceptors/api-interceptor.ts`](src/app/core/interceptors/api-interceptor.ts)

`HttpInterceptorFn` registrado en `app.config.ts`. Hace dos cosas:

1. **Request saliente:** si hay token en `Auth`, clona la petición añadiendo la cabecera
   `Authorization: Bearer <token>`.
2. **Respuesta de error:** si llega un `401` **y** había sesión activa, llama a
   `Auth.logout()` y navega a `/login`. Así una sesión vencida nunca deja la UI mostrando
   datos obsoletos como si todo siguiera bien. El error se vuelve a propagar
   (`throwError`) para que quien hizo la llamada también pueda reaccionar.

---

## Servicios (`core/services`)

Todos son `@Injectable({ providedIn: 'root' })` (singletons). Patrón común:

- El **estado compartido** entre varias vistas vive en signals del servicio
  (`books`, `myLoans`, `stats`, `loading`, `error`…). Los métodos `load*` / `search`
  hacen la petición y actualizan esas signals, incluida la de error con un mensaje
  legible.
- Las **acciones puntuales** (crear, eliminar, devolver, cancelar, bloquear…) devuelven un
  `Observable`. Siguen el patrón de `Loan`/`Reservation`: se auto-refrescan la lista en el
  `tap`, y quien llama decide cómo mostrar su feedback — que en las páginas es siempre un
  **`Toast`** (éxito/error) y, antes de una acción destructiva, un **`ConfirmDialog`**, vía
  el servicio [`UiFeedback`](src/app/core/services/ui-feedback.ts). Ningún componente usa
  `window.alert` / `window.confirm`.

### `Auth` — [`auth.ts`](src/app/core/services/auth.ts) · [tipos](src/app/core/services/auth.types.ts)

Sesión del usuario actual. Estado en signals + persistencia en `localStorage`
(clave `biblioteca.auth`) para sobrevivir un refresh. Lectura de `localStorage` protegida
con `try/catch` (modo privado / storage bloqueado → la app funciona igual, sin sesión
recordada).

| Miembro | Tipo | Descripción |
|---|---|---|
| `currentUser` | `computed<CurrentUser \| null>` | Nombre, correo y rol del usuario, o `null`. |
| `isAuthenticated` | `computed<boolean>` | `true` si hay sesión. Lo usan los guards. |
| `isAdmin` | `computed<boolean>` | `true` si `role === 'ADMIN'`. |
| `token` | getter `string \| null` | Token JWT actual. Lo lee el interceptor. |
| `login(payload)` | `Observable<AuthResponse>` | `POST /auth/login`. Guarda la sesión en el `tap`. |
| `register(payload)` | `Observable<AuthResponse>` | `POST /auth/register`. Guarda la sesión (rol siempre `BIBLIOTECARIO`). |
| `logout()` | `void` | Limpia signal y `localStorage`. |

Roles: `'ADMIN' | 'BIBLIOTECARIO'`.

### `Book` — [`book.ts`](src/app/core/services/book.ts) · [tipos](src/app/core/services/book.types.ts)

Catálogo de libros. Estado: `books`, `totalElements`, `totalPages`, `currentPage`,
`loading`, `error`.

| Método | HTTP | Descripción |
|---|---|---|
| `search(params?)` | `GET /books?title&author&status&page&size` | Búsqueda paginada. Vuelca el resultado en las signals. `size` por defecto: 20. |
| `lookupByIsbn(isbn)` | `GET /books/lookup/{isbn}` | Previsualización de datos vía Open Library (título, autor, año, portada, materias). Nunca guarda nada. |
| `create(request)` | `POST /books` | Alta de libro (ADMIN). |
| `delete(id)` | `DELETE /books/{id}` | Baja de libro (ADMIN). |

`BookStatus`: `'DISPONIBLE' | 'PRESTADO' | 'RESERVADO'`.
El tipo del libro se llama `BookItem` (no `Book`) para no colisionar con la clase de
servicio `Book`.

### `Loan` — [`loan.ts`](src/app/core/services/loan.ts) · [tipos](src/app/core/services/loan.types.ts)

Préstamos del usuario actual. Estado: `myLoans`, `loading`, `error`.

| Método | HTTP | Descripción |
|---|---|---|
| `loadMine()` | `GET /loans/mine` | Carga los préstamos del usuario. |
| `create(bookId)` | `POST /loans` | Pedir un préstamo de un libro disponible. |
| `returnLoan(id)` | `PUT /loans/{id}/return` | Devolver un préstamo. Refresca la lista en el `tap`. |

`LoanItem` incluye `dueDate`, `returnDate`, `overdue` (booleano calculado por el backend)
y `reminderSent`.

### `Reservation` — [`reservation.ts`](src/app/core/services/reservation.ts) · [tipos](src/app/core/services/reservation.types.ts)

Reservas (lista de espera) del usuario. Estado: `myReservations`, `loading`, `error`.

| Método | HTTP | Descripción |
|---|---|---|
| `loadMine()` | `GET /reservations/mine` | Carga las reservas del usuario. |
| `create(bookId)` | `POST /reservations` | Reservar un libro que está prestado. |
| `cancel(id)` | `DELETE /reservations/{id}` | Cancelar la reserva (soft-delete a `CANCELADO`). Refresca la lista. |

`ReservationStatus`: `'PENDIENTE' | 'NOTIFICADO' | 'CANCELADO' | 'CUMPLIDO'`.

### `Admin` — [`admin.ts`](src/app/core/services/admin.ts) · [tipos](src/app/core/services/admin.types.ts)

Todo el panel de administración. Estado: `stats`, `users`, `loans`, `loansIncludeReturned`,
`activity`, `errorLogs`, `loading`, `error`.

| Método | HTTP | Descripción |
|---|---|---|
| `loadStats()` | `GET /admin/stats` | Contadores: préstamos activos / vencidos, reservas activas, cuentas bloqueadas. |
| `loadUsers()` | `GET /admin/users` | Todas las cuentas del sistema (`ManagedUser[]`). |
| `createUser(payload)` | `POST /admin/users` | Alta de cuenta con rol elegible (`ADMIN`/`BIBLIOTECARIO`). Refresca la lista. |
| `updateUser(id, payload)` | `PUT /admin/users/{id}` | Edita nombre y rol. Refresca la lista. |
| `deleteUser(id)` | `DELETE /admin/users/{id}` | Elimina una cuenta. Refresca la lista. |
| `blockUser(id, days)` | `PUT /admin/users/{id}/block` | Bloquea `days` días (elige el ADMIN). Refresca la lista. |
| `unblockUser(id)` | `PUT /admin/users/{id}/unblock` | Levanta el bloqueo. Refresca la lista. |
| `loadLoans(includeReturned?)` | `GET /admin/loans?includeReturned` | Préstamos para gestión: activos por defecto, o con el historial. Guarda el flag en `loansIncludeReturned`. |
| `returnLoan(id)` | `PUT /loans/{id}/return` | Devuelve el préstamo (endpoint compartido con "Mis préstamos", ya acepta al ADMIN). Refresca respetando el filtro activo. |
| `loadActivity(page?, size?)` | `GET /admin/activity?page&size` | Bitácora de actividad paginada (`size` por defecto: 30). |
| `loadErrorLogs(page?, size?)` | `GET /admin/logs?page&size` | Bitácora de errores paginada (`size` por defecto: 20). |

`ManagedUser` trae `role`, `blockedUntil` (crudo) y `blocked` (booleano ya resuelto por el
backend). `LogLevel`: `'INFO' | 'WARN' | 'ERROR'`. Los errores de negocio del backend
(`409`: "no puedes eliminar la última cuenta ADMIN", "no puedes bloquearte a ti mismo"…)
llegan en `ApiError.message` y la página los muestra tal cual en el `Toast`.

> **Extensión sobre el enunciado.** El PDF solo contempla el auto-registro público
> (`/auth/register`, siempre `BIBLIOTECARIO`) y el bloqueo automático por atrasos; la
> gestión de usuarios y el bloqueo manual se agregan para que el ADMIN pueda operar de
> verdad. Ver la decisión completa en el [README raíz](../README.md#decisiones-de-diseño).

> **Base URL:** todos los servicios construyen las URLs como `` `${environment.apiUrl}/...` ``.
> En desarrollo eso es `http://localhost:8080/api`; en producción es `/api`, que nginx
> reenvía al backend (ver [despliegue](#build-y-despliegue-docker--nginx)).

---

## Features y sus componentes

### `auth`

| Componente | Selector | Rol |
|---|---|---|
| `LoginPage` | `app-login-page` | Página de la ruta `/login`. Layout centrado; al recibir `(loggedIn)` navega a `/`. |
| `LoginForm` | `app-login-form` | Reactive Form con `email` (requerido + formato) y `password` (requerido + mínimo 8). Los mensajes de error se recalculan mientras se escribe gracias a un puente `toSignal` sobre `valueChanges`. Emite `loggedIn`. Distingue el `401` ("Correo o contraseña incorrectos") de otros fallos. |

### `catalog`

| Componente | Selector | Rol |
|---|---|---|
| `CatalogPage` | `app-catalog-page` | Página de `/`. Inyecta `Book`, `Loan`, `Reservation`, `Auth`, `UiFeedback`. Orquesta búsqueda, alta, préstamo, reserva y baja; confirma la baja con `ConfirmDialog` e informa cada resultado con `Toast`. |
| `CatalogSearch` | `app-catalog-search` | Formulario de filtros: título, autor y estado (`p-select` con opción "Todos" y `showClear`). Emite `search` con los parámetros ya normalizados (strings vacíos → `undefined`). |
| `CatalogTable` | `app-catalog-table` | Usa `<app-data-table>`. Columnas: Título, Autor, ISBN, Año, Estado (`status-badge`), Acciones. Botones por fila según estado y según `canManage` (ADMIN). Emite `borrowBook` / `reserveBook` / `deleteBook`. |
| `BookForm` | `app-book-form` | Alta de libro para ADMIN. "Autocompletar desde ISBN" llama a `lookupByIsbn` y precarga el resto de campos (editables); si el ISBN no se encuentra, el formulario queda intacto para completarlo a mano — nunca bloquea el alta. `publicationYear` viaja como string en el form y se convierte a número al construir el payload. Distingue el `409` ("Ya existe un libro con ese ISBN"). Emite `created`. |

### `loans`

| Componente | Selector | Rol |
|---|---|---|
| `MyLoansPage` | `app-my-loans-page` | Página de `/my-loans`. Inyecta `Loan` y `Reservation`, dispara `loadMine()` de ambos en el constructor. |
| `LoansTable` | `app-loans-table` | Usa `<app-data-table>`. Columnas: Libro, ISBN, Fecha de préstamo, Fecha límite, Estado (`overdue-badge` + aviso "recordatorio enviado"), Acciones (**Devolver** si no está devuelto). Emite `returnLoan`. |
| `ReservationsTable` | `app-reservations-table` | Usa `<app-data-table>`. Estado de la reserva como `p-tag`; acción **Cancelar**. Emite `cancelReservation`. |

### `admin`

| Componente | Selector | Rol |
|---|---|---|
| `AdminPage` | `app-admin-page` | Página de `/admin`. Único componente que conoce el servicio `Admin` y el que orquesta el feedback (`UiFeedback`). En `ngOnInit` carga stats, usuarios, préstamos, actividad y bitácora de errores. Contiene el diálogo (`p-dialog`) de "bloquear N días" y el checkbox "Incluir devueltos" — las tablas se mantienen tontas y solo emiten eventos; la página valida, confirma y refresca. Toda acción destructiva pasa por `ConfirmDialog` + `Toast`. |
| `UsersTable` | `app-users-table` | Usa `<app-data-table>` (buscador por nombre/correo + filtro por rol). Columnas: Nombre, Correo, Rol (`p-tag`), Estado (`Activa` / `Bloqueada hasta …`), Alta, Acciones. Emite `edit` / `block` / `unblock` / `remove`. |
| `UserForm` | `app-user-form` | Alta y edición en un solo componente. Con `user` → edita (nombre + rol; el correo se muestra deshabilitado, la contraseña no aplica); sin `user` → alta (nombre, correo, contraseña ≥ 8, rol vía `p-select`). Sincroniza con `user` en un `effect` (los `input()` no están listos en el constructor y el ADMIN puede saltar de editar una cuenta a otra). Validación espejo del backend; distingue el `409`. Emite `saved` / `cancelled`. |
| `AdminLoansTable` | `app-admin-loans-table` | Como `LoansTable` pero con la columna del prestatario (nombre + correo) y la acción **Devolver** para cualquier préstamo activo, no solo los propios. Emite `returnLoan`. |
| `ActivityLogTable` | `app-activity-log-table` | Usa `<app-data-table>` (solo lectura, filtro por tipo de acción). Acción como `p-tag` con etiqueta legible (`LOAN_CREATED` → "Préstamo pedido", …); muestra quién (o "sistema"), el detalle y la fecha. |
| `ErrorLogTable` | `app-error-log-table` | Usa `<app-data-table>` (solo lectura, filtro por nivel). Nivel como `p-tag` con severidad mapeada (`INFO`→info, `WARN`→warn, `ERROR`→danger); muestra mensaje, tipo de excepción, método y ruta HTTP, y fecha. |

---

## Design system (`shared/ui`)

Piezas reutilizables, sin lógica de negocio, agrupadas por nivel atómico. Todas `OnPush`.

### Atoms

| Componente | Selector | API (`input` / `output`) | Notas |
|---|---|---|---|
| `Button` | `app-button` | `label` (req.), `type`, `loading`, `disabled`, `class` (alias) | Envuelve `pButton`. `host { display: contents }` para que el `class` del call site aplique al `<button>` interno. |
| `TextInput` | `app-text-input` | `id` (req.), `type` (`text`/`email`/`password`), `placeholder`, `autocomplete` | Implementa `ControlValueAccessor` → usable con `formControlName`. Envuelve `pInputText`. Siempre produce/consume `string`. |
| `StatusBadge` | `app-status-badge` | `status` (req.: `BookStatus`) | `p-tag` con etiqueta y color por estado (DISPONIBLE→success, PRESTADO→warn, RESERVADO→info). |
| `OverdueBadge` | `app-overdue-badge` | `returned`, `overdue` | `p-tag`: "Devuelto" / "Vencido" / "Al día" con severidad acorde. |
| `StatCard` | `app-stat-card` | `label` (req.), `value` (req.: number) | Número + etiqueta para el dashboard. Sin PrimeNG: solo texto con estilo. |

### Molecules

| Componente | Selector | API | Notas |
|---|---|---|---|
| `FormField` | `app-form-field` | `label` (req.), `inputId` (req.), `errorMessage` | Compone `<label>` + contenido proyectado (el input) + mensaje de error. Une accesibilidad (`for`/`id`) y presentación del error en un solo lugar. |

### Organisms

| Componente | Selector | Notas |
|---|---|---|
| `AppHeader` | `app-header` | Marca "Biblioteca" + navegación (`routerLink` + `routerLinkActive`): Catálogo, Mis préstamos y —solo ADMIN— Administración. Muestra `nombre · rol` y botón **Cerrar sesión** (llama a `Auth.logout()` y navega a `/login`). Montado **una sola vez** en el layout raíz (`app.ts`). |
| `DataTable<T>` | `app-data-table` | Tabla genérica que usan las 5 tablas de la app. Envuelve `p-table` y añade: buscador global client-side (`globalFilterFields`), filtro opcional por categoría (`selectFilter`), scroll horizontal responsive y mensaje de "sin resultados". Inputs: `value`, `columns` (`{ field, header, class? }[]`), `loading`, `dataKey`, `emptyMessage`. Cada tabla concreta aporta solo sus columnas y, para celdas que no son texto plano (badges, botones), un `<ng-template appColumnTemplate="campo">` proyectado. |
| `ColumnTemplate` (directiva) | `ng-template[appColumnTemplate]` | Marca un `<ng-template>` proyectado como el renderizador de una columna (por su `field`). Deja que cada tabla decida cómo se ve una celda sin que `DataTable` conozca ningún dominio. |

### Servicio de feedback

| Servicio | Notas |
|---|---|
| `UiFeedback` — [`core/services/ui-feedback.ts`](src/app/core/services/ui-feedback.ts) | Envoltorio delgado sobre `MessageService` / `ConfirmationService` de PrimeNG. `success()` / `error()` / `info()` disparan un `Toast`; `confirm(options)` devuelve una `Promise<boolean>` (permite `if (!(await ui.confirm(...))) return;`, el mismo flujo lineal que `window.confirm` pero con un modal real). Los `<p-toast>` / `<p-confirmdialog>` se montan una sola vez en `app.html`; los providers `MessageService`/`ConfirmationService` se registran en `app.config.ts` para que sean instancia única. |

---

## Gestión de estado

- **Sin librería de estado** (NgRx/otros): el estado compartido vive en **signals dentro
  de los servicios `core`**. Los componentes exponen esas mismas signals a la plantilla
  (`protected readonly books = this.bookService.books`).
- **Sesión:** signal privada en `Auth`, espejada en `localStorage`; derivados
  (`isAuthenticated`, `isAdmin`, `currentUser`) como `computed`.
- **Formularios:** Reactive Forms tipados. En `LoginForm`, `valueChanges` se puentea a
  signals con `toSignal` para que los `computed` de mensajes de error se actualicen en
  vivo dentro de un componente `OnPush`.
- **Comunicación padre/hijo:** `input()` hacia abajo, `output()` hacia arriba. Los hijos
  no inyectan servicios de datos.
- **Feedback de UI:** ni `window.alert` ni `window.confirm`. Éxito/error → `Toast`;
  confirmación previa a una acción destructiva → `ConfirmDialog`. Todo a través de
  `UiFeedback`, y solo desde las páginas.

---

## Estilos

- **Tailwind CSS 4** vía PostCSS (`.postcssrc.json` → `@tailwindcss/postcss`). No hay
  `tailwind.config.js`: la configuración vive en `styles.css` con la sintaxis nueva
  (`@import 'tailwindcss'`, `@plugin 'tailwindcss-primeui'`).
- **PrimeNG** con el preset de tema **Aura** (`@primeuix/themes/aura`), configurado en
  `app.config.ts`. **Dark mode** con `darkModeSelector: '.dark'` — se activa poniendo la
  clase `.dark` en un ancestro; las plantillas ya llevan variantes `dark:` de Tailwind y
  clases `surface-*` de PrimeUI.
- **PrimeIcons** importado en `styles.css`.
- Presupuestos de CSS por componente en `angular.json`: warning a 4 kB, error a 8 kB.

---

## Configuración por entorno

| Archivo | `production` | `apiUrl` | Cuándo se usa |
|---|---|---|---|
| [`environment.ts`](src/environments/environment.ts) | `true` | `/api` | Build de producción (por defecto). |
| [`environment.development.ts`](src/environments/environment.development.ts) | `false` | `http://localhost:8080/api` | `ng serve` y `npm run watch` (via `fileReplacements` en `angular.json`). |

No hay más configuración de entorno: la app no tiene flags de feature ni claves de
terceros en el cliente.

---

## Testing

- Runner: **Vitest** (vía `@angular/build:unit-test`), entorno `jsdom`.
- Cobertura: **35** archivos `*.spec.ts` / **176** casos, sobre servicios, guards,
  interceptor y componentes (cada componente tiene su spec junto al código).

```bash
npm test
```

> El runner se levanta desde `@angular/build:unit-test` (que compila con AOT + linker de
> Angular). Correr `npx vitest` directo **no** funciona: se salta ese setup y falla al
> compilar en JIT.

Qué se cubre:

- **Servicios** — construcción de URLs y params, actualización de signals de estado y de
  error, refresco de listas tras acciones, `tap` de persistencia de sesión.
- **`authGuard` / `adminGuard`** — permiten el paso o devuelven el `UrlTree` correcto.
- **`apiInterceptor`** — añade el header; ante un `401` con sesión activa hace `logout` +
  navegación.
- **`DataTable` / `UiFeedback`** — filtrado client-side, proyección de plantillas por
  columna, `confirm()` como Promise, toasts.
- **Componentes** — render, validación de formularios, emisión de `output`s, ramas por
  estado (botones que aparecen/desaparecen según `BookStatus`, rol ADMIN, `blocked`, modo
  alta vs. edición del `user-form`, etc.).

---

## Build y despliegue (Docker + nginx)

[`Dockerfile`](Dockerfile) — build multi-stage:

1. **`build`** (`node:22-alpine`): `npm ci` en su propia capa (cacheable) y
   `ng build --configuration production` → `dist/frontend/browser`.
2. **Runtime** (`nginx:1.27-alpine`): sirve los estáticos y aplica
   [`nginx.conf`](nginx.conf).

[`nginx.conf`](nginx.conf) hace dos cosas clave:

- **SPA fallback:** `try_files $uri $uri/ /index.html` — cualquier ruta que no sea un
  archivo real cae en `index.html` para que el router de Angular la resuelva en el
  cliente (así `/my-loans` recargado directo no da 404).
- **Proxy `/api/` → backend:** en producción el frontend habla con `/api` (mismo origen),
  y nginx reenvía a `http://backend:8080` dentro de la red de Docker Compose, evitando
  CORS. Usa `resolver 127.0.0.11` + variable en `proxy_pass` para **re-resolver** el
  nombre `backend` en cada request (no solo al arrancar): así este contenedor puede
  levantar antes que el backend, o el backend puede reiniciarse y cambiar de IP, sin
  tumbar nginx. Se usa `$request_uri` (la URI original completa) porque con una variable
  en `proxy_pass` nginx **no** hace el stripping automático del prefijo del `location`.
- **Cache de assets:** archivos con hash (`.js`, `.css`, imágenes, fuentes) se sirven con
  `expires 30d`.

El servicio se expone en el puerto 4200 del host (ver `docker-compose.yml` de la raíz).

---

## Convenciones

- **Generación con Angular CLI:** todos los artefactos se crearon con `ng generate`. De
  ahí los nombres de archivo sin sufijo de tipo (`auth.ts`, `catalog-page.ts`) y las
  clases sin sufijo (`Auth`, `Book`, `CatalogPage`). Los **tipos** de dominio llevan
  sufijo cuando chocarían con la clase de servicio del mismo archivo (`BookItem` vs.
  `Book`, `ReservationItem` vs. `Reservation`) o para desambiguar (`ManagedUser` es la
  cuenta vista desde el panel de admin, distinta del `CurrentUser` de la sesión).
- **Standalone siempre:** cada componente declara sus `imports`; no hay NgModules.
- **`OnPush` + signals** en todos los componentes.
- **Pages inyectan servicios; los hijos no.** La lógica de negocio no baja de la página.
- **Formato:** Prettier con `printWidth: 100` y comillas simples; HTML con el parser
  `angular` (ver `.prettierrc`).
- **Idioma:** UI, comentarios y mensajes de commit en español; el HTML declara
  `lang="es"`.
```
