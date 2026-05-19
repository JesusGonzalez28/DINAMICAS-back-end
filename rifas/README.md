# API de Rifas — NestJS + TypeORM + MySQL

## Stack
- **NestJS 11** — Framework
- **TypeORM 0.3** — ORM para MySQL
- **JWT + Passport** — Autenticación
- **class-validator** — Validación de DTOs
- **Swagger** — Documentación en `/docs`

---

## Instalación

```bash
npm install
cp .env.example .env
# Edita .env con tus credenciales de MySQL
```

## Correr en desarrollo

```bash
npm run start:dev
```

Accede a la documentación en: **http://localhost:3000/docs**

---

## Estructura

```
src/
├── auth/                  # JWT, registro, login
├── common/
│   ├── decorators/        # @Roles()
│   ├── filters/           # Manejo global de errores
│   └── guards/            # RolesGuard
├── config/                # Configuración de base de datos
├── entities/              # Entidades TypeORM
│   ├── user.entity.ts
│   ├── raffle.entity.ts
│   ├── ticket.entity.ts
│   └── purchase.entity.ts
├── raffles/               # Módulo de rifas
└── purchases/             # Módulo de compras
```

---

## Endpoints principales

### Auth
| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| POST | `/auth/register` | Público | Crear usuario |
| POST | `/auth/login` | Público | Login → JWT |
| GET | `/auth/profile` | Autenticado | Ver perfil |

### Rifas
| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| GET | `/raffles` | Público | Listar rifas |
| GET | `/raffles/:id` | Público | Ver rifa |
| GET | `/raffles/:id/stats` | Público | Estadísticas de venta |
| GET | `/raffles/:id/sold-numbers` | Público | Números vendidos |
| GET | `/raffles/:id/available-numbers` | Público | Números disponibles |
| POST | `/raffles` | **Admin** | Crear rifa |
| PATCH | `/raffles/:id/status` | **Admin** | Cambiar estado |

### Compras
| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| POST | `/raffles/:id/purchases` | Público | Comprar tickets |
| GET | `/raffles/:id/purchases` | **Admin** | Ver compras de una rifa |
| GET | `/raffles/:id/purchases/:pid` | **Admin** | Ver una compra |
| PATCH | `/raffles/:id/purchases/:pid/confirm` | **Admin** | Confirmar pago |
| PATCH | `/raffles/:id/purchases/:pid/cancel` | **Admin** | Cancelar compra |

---

## Flujo de compra

1. Cliente llama `POST /raffles/:id/purchases` con sus datos y cantidad de números
2. El sistema asigna números **aleatorios** y crea la compra en estado `PENDING`
3. El cliente realiza el pago externamente (Wompi, PSE, etc.)
4. El admin confirma con `PATCH .../confirm` enviando el `paymentId`

---

## Correcciones aplicadas al código original

- ✅ `Not(null)` → `Not(IsNull())` (TypeORM correcto)
- ✅ Insert de 10.000 tickets en chunks de 1.000 (evita límite MySQL)
- ✅ Validación de fecha futura al crear rifa
- ✅ `NotFoundException` en lugar de `BadRequestException` para recursos no encontrados
- ✅ Índice en `(raffleId, number)` sobre columnas directas, no sobre relaciones
- ✅ FK directas (`raffleId`, `purchaseId`) para queries eficientes sin joins
- ✅ Transacciones con `FOR UPDATE` en compras para evitar race conditions
- ✅ Contraseñas hasheadas con bcrypt
- ✅ Mensaje genérico en login (no revela si el email existe)
- ✅ `synchronize: false` en producción
- ✅ `ValidationPipe` global con `whitelist` y `transform`
