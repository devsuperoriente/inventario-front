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

### Pedidos y clientes

Al crear o editar un pedido, el frontend envía `clientId` junto con el número y la fecha. El backend debe guardar la relación como muchos pedidos para un cliente (cada pedido pertenece a un cliente) y devolver la relación `client` con su `name`, o `clientName`, para mostrarla en la lista. El usuario autenticado se muestra como responsable, pero el servidor debe asignar el supervisor creador usando la identidad de la cookie de sesión; no debe aceptar un ID de supervisor enviado por el cliente. La creación de pedidos debe estar autorizada para el rol supervisor en el backend.

Al crear un pedido, `POST /pedidos` debe responder con el pedido creado y su `id` (o dejarlo disponible en `GET /pedidos`). Con ese ID, el frontend abre inmediatamente el detalle del pedido para agregar productos mediante `/detalle-pedidos`; estos se guardan como registros relacionados al pedido, sin asumir que el backend crea pedido y detalles en una sola transacción.

### Lotes

El feature de lotes usa `GET/POST /lotes`, `PUT /lotes/:id` y `DELETE /lotes/:id`. Cada lote se relaciona con un producto y un proveedor y contiene `code`, `quantity`, `date`, `dateMatury`, `temperature`, `observation` e `image`. La imagen se carga primero en Cloudinary y el backend recibe `image` como una URL HTTPS string junto con los demás campos en JSON. Al editar sin elegir otra imagen, se conserva la URL ya guardada. Para mostrarlos en la tabla, `GET /lotes` debería incluir `product` y `provider` con sus nombres, o `productName`/`providerName`, y `image` como URL accesible.

Configura Cloudinary copiando `.env.example` a `.env.local` y completando `VITE_CLOUDINARY_CLOUD_NAME` y `VITE_CLOUDINARY_UPLOAD_PRESET`. Crea en Cloudinary un **unsigned upload preset** restringido a imágenes, limita el tamaño (la interfaz limita a 5 MB) y fija una carpeta como `pancontrol/batches` desde el preset. El preset y cloud name son configuración pública del navegador; **no pongas el API secret de Cloudinary en variables `VITE_*`**. El archivo se transmite directamente del navegador a Cloudinary; el API de lotes solo recibe la URL `secure_url`.

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
