# Especificación funcional y técnica de MindSave Admin

## 1. Identificación del documento

| Campo | Valor |
|---|---|
| Sistema | MindSave Admin |
| Tipo de sistema | Aplicación web de página única (SPA) ejecutada en navegador |
| Repositorio analizado | mindsave-admin |
| Fecha de análisis | 25 de agosto de 2026 |
| Alcance | Todo el código fuente, configuración, estilos, contratos TypeScript y pruebas presentes en este repositorio |
| Propósito | Servir como fuente verificable para casos de uso extendidos, diagramas UML y documentación de arquitectura |

## 2. Propósito y criterio de lectura

Este documento describe qué funcionalidades ofrece el frontend administrativo de MindSave y cómo están implementadas. No documenta un sistema backend completo porque dicho backend no forma parte del repositorio. En particular:

- las rutas HTTP, cuerpos y respuestas se describen únicamente según lo que consume o envía este cliente;
- no se presuponen tablas de base de datos, algoritmos del servidor, códigos HTTP específicos ni reglas de autorización internas del backend;
- cuando la interfaz interpreta un borrado como desactivación lógica, se identifica expresamente como una interpretación del cliente;
- las diferencias entre las reglas declaradas del proyecto y el comportamiento efectivo del código se registran como brechas.

La palabra “usuario” tiene dos significados en el sistema:

1. **Administrador autenticado:** persona que opera el panel.
2. **Cuenta gestionada:** registro que el administrador consulta o modifica. Puede tener rol de administrador o de usuario común.

## 3. Definición concreta del sistema

MindSave Admin es un cliente web en español que permite:

- autenticar a un operador mediante correo y contraseña;
- mantener y revalidar una sesión basada en token Bearer;
- restringir las rutas del panel según el estado local de autenticación;
- mostrar una pantalla de inicio para el administrador autenticado;
- consultar una lista paginada de cuentas;
- buscar cuentas por nombre o correo;
- filtrar cuentas por rol, estado activo y verificación de correo;
- crear cuentas;
- consultar el detalle de una cuenta para editarla;
- editar nombre, rol, correo, contraseña y estado de verificación de correo;
- desactivar una cuenta, previa confirmación;
- restaurar una cuenta, previa confirmación;
- impedir desde la interfaz que el administrador desactive o restaure su propia cuenta;
- comunicar cargas, errores, operaciones pendientes y resultados mediante páginas de estado, diálogos y notificaciones.

El repositorio solo contiene el frontend. Toda persistencia de usuarios, comprobación de credenciales, emisión de tokens y aplicación definitiva de cambios depende de una API externa cuya URL base se configura mediante la variable de entorno **VITE_API_URL**.

## 4. Actores y sistemas externos

### 4.1. Actor humano

#### Administrador

Es el único actor humano directo. Inicia sesión, navega por el panel y gestiona cuentas. La interfaz traduce el rol literal **PROFESIONAL_ROL** como “Administrador”.

La intención de negocio del proyecto es permitir acceso administrativo exclusivamente a ese rol. La comprobación se realiza durante el login, pero no durante la revalidación de una sesión existente; esta diferencia se detalla en la sección de brechas.

#### Usuario común

Una cuenta con rol **USER_ROL** no tiene un flujo propio dentro de esta aplicación. Puede aparecer como entidad gestionada y puede ser creada o editada por un administrador. Si intenta iniciar sesión directamente, el frontend rechaza el acceso aunque la API haya validado sus credenciales.

### 4.2. Sistemas colaboradores

| Colaborador | Responsabilidad observada |
|---|---|
| API administrativa de MindSave | Autenticar, validar/renovar sesiones y ejecutar operaciones CRUD/lifecycle sobre cuentas |
| Navegador | Ejecutar la SPA, mantener la URL y almacenar el token en localStorage |
| Google Fonts | Proveer Lora e Inter mediante recursos remotos |
| React Query Devtools | Facilitar inspección de caché en ejecución; se monta incluso en la aplicación construida |

## 5. Catálogo de funcionalidades

| ID | Funcionalidad | Ruta visible | Operación principal | Resultado |
|---|---|---|---|---|
| F-01 | Comprobar sesión al iniciar | Todas | GET /auth/check-status | Establece sesión autenticada o no autenticada |
| F-02 | Iniciar sesión | /login | POST /auth/login | Guarda token y abre el panel si el rol es admitido |
| F-03 | Cerrar sesión | Rutas privadas | Operación local | Elimina token y bloquea las rutas privadas |
| F-04 | Consultar inicio administrativo | / | Sin HTTP propio | Presenta accesos a gestión y creación |
| F-05 | Listar usuarios | /users | GET /user | Presenta tabla o tarjetas según el viewport |
| F-06 | Buscar usuarios | /users?query=... | GET /user con query | Reduce el listado según criterio enviado al backend |
| F-07 | Filtrar usuarios | /users con parámetros | GET /user con filtros | Filtra por correo, rol y estado |
| F-08 | Paginar usuarios | /users?page=... | GET /user con page y limit | Cambia la página conservando el resto de la URL |
| F-09 | Crear usuario | /new-user | POST /user | Registra una cuenta y vuelve al listado |
| F-10 | Cargar detalle | /users/:id | GET /user/:id | Obtiene valores iniciales del formulario de edición |
| F-11 | Editar usuario | /users/:id | PUT /user/:id | Actualiza la cuenta y vuelve al listado |
| F-12 | Desactivar usuario | /users | DELETE /user/:id | Marca la cuenta como no disponible según la semántica de la UI |
| F-13 | Restaurar usuario | /users | PUT /user/restore-user/:id | Recupera el acceso de una cuenta inactiva |

## 6. Reglas funcionales y de negocio observadas

| ID | Regla | Implementación |
|---|---|---|
| RN-01 | El rol administrativo reconocido es exactamente PROFESIONAL_ROL. | Unión literal de TypeScript y comparación en auth.store.ts |
| RN-02 | El otro rol reconocido es exactamente USER_ROL. | Contratos de autenticación y usuario |
| RN-03 | El token se conserva con la clave exacta token en localStorage. | auth.store.ts y check-auth.action.ts |
| RN-04 | Toda solicitud realizada con mindsaveAPI incorpora Authorization: Bearer TOKEN si existe token. | Interceptor de Axios |
| RN-05 | La URL efectiva de la API es VITE_API_URL seguida de /admin. | mindsave.backend.ts |
| RN-06 | Una respuesta correcta de check-status reemplaza el token almacenado por el token renovado. | checkAuthAction |
| RN-07 | Un fallo de check-status elimina el token y deja la sesión como no autenticada. | checkAuthAction y auth.store.ts |
| RN-08 | El login solo completa la sesión si la respuesta tiene rol PROFESIONAL_ROL. | Método login del store |
| RN-09 | Las rutas /, /users, /users/:id y /new-user exigen estado authenticated. | AuthenticatedRoute |
| RN-10 | /login solo se muestra en estado not-authenticated. | NotAuthenticatedRoute |
| RN-11 | El administrador no puede desactivar ni restaurar su propia cuenta desde el listado. | Comparación entre ID autenticado e ID de la fila |
| RN-12 | Desactivar y restaurar requieren confirmación explícita. | ConfirmDialog |
| RN-13 | Una contraseña vacía durante la edición significa conservar la contraseña actual. | UserEditForm elimina password del payload |
| RN-14 | Cambiar búsqueda o filtros reinicia page a 1. | SearchBar y UserFilters |
| RN-15 | Los cambios de búsqueda, filtros y paginación preservan parámetros de URL no relacionados. | Copia mediante new URLSearchParams(previous) |
| RN-16 | Una creación o edición exitosa vuelve a /users. | NewUserPage y UserPage |
| RN-17 | Las acciones visibles bloquean sus controles mientras la mutación está pendiente. | isPending en formularios, botones y diálogo |
| RN-18 | El listado vacío no se trata como error. | UserList muestra un estado vacío específico |
| RN-19 | Los valores de filtro enviados al backend son literales predeterminados. | rol, state y emailVerify en UserFilters |

### 6.1. Literales de filtros

| Parámetro | Significado visual | Valor enviado |
|---|---|---|
| rol | Administrador | PROFESIONAL_ROL |
| rol | Usuario | USER_ROL |
| state | Activos | active |
| state | Inactivos | inactive |
| emailVerify | Verificado | verify |
| emailVerify | No verificado | unverify |

## 7. Casos de uso detallados

### CU-01. Inicializar y revalidar la sesión

**Actor principal:** navegador.

**Colaboradores:** store de autenticación, TanStack Query y API MindSave.

**Disparador:** montaje de la aplicación o refetch programado de la query de autenticación.

**Precondiciones:** la SPA fue cargada.

**Flujo principal:**

1. App crea un único QueryClient a nivel de módulo.
2. CheckAuthProvider ejecuta una query con clave **["auth"]**.
3. El store llama a checkAuthAction.
4. La action busca la clave **token** en localStorage.
5. El interceptor añade el token como Bearer a GET /auth/check-status.
6. La API devuelve id, email, name, role y un token.
7. La action reemplaza el token de localStorage por el token de la respuesta.
8. El store construye el usuario autenticado sin incluir el token dentro del objeto user.
9. El store establece authStatus en authenticated.
10. El router puede mostrar la ruta solicitada.

**Alternativa A — no existe token:**

1. checkAuthAction lanza “No token found”.
2. El store captura el fallo.
3. user y token pasan a null.
4. authStatus pasa a not-authenticated.
5. Una ruta privada redirige a /login.

**Alternativa B — token rechazado o error de red:**

1. checkAuthAction elimina la clave token.
2. Lanza el error genérico “Token expired or not valid”, conservando el error original como causa.
3. El store deja la sesión como no autenticada.

**Frecuencia de revalidación:**

- al montar la aplicación;
- cada 1,5 horas mediante refetchInterval;
- al recuperar el foco de la ventana mediante refetchOnWindowFocus;
- sin reintento automático de la query.

**Estado visible:** mientras la consulta inicial carga, se presenta LoadingPage con el mensaje “Comprobando tu sesión”.

Las revalidaciones posteriores son de fondo: CheckAuthProvider observa isLoading, no isFetching, por lo que no reemplaza la vista completa mientras se renueva una sesión ya consultada. Además, checkAuthStatus captura sus propios fallos y devuelve false; para React Query ese resultado es una resolución correcta, no un estado isError.

**Postcondición de éxito:** token renovado y sesión local autenticada.

**Observación crítica:** este flujo no verifica que role sea PROFESIONAL_ROL.

### CU-02. Iniciar sesión

**Actor principal:** administrador.

**Ruta:** /login.

**Precondiciones:** authStatus es not-authenticated; si ya es authenticated, la ruta redirige a /.

**Entradas:** email y password, ambos obligatorios mediante validación HTML nativa.

**Flujo principal:**

1. El administrador completa correo y contraseña.
2. El formulario deshabilita sus inputs y botón al comenzar el envío.
3. LoginPage obtiene valores mediante FormData.
4. El store ejecuta loginAction(email, password).
5. La action envía POST /auth/login con ambos campos.
6. El store verifica que role sea exactamente PROFESIONAL_ROL.
7. El token devuelto se guarda en localStorage.
8. Se guarda user con id, email, name y role.
9. authStatus cambia a authenticated.
10. Se muestra el toast “Sesión iniciada”.
11. La navegación cambia a /.

**Alternativa A — credenciales válidas pero rol no administrativo:**

1. El store devuelve false.
2. No guarda el token recibido ni actualiza la sesión.
3. LoginPage muestra “Acceso no autorizado”.
4. El usuario permanece en /login.

**Alternativa B — error HTTP o de transporte:**

1. handleError normaliza el mensaje.
2. El store elimina cualquier token local y establece not-authenticated.
3. El error se propaga a LoginPage.
4. Se muestra el toast “No pudimos iniciar sesión”.

**Postcondición de éxito:** sesión autenticada y token disponible para solicitudes posteriores.

**Protección contra doble envío:** isPosting deshabilita controles hasta finalizar.

### CU-03. Cerrar sesión

**Actor principal:** administrador autenticado.

**Disparador:** botón “Cerrar sesión” del encabezado.

**Flujo:**

1. El store elimina token de localStorage.
2. user y token pasan a null.
3. authStatus pasa a not-authenticated.
4. Se muestra el toast “Sesión cerrada”.
5. Al reevaluarse la guarda de la ruta privada, el router redirige a /login.

**Comunicación externa:** ninguna. El frontend no invoca un endpoint de cierre o revocación.

**Postcondición:** el navegador ya no conserva la credencial local.

### CU-04. Consultar la pantalla de inicio

**Actor principal:** administrador autenticado.

**Ruta:** /.

**Flujo:**

1. HomePage obtiene el usuario del store.
2. Calcula “Buenos días”, “Buenas tardes” o “Buenas noches” con la hora local del navegador.
3. Presenta el nombre del usuario; usa “Administrador” como respaldo si no existe.
4. Ofrece acceso a “Gestionar usuarios” y “Crear usuario”.

**Comunicación externa:** no realiza solicitudes propias.

### CU-05. Consultar el listado de usuarios

**Actor principal:** administrador autenticado.

**Ruta:** /users.

**Precondición:** acceso permitido por AuthenticatedRoute.

**Flujo principal:**

1. useGetUsers lee page, limit, query, rol, state y emailVerify desde la URL.
2. Convierte page y limit a número.
3. Sustituye page inválida o menor que 1 por 1.
4. Sustituye limit inválido o menor que 1 por 10.
5. Omite los filtros vacíos del objeto de parámetros HTTP.
6. Ejecuta GET /user con los parámetros efectivos.
7. Guarda el resultado bajo la clave de caché **["users", { page, limit, query, rol, state, emailVerify }]**.
8. UsersPage presenta encabezado, acción de alta, buscador, filtros, lista y paginación.
9. UserList muestra:
   - tabla desde el breakpoint lg;
   - tarjetas por debajo de lg.
10. Para cada cuenta muestra nombre, correo, rol, actividad, verificación de correo y acciones disponibles.

**Alternativa A — carga inicial:** LoadingPage muestra “Cargando usuarios”.

**Alternativa B — error:** ErrorPage presenta el mensaje normalizado, “Reintentar” mediante recarga completa e “Ir al inicio”.

**Alternativa C — lista sin resultados:** se muestra “No encontramos usuarios”, sin considerar el resultado un error.

**Datos esperados:** results, totalPages, page y limit.

### CU-06. Buscar usuarios

**Actor principal:** administrador autenticado.

**Precondición:** vista /users cargada.

**Entrada:** texto libre destinado a nombre o correo según la etiqueta de la interfaz.

**Flujo:**

1. El administrador escribe en el campo de búsqueda.
2. Envía el formulario.
3. El cliente aplica trim y transforma el texto a minúsculas.
4. Si el resultado no está vacío, escribe query en la URL; si está vacío, elimina query.
5. Establece page=1.
6. Conserva limit y los filtros existentes.
7. El cambio de clave de React Query dispara una nueva consulta de listado.

**Flujo de limpieza:**

1. El botón de limpieza aparece solo si la URL ya contiene un query no vacío.
2. Limpia el campo, elimina query, restablece page=1 y devuelve el foco al input.

**Límite del contrato:** el criterio real de coincidencia lo implementa el backend; el frontend solo rotula la función como búsqueda por nombre o correo.

### CU-07. Filtrar usuarios

**Actor principal:** administrador autenticado.

**Filtros disponibles:**

- estado del correo: todos, verify o unverify;
- rol: todos, PROFESIONAL_ROL o USER_ROL;
- estado de cuenta: todos, active o inactive.

**Flujo:**

1. El administrador cambia un selector.
2. El valor no vacío se escribe en su parámetro de URL; “Todos” elimina el parámetro.
3. page se establece en 1.
4. Se conservan query, limit y los otros filtros.
5. React Query solicita el nuevo conjunto.

**Limpieza conjunta:**

1. “Limpiar filtros” aparece cuando alguno de los tres filtros está activo.
2. El botón elimina emailVerify, rol y state.
3. Conserva query y limit.
4. Restablece page=1.

### CU-08. Paginar usuarios

**Actor principal:** administrador autenticado.

**Precondición:** totalPages es mayor que 1.

**Flujo:**

1. CustomPagination lee page desde la URL.
2. Para la presentación, limita la página al rango 1..totalPages.
3. Genera números visibles y elipsis mediante getPaginationItems.
4. Permite ir a primera, anterior, una página específica, siguiente o última.
5. Rechaza solicitudes fuera de rango o hacia la página actual.
6. Escribe el nuevo valor de page preservando los demás parámetros.
7. Desplaza la ventana al inicio con comportamiento suave.
8. El cambio de URL provoca una nueva consulta.

**Reglas visuales:**

- con una sola página no se muestra el control;
- con hasta tres páginas se muestran todas;
- con más páginas se mantienen primera, última y páginas cercanas, agregando elipsis según corresponda.

### CU-09. Crear un usuario

**Actor principal:** administrador autenticado.

**Ruta:** /new-user.

**Valores iniciales:**

- email vacío;
- name vacío;
- password vacío;
- emailVerified=false;
- role=USER_ROL.

**Flujo principal:**

1. El administrador completa el formulario compartido UserForm en modo create.
2. React Hook Form valida los datos.
3. UserCreateForm adapta UserFormValues al contrato NewUser.
4. useCreateUser ejecuta POST /user.
5. La action envía email, password, name, emailVerified y role.
6. Si la respuesta contiene el usuario creado, el hook invalida las queries cuya raíz es ["users"].
7. Se muestra “Usuario creado”.
8. La aplicación navega a /users.

**Alternativa A — validación local fallida:** se muestran mensajes bajo cada campo aplicable y no se invoca la API.

**Alternativa B — error de API:** se muestra “No pudimos crear el usuario” con el mensaje normalizado y se conserva el formulario.

**Cancelación:** los enlaces “Cancelar” y “Volver a usuarios” navegan a /users sin enviar datos.

### CU-10. Consultar y editar un usuario

**Actor principal:** administrador autenticado.

**Ruta:** /users/:id.

**Precondición:** existe un parámetro id no vacío.

**Carga de detalle:**

1. useGetUserById crea la clave **["user", { id }]**.
2. Ejecuta GET /user/:id.
3. No reintenta automáticamente.
4. Considera frescos los datos durante cinco minutos.
5. Mientras espera, muestra “Cargando los datos del usuario”.
6. Ante error o respuesta nula, muestra ErrorPage.

**Edición:**

1. UserEditForm carga email, emailVerified, name y role.
2. password comienza vacío.
3. El administrador modifica valores y envía el formulario.
4. Si password contiene únicamente una cadena vacía, UserEditForm elimina el campo del payload.
5. UserPage agrega id desde la ruta.
6. La action envía PUT /user/:id con email, password cuando corresponda, name, emailVerified y role.
7. El hook invalida ["users"] y ["user", { id }].
8. Se muestra “Cambios guardados”.
9. La aplicación navega a /users.

**Alternativa — error de mutación:** se muestra “No pudimos editar el usuario” y se permanece en la vista.

**Alcance de permisos en el cliente:** la interfaz permite editar la propia cuenta, cuentas inactivas y roles. No contiene reglas adicionales por campo.

### CU-11. Desactivar un usuario

**Actor principal:** administrador autenticado.

**Ubicación:** acción de cada fila o tarjeta del listado.

**Precondiciones locales:**

- la cuenta está activa;
- la cuenta no corresponde al administrador autenticado;
- no existe una desactivación de esa instancia en curso.

**Flujo principal:**

1. El administrador pulsa “Eliminar”.
2. Se abre un alertdialog titulado “Desactivar usuario”.
3. El diálogo explica que la cuenta podrá restaurarse.
4. El foco inicial se coloca en “Cancelar”.
5. El administrador confirma.
6. Se ejecuta DELETE /user/:id.
7. Se invalida la familia de queries ["users"].
8. Se muestra “Usuario desactivado”.
9. El diálogo se cierra.

**Cancelación:** puede realizarse con el botón, Escape o clic en el fondo mientras no haya una mutación pendiente.

**Protección de cuenta propia:** el botón se deshabilita, cambia su etiqueta a “Protegido” y presenta una ayuda mediante title.

**Semántica:** el nombre técnico de la action es deleteUserAction y usa HTTP DELETE, pero toda la UI lo interpreta como desactivación reversible. El repositorio no permite confirmar cómo persiste esa operación el backend.

**Alternativa — error de mutación:** se muestra “No pudimos desactivar el usuario”; el diálogo permanece abierto y vuelve a permitir cancelar o reintentar.

### CU-12. Restaurar un usuario

**Actor principal:** administrador autenticado.

**Ubicación:** acción de cada fila o tarjeta del listado.

**Precondiciones locales:**

- la cuenta está inactiva;
- la cuenta no corresponde al administrador autenticado;
- no existe una restauración de esa instancia en curso.

**Flujo principal:**

1. El administrador pulsa “Restaurar”.
2. Se abre un alertdialog con semántica visual de éxito.
3. El administrador confirma.
4. Se ejecuta PUT /user/restore-user/:id sin cuerpo explícito.
5. Se invalida la familia ["users"].
6. Se muestra “Usuario restaurado”.
7. El diálogo se cierra.

**Cancelación y protección propia:** siguen las mismas reglas que la desactivación.

**Alternativa — error de mutación:** se muestra “No pudimos restaurar el usuario”; el diálogo permanece abierto.

## 8. Mapa de navegación y control de acceso

| Ruta | Tipo | Componente | Guarda | Función |
|---|---|---|---|---|
| /login | Pública restringida | LoginPage | NotAuthenticatedRoute | Autenticación |
| / | Privada, índice | HomePage dentro de UsersLayout | AuthenticatedRoute | Inicio |
| /users | Privada | UsersPage dentro de UsersLayout | AuthenticatedRoute | Listado y gestión |
| /users/:id | Privada dinámica | UserPage dentro de UsersLayout | AuthenticatedRoute | Carga y edición |
| /new-user | Privada | NewUserPage dentro de UsersLayout | AuthenticatedRoute | Alta |
| Cualquier otra | Redirección | Navigate | Ninguna directa | Redirige a / |

### 8.1. Comportamiento de las guardas

| authStatus | AuthenticatedRoute | NotAuthenticatedRoute |
|---|---|---|
| checking | LoadingPage | LoadingPage |
| authenticated | Renderiza children | Redirige a / |
| not-authenticated | Redirige a /login | Renderiza children |

UsersLayout contiene el fondo global del panel, el encabezado persistente y un Outlet para la página hija.

## 9. Modelo de datos del frontend

### 9.1. Usuario autenticado

#### UserAuthResponse

| Campo | Tipo | Uso |
|---|---|---|
| id | string | Identidad del administrador y protección de su propia cuenta |
| email | string | Dato de sesión |
| name | string | Saludo y encabezado |
| role | PROFESIONAL_ROL o USER_ROL | Autorización inicial y metadato de sesión |

### 9.2. Respuestas de autenticación

LoginResponse y CheckAuthResponse tienen la misma forma:

| Campo | Tipo |
|---|---|
| id | string |
| email | string |
| name | string |
| role | PROFESIONAL_ROL o USER_ROL |
| token | string |

El store separa token del objeto user, aunque mantiene ambos en memoria.

### 9.3. Cuenta gestionada

#### UserResponse

| Campo | Tipo | Representación/uso |
|---|---|---|
| id | string | Ruta de detalle y mutaciones |
| email | string | Listado y formulario |
| name | string | Listado, avatar y formulario |
| password | string | Declarado en el contrato, no mostrado en el detalle |
| emailVerified | boolean | Badge y control de formulario |
| role | PROFESIONAL_ROL o USER_ROL | Badge, filtro y selector |
| isActive | boolean | Estado y habilitación de acciones |

El frontend modela password en la respuesta de usuario, pero no lo muestra ni lo usa para precargar la edición. Esto evita exponerlo en pantalla, aunque el campo en el contrato merece revisión con el backend.

### 9.4. Alta

#### NewUser

| Campo | Tipo | Obligatorio |
|---|---|---|
| email | string | Sí |
| name | string | Sí |
| password | string | Sí |
| emailVerified | boolean | Sí |
| role | PROFESIONAL_ROL o USER_ROL | Sí |

### 9.5. Lista paginada

#### UsersResponse

| Campo | Tipo | Significado |
|---|---|---|
| results | UserResponse[] | Cuentas de la página |
| totalPages | number | Total usado por el paginador |
| page | number | Página informada por el backend |
| limit | number | Tamaño informado por el backend |

La UI usa results y totalPages. No usa data.page ni data.limit para corregir la URL.

### 9.6. Estado de autenticación

AuthState contiene:

- user: UserAuthResponse o null;
- token: string o null;
- authStatus: authenticated, not-authenticated o checking;
- login(email, password);
- logout();
- checkAuthStatus().

## 10. Contrato HTTP consumido

### 10.1. Cliente común

- Cliente: una instancia única de Axios llamada mindsaveAPI.
- URL base: valor de VITE_API_URL concatenado con /admin.
- Content-Type: application/json.
- Autenticación: interceptor de request que consulta localStorage en cada solicitud.
- Formato de cabecera: Authorization: Bearer TOKEN.
- No existe interceptor global de respuesta.
- No existe política global para respuestas 401 o 403.

### 10.2. Operaciones

| ID | Método y ruta relativa | Entrada | Respuesta tipada | Consumidor |
|---|---|---|---|---|
| API-01 | POST /auth/login | { email, password } | LoginResponse | loginAction |
| API-02 | GET /auth/check-status | Bearer token | CheckAuthResponse | checkAuthAction |
| API-03 | GET /user | Query params opcionales | UsersResponse | getAllUsersByPageAction |
| API-04 | GET /user/:id | id en ruta | UserResponse | getUserByIdAction |
| API-05 | POST /user | NewUser | UserResponse | createUserAction |
| API-06 | PUT /user/:id | email, password opcional en la práctica, name, emailVerified, role | Sin cuerpo consumido; retorna localmente id | editUserAction |
| API-07 | DELETE /user/:id | id en ruta | Sin cuerpo consumido | deleteUserAction |
| API-08 | PUT /user/restore-user/:id | id en ruta; sin cuerpo explícito | Sin cuerpo consumido | restoreUserAction |

### 10.3. Parámetros de GET /user

| Parámetro | Tipo generado por el cliente | Valor por defecto efectivo | Condición de envío |
|---|---|---|---|
| page | number | 1 | Siempre |
| limit | number | 10 | Siempre |
| query | string | Cadena vacía | Solo si trim no está vacío |
| rol | string | Cadena vacía | Solo si no está vacío |
| state | string | Cadena vacía | Solo si no está vacío |
| emailVerify | string | Cadena vacía | Solo si no está vacío |

### 10.4. Normalización de errores

handleError aplica esta prioridad para errores Axios:

1. response.data.error;
2. response.data.message;
3. error.message;
4. mensaje predeterminado.

Si el valor seleccionado es un arreglo, une sus elementos con coma. Si es string, lo conserva. Para otra forma, usa JSON.stringify. Siempre lanza un nuevo Error y conserva el error original en cause.

Para errores no Axios, usa el mensaje del Error recibido o el mensaje predeterminado y también vuelve a lanzar.

checkAuthAction es una excepción: traduce cualquier fallo del endpoint a “Token expired or not valid” y elimina el token.

Varias actions conservan retornos de respaldo después de llamar a handleError. Como handleError retorna never y siempre lanza, esos retornos son inalcanzables en ejecución.

## 11. Arquitectura de implementación

### 11.1. Estilo

La aplicación usa una arquitectura frontend por features con capas ligeras:

1. **Arranque y composición global:** main.tsx y App.tsx.
2. **Navegación:** router y guardas.
3. **Features de dominio:** auth y users.
4. **Actions:** acceso HTTP.
5. **Hooks/store:** coordinación de estado remoto y global.
6. **Pages/layout:** orquestación de casos de uso y navegación.
7. **Components:** presentación y eventos de usuario.
8. **UI/shared:** primitivas y estados reutilizables.
9. **Infraestructura:** cliente Axios, estilos, Vite y TypeScript.

No existe una capa backend, repositorio de persistencia local, service worker ni renderizado del lado del servidor.

### 11.2. Flujo de dependencias

La dirección predominante es:

**Página o componente → hook/store → action → mindsaveAPI → API externa**

El retorno sigue:

**API externa → action tipada → React Query/store → página o componente → UI**

Las pages no invocan Axios directamente. Las actions no navegan ni muestran toasts.

### 11.3. Composición en tiempo de ejecución

1. main.tsx monta App en el elemento root dentro de React StrictMode.
2. App monta QueryClientProvider.
3. Toaster configura notificaciones oscuras, accesibles y con iconos.
4. CheckAuthProvider resuelve la sesión antes de entregar el router.
5. RouterProvider controla navegación.
6. ReactQueryDevtools queda disponible con el panel inicialmente cerrado.

### 11.4. Responsabilidades por módulo

| Módulo | Responsabilidad |
|---|---|
| src/api/mindsave.backend.ts | Cliente HTTP, token Bearer y errores |
| src/auth/actions | Operaciones HTTP de autenticación |
| src/auth/store/auth.store.ts | Estado global y transición de sesión |
| src/auth/pages/LoginPage.tsx | Captura de credenciales, feedback y navegación |
| src/components/routes/ProtectedRoutes.tsx | Control declarativo de rutas |
| src/router/app.router.tsx | Árbol de rutas |
| src/users/actions | Contrato HTTP de usuarios |
| src/users/hooks | Queries, mutaciones e invalidación de caché |
| src/users/pages | Orquestación de pantallas |
| src/users/components | Formularios, lista, filtros, paginación y acciones |
| src/components/shared | Marca, diálogo y estados de carga/error |
| src/components/ui | Primitivas estilizadas |
| src/index.css | Tokens, identidad visual, animación y estilos globales |

## 12. Estado, caché y sincronización

### 12.1. Estado global local

Zustand se usa exclusivamente para la sesión. El store no se persiste mediante middleware; al recargar, se reconstruye con check-status usando el token de localStorage.

### 12.2. Estado remoto

TanStack Query gestiona autenticación consultable y datos de usuarios.

| Recurso | Query key | Configuración especial |
|---|---|---|
| Sesión | ["auth"] | retry=false, refetch cada 1,5 horas y al enfocar |
| Lista | ["users", { page, limit, query, rol, state, emailVerify }] | Parámetros derivados de URL |
| Detalle | ["user", { id }] | retry=false, staleTime=5 minutos, enabled solo con id |

### 12.3. Invalidación por mutación

| Mutación | Caché invalidada |
|---|---|
| Crear | Todas las queries con raíz ["users"], solo si la action devuelve un usuario |
| Editar | ["users"] y ["user", { id }] |
| Desactivar | ["users"] |
| Restaurar | ["users"] |

Desactivar y restaurar no invalidan una posible query de detalle ya almacenada para ese usuario.

### 12.4. Estado de URL

La URL es la fuente de verdad para:

- page;
- limit;
- query;
- rol;
- state;
- emailVerify.

Beneficios efectivos:

- la navegación atrás/adelante conserva cambios;
- una URL puede representar una vista filtrada;
- la clave de caché coincide con la combinación visible.

Limitaciones efectivas:

- page y limit aceptan números decimales porque solo se comprueba NaN y valores menores que 1;
- la URL no se reescribe cuando se aplica un valor predeterminado a un parámetro inválido;
- useGetUsers no limita page al total de páginas antes de solicitar;
- rol, state y emailVerify se envían si no están vacíos, sin comprobar que una URL manipulada contenga uno de los literales admitidos por los selectores;
- limit tiene soporte en URL, query key y API, pero no existe un control visible para modificarlo;
- el campo de búsqueda usa defaultValue y no se resincroniza necesariamente si query cambia externamente sin remontar el componente.

## 13. Validaciones y transformación de formularios

### 13.1. Reglas activas

Las validaciones ejecutadas pertenecen a React Hook Form:

| Campo | Alta | Edición |
|---|---|---|
| name | Obligatorio, mínimo 2 y máximo 30 caracteres | Igual |
| role | Obligatorio; UI ofrece los dos roles conocidos | Igual |
| email | Obligatorio y expresión regular de correo | Igual |
| password | Entre 4 y 20 caracteres | Vacío permitido; si se informa, entre 4 y 20 |
| emailVerified | Booleano mediante checkbox | Igual |

No se aplica trim a name, email o password antes de enviar. La expresión de correo es **^[^\s@]+@[^\s@]+\.[^\s@]+$**.

La regla activa de role solo exige un valor. El selector ofrece los literales válidos, pero React Hook Form no ejecuta una validación de pertenencia al enum si el DOM o la solicitud se manipulan.

### 13.2. Adaptadores

- UserCreateForm entrega todos los valores como NewUser.
- UserEditForm construye Partial<UserResponse>.
- En edición, elimina password si su valor es la cadena vacía después de trim.
- UserPage añade id desde la ruta antes de invocar la mutación.

### 13.3. Esquema Zod no activo

src/users/validators/userValidator.ts declara un UserSchema con id opcional, email, name, password, emailVerified, role e isActive. Ningún formulario, action ni hook importa ese esquema. Por tanto:

- Zod no participa en la validación de ejecución;
- las reglas de longitud del formulario no existen en el esquema;
- el esquema exige isActive aunque el formulario no lo gestiona;
- no debe usarse el esquema como descripción del comportamiento actual.

## 14. Interfaz y experiencia de usuario

### 14.1. Identidad

La interfaz activa es exclusivamente oscura:

- fondo principal #080f0f;
- superficies profundas;
- acento teal #00b2b3;
- éxito verde, advertencia ámbar y peligro rojo;
- Lora para titulares;
- Inter para cuerpo y controles.

Aunque el documento de diseño menciona modo claro, el código no implementa selector ni tokens activos alternativos.

### 14.2. Adaptación responsive

- ancho mínimo global: 320 px;
- listado como tabla en lg y como tarjetas debajo de lg;
- encabezado compacta el logo y oculta textos según breakpoint;
- formularios ajustan padding y colocación de acciones;
- paginador oculta etiquetas secundarias en pantallas pequeñas;
- filtros cambian de una a tres columnas progresivamente.

### 14.3. Estados visibles

| Estado | Presentación |
|---|---|
| Comprobación de sesión | LoadingPage con marca y barra animada |
| Carga de usuarios | LoadingPage |
| Carga de detalle | LoadingPage |
| Error de consulta | ErrorPage con recarga e inicio |
| Lista vacía | Tarjeta “No encontramos usuarios” |
| Mutación pendiente | Controles deshabilitados y etiquetas verbales |
| Éxito/fallo de mutación | Toast de Sonner |
| Acción destructiva/restauración | ConfirmDialog |

### 14.4. Accesibilidad observada

La implementación incluye:

- idioma es en index.html;
- etiquetas asociadas a inputs y selects;
- aria-invalid y mensajes con role=alert en formularios;
- role=search en la búsqueda;
- navegación con aria-label;
- aria-current en la página activa;
- nombres accesibles para botones de paginación y cierre de sesión;
- iconos decorativos ocultos en algunos contextos;
- alertdialog con aria-modal, título y descripción enlazados;
- foco inicial en Cancelar;
- cierre con Escape;
- foco visible;
- role=status y aria-live en carga;
- reducción global de animación mediante prefers-reduced-motion.

Limitaciones:

- ConfirmDialog no implementa un focus trap completo;
- no devuelve explícitamente el foco al elemento disparador al cerrar;
- algunos iconos visibles dentro de enlaces no están marcados como decorativos, aunque el enlace ya tiene texto.

## 15. Manejo de errores y retroalimentación

### 15.1. Consultas

Los errores de listado y detalle se delegan a ErrorPage. “Reintentar” recarga toda la ventana, por lo que vuelve a ejecutar la comprobación de sesión y la consulta.

### 15.2. Mutaciones

Cada mutación presenta un toast específico:

| Acción | Éxito | Fallo |
|---|---|---|
| Login | Sesión iniciada | Acceso no autorizado o No pudimos iniciar sesión |
| Logout | Sesión cerrada | No aplica |
| Crear | Usuario creado | No pudimos crear el usuario |
| Editar | Cambios guardados | No pudimos editar el usuario |
| Desactivar | Usuario desactivado | No pudimos desactivar el usuario |
| Restaurar | Usuario restaurado | No pudimos restaurar el usuario |

### 15.3. Ausencias

- no hay Error Boundary global de React;
- no hay gestión global de expiración durante una mutación ordinaria;
- no hay reintentos personalizados para usuarios;
- no hay modo offline;
- no se conserva un borrador de formularios.

## 16. Seguridad y autorización

### 16.1. Controles implementados

- token Bearer en todas las solicitudes del cliente común;
- eliminación del token ante fallo de check-status, login fallido y logout;
- bloqueo de rutas mediante estado de sesión;
- rechazo del login para roles distintos de PROFESIONAL_ROL;
- contraseña siempre en input type=password;
- ausencia de logs de credenciales en el código;
- bloqueo visual de auto-desactivación y auto-restauración.

### 16.2. Límites de estos controles

Las guardas, los botones deshabilitados y la validación de rol son controles del cliente y no sustituyen autorización en el servidor. Un cliente modificado podría invocar los endpoints directamente. El backend debe:

- verificar token, vigencia y rol en cada operación administrativa;
- impedir por su cuenta operaciones prohibidas;
- validar todos los cuerpos y parámetros;
- decidir la semántica y autorización del cambio de rol;
- no depender de que la interfaz oculte acciones.

### 16.3. Riesgos o puntos de revisión

1. checkAuthStatus acepta cualquier role devuelto por check-status y establece authenticated.
2. El token reside en localStorage, por lo que una vulnerabilidad XSS podría exponerlo.
3. UserResponse declara password como parte de la respuesta; debería confirmarse que la API no devuelve material sensible.
4. No existe manejo global de 401/403 para limpiar inmediatamente una sesión expirada durante otras operaciones.
5. VITE_API_URL no se valida en el arranque.

## 17. Tecnología, configuración y ejecución

### 17.1. Stack

| Área | Tecnología |
|---|---|
| UI | React 19 |
| Lenguaje | TypeScript 6 |
| Build/dev server | Vite 8 |
| Router | React Router 8, importado desde react-router |
| Estado remoto | TanStack Query 5 |
| Estado global | Zustand 5 |
| HTTP | Axios |
| Formularios | React Hook Form |
| Esquemas disponibles | Zod 4, no conectado al formulario |
| Notificaciones | Sonner |
| Iconos | Lucide |
| Primitivas | Base UI y shadcn base-nova |
| Estilos | Tailwind CSS 4, tokens en src/index.css |
| Pruebas | Vitest, jsdom y Testing Library disponible |

### 17.2. Variable de entorno

La única variable declarada es:

**VITE_API_URL=http://localhost:3000**

La plantilla no incluye /admin porque el cliente lo agrega. Un valor de ejemplo produce la base final:

**http://localhost:3000/admin**

El archivo .env está ignorado por Git.

### 17.3. Scripts

| Comando | Función |
|---|---|
| npm ci | Instalar exactamente package-lock.json |
| npm run dev | Iniciar Vite |
| npm run lint | Ejecutar ESLint |
| npm test -- --run | Ejecutar Vitest una vez |
| npm run build | Comprobar TypeScript y construir producción |
| npm run preview | Servir el build local |

### 17.4. Consideraciones de despliegue

- createBrowserRouter requiere que el servidor entregue index.html para rutas como /users/:id.
- la SPA requiere acceso de red a VITE_API_URL.
- las fuentes se cargan desde Google Fonts; una política CSP o red cerrada debe contemplarlo.
- no existe configuración de despliegue, contenedor, CI/CD ni proxy en el repositorio.

## 18. Pruebas y estado verificado

### 18.1. Cobertura presente

tests/app.test.tsx solo verifica que 1 + 1 sea 2. Confirma que Vitest puede arrancar, pero no prueba:

- autenticación;
- guardas;
- actions HTTP;
- roles;
- formularios;
- filtros;
- paginación;
- caché;
- desactivación/restauración;
- componentes.

Testing Library y axios-mock-adapter están instalados, pero no se usan en la prueba actual.

### 18.2. Verificación realizada durante este análisis

| Comprobación | Resultado |
|---|---|
| npm run lint | Correcto |
| npm test -- --run | 1 archivo, 1 prueba, correcto |
| npm run build | Correcto |
| Tamaño JS construido | 536,70 kB minificado; 171,82 kB gzip |
| Advertencia de build | Chunk principal superior a 500 kB |

Estas comprobaciones demuestran consistencia estática y capacidad de build, no corrección funcional contra un backend real.

## 19. Brechas, inconsistencias y decisiones pendientes

### 19.1. Alta prioridad

#### B-01. Revalidación sin control de rol

El login exige PROFESIONAL_ROL, pero checkAuthStatus autentica cualquier rol que reciba. Un token válido de USER_ROL podría habilitar la interfaz si el backend devuelve ese rol. La regla debe ser coherente en ambos flujos y, obligatoriamente, reforzada por el backend.

#### B-02. Contrato de respuesta con password

UserResponse incluye password. Aunque la UI no lo muestra, el contrato debería confirmar que el servidor no devuelve hashes ni credenciales.

#### B-03. Ausencia de pruebas funcionales

Los flujos críticos carecen de regresión automatizada. Para documentar garantías reales de negocio se necesitan pruebas de guards, roles, token, parámetros, validaciones e invalidación.

### 19.2. Prioridad media

#### B-04. Caché de detalle después de desactivar/restaurar

Estas operaciones solo invalidan ["users"]. Un detalle previamente cacheado puede conservar isActive durante su ventana de frescura.

#### B-05. Dos fuentes potenciales de validación

Existe un esquema Zod sin uso y reglas distintas en React Hook Form. Mantener ambos puede producir divergencia si alguien comienza a usar el esquema parcialmente.

#### B-06. Parámetros numéricos parcialmente validados

Se rechazan NaN y valores menores que 1, pero no decimales. La consulta tampoco ajusta una page superior al total antes de llamar al backend.

#### B-07. Expiración fuera de check-status

No hay interceptor de respuesta ni coordinación para cerrar sesión inmediatamente ante un 401/403 de usuarios.

#### B-08. Semántica DELETE/desactivación

El frontend presenta DELETE como operación reversible. El contrato backend debe confirmar si se trata de soft delete, cambio de bandera u otra estrategia.

### 19.3. Mantenibilidad y experiencia

#### B-09. Retornos inalcanzables en actions

Las actions devuelven null o datos vacíos después de handleError, aunque handleError siempre lanza.

#### B-10. Búsqueda no totalmente sincronizada con URL externa

SearchBar usa defaultValue. Navegar entre historiales con distintos query puede cambiar la consulta sin actualizar el texto visible del input en todos los escenarios.

#### B-11. Accesibilidad modal incompleta

El diálogo tiene buena semántica inicial, pero no encierra el foco ni lo restaura al disparador.

#### B-12. Documentación de instalación obsoleta

README.md sigue siendo el texto de plantilla de Vite y no explica MindSave Admin.

#### B-13. Bundle único grande

Las páginas se importan de forma estática y el build genera un chunk JS que supera el umbral de 500 kB.

#### B-14. Fuentes redundantes

index.html carga Lora e Inter y además Outfit, Source Sans 3 e Instrument Serif. index.css vuelve a importar Lora e Inter. Las tres fuentes adicionales no forman parte del sistema visual observado.

#### B-15. Modo claro solo documental

El sistema de diseño menciona modo claro, pero la aplicación fuerza color-scheme dark y no implementa cambio de tema.

## 20. Insumos para diagramas UML

### 20.1. Diagrama de casos de uso

Actor principal:

- Administrador.

Casos:

- iniciar sesión;
- cerrar sesión;
- consultar inicio;
- listar usuarios;
- buscar usuarios;
- filtrar usuarios;
- paginar usuarios;
- crear usuario;
- consultar detalle;
- editar usuario;
- desactivar usuario;
- restaurar usuario.

Relaciones sugeridas:

- “Listar usuarios” incluye “Aplicar parámetros de URL”.
- “Buscar”, “Filtrar” y “Paginar” extienden “Listar usuarios”.
- “Editar usuario” incluye “Consultar detalle”.
- “Desactivar usuario” y “Restaurar usuario” incluyen “Confirmar acción”.
- todas las operaciones privadas incluyen “Verificar sesión”.
- “Crear” y “Editar” incluyen “Validar formulario”.

### 20.2. Diagrama de clases o modelo estático

Aunque el código usa funciones y hooks más que clases, el modelo puede representar:

#### Entidades/DTO

- UserAuthResponse;
- LoginResponse;
- CheckAuthResponse;
- UserResponse;
- NewUser;
- UsersResponse;
- GetAllUsersByPageParams;
- UserFormValues.

#### Relaciones

- LoginResponse y CheckAuthResponse contienen los datos de UserAuthResponse más token.
- UsersResponse agrega cero o más UserResponse.
- NewUser representa el subconjunto necesario para crear UserResponse.
- UserFormValues coincide con los campos editables.
- AuthState contiene cero o un UserAuthResponse y cero o un token.

#### Servicios/controladores de frontend

- AuthStore: login, logout, checkAuthStatus.
- AuthActions: loginAction, checkAuthAction.
- UserActions: getAllUsersByPageAction, getUserByIdAction, createUserAction, editUserAction, deleteUserAction, restoreUserAction.
- UserQueries: useGetUsers, useGetUserById, useCreateUser.
- MindsaveAPI: interceptor de autenticación y operaciones HTTP.

### 20.3. Diagrama de estados de sesión

Estados:

- checking;
- authenticated;
- not-authenticated.

Transiciones:

| Origen | Evento/condición | Destino |
|---|---|---|
| Inicio | Store creado | checking |
| checking | check-status correcto | authenticated |
| checking | sin token o check-status fallido | not-authenticated |
| not-authenticated | login correcto y rol admitido | authenticated |
| not-authenticated | login fallido o rol no admitido | not-authenticated |
| authenticated | logout | not-authenticated |
| authenticated | refetch check-status fallido | not-authenticated |
| authenticated | refetch check-status correcto | authenticated con token renovado |

### 20.4. Diagrama de estados de cuenta

Estados visibles:

- Activa;
- Inactiva.

Transiciones:

- Activa → Inactiva: confirmación y DELETE /user/:id.
- Inactiva → Activa: confirmación y PUT /user/restore-user/:id.

Restricción:

- si la cuenta corresponde al actor autenticado, ambas transiciones se bloquean en la interfaz.

El estado inicial al crear no está expresado en NewUser; queda a cargo del backend.

### 20.5. Diagramas de secuencia

#### Secuencia de login

1. Administrador → LoginPage: envía credenciales.
2. LoginPage → AuthStore: login(email, password).
3. AuthStore → loginAction.
4. loginAction → mindsaveAPI.
5. mindsaveAPI → Backend: POST /auth/login.
6. Backend → loginAction: LoginResponse o error.
7. AuthStore → AuthStore: valida role.
8. AuthStore → localStorage: guarda token.
9. LoginPage → Toaster: comunica éxito.
10. LoginPage → Router: navega a /.

Agregar ramas para rol no admitido y error HTTP.

#### Secuencia de consulta de usuarios

1. Administrador → Router: abre /users con parámetros.
2. UsersPage → useGetUsers.
3. useGetUsers → URLSearchParams: lee estado.
4. useGetUsers → React Query: consulta por clave compuesta.
5. React Query → getAllUsersByPageAction.
6. Action → mindsaveAPI.
7. Interceptor → localStorage: obtiene token.
8. mindsaveAPI → Backend: GET /user.
9. Backend → React Query: UsersResponse.
10. UsersPage → UserList/Pagination: renderiza.

#### Secuencia de edición

1. UserPage obtiene id del router.
2. useGetUserById solicita GET /user/:id.
3. UserEditForm presenta valores.
4. Administrador envía cambios.
5. UserEditForm omite password vacío.
6. UserPage agrega id.
7. Mutación envía PUT /user/:id.
8. React Query invalida lista y detalle.
9. Toaster comunica éxito.
10. Router navega a /users.

#### Secuencia de desactivación/restauración

1. Administrador pulsa acción.
2. Botón abre ConfirmDialog.
3. Administrador confirma.
4. Mutación invoca action.
5. Action envía DELETE o PUT.
6. React Query invalida lista.
7. Toaster comunica resultado.
8. Diálogo se cierra en éxito.

### 20.6. Diagramas de actividad

Nodos de decisión importantes:

- ¿Existe token?
- ¿check-status fue correcto?
- ¿role es PROFESIONAL_ROL?
- ¿la ruta exige autenticación?
- ¿la lista está cargando, falló, está vacía o contiene resultados?
- ¿el formulario es válido?
- ¿la edición contiene contraseña?
- ¿la cuenta objetivo es la cuenta autenticada?
- ¿la cuenta está activa o inactiva?
- ¿el administrador confirma o cancela?
- ¿la mutación tuvo éxito?

### 20.7. Diagrama de componentes

Componentes sugeridos:

- Browser;
- React SPA;
- Router;
- Auth feature;
- Users feature;
- Zustand Auth Store;
- TanStack Query Cache;
- Axios API Client;
- localStorage;
- MindSave Admin API;
- Sonner Notifications;
- Design System/UI primitives.

Conectores:

- Router usa Auth Store para decidir acceso.
- Auth y Users usan Axios API Client.
- Axios API Client lee localStorage.
- Users usa TanStack Query Cache.
- Pages usan Notifications y Router.
- React SPA se comunica por HTTPS/HTTP JSON con MindSave Admin API.

## 21. Trazabilidad entre funcionalidad y código

| Área | Archivos principales |
|---|---|
| Arranque | src/main.tsx, src/App.tsx |
| Router | src/router/app.router.tsx |
| Guardas | src/components/routes/ProtectedRoutes.tsx |
| Cliente API | src/api/mindsave.backend.ts |
| Autenticación HTTP | src/auth/actions/login.action.ts, src/auth/actions/check-auth.action.ts |
| Sesión | src/auth/store/auth.store.ts |
| Login | src/auth/pages/LoginPage.tsx |
| Contratos de autenticación | src/auth/interfaces |
| Listado | src/users/pages/UsersPage.tsx, src/users/components/UserList.tsx |
| Búsqueda | src/users/components/SearchBar.tsx |
| Filtros | src/users/components/UserFilters.tsx |
| Paginación | src/users/components/CustomPagination.tsx, src/users/utils/pagination.ts |
| Alta | src/users/pages/NewUserPage.tsx, src/users/components/UserCreateForm.tsx |
| Detalle/edición | src/users/pages/UserPage.tsx, src/users/components/UserEditForm.tsx |
| Formulario compartido | src/users/components/UserForm.tsx |
| Desactivación | src/users/components/DeleteUserButton.tsx |
| Restauración | src/users/components/RestoreUserButton.tsx |
| Confirmación | src/components/shared/ConfirmDialog.tsx |
| Queries/mutaciones | src/users/hooks |
| HTTP de usuarios | src/users/actions |
| Contratos de usuarios | src/users/interfaces |
| Estados compartidos | src/components/shared/LoadingPage.tsx, src/components/shared/ErrorPage.tsx |
| Primitivas visuales | src/components/ui |
| Sistema visual | src/index.css, skills/DESIGN_SYSTEM.md |
| Configuración | package.json, vite.config.ts, tsconfig.app.json, eslint.config.js |
| Pruebas | tests/app.test.tsx |

## 22. Requisitos no demostrables desde este repositorio

Para completar una especificación del sistema total se necesita documentación o código del backend que confirme:

- códigos HTTP y forma exacta de errores por endpoint;
- expiración, firma, revocación y claims del token;
- autorización servidor para PROFESIONAL_ROL;
- unicidad y normalización de email;
- reglas adicionales de contraseña;
- significado persistente de isActive;
- semántica real de DELETE /user/:id;
- valor inicial de isActive;
- posibilidad de editar o desactivar administradores;
- ordenamiento del listado;
- algoritmo de búsqueda;
- límites máximos de page y limit;
- estructura de persistencia y relaciones de base de datos;
- auditoría de operaciones administrativas;
- concurrencia y resolución de ediciones simultáneas.

Estos puntos no deben inventarse al producir diagramas UML o casos de uso del sistema completo. Deben marcarse como dependencias de contrato hasta obtener la especificación del backend.

## 23. Glosario

| Término | Definición en este proyecto |
|---|---|
| Administrador | Cuenta cuyo rol literal es PROFESIONAL_ROL |
| Usuario | Cuenta gestionada; puede ser USER_ROL o PROFESIONAL_ROL |
| Desactivar | Resultado que la UI atribuye a DELETE /user/:id |
| Restaurar | Recuperar una cuenta mediante PUT /user/restore-user/:id |
| Sesión | Estado local derivado de token, user y authStatus |
| Query key | Identificador estructurado usado por TanStack Query |
| Estado de URL | Parámetros que representan búsqueda, filtros y paginación |
| Action | Función que concentra una llamada HTTP |
| Hook | Función React que coordina query, mutación o datos de la URL |
| Guarda | Componente que permite o redirige una ruta según authStatus |
