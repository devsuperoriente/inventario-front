# PanControl - Inventario de planta

## Autenticación y permisos

La aplicación usa cookies de autenticación `HttpOnly`; no guarda tokens en `localStorage` ni `sessionStorage`. El backend configurado en `VITE_API_URL` (por defecto `http://localhost:3000`) debe exponer:

- `POST /auth/login`, recibe `{ "username": "...", "password": "..." }`, valida las credenciales y emite cookies `HttpOnly` de acceso y renovación. La respuesta JSON contiene `user` (con `username`) y `permissions`.
- `POST /auth/refresh`, valida la cookie de renovación, rota/emite cookies actualizadas y devuelve el usuario y sus permisos actuales. La app lo llama al iniciar para restaurar la sesión y una vez más si una petición API responde `401`; al renovarla, repite la petición original.
- `POST /auth/logout`, invalida la sesión en el servidor y expira las cookies de acceso y renovación.

`/auth/refresh` debe responder `401` o `403` cuando no haya una cookie de renovación válida. En ese caso el frontend muestra el login. La respuesta de `/auth/refresh` debe incluir el mismo formato de usuario y permisos que la de login:

Ejemplo del cuerpo de respuesta de login y sesión:

```json
{
  "user": {
    "id": "usuario-123",
    "username": "operador",
    "email": "operador@empresa.com",
    "role": "Operador"
  },
  "permissions": ["dashboard", "inventory", "orders"]
}
```

El cliente envía las cookies con `credentials: "include"`. Configura las cookies con `HttpOnly`, `Secure` en producción, `Path=/` y un `SameSite` adecuado; limita la cookie de renovación a la ruta `/auth/refresh` si el framework/backend lo permite. Rota la cookie de renovación después de usarla y revoca la anterior. Si frontend y API son de distinto origen, configura CORS con el origen exacto del frontend y `Access-Control-Allow-Credentials: true`; `SameSite=None` requiere HTTPS y `Secure`. Protege las operaciones que cambian estado contra CSRF (por ejemplo, `SameSite` apropiado y validación de `Origin` o token CSRF).

Los elementos de `permissions` son los identificadores de funcionalidades mostrados en la navegación (`dashboard`, `inventory`, `categories`, `products`, `batches`, `providers`, `clients`, `orders`, `recipes`, `production-orders`, `order-states`, `measurement-units`, `types-movement` y `dispatch`). `*` concede acceso a todas. Cada usuario puede recibir una lista distinta; la interfaz oculta las funcionalidades no autorizadas. La autorización del frontend solo controla la interfaz: el backend debe validar la sesión y aplicar permisos en cada endpoint.

### Inventario y movimientos

El módulo `inventory` agrupa las existencias de `GET /lotes` por producto y unidad de medida para mostrar la suma de `quantityAvailable`; no combina productos ni unidades distintos. El detalle de cada producto se carga bajo demanda desde `GET /lotes/producto/:productId/existencias`, cuya respuesta incluye `productoId`, `producto`, `unidad` y `lotes` con `id`, `codigo`, `proveedor`, `fechaIngreso`, `fechaVencimiento`, `cantidadInicial` y `cantidadDisponible`. El historial se consulta en `GET /movimientos-inventario`. El frontend es de solo lectura y no calcula `balancePrevius`/`balanceCurrent`; esos balances corresponden al backend. Para mostrar cada movimiento se recomienda que la respuesta incluya `batch` con `product` (incluida su unidad de medida), `typeMovement` y `ordersProduction` cuando exista, además de `quantity`, `balancePrevius`, `balanceCurrent`, `date` y `observation`.

### Pedidos y clientes

Al crear o editar un pedido, el frontend envía `clientId` junto con el número y la fecha. El backend debe guardar la relación como muchos pedidos para un cliente (cada pedido pertenece a un cliente) y devolver la relación `client` con su `name`, o `clientName`, para mostrarla en la lista. El usuario autenticado se muestra como responsable, pero el servidor debe asignar el supervisor creador usando la identidad de la cookie de sesión; no debe aceptar un ID de supervisor enviado por el cliente. La creación de pedidos debe estar autorizada para el rol supervisor en el backend.

Al crear un pedido, `POST /pedidos` debe responder con el pedido creado y su `id` (o dejarlo disponible en `GET /pedidos`). Con ese ID, el frontend abre inmediatamente el detalle del pedido para agregar productos mediante `/detalle-pedidos`; estos se guardan como registros relacionados al pedido, sin asumir que el backend crea pedido y detalles en una sola transacción.

### Lotes

El feature de lotes usa `GET/POST /lotes`, `PUT /lotes/:id` y `DELETE /lotes/:id`. Cada lote se relaciona con un producto y un proveedor y el formulario envía `quantityInitial`, `quantityAvailable` al crear, `entryDate`, `expirationDate`, `temperature`, `observation`, `productId` y `providerId`; no solicita ni envía `code`. La cantidad disponible se inicializa con la cantidad inicial al registrar el lote; el backend debe mantenerla actualizada con los movimientos y consumos de inventario. La imagen es opcional: cuando se selecciona, se carga en Cloudinary y se envía `imageUrl` como una URL HTTPS; si se omite, el frontend no incluye esa propiedad en el payload. Al editar sin elegir otra imagen, se conserva la URL ya guardada. `temperature` y `observation` pueden ser nulos; en el formulario, una observación vacía se envía como `null`. La entidad TypeORM compartida declara `imageUrl` y `observation` no nulos; para guardar lotes sin esos valores, el backend debe permitir `null` en esas columnas o definir valores por defecto. Para mostrar los lotes, `GET /lotes` debería incluir `product` y `provider` con sus nombres o `productName`/`providerName`.

Configura Cloudinary copiando `.env.example` a `.env.local` y completando `VITE_CLOUDINARY_CLOUD_NAME` y `VITE_CLOUDINARY_UPLOAD_PRESET`. Crea en Cloudinary un **unsigned upload preset** restringido a imágenes, limita el tamaño (la interfaz limita a 5 MB) y fija una carpeta como `pancontrol/batches` desde el preset. El preset y cloud name son configuración pública del navegador; **no pongas el API secret de Cloudinary en variables `VITE_*`**. El archivo se transmite directamente del navegador a Cloudinary; el API de lotes solo recibe la URL `secure_url`.

### Recetas

El feature de recetas usa `GET/POST /recetas`, `PUT /recetas/:id` y `DELETE /recetas/:id`. Cada receta se asocia a un producto final mediante `productId` y contiene `name`, `description` y `version`. La relación de ingredientes usa `GET/POST /detalle-receta`, `PUT /detalle-receta/:id` y `DELETE /detalle-receta/:id`; cada detalle incluye `recipeId`, `productId` obligatorio, `amount` decimal de hasta dos decimales opcional y `observation` opcional de hasta 30 caracteres. El frontend abre los ingredientes al crear la receta y muestra/permite modificar y quitar los productos vinculados. El backend debe devolver la relación `product` de la receta y las relaciones `recipe` y `product` de sus detalles, o sus IDs equivalentes.

### Órdenes de producción

El feature consulta `GET /pedidos/by-date?date=YYYY-MM-DD`, que debe devolver una lista de pedidos con `id`, y cruza sus IDs con `GET /detalle-pedidos` para sumar `amount` por producto. Los detalles deben incluir `orderId` (o `order.id`) y `productId` (o `product.id`). Al confirmar, el frontend crea un registro por producto consolidado mediante `POST /ordenes-produccion`, enviando `productId`, `stateId`, `date`, `quantitySheduled` y `observation`. El backend debe asignar el usuario desde la sesión y generar `numberOrder`; el estado inicial se selecciona desde `GET /estados`. Para consultar los insumos calculados de una orden se usa `GET /ordenes-produccion/:id/insumos-requeridos`; la respuesta incluye `orden`, `receta` e `insumos`. El botón **Ver insumos** muestra ese cálculo. Desde el modal, el dosificador confirma la operación con `POST /ordenes-produccion/:id/consumos-materia-prima`, protegido por `production-orders:consume`, sin enviar cantidades ni lotes. El método del backend se encarga de cambiar la orden a dosificación y registrar el consumo: calcula con la cantidad programada, asigna lotes vigentes por FEFO, registra consumos y movimientos y actualiza sus saldos en una sola transacción; también debe rechazar falta de stock sin cambios parciales y tratar reintentos de forma idempotente. El frontend solicita confirmación, deshabilita el cierre mientras se procesa y recarga la lista de órdenes al finalizar. El historial permite buscar y filtrar por fecha; las tablas se muestran como tarjetas en pantallas pequeñas.

## Desarrollo

```sh
npm install
npm run dev
```

## Validación

```sh
npm run lint
npm run build
```
