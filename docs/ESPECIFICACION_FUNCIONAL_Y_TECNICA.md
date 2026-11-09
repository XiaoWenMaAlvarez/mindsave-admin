# Especificación funcional y técnica AS-IS de MindSave Admin

## 1. Identificación del documento

| Campo | Valor |
|---|---|
| Sistema | MindSave Admin |
| Repositorio | `mindsave-admin` |
| Tipo de producto | Aplicación web de página única (SPA) ejecutada en navegador |
| Idioma de la interfaz | Español |
| Fecha de análisis | 27 de agosto de 2026 |
| Estado descrito | Implementación AS-IS presente en el repositorio |
| Alcance analizado | Código fuente, rutas, estado, contratos HTTP, componentes, estilos, configuración y pruebas del frontend |
| Propósito | Fuente de información para casos de uso extendidos, diagramas UML y documentación de arquitectura |

## 2. Propósito y criterio de esta especificación

Este documento describe las funcionalidades que el frontend administrativo de MindSave ofrece actualmente y la forma concreta en que las implementa. La descripción se deriva del código presente en el repositorio y no de una propuesta futura del producto.

El repositorio contiene exclusivamente el cliente web administrativo. La persistencia de las cuentas, la comprobación de credenciales, la emisión y validación de tokens y la ejecución definitiva de las operaciones sobre usuarios corresponden a una API externa. Por ello, el contrato de esa API se documenta desde la perspectiva del consumidor: rutas, parámetros, cuerpos y respuestas que el frontend usa explícitamente.

En el documento se distinguen dos usos de la palabra «usuario»:

1. **Administrador autenticado:** persona que opera MindSave Admin y cuya sesión contiene el rol literal `PROFESIONAL_ROL`.
2. **Cuenta gestionada:** registro consultado o modificado desde el panel. Puede tener rol `PROFESIONAL_ROL` o `USER_ROL`.

## 3. Definición funcional del sistema

MindSave Admin permite a un administrador:

- iniciar sesión con correo y contraseña;
- mantener una sesión local basada en un token Bearer;
- revalidar y renovar la sesión al arrancar la aplicación, al recuperar el foco y de forma periódica;
- cerrar la sesión local;
- acceder a una pantalla de inicio con accesos a las operaciones principales;
- consultar un listado paginado de cuentas;
- buscar cuentas por nombre o correo según el criterio presentado por la interfaz;
- filtrar cuentas por rol, actividad y verificación de correo;
- conservar búsqueda, filtros, límite y página en la URL;
- crear una cuenta con nombre, rol, correo, contraseña y estado de verificación del correo;
- consultar el detalle de una cuenta;
- editar nombre, rol, correo, contraseña y verificación del correo;
- conservar la contraseña existente al editar si el campo de contraseña queda vacío;
- desactivar una cuenta activa después de una confirmación;
- restaurar una cuenta inactiva después de una confirmación;
- impedir desde la interfaz que el administrador desactive o restaure su propia cuenta;
- impedir desde la interfaz que el administrador cambie su propia cuenta a `USER_ROL`;
- impedir desde la interfaz que el administrador marque su propio correo como no verificado;
- recibir estados visuales de carga, vacío, error, operación pendiente, éxito y fallo.

## 4. Actores y colaboradores

### 4.1. Actor humano principal

#### Administrador

Es la persona que interactúa directamente con la SPA. Para que el frontend establezca una sesión autenticada, la respuesta de autenticación o revalidación debe contener el rol exacto `PROFESIONAL_ROL`. La interfaz representa este literal con la etiqueta «Administrador».

El administrador puede gestionar tanto cuentas con rol administrativo como cuentas con rol de usuario común. Su identidad local contiene `id`, `email`, `name` y `role`.

### 4.2. Cuenta con rol de usuario común

Una cuenta con rol `USER_ROL` aparece como objeto de gestión dentro del panel. La interfaz la etiqueta como «Usuario». El flujo de login del frontend no establece una sesión administrativa para una respuesta con este rol.

### 4.3. Colaboradores técnicos

| Colaborador | Participación en el sistema |
|---|---|
| API administrativa de MindSave | Autentica, revalida sesiones y procesa las operaciones de consulta y mantenimiento de cuentas |
| Navegador | Ejecuta la SPA, conserva la URL, mantiene `localStorage` y aporta la hora local para el saludo |
| `localStorage` | Persiste el token bajo la clave exacta `token` |
| Google Fonts | Entrega fuentes web declaradas por la aplicación |
| TanStack Query | Coordina consultas, mutaciones, caché e invalidación de datos remotos |
| Zustand | Mantiene el estado global de autenticación en memoria |
| React Router | Resuelve rutas, parámetros, redirecciones y estado de búsqueda en la URL |
| Axios | Implementa el cliente HTTP y sus interceptores |
| Sonner | Presenta notificaciones transitorias de resultado |

## 5. Catálogo de funcionalidades

| ID | Funcionalidad | Ruta o contexto | Comunicación HTTP |
|---|---|---|---|
| F-01 | Inicializar y revalidar la sesión | Global | `GET /auth/check-status` |
| F-02 | Iniciar sesión | `/login` | `POST /auth/login` |
| F-03 | Cerrar sesión | Encabezado de rutas privadas | Ninguna |
| F-04 | Consultar el inicio administrativo | `/` | Ninguna propia de la página |
| F-05 | Consultar usuarios | `/users` | `GET /user` |
| F-06 | Buscar usuarios | `/users?query=...` | `GET /user` con `query` |
| F-07 | Filtrar usuarios | `/users` con filtros de URL | `GET /user` con filtros |
| F-08 | Paginar usuarios | `/users?page=...&limit=...` | `GET /user` con `page` y `limit` |
| F-09 | Crear usuario | `/new-user` | `POST /user` |
| F-10 | Consultar detalle de usuario | `/users/:id` | `GET /user/:id` |
| F-11 | Editar usuario | `/users/:id` | `PUT /user/:id` |
| F-12 | Desactivar usuario | Acción del listado | `DELETE /user/:id` |
| F-13 | Restaurar usuario | Acción del listado | `PUT /user/restore-user/:id` |
| F-14 | Gestionar expiración o rechazo de autorización | Global, excepto la solicitud de login | Reacción a respuestas `401` o `403` |

## 6. Reglas funcionales y de negocio implementadas

| ID | Regla implementada | Mecanismo |
|---|---|---|
| RN-01 | El rol administrativo reconocido es exactamente `PROFESIONAL_ROL`. | Comparación en los flujos `login` y `checkAuthStatus` |
| RN-02 | El otro rol de cuenta reconocido es exactamente `USER_ROL`. | Uniones literales de TypeScript, formularios y filtros |
| RN-03 | El token se persiste con la clave exacta `token`. | Lectura y escritura en `localStorage` |
| RN-04 | Las solicitudes del cliente común envían `Authorization: Bearer <token>` cuando existe token. | Interceptor de solicitud de Axios |
| RN-05 | La base efectiva del cliente HTTP es `${VITE_API_URL}/admin`. | Creación de la instancia `mindsaveAPI` |
| RN-06 | Una revalidación correcta reemplaza el token persistido por el token recibido. | `checkAuthAction` |
| RN-07 | Las rutas privadas requieren `authStatus = authenticated`. | `AuthenticatedRoute` |
| RN-08 | `/login` solo se presenta cuando no hay sesión autenticada. | `NotAuthenticatedRoute` |
| RN-09 | El administrador no puede desactivar ni restaurar su propia cuenta desde el listado. | Comparación del `id` autenticado con el `id` de la cuenta |
| RN-10 | Desactivar y restaurar requieren confirmación explícita. | `ConfirmDialog` |
| RN-11 | Una contraseña vacía en edición representa «mantener la contraseña actual». | Eliminación de `password` en `UserEditForm` |
| RN-12 | Cambiar búsqueda o filtros restablece `page` a `1`. | Actualización de `URLSearchParams` |
| RN-13 | Búsqueda, filtros y paginación preservan parámetros de URL no relacionados. | Copia de los parámetros existentes antes de modificar uno |
| RN-14 | Crear o editar con éxito navega al listado `/users`. | Callbacks de éxito de las páginas |
| RN-15 | Una cuenta activa habilita la desactivación y deshabilita la restauración. | Estado calculado de ambos botones |
| RN-16 | Una cuenta inactiva habilita la restauración y deshabilita la desactivación. | Estado calculado de ambos botones |
| RN-17 | El administrador no puede asignar `USER_ROL` a su propia cuenta desde el formulario. | Comparación de correos en `UserPage` antes de la mutación |
| RN-18 | El administrador no puede desverificar el correo de su propia cuenta desde el formulario. | Comparación de correos en `UserPage` antes de la mutación |
| RN-19 | Los controles asociados a una operación pendiente permanecen deshabilitados. | Estados `isPosting` e `isPending` |
| RN-20 | La ausencia de resultados es un estado válido del listado. | Presentación vacía de `UserList` |
| RN-21 | Una respuesta `401` o `403` de una solicitud distinta del login cierra la sesión local. | Interceptor de respuesta y handler registrado por el store |
| RN-22 | Los filtros solo llegan a la API si pertenecen a sus conjuntos de literales permitidos. | Normalización en `useGetUsers` |
| RN-23 | `page` y `limit` se interpretan como enteros positivos; `limit` no supera `100`. | `parsePositiveInteger` |
| RN-24 | El texto de búsqueda efectivo se recorta, elimina espacios exteriores y se limita a 100 caracteres. | Normalización en `useGetUsers` |

### 6.1. Literales funcionales

| Concepto | Valor de contrato | Etiqueta visible |
|---|---|---|
| Rol administrativo | `PROFESIONAL_ROL` | Administrador |
| Rol común | `USER_ROL` | Usuario |
| Cuenta activa | `active` en filtro; `isActive=true` en respuesta | Activo |
| Cuenta inactiva | `inactive` en filtro; `isActive=false` en respuesta | Inactivo |
| Correo verificado | `verify` en filtro; `emailVerified=true` en respuesta | Verificado |
| Correo no verificado | `unverify` en filtro; `emailVerified=false` en respuesta | No verificado |

## 7. Navegación y control de acceso

### 7.1. Árbol de rutas

| Ruta | Página o layout | Acceso | Propósito |
|---|---|---|---|
| `/` | `UsersLayout` + `HomePage` | Autenticado | Inicio administrativo |
| `/users` | `UsersLayout` + `UsersPage` | Autenticado | Listado y gestión de cuentas |
| `/users/:id` | `UsersLayout` + `UserPage` | Autenticado | Consulta y edición de una cuenta |
| `/new-user` | `UsersLayout` + `NewUserPage` | Autenticado | Creación de una cuenta |
| `/login` | `LoginPage` | No autenticado | Inicio de sesión |
| Cualquier otra | `Navigate` | Según destino `/` | Redirección al inicio |

### 7.2. Guardas

`AuthenticatedRoute` consulta `authStatus` en Zustand:

- con `checking`, muestra `LoadingPage`;
- con `not-authenticated`, redirige a `/login`;
- con `authenticated`, renderiza el contenido privado.

`NotAuthenticatedRoute` aplica la regla inversa:

- con `checking`, muestra `LoadingPage`;
- con `authenticated`, redirige a `/`;
- con `not-authenticated`, presenta el login.

### 7.3. Carga diferida

Las cuatro páginas, el layout privado y la página de login se cargan mediante `React.lazy`. Cada elemento diferido queda contenido en `Suspense`, cuyo fallback es `LoadingPage`. El router se implementa con `createBrowserRouter` y se monta mediante `RouterProvider`.

### 7.4. Layout privado y encabezado

`UsersLayout` proporciona:

- fondo de página oscuro y cuadrícula decorativa fija;
- `CustomHeader` compartido;
- un `Outlet` para la página hija activa.

El encabezado permanece adherido (`sticky`) al borde superior durante el desplazamiento y contiene:

- el logo enlazado a `/`, compacto en pantallas pequeñas;
- navegación a `/users` con estado activo también en `/users/:id` y `/new-user`;
- nombre del administrador y etiqueta «Administrador» en pantallas grandes;
- acción «Cerrar sesión».

## 8. Autenticación y ciclo de sesión

### 8.1. Estado de autenticación

El store `useAuthStore` mantiene:

| Propiedad | Tipo | Significado |
|---|---|---|
| `user` | `UserAuthResponse \| null` | Identidad del administrador autenticado |
| `token` | `string \| null` | Copia en memoria del token vigente |
| `authStatus` | `authenticated \| not-authenticated \| checking` | Estado usado por las guardas |

También expone tres operaciones:

- `login(email, password)`;
- `logout()`;
- `checkAuthStatus()`.

El estado inicial es `user=null`, `token=null` y `authStatus=checking`.

### 8.2. Inicialización y revalidación de sesión

`CheckAuthProvider`, montado dentro de `QueryClientProvider`, crea una consulta con:

- query key `['auth']`;
- query function `checkAuthStatus`;
- reintentos automáticos deshabilitados;
- intervalo de revalidación de 1,5 horas;
- revalidación al recuperar el foco de la ventana.

Durante la primera carga presenta `LoadingPage` con el mensaje «Comprobando tu sesión».

#### Flujo con token

1. El store lee `token` desde `localStorage`.
2. `checkAuthAction` vuelve a comprobar la existencia del token.
3. El cliente ejecuta `GET /auth/check-status`.
4. El interceptor de solicitud incorpora el token Bearer.
5. La respuesta entrega `id`, `email`, `name`, `role` y un token.
6. La action reemplaza el token persistido por el token de la respuesta.
7. El store comprueba que `role` sea `PROFESIONAL_ROL`.
8. Si el rol coincide, crea el objeto `user`, actualiza el token en memoria y establece `authenticated`.
9. Si el rol no coincide, elimina el token, limpia la caché y establece `not-authenticated`.

#### Flujo sin token

1. El store detecta que la clave no existe.
2. Establece `user=null`, `token=null` y `authStatus=not-authenticated`.
3. Devuelve `false` sin invocar la API.

#### Flujo con rechazo de autenticación

Para una respuesta `401` o `403`, el interceptor global ejecuta el cierre local y la action elimina el token. El store clasifica el resultado como error de autenticación, limpia la caché y establece el estado no autenticado.

#### Flujo con error de conectividad o servidor

`checkAuthAction` conserva el token persistido y propaga un error con el mensaje de la respuesta, de Axios o el texto «Error de conexión con el servidor». El store devuelve `false`. Si todavía estaba en el estado inicial `checking`, cambia `authStatus` a `not-authenticated`; si la revalidación ocurrió sobre una sesión ya autenticada, no reemplaza el estado de sesión vigente en esa rama.

### 8.3. Inicio de sesión

#### Precondición de navegación

La ruta `/login` es visible cuando `authStatus` es `not-authenticated`. Una sesión autenticada provoca redirección a `/`.

#### Entradas

| Campo | Tipo HTML | Reglas del formulario de login |
|---|---|---|
| Correo | `email` | Obligatorio; `autocomplete=email` |
| Contraseña | `password` | Obligatoria; `autocomplete=current-password` |

#### Flujo principal

1. El operador envía el formulario.
2. `LoginPage` establece `isPosting=true`, deshabilitando campos y botón.
3. Obtiene `email` y `password` mediante `FormData`.
4. Llama a `useAuthStore.login`.
5. `loginAction` envía `POST /auth/login` con `{ email, password }`.
6. El store exige `role === 'PROFESIONAL_ROL'`.
7. Limpia la caché de TanStack Query.
8. Construye `user` con `id`, `email`, `name` y `role`.
9. Guarda el token en `localStorage` y en el store.
10. Establece `authStatus=authenticated` y devuelve `true`.
11. La página muestra el toast «Sesión iniciada» y navega a `/`.
12. En el bloque `finally`, restablece `isPosting=false`.

#### Respuesta con rol no administrativo

El store devuelve `false`. La página muestra «Acceso no autorizado» con la explicación de que la cuenta no tiene permisos para el panel y permanece en el login.

#### Error de la solicitud

El store elimina el token local, limpia la caché, restablece los datos de sesión y propaga el error normalizado. La página presenta «No pudimos iniciar sesión» y utiliza el mensaje de error como descripción.

### 8.4. Cierre de sesión

El botón del encabezado ejecuta `logout()`:

1. elimina `token` de `localStorage`;
2. limpia toda la caché de TanStack Query;
3. establece `user=null`, `token=null` y `authStatus=not-authenticated`;
4. muestra «Sesión cerrada»;
5. la guarda privada redirige a `/login`.

El cierre es local y no envía una solicitud HTTP.

### 8.5. Reacción global a `401` y `403`

El módulo del store registra su método `logout` como handler de acceso no autorizado en el cliente Axios. Para cualquier respuesta `401` o `403`, excepto una solicitud cuya URL contiene `/auth/login`, el interceptor:

1. invoca el handler registrado;
2. elimina el token y limpia la caché por medio de `logout`;
3. cambia la sesión a `not-authenticated`;
4. mantiene el rechazo de la promesa HTTP para que la consulta o mutación reciba el error.

El cliente también contiene un camino de respaldo que elimina token y caché si todavía no existe un handler registrado.

### 8.6. Máquina de estados de sesión

| Estado origen | Evento o condición | Estado destino | Efectos principales |
|---|---|---|---|
| Inicio | Creación del store | `checking` | Sesión aún no resuelta |
| `checking` | No existe token | `not-authenticated` | Usuario y token en memoria quedan nulos |
| `checking` | `check-status` correcto y rol administrativo | `authenticated` | Usuario y token quedan disponibles |
| `checking` | Rol no administrativo | `not-authenticated` | Token y caché se eliminan |
| `checking` | Rechazo `401/403` | `not-authenticated` | Token y caché se eliminan |
| `checking` | Error de conectividad o servidor | `not-authenticated` | Finaliza el estado de comprobación |
| `not-authenticated` | Login correcto y rol administrativo | `authenticated` | Token persistido y usuario cargado |
| `not-authenticated` | Login con rol no administrativo | `not-authenticated` | Acceso no concedido |
| `not-authenticated` | Login fallido | `not-authenticated` | Token y caché se limpian |
| `authenticated` | Logout | `not-authenticated` | Se elimina la sesión local |
| `authenticated` | `401/403` global | `not-authenticated` | Se elimina la sesión local |
| `authenticated` | Revalidación correcta | `authenticated` | Token renovado |
| `authenticated` | Revalidación con error de conectividad o servidor | `authenticated` | El store conserva el estado de sesión de esa rama y devuelve `false` |

## 9. Pantalla de inicio administrativo

`HomePage`, disponible en `/`, no realiza una consulta HTTP propia. Obtiene al administrador desde Zustand y presenta:

- un saludo calculado con la hora local del navegador;
- el nombre del administrador o «Administrador» como valor de respaldo;
- un texto introductorio;
- una tarjeta de acceso a `/users` para gestionar cuentas;
- una tarjeta de acceso a `/new-user` para crear una cuenta.

La regla horaria del saludo es:

| Hora local | Saludo |
|---|---|
| Antes de las 12:00 | Buenos días |
| Desde las 12:00 y antes de las 19:00 | Buenas tardes |
| Desde las 19:00 | Buenas noches |

## 10. Consulta y presentación del listado de usuarios

### 10.1. Entrada desde la URL

`useGetUsers` usa `useSearchParams` para convertir la URL en el estado de consulta.

| Parámetro | Valor por defecto | Normalización | Uso |
|---|---:|---|---|
| `page` | `1` | Entero finito mayor o igual a 1 | Página solicitada |
| `limit` | `10` | Entero finito entre 1 y 100 | Cantidad solicitada por página |
| `query` | Cadena vacía | `trim()` y máximo de 100 caracteres | Texto de búsqueda |
| `rol` | Cadena vacía | Solo `USER_ROL` o `PROFESIONAL_ROL` | Rol |
| `state` | Cadena vacía | Solo `active` o `inactive` | Actividad de cuenta |
| `emailVerify` | Cadena vacía | Solo `verify` o `unverify` | Verificación de correo |

`page` y `limit` siempre forman parte de los parámetros enviados. Los otros parámetros solo se agregan al objeto HTTP cuando su valor efectivo no está vacío.

La query key es:

```text
[
  "users",
  { page, limit, query, rol, state, emailVerify }
]
```

Por tanto, cada combinación normalizada de página, límite, búsqueda y filtros representa una entrada diferenciada de caché.

### 10.2. Obtención de datos

`getAllUsersByPageAction` ejecuta `GET /user` y envía los parámetros recibidos mediante la opción `params` de Axios. Espera una respuesta `UsersResponse` con:

- `results`: arreglo de cuentas;
- `totalPages`: total de páginas;
- `page`: página reportada por la API;
- `limit`: límite reportado por la API.

Cuando una respuesta indica un `totalPages` mayor que cero y la página solicitada excede ese total, un efecto reemplaza el parámetro `page` de la URL por `totalPages`. La actualización usa la opción `replace`, por lo que sustituye la entrada actual del historial.

### 10.3. Estructura de la página

`UsersPage` presenta:

1. título y descripción de la gestión;
2. enlace «Crear usuario» hacia `/new-user`;
3. superficie con búsqueda y filtros;
4. listado de cuentas;
5. paginación cuando hay más de una página.

### 10.4. Representación de cada cuenta

Cada cuenta muestra:

- avatar textual generado con las iniciales de las primeras dos palabras del nombre;
- nombre;
- correo;
- rol con etiqueta visual;
- estado activo o inactivo;
- correo verificado o no verificado;
- enlace de edición;
- acción de desactivación;
- acción de restauración.

La cuenta cuyo `id` coincide con el administrador autenticado se marca como «Tu cuenta» en la tabla y con un icono accesible equivalente en tarjetas.

### 10.5. Presentación responsive

`UserList` mantiene dos representaciones del mismo arreglo:

- desde el breakpoint `lg`, una tabla con columnas separadas para atributos y acciones;
- por debajo de `lg`, tarjetas individuales con atributos agrupados y tres acciones en la zona inferior.

Los estados se presentan con badges semánticos:

| Dato | Presentación |
|---|---|
| `PROFESIONAL_ROL` | Badge teal «Administrador» |
| `USER_ROL` | Badge neutro «Usuario» |
| `isActive=true` | Badge verde «Activo» |
| `isActive=false` | Badge rojo «Inactivo» |
| `emailVerified=true` | Badge verde «Verificado» |
| `emailVerified=false` | Badge ámbar «No verificado» |

### 10.6. Estados de la consulta

| Estado | Presentación |
|---|---|
| Carga | `LoadingPage` con «Cargando usuarios» |
| Error o respuesta sin `results` | `ErrorPage` con el mensaje disponible |
| `results` vacío | Estado «No encontramos usuarios» |
| Resultados disponibles | Tabla o tarjetas más paginación |

## 11. Búsqueda de usuarios

`SearchBar` implementa un formulario con rol accesible `search`.

### 11.1. Aplicar búsqueda

1. El campo se inicializa con el valor `query` existente en la URL.
2. El administrador escribe y envía el formulario.
3. El componente aplica `trim()` y convierte el texto a minúsculas.
4. Si queda contenido, escribe `query` en la URL; si queda vacío, elimina el parámetro.
5. Establece `page=1`.
6. Conserva el resto de parámetros.
7. El cambio de la query key provoca la consulta correspondiente.

### 11.2. Limpiar búsqueda

Cuando la URL contiene una búsqueda activa, aparece un botón de limpieza. Al utilizarlo:

- vacía el elemento de entrada;
- elimina `query` de la URL;
- establece `page=1`;
- conserva filtros y límite;
- devuelve el foco al campo de búsqueda.

La interfaz describe el criterio como «Buscar por nombre o correo». El texto normalizado se transmite al backend como un único parámetro `query`.

## 12. Filtrado de usuarios

`UserFilters` presenta tres selectores:

| Selector | Opciones y valores |
|---|---|
| Estado del correo | Todos; Verificado=`verify`; No verificado=`unverify` |
| Rol | Todos; Administrador=`PROFESIONAL_ROL`; Usuario=`USER_ROL` |
| Estado de la cuenta | Todos; Activos=`active`; Inactivos=`inactive` |

Al cambiar un selector:

1. el valor no vacío se escribe en su parámetro;
2. la opción «Todos» elimina ese parámetro;
3. `page` pasa a `1`;
4. se preservan búsqueda, límite y demás filtros.

El botón «Limpiar filtros» solo aparece si al menos uno de los tres parámetros tiene contenido. La acción elimina `emailVerify`, `rol` y `state`, conserva la búsqueda y el límite, y establece `page=1`.

## 13. Paginación de usuarios

`CustomPagination` recibe `totalPages` desde la respuesta. No renderiza controles cuando el total es menor o igual a uno.

Para una página válida, permite:

- ir a la primera página;
- ir a la página anterior;
- seleccionar un número visible;
- ir a la página siguiente;
- ir a la última página.

La acción se ignora si el destino queda fuera de `1..totalPages` o coincide con la página actual. Un cambio válido:

1. reemplaza únicamente `page` dentro de una copia de los parámetros actuales;
2. conserva búsqueda, filtros, límite y cualquier otro parámetro;
3. desplaza la ventana al comienzo con desplazamiento suave;
4. activa una consulta con la nueva query key.

### 13.1. Números y elipsis

`getPaginationItems` devuelve números o los marcadores `ellipsis-left` y `ellipsis-right`:

- con cero páginas, devuelve una lista vacía;
- con una a tres páginas, devuelve todos los números;
- al comienzo de un conjunto mayor, muestra las tres primeras, elipsis derecha y última;
- al final, muestra primera, elipsis izquierda y las tres últimas;
- en una zona intermedia, muestra primera, elipsis izquierda, página anterior, actual, siguiente, elipsis derecha y última.

Los marcadores se representan con el icono de puntos suspensivos y se ocultan del árbol accesible.

## 14. Creación de usuario

### 14.1. Acceso y valores iniciales

La creación está disponible en `/new-user`. `UserCreateForm` instancia el formulario compartido con:

| Campo | Valor inicial |
|---|---|
| `name` | `""` |
| `role` | `USER_ROL` |
| `email` | `""` |
| `password` | `""` |
| `emailVerified` | `false` |

### 14.2. Validación activa

El formulario usa React Hook Form con `zodResolver(createUserSchema)`.

| Campo | Regla |
|---|---|
| `name` | Se recorta; obligatorio; mínimo 2 y máximo 30 caracteres |
| `role` | Debe ser `USER_ROL` o `PROFESIONAL_ROL` |
| `email` | Debe tener formato de correo válido |
| `password` | Obligatoria; mínimo 6 y máximo 20 caracteres |
| `emailVerified` | Booleano |

El formulario HTML utiliza `noValidate`, por lo que esta validación se ejecuta por medio de React Hook Form y Zod. Los mensajes aparecen bajo el campo correspondiente con `role=alert`, y los inputs de texto inválidos exponen `aria-invalid`.

Los campos aparecen en el orden nombre, rol, correo, contraseña y verificación. El rol se captura con un selector. La verificación se captura con un checkbox visualmente representado como tarjeta e interruptor; `useWatch` observa su valor para alternar icono, color, descripción y badge entre «Verificado» y «No verificado».

### 14.3. Flujo de creación

1. El administrador completa y envía el formulario.
2. El resolver valida y entrega `UserFormValues`.
3. `UserCreateForm` entrega los valores como `NewUser`.
4. `useCreateUser` inicia una mutación.
5. `createUserAction` envía `POST /user` con `email`, `password`, `name`, `emailVerified` y `role`.
6. La action devuelve el `UserResponse` recibido.
7. El hook invalida todas las queries cuya raíz es `['users']`.
8. La página muestra «Usuario creado» con el nombre de la cuenta.
9. La página navega a `/users`.

Durante la mutación, todos los campos y el botón de envío quedan deshabilitados. El botón cambia su texto de «Crear usuario» a «Creando…».

Si la mutación falla, se muestra «No pudimos crear el usuario» con el mensaje normalizado y no se ejecuta la navegación de éxito.

Los enlaces «Volver a usuarios» y «Cancelar» navegan a `/users` sin invocar la action.

## 15. Consulta y edición de usuario

### 15.1. Carga del detalle

`UserPage` obtiene `id` mediante `useParams`. `useGetUserById(id)` configura una query con:

- query key `['user', { id }]`;
- query function `getUserByIdAction(id)`;
- ejecución habilitada solo cuando `id` tiene contenido;
- reintento automático deshabilitado;
- `staleTime` de cinco minutos.

La action ejecuta `GET /user/:id` y espera un `UserResponse`.

| Estado | Presentación |
|---|---|
| Carga | `LoadingPage` con «Cargando los datos del usuario» |
| Error o usuario ausente | `ErrorPage` |
| Usuario disponible | `UserEditForm` con sus datos |

### 15.2. Valores del formulario

El formulario de edición recibe:

- `email` de la respuesta;
- `name` de la respuesta;
- `role` de la respuesta;
- `emailVerified` de la respuesta;
- `password=""`.

### 15.3. Validación activa

El modo edición usa `zodResolver(editUserSchema)`.

| Campo | Regla |
|---|---|
| `name` | Se recorta; obligatorio; mínimo 2 y máximo 30 caracteres |
| `role` | Debe ser `USER_ROL` o `PROFESIONAL_ROL` |
| `email` | Debe tener formato de correo válido |
| `password` | Puede ser exactamente vacío o tener entre 6 y 20 caracteres |
| `emailVerified` | Booleano |

### 15.4. Transformación de la contraseña

Antes de entregar el payload a la página, `UserEditForm` evalúa `values.password.trim()`:

- si queda vacío, elimina la propiedad `password` del objeto;
- si contiene texto válido, conserva `password` para la actualización.

Este adaptador implementa el comportamiento visible «Deja la contraseña vacía para mantener la actual».

### 15.5. Restricciones sobre la propia cuenta

Antes de iniciar la mutación, `UserPage` compara el correo de la sesión con el correo del usuario cargado.

| Condición | Resultado |
|---|---|
| Es la propia cuenta y el nuevo rol es `USER_ROL` | Cancela el envío y muestra «No puedes cambiar tu rol» |
| Es la propia cuenta y `emailVerified` es `false` | Cancela el envío y muestra «No puedes desverificar tu correo» |
| Ninguna de las anteriores | Continúa con la mutación |

### 15.6. Flujo de actualización

1. El formulario entrega los valores validados y adaptados.
2. `UserPage` agrega el `id` obtenido de la ruta.
3. La mutación ejecuta `editUserAction`.
4. La action envía `PUT /user/:id` con `email`, `password` cuando está definido, `name`, `emailVerified` y `role`.
5. La action devuelve el mismo `id`.
6. El hook invalida `['users']` y `['user', { id }]`.
7. La página muestra «Cambios guardados».
8. La página navega a `/users`.

Durante la mutación, el formulario queda deshabilitado y el botón muestra «Guardando…». Si la solicitud falla, se muestra «No pudimos editar el usuario» y no se ejecuta la navegación de éxito.

## 16. Desactivación de usuario

La interfaz usa el término «desactivar» para la operación `DELETE /user/:id` y la presenta como reversible mediante la restauración.

### 16.1. Disponibilidad de la acción

`DeleteUserButton` calcula:

- `isCurrentUser` comparando el `id` de la sesión con `userId`;
- `disabled` cuando la mutación está pendiente, la cuenta ya está inactiva o es la propia cuenta.

Para la propia cuenta, el botón muestra «Protegido», un icono de escudo y el título «No puedes eliminar tu propia cuenta».

### 16.2. Confirmación y ejecución

1. El administrador pulsa «Eliminar» en una cuenta activa distinta de la propia.
2. Se abre un `ConfirmDialog` de variante de peligro con título «Desactivar usuario».
3. El diálogo explica que la cuenta podrá restaurarse posteriormente.
4. El administrador puede cancelar o confirmar «Desactivar».
5. Al confirmar, la mutación invoca `deleteUserAction(userId)`.
6. La action ejecuta `DELETE /user/:id`.
7. En éxito, se invalidan `['users']` y `['user', { id: userId }]`.
8. Se muestra «Usuario desactivado».
9. El diálogo se cierra.

Durante la solicitud, el botón de la fila muestra «Eliminando…» y el diálogo muestra «Procesando…». Si la solicitud falla, el diálogo permanece disponible y se presenta «No pudimos desactivar el usuario».

## 17. Restauración de usuario

### 17.1. Disponibilidad de la acción

`RestoreUserButton` deshabilita la acción cuando:

- la mutación está pendiente;
- la cuenta ya está activa;
- la cuenta corresponde al administrador autenticado.

Para la propia cuenta utiliza la misma representación «Protegido».

### 17.2. Confirmación y ejecución

1. El administrador pulsa «Restaurar» en una cuenta inactiva distinta de la propia.
2. Se abre un `ConfirmDialog` de variante de éxito con título «Restaurar usuario».
3. El diálogo indica que la cuenta recuperará el acceso.
4. El administrador puede cancelar o confirmar «Restaurar».
5. Al confirmar, la mutación invoca `restoreUserAction(userId)`.
6. La action ejecuta `PUT /user/restore-user/:id` sin cuerpo explícito.
7. En éxito, se invalidan `['users']` y `['user', { id: userId }]`.
8. Se muestra «Usuario restaurado».
9. El diálogo se cierra.

Durante la solicitud, el botón muestra «Restaurando…» y el diálogo muestra «Procesando…». Si la solicitud falla, se presenta «No pudimos restaurar el usuario».

## 18. Comportamiento del diálogo de confirmación

`ConfirmDialog` es compartido por desactivación y restauración. Recibe título, descripción, etiqueta de confirmación, estado pendiente, callbacks y variante semántica.

Su comportamiento es:

- se representa como `role=alertdialog` y `aria-modal=true`;
- enlaza título y descripción con `aria-labelledby` y `aria-describedby`;
- al montarse, guarda el elemento que tenía foco y enfoca «Cancelar»;
- limita la navegación con `Tab` y `Shift+Tab` a los elementos enfocables del diálogo;
- `Escape` cancela cuando no existe operación pendiente;
- un clic en el fondo cancela cuando no existe operación pendiente;
- durante una operación pendiente, deshabilita cancelar y confirmar;
- al desmontarse, devuelve el foco al elemento previamente activo;
- aplica rojo e icono de alerta para peligro;
- aplica verde e icono de restauración para éxito.

## 19. Modelo de datos del frontend

### 19.1. Identidad autenticada: `UserAuthResponse`

| Campo | Tipo | Significado en el frontend |
|---|---|---|
| `id` | `string` | Identificador de la cuenta autenticada |
| `email` | `string` | Correo de la cuenta autenticada |
| `name` | `string` | Nombre presentado en inicio y encabezado |
| `role` | `PROFESIONAL_ROL \| USER_ROL` | Rol recibido; el store exige el valor administrativo para autenticar |

### 19.2. Respuesta de login: `LoginResponse`

Contiene los cuatro campos de `UserAuthResponse` y:

| Campo | Tipo | Uso |
|---|---|---|
| `token` | `string` | Credencial persistida después de un login administrativo correcto |

### 19.3. Respuesta de revalidación: `CheckAuthResponse`

Tiene la misma estructura que `LoginResponse`. Su `token` reemplaza al token persistido antes de que el store termine de actualizar la sesión.

### 19.4. Cuenta gestionada: `UserResponse`

| Campo | Tipo | Uso en el frontend |
|---|---|---|
| `id` | `string` | Rutas, claves de lista, edición y acciones de ciclo de vida |
| `email` | `string` | Visualización, edición y reconocimiento de propia cuenta en las restricciones de edición |
| `name` | `string` | Visualización, avatar, formularios y mensajes |
| `password` | `string` | Parte declarada del contrato TypeScript; el formulario no precarga este valor |
| `emailVerified` | `boolean` | Badge, filtro indirecto y campo editable |
| `role` | `PROFESIONAL_ROL \| USER_ROL` | Badge, filtro y campo editable |
| `isActive` | `boolean` | Badge y habilitación de desactivar/restaurar |

### 19.5. Entrada de creación: `NewUser`

| Campo | Tipo |
|---|---|
| `email` | `string` |
| `name` | `string` |
| `password` | `string` |
| `emailVerified` | `boolean` |
| `role` | `PROFESIONAL_ROL \| USER_ROL` |

El estado `isActive` y el `id` no forman parte del cuerpo que el frontend construye para el alta.

### 19.6. Respuesta paginada: `UsersResponse`

| Campo | Tipo | Relación |
|---|---|---|
| `results` | `UserResponse[]` | Agrega cero o más cuentas |
| `totalPages` | `number` | Controla la paginación |
| `page` | `number` | Página reportada por la API |
| `limit` | `number` | Tamaño de página reportado por la API |

### 19.7. Parámetros de listado: `GetAllUsersByPageParams`

Todos los campos son opcionales en la interfaz TypeScript:

- `page?: number`;
- `limit?: number`;
- `query?: string`;
- `rol?: string`;
- `state?: string`;
- `emailVerify?: string`.

`useGetUsers` construye la instancia efectiva y siempre incorpora `page` y `limit`.

### 19.8. Valores del formulario: `UserFormValues`

Agrupa los campos compartidos por creación y edición:

- `email`;
- `emailVerified`;
- `name`;
- `password`;
- `role`.

Los adaptadores `UserCreateForm` y `UserEditForm` convierten estos valores al payload correspondiente a cada operación.

### 19.9. Relaciones del modelo

| Origen | Relación | Destino |
|---|---|---|
| `AuthState` | Contiene cero o uno | `UserAuthResponse` |
| `LoginResponse` | Extiende conceptualmente con token | `UserAuthResponse` |
| `CheckAuthResponse` | Extiende conceptualmente con token | `UserAuthResponse` |
| `UsersResponse` | Agrega cero o más | `UserResponse` |
| `NewUser` | Representa datos de alta de | `UserResponse` |
| `UserFormValues` | Se adapta a | `NewUser` o `Partial<UserResponse>` |

### 19.10. Esquema general exportado

El archivo de validadores también exporta `userSchema`. Este esquema general declara `id` e `isActive` como opcionales, `password` como opcional con longitud de 6 a 20 cuando está presente, y mantiene las reglas de nombre, rol, correo y `emailVerified`. Los formularios en ejecución seleccionan explícitamente `createUserSchema` o `editUserSchema` según su modo.

## 20. Contrato HTTP consumido

### 20.1. Configuración del cliente

La instancia `mindsaveAPI` se crea con:

```text
baseURL = VITE_API_URL + "/admin"
Content-Type = application/json
```

Antes de cada solicitud, el interceptor lee `localStorage.getItem('token')`. Si obtiene un valor, agrega:

```http
Authorization: Bearer <token>
```

### 20.2. Operaciones de autenticación

| Función | Método y ruta relativa | Cuerpo | Respuesta tipada |
|---|---|---|---|
| `loginAction` | `POST /auth/login` | `{ email, password }` | `LoginResponse` |
| `checkAuthAction` | `GET /auth/check-status` | Sin cuerpo | `CheckAuthResponse` |

### 20.3. Operaciones de usuarios

| Función | Método y ruta relativa | Entrada | Resultado usado |
|---|---|---|---|
| `getAllUsersByPageAction` | `GET /user` | Query params | `UsersResponse` |
| `getUserByIdAction` | `GET /user/:id` | `id` en ruta | `UserResponse` |
| `createUserAction` | `POST /user` | `email`, `password`, `name`, `emailVerified`, `role` | `UserResponse` |
| `editUserAction` | `PUT /user/:id` | `email`, `password` si está definido, `name`, `emailVerified`, `role` | Devuelve localmente el `id` después de respuesta correcta |
| `deleteUserAction` | `DELETE /user/:id` | `id` en ruta | No consume cuerpo de respuesta |
| `restoreUserAction` | `PUT /user/restore-user/:id` | `id` en ruta, sin cuerpo explícito | No consume cuerpo de respuesta |

Todas las rutas de la tabla se resuelven bajo el prefijo `/admin` agregado por el cliente.

### 20.4. Parámetros de `GET /user`

| Parámetro | Tipo enviado | Valores producidos por el frontend |
|---|---|---|
| `page` | Número | Entero positivo |
| `limit` | Número | Entero de 1 a 100 |
| `query` | Cadena | Texto no vacío de hasta 100 caracteres |
| `rol` | Cadena | `PROFESIONAL_ROL` o `USER_ROL` |
| `state` | Cadena | `active` o `inactive` |
| `emailVerify` | Cadena | `verify` o `unverify` |

### 20.5. Normalización común de errores

Las actions, salvo el tratamiento específico de `checkAuthAction`, utilizan `handleError`.

Para un error de Axios, el mensaje se selecciona en este orden:

1. `response.data.error`;
2. `response.data.message`;
3. `error.message`;
4. mensaje predeterminado entregado por la action.

Si el mensaje es un arreglo, sus elementos se unen con coma. Si es una cadena, se utiliza directamente. Cualquier otro valor se serializa con `JSON.stringify`. Después se lanza un nuevo `Error` que conserva el error original como `cause`.

Para un error no Axios, `handleError` usa el mensaje del objeto `Error` o el texto predeterminado y también conserva la causa.

`checkAuthAction` distingue:

- `401/403`: elimina token y lanza «Token expired or not valid»;
- otros errores Axios: usa el mensaje de la respuesta, de Axios o «Error de conexión con el servidor»;
- otros errores: vuelve a lanzarlos.

## 21. Estado, caché y sincronización

### 21.1. Estado local global

Zustand se utiliza exclusivamente para la sesión. El store no persiste automáticamente su estructura; la única persistencia explícita es el token de `localStorage`.

### 21.2. Estado remoto

TanStack Query gestiona:

- comprobación de sesión;
- listado de usuarios;
- detalle de usuario;
- mutaciones de creación, edición, desactivación y restauración.

La aplicación usa una instancia única de `QueryClient`, exportada desde `src/lib/queryClient.ts` y proporcionada en la raíz.

### 21.3. Claves de consulta

| Dato | Query key |
|---|---|
| Sesión | `['auth']` |
| Listado | `['users', { page, limit, query, rol, state, emailVerify }]` |
| Detalle | `['user', { id }]` |

### 21.4. Invalidaciones

| Mutación | Queries invalidadas |
|---|---|
| Crear usuario | Todas las que comienzan por `['users']` |
| Editar usuario | `['users']` y `['user', { id }]` |
| Desactivar usuario | `['users']` y `['user', { id: userId }]` |
| Restaurar usuario | `['users']` y `['user', { id: userId }]` |

Un login administrativo correcto, un error de login y un logout limpian la caché completa en los puntos definidos por el store. Un rechazo global `401/403` también la limpia al ejecutar `logout`.

### 21.5. Estado de URL

La URL es la fuente de estado para:

- página;
- límite;
- búsqueda;
- rol;
- actividad;
- verificación de correo.

Los componentes modifican una copia de los parámetros actuales, por lo que los parámetros no afectados permanecen en la URL. La normalización que determina la consulta efectiva ocurre dentro de `useGetUsers`.

## 22. Arquitectura de implementación

### 22.1. Estilo arquitectónico del frontend

La aplicación es una SPA organizada por funcionalidades. Sus capas operativas son:

1. **Arranque y proveedores:** montaje React, Query Client, comprobación de sesión, toaster y router.
2. **Enrutamiento y guardas:** definición de páginas públicas/privadas y redirecciones.
3. **Páginas:** composición de cada vista y coordinación de navegación y mensajes.
4. **Componentes de funcionalidad:** formularios, listado, búsqueda, filtros, paginación y acciones.
5. **Hooks:** coordinación de URL, queries, mutaciones e invalidaciones.
6. **Actions:** llamadas HTTP tipadas.
7. **Cliente API:** base URL, token, interceptores y normalización de errores.
8. **Estado global:** sesión de Zustand.
9. **Contratos:** interfaces TypeScript y esquemas Zod.
10. **Presentación compartida:** estados de carga/error, diálogo, marca y primitivas UI.

### 22.2. Flujo de dependencias

```text
Interacción del administrador
        ↓
Página o componente
        ↓
Hook / Auth Store
        ↓
Action HTTP
        ↓
mindsaveAPI (Axios + interceptores)
        ↓
API administrativa de MindSave
```

Para datos remotos, TanStack Query envuelve el paso entre el hook y la action, almacena el resultado y coordina invalidaciones. Para autenticación, Zustand coordina las actions, el usuario en memoria, el token y el estado consumido por las guardas.

### 22.3. Composición en tiempo de ejecución

La jerarquía principal es:

```text
React.StrictMode
└── App
    └── QueryClientProvider
        ├── Toaster
        ├── CheckAuthProvider
        │   └── AppRouter / RouterProvider
        └── ReactQueryDevtools
```

En rutas privadas:

```text
AuthenticatedRoute
└── UsersLayout
    ├── CustomHeader
    └── Outlet
        ├── HomePage
        ├── UsersPage
        ├── UserPage
        └── NewUserPage
```

### 22.4. Responsabilidades por módulo

| Módulo | Responsabilidad |
|---|---|
| `src/main.tsx` | Montar React en `#root` dentro de `StrictMode` |
| `src/App.tsx` | Instalar proveedores, revalidar sesión, montar toaster, router y devtools |
| `src/router/app.router.tsx` | Declarar árbol de rutas, lazy loading y fallbacks |
| `src/components/routes/ProtectedRoutes.tsx` | Permitir o redirigir según `authStatus` |
| `src/api/mindsave.backend.ts` | Configurar Axios, token, rechazo de autorización y errores |
| `src/auth/actions` | Ejecutar login y comprobación de sesión |
| `src/auth/store` | Mantener la máquina de estados de autenticación |
| `src/auth/pages` | Presentar y coordinar el formulario de login |
| `src/users/pages` | Componer inicio, listado, alta y edición |
| `src/users/hooks` | Coordinar queries, mutaciones, URL e invalidaciones |
| `src/users/actions` | Implementar operaciones HTTP de cuentas |
| `src/users/components` | Implementar UI y comportamiento de gestión |
| `src/users/interfaces` | Definir DTO de cuentas y respuestas |
| `src/users/validators` | Definir reglas Zod de alta y edición |
| `src/users/utils` | Generar el modelo del paginador |
| `src/components/shared` | Implementar marca, diálogo y páginas de estado |
| `src/components/ui` | Proveer primitivas estilizadas |
| `src/index.css` | Definir tokens, tema, tipografía, utilidades y animaciones |
| `src/lib/queryClient.ts` | Exportar la única instancia de `QueryClient` |
| `src/lib/utils.ts` | Combinar clases con `clsx` y `tailwind-merge` |

### 22.5. Separación de responsabilidades en los flujos de usuario

| Flujo | Página | Hook/store | Action | Contrato principal |
|---|---|---|---|---|
| Login | `LoginPage` | `useAuthStore.login` | `loginAction` | `LoginResponse` |
| Revalidación | `CheckAuthProvider` | `useAuthStore.checkAuthStatus` | `checkAuthAction` | `CheckAuthResponse` |
| Listado | `UsersPage` | `useGetUsers` | `getAllUsersByPageAction` | `UsersResponse` |
| Alta | `NewUserPage` | `useCreateUser` | `createUserAction` | `NewUser`, `UserResponse` |
| Detalle/edición | `UserPage` | `useGetUserById` | `getUserByIdAction`, `editUserAction` | `UserResponse` |
| Desactivación | `DeleteUserButton` | `useMutation` local | `deleteUserAction` | `id` |
| Restauración | `RestoreUserButton` | `useMutation` local | `restoreUserAction` | `id` |

## 23. Interfaz, experiencia y accesibilidad implementadas

### 23.1. Identidad visual activa

La interfaz utiliza un tema oscuro único:

| Elemento | Implementación |
|---|---|
| Fondo | `#080f0f` con halo radial teal |
| Superficie | Tonos `#0f1e1e` y `#0a1818` |
| Color primario | Teal `#00b2b3` |
| Hover primario | Teal brillante `#00cacb` |
| Texto principal | `#d5ecec` |
| Texto secundario | `#7a9e9e` |
| Peligro | `#ef4444` |
| Éxito | `#10b981` |
| Advertencia | `#f59e0b` |
| Titulares | Lora |
| Cuerpo y controles | Inter |

El documento HTML declara `lang="es"`, favicon, viewport y el título «Mindsave Admin».

### 23.2. Primitivas visuales

- `Button` se construye sobre Base UI y ofrece variantes default, outline, secondary, ghost, destructive y link, además de varios tamaños.
- `Input` se construye sobre la primitiva de Base UI y aplica estados de foco, deshabilitado e inválido.
- `Label` asocia texto y control mediante HTML estándar.
- `Card` y sus subcomponentes proveen superficie, cabecera, contenido y pie.
- `cn` resuelve clases condicionales y conflictos de Tailwind.

### 23.3. Estados compartidos

#### `LoadingPage`

Presenta el logo, mensaje configurable, barra animada y semántica `role=status` con `aria-live=polite`.

#### `ErrorPage`

Presenta el mensaje recibido y dos acciones:

- «Reintentar», que ejecuta `window.location.reload()`;
- «Ir al inicio», que navega a `/`.

#### Estado vacío

`UserList` presenta icono, título y orientación para cambiar búsqueda o filtros cuando el arreglo está vacío.

### 23.4. Notificaciones

La raíz configura Sonner con:

- tema oscuro;
- posición superior derecha;
- colores enriquecidos;
- botón de cierre;
- máximo de cuatro toasts visibles;
- iconos específicos para éxito, error, información, advertencia y carga;
- offsets diferenciados para escritorio y móvil;
- etiqueta accesible «Notificaciones».

### 23.5. Accesibilidad

La implementación incorpora:

- etiquetas asociadas con campos y selectores;
- navegación principal identificada con `aria-label`;
- nombres accesibles en cierre de sesión, búsqueda, limpieza y paginación;
- `aria-current=page` en la página seleccionada;
- `aria-invalid` y mensajes `role=alert` en formularios;
- `role=search` en el buscador;
- `role=status` y anuncios corteses durante la carga;
- `alertdialog` modal con título y descripción asociados;
- manejo de foco, `Tab`, `Shift+Tab` y `Escape` en confirmaciones;
- estilos visibles de foco;
- iconos decorativos con `aria-hidden` en los lugares declarados;
- controles deshabilitados mientras una operación está pendiente;
- regla global `prefers-reduced-motion` que lleva el comportamiento CSS de scroll a `auto` y reduce la duración y repetición de animaciones y transiciones.

### 23.6. Adaptación responsive

- el ancho mínimo global es 320 px;
- el listado alterna tarjetas y tabla en el breakpoint `lg`;
- el encabezado presenta versiones compactas de marca y texto según ancho;
- los filtros evolucionan de una a tres columnas;
- los formularios ajustan padding y apilan acciones en móvil;
- la paginación oculta etiquetas secundarias en pantallas pequeñas;
- el toaster usa offsets específicos para móvil.

## 24. Retroalimentación por operación

| Operación | Estado pendiente | Éxito | Fallo o rechazo |
|---|---|---|---|
| Comprobar sesión | Página «Comprobando tu sesión» en carga inicial | Acceso a la ruta resuelta | La guarda conduce al estado no autenticado cuando corresponde |
| Login | Inputs deshabilitados; «Ingresando…» | «Sesión iniciada» | «Acceso no autorizado» o «No pudimos iniciar sesión» |
| Logout | No aplica | «Sesión cerrada» | No aplica |
| Listado | «Cargando usuarios» | Tabla, tarjetas o estado vacío | `ErrorPage` |
| Detalle | «Cargando los datos del usuario» | Formulario precargado | `ErrorPage` |
| Crear | Formulario deshabilitado; «Creando…» | «Usuario creado» | «No pudimos crear el usuario» |
| Editar | Formulario deshabilitado; «Guardando…» | «Cambios guardados» | «No pudimos editar el usuario» |
| Desactivar | «Eliminando…» y diálogo «Procesando…» | «Usuario desactivado» | «No pudimos desactivar el usuario» |
| Restaurar | «Restaurando…» y diálogo «Procesando…» | «Usuario restaurado» | «No pudimos restaurar el usuario» |
| Autoedición de rol | No inicia mutación | No aplica | «No puedes cambiar tu rol» |
| Autoedición de verificación | No inicia mutación | No aplica | «No puedes desverificar tu correo» |

## 25. Tecnología y configuración

### 25.1. Stack declarado

| Área | Tecnología |
|---|---|
| UI | React 19 |
| Lenguaje | TypeScript 6 |
| Desarrollo y build | Vite 8 |
| Compilación React | React Compiler mediante preset de Babel/Rolldown |
| Enrutamiento | React Router 8, importado desde `react-router` |
| Estado remoto | TanStack Query 5 |
| Estado global | Zustand 5 |
| HTTP | Axios |
| Formularios | React Hook Form |
| Validación | Zod 4 y `@hookform/resolvers` |
| Notificaciones | Sonner |
| Iconos | Lucide React |
| Primitivas | Base UI y componentes shadcn estilo `base-nova` |
| Estilos | Tailwind CSS 4, `tw-animate-css` y tokens CSS |
| Pruebas | Vitest con entorno `jsdom`; Testing Library disponible |

### 25.2. Alias y TypeScript

El alias `@/*` resuelve `src/*`. TypeScript se configura en modo de resolución `bundler` para la aplicación, con JSX `react-jsx`, `noEmit`, detección forzada de módulos y comprobaciones de símbolos no utilizados, parámetros no utilizados y caídas de `switch`.

### 25.3. Build y partición de dependencias

Vite integra:

- plugin React;
- preset de React Compiler por medio de Babel/Rolldown;
- plugin de Tailwind CSS.

La configuración de build clasifica dependencias de `node_modules` en chunks manuales:

| Chunk | Dependencias reconocidas por la función |
|---|---|
| `react-vendor` | React DOM, React Router y React |
| `query-vendor` | Paquetes `@tanstack` |
| `form-vendor` | Zod, React Hook Form y resolvers |
| `ui-vendor` | Lucide React y Sonner |

Las páginas y el layout también quedan sujetos a carga diferida por ruta mediante `React.lazy`.

### 25.4. Variable de entorno

La plantilla declara:

```dotenv
VITE_API_URL=http://localhost:3000
```

El valor representa la URL base previa a `/admin`. Con el ejemplo de la plantilla, Axios usa `http://localhost:3000/admin` como base efectiva.

### 25.5. Scripts

| Comando | Función |
|---|---|
| `npm ci` | Instalar las versiones resueltas por `package-lock.json` |
| `npm run dev` | Iniciar el servidor de desarrollo de Vite |
| `npm run lint` | Ejecutar ESLint sobre el proyecto |
| `npm test -- --run` | Ejecutar Vitest una vez |
| `npm run build` | Ejecutar el build de TypeScript y Vite |
| `npm run preview` | Servir localmente el artefacto construido |

### 25.6. Artefactos y ejecución

- `index.html` contiene el nodo `#root` y carga `src/main.tsx` como módulo.
- `public/favicon.png` se usa como favicon y marca visual dentro de la aplicación.
- `dist/` es la salida generada por Vite.
- `node_modules/` contiene dependencias instaladas.
- `tailwind.config.js` está vacío; el tema activo se define en `src/index.css`.
- `components.json` configura el registro shadcn con estilo `base-nova`, TSX, variables CSS e iconos Lucide.

## 26. Pruebas presentes

Vitest está configurado en `vite.config.ts` con:

- entorno `jsdom`;
- globals habilitados.

El archivo `tests/app.test.tsx` contiene una prueba de ejecución básica que afirma que `1 + 1` es `2`. La prueba actual no instancia componentes ni realiza solicitudes; su comportamiento verificable es confirmar la ejecución elemental del runner.

## 27. Insumos estructurados para casos de uso y UML

Esta sección organiza los elementos ya descritos para facilitar su transformación posterior sin agregar comportamiento distinto al código.

### 27.1. Actor y casos de uso

**Actor principal:** Administrador.

| Caso | Objetivo del actor | Dependencias funcionales |
|---|---|---|
| Iniciar sesión | Acceder al panel | Validar credenciales y rol; establecer sesión |
| Cerrar sesión | Finalizar el acceso local | Eliminar token y caché |
| Consultar inicio | Acceder a las operaciones principales | Mantener sesión autenticada |
| Listar usuarios | Ver cuentas registradas | Aplicar URL, consultar API y presentar resultados |
| Buscar usuarios | Acotar el listado por texto | Actualizar `query`; reiniciar página |
| Filtrar usuarios | Acotar por correo, rol o actividad | Actualizar filtros; reiniciar página |
| Paginar usuarios | Navegar entre páginas | Actualizar `page`; conservar demás parámetros |
| Crear usuario | Registrar una cuenta | Validar formulario; enviar alta; invalidar listado |
| Consultar detalle | Obtener datos editables | Resolver `id`; consultar API |
| Editar usuario | Actualizar una cuenta | Cargar detalle; validar; aplicar restricciones propias; invalidar caché |
| Desactivar usuario | Suspender una cuenta activa | Verificar disponibilidad; confirmar; ejecutar DELETE |
| Restaurar usuario | Recuperar una cuenta inactiva | Verificar disponibilidad; confirmar; ejecutar PUT |

### 27.2. Relaciones funcionales derivables

- «Buscar usuarios», «Filtrar usuarios» y «Paginar usuarios» operan sobre «Listar usuarios».
- «Editar usuario» utiliza previamente «Consultar detalle».
- «Crear usuario» y «Editar usuario» utilizan «Validar formulario».
- «Desactivar usuario» y «Restaurar usuario» utilizan «Confirmar acción».
- Todos los casos alojados en el layout privado dependen de una sesión con estado `authenticated`.
- Todas las actions HTTP utilizan el cliente Axios compartido.
- Todas las solicitudes del cliente compartido dependen de la configuración de `VITE_API_URL`.

### 27.3. Participantes para diagramas de secuencia

#### Inicio de sesión

```text
Administrador
→ LoginPage
→ AuthStore
→ loginAction
→ mindsaveAPI / interceptor
→ API MindSave
→ AuthStore / localStorage / QueryClient
→ Toaster
→ Router
```

Ramas presentes: rol administrativo, rol no administrativo y error de solicitud.

#### Revalidación

```text
App / CheckAuthProvider
→ React Query
→ AuthStore
→ localStorage
→ checkAuthAction
→ mindsaveAPI / interceptor
→ API MindSave
→ localStorage / AuthStore
→ Guardas
```

Ramas presentes: sin token, respuesta administrativa, respuesta con otro rol, `401/403` y error de conectividad o servidor.

#### Listado

```text
Administrador
→ UsersPage
→ useGetUsers
→ URLSearchParams
→ TanStack Query
→ getAllUsersByPageAction
→ mindsaveAPI / interceptor
→ API MindSave
→ Query Cache
→ UserList / CustomPagination
```

#### Creación

```text
Administrador
→ UserForm
→ React Hook Form / Zod
→ NewUserPage
→ useCreateUser
→ createUserAction
→ API MindSave
→ QueryClient.invalidateQueries
→ Toaster
→ Router
```

#### Edición

```text
Router(id)
→ UserPage
→ useGetUserById
→ getUserByIdAction
→ API MindSave
→ UserEditForm
→ React Hook Form / Zod
→ Restricciones de propia cuenta
→ editUserAction
→ API MindSave
→ QueryClient.invalidateQueries
→ Toaster
→ Router
```

#### Desactivación o restauración

```text
Administrador
→ DeleteUserButton / RestoreUserButton
→ ConfirmDialog
→ useMutation
→ Action correspondiente
→ API MindSave
→ QueryClient.invalidateQueries
→ Toaster
```

### 27.4. Nodos para diagramas de actividad

#### Actividad de autenticación

- iniciar aplicación;
- comprobar existencia del token;
- enviar `check-status`;
- evaluar respuesta HTTP;
- evaluar rol;
- establecer sesión autenticada o no autenticada;
- resolver la guarda de navegación.

#### Actividad de listado

- leer URL;
- normalizar página, límite, búsqueda y filtros;
- construir query key y parámetros HTTP;
- consultar usuarios;
- evaluar carga, error, vacío o resultados;
- presentar tabla/tarjetas;
- permitir búsqueda, filtrado o cambio de página.

#### Actividad de formulario

- cargar valores iniciales;
- capturar cambios;
- validar con el esquema del modo;
- en edición, adaptar contraseña vacía;
- en edición propia, evaluar rol y verificación;
- enviar mutación;
- evaluar éxito o fallo;
- invalidar caché, notificar y navegar en éxito.

#### Actividad de ciclo de cuenta

- determinar si la cuenta es propia;
- determinar si está activa;
- habilitar desactivación o restauración;
- abrir confirmación;
- cancelar o confirmar;
- bloquear controles durante la solicitud;
- ejecutar action;
- notificar resultado;
- invalidar lista y detalle en éxito.

### 27.5. Elementos para diagrama de componentes

| Componente | Interfaces o dependencias relevantes |
|---|---|
| React SPA | Router, providers y árbol de páginas |
| Router | Guardas, layout, páginas y parámetros de URL |
| Auth Feature | Store, actions, contratos y login |
| Users Feature | Páginas, hooks, actions, componentes, interfaces y validadores |
| Zustand Auth Store | Sesión, `localStorage`, Query Client y auth actions |
| TanStack Query | Query functions, cache e invalidaciones |
| Axios API Client | `VITE_API_URL`, `localStorage`, interceptores y API externa |
| UI compartida | Primitivas, marca, carga, error y diálogo |
| Sonner | Eventos de éxito, fallo y rechazo local |
| API administrativa | Endpoints `/admin/auth/*` y `/admin/user/*` consumidos |

### 27.6. Elementos para diagrama estático

Los elementos de datos son:

- `AuthState`;
- `UserAuthResponse`;
- `LoginResponse`;
- `CheckAuthResponse`;
- `UserResponse`;
- `UsersResponse`;
- `NewUser`;
- `UserFormValues`;
- `GetAllUsersByPageParams`;
- `PaginationItem`.

Los elementos con comportamiento son:

- `AuthStore` con `login`, `logout` y `checkAuthStatus`;
- `mindsaveAPI` con interceptores de solicitud y respuesta;
- actions de autenticación;
- actions de usuarios;
- hooks de consulta y mutación;
- componentes de página y de interacción.

### 27.7. Máquina de estados de cuenta

La interfaz representa dos estados:

```text
Activa --confirmar desactivación / DELETE--> Inactiva
Inactiva --confirmar restauración / PUT----> Activa
```

Para la cuenta del administrador autenticado, las dos acciones se presentan como protegidas y permanecen deshabilitadas.

## 28. Trazabilidad entre funcionalidad y código

| Funcionalidad o área | Archivos principales |
|---|---|
| Arranque de la SPA | `src/main.tsx`, `src/App.tsx` |
| Router y carga diferida | `src/router/app.router.tsx` |
| Guardas | `src/components/routes/ProtectedRoutes.tsx` |
| Cliente HTTP y errores | `src/api/mindsave.backend.ts` |
| Query Client | `src/lib/queryClient.ts` |
| Autenticación HTTP | `src/auth/actions/login.action.ts`, `src/auth/actions/check-auth.action.ts` |
| Estado de sesión | `src/auth/store/auth.store.ts` |
| Login | `src/auth/pages/LoginPage.tsx` |
| Contratos de autenticación | `src/auth/interfaces/*` |
| Layout y navegación privada | `src/users/layout/UsersLayout.tsx`, `src/users/components/CustomHeader.tsx` |
| Inicio | `src/users/pages/HomePage.tsx` |
| Listado | `src/users/pages/UsersPage.tsx`, `src/users/components/UserList.tsx` |
| Búsqueda | `src/users/components/SearchBar.tsx` |
| Filtros | `src/users/components/UserFilters.tsx` |
| Paginación | `src/users/components/CustomPagination.tsx`, `src/users/utils/pagination.ts` |
| Alta | `src/users/pages/NewUserPage.tsx`, `src/users/components/UserCreateForm.tsx`, `src/users/hooks/useCreateUser.ts` |
| Detalle y edición | `src/users/pages/UserPage.tsx`, `src/users/components/UserEditForm.tsx`, `src/users/hooks/useGetUserById.ts` |
| Formulario común | `src/users/components/UserForm.tsx` |
| Validación | `src/users/validators/userValidator.ts` |
| Consulta de listado | `src/users/hooks/useGetUsers.ts`, `src/users/actions/getAllUserByPage.action.ts` |
| Actions de cuentas | `src/users/actions/*` |
| Contratos de cuentas | `src/users/interfaces/*` |
| Desactivación | `src/users/components/DeleteUserButton.tsx`, `src/users/actions/deleteUser.action.ts` |
| Restauración | `src/users/components/RestoreUserButton.tsx`, `src/users/actions/restoreUser.action.ts` |
| Confirmación | `src/components/shared/ConfirmDialog.tsx` |
| Carga, error y marca | `src/components/shared/*` |
| Primitivas | `src/components/ui/*` |
| Tema y estilos | `src/index.css`, `skills/DESIGN_SYSTEM.md` |
| Configuración de build | `vite.config.ts`, `tsconfig*.json`, `package.json` |
| Configuración shadcn | `components.json` |
| Prueba presente | `tests/app.test.tsx` |

## 29. Límite documental del repositorio

Los siguientes aspectos pertenecen a la API o a su persistencia y no están definidos por el código de este repositorio:

- estructura de base de datos;
- algoritmo de autenticación y emisión del token;
- reglas internas de expiración o revocación;
- algoritmo concreto de coincidencia de `query`;
- ordenamiento aplicado al listado;
- transformación persistente realizada por `DELETE /user/:id`;
- generación del `id` y del estado activo inicial;
- reglas servidor adicionales sobre correo, contraseña, roles o verificación;
- formato completo de todas las respuestas de error;
- auditoría de operaciones administrativas.

Esta especificación representa esos elementos únicamente mediante los contratos que el frontend consume o produce.

## 30. Glosario

| Término | Significado dentro de MindSave Admin |
|---|---|
| Administrador | Cuenta cuya sesión aceptada contiene `PROFESIONAL_ROL` |
| Cuenta gestionada | Usuario mostrado y mantenido desde el panel |
| Desactivar | Operación presentada por la UI al ejecutar `DELETE /user/:id` |
| Restaurar | Operación que ejecuta `PUT /user/restore-user/:id` sobre una cuenta inactiva |
| Sesión | Combinación de `user`, `token` y `authStatus` mantenida por Zustand |
| Action | Función que encapsula una llamada HTTP |
| Hook | Función React que coordina queries, mutaciones o estado de URL |
| Query key | Identificador estructurado de un dato remoto en TanStack Query |
| Invalidación | Marcación de queries para actualización después de una mutación |
| Guarda | Componente que permite contenido o redirige según `authStatus` |
| Estado de URL | Búsqueda, filtros, límite y página expresados como query parameters |
| Payload | Objeto enviado como cuerpo o parámetros de una solicitud |
| AS-IS | Comportamiento implementado actualmente, sin proyección futura |
