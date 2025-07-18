# 🏥 API COMPLETA CPCE - DOCUMENTACIÓN v1.2
**Sistema de Auditorías CPCE + Módulo de Proveedores de Medicación de Alto Costo**  
**Tablas: Auditorías existentes + alt_proveedor + alt_contacto_proveedor + alt_proveedor_medicamento**

## 📋 ÍNDICE
1. [Introducción](#introducción)
2. [Estructura de Base de Datos](#estructura-de-base-de-datos)
3. [Autenticación](#autenticación)
4. [Módulo de Auditorías](#módulo-de-auditorías)
5. [Módulo de Proveedores](#módulo-de-proveedores)
6. [Códigos de Estado](#códigos-de-estado)
7. [Ejemplos de Integración](#ejemplos-de-integración)

---

## 🌟 INTRODUCCIÓN

Esta API integra dos módulos principales:
- **Módulo de Auditorías**: Sistema existente para gestión de auditorías médicas
- **Módulo de Proveedores**: Nuevo sistema para gestión de proveedores de medicación de alto costo

Ambos módulos comparten el mismo sistema de autenticación JWT y están completamente integrados.

---

## 🔐 AUTENTICACIÓN
Todos los endpoints requieren autenticación JWT. Incluir en headers:
```
Authorization: Bearer {token}
```

### POST /api/auth/login
```json
{
    "username": "tu_usuario",
    "password": "tu_password"
}
```

---

## 🗄️ ESTRUCTURA DE BASE DE DATOS

### Tablas Existentes (Auditorías)
- `rec_auditoria` - Auditorías principales
- `rec_paciente` - Datos de pacientes
- `rec_prescrmedicamento` - Medicamentos prescritos
- `user_au` - Usuarios auditores
- `tmp_person` - Médicos prescriptores

### Nuevas Tablas (Proveedores)

#### Tabla `alt_proveedor`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_proveedor` | INT AUTO_INCREMENT | ID único del proveedor |
| `razon_social` | VARCHAR(255) | Nombre legal de la empresa |
| `cuit` | VARCHAR(20) UNIQUE | CUIT en formato XX-XXXXXXXX-X |
| `tipo_proveedor` | ENUM | Laboratorio, Droguería, Ambos |
| `email_general` | VARCHAR(255) | Email institucional |
| `telefono_general` | VARCHAR(50) | Teléfono principal |
| `direccion_calle` | VARCHAR(100) | Nombre de la calle |
| `direccion_numero` | VARCHAR(10) | Número de la dirección |
| `barrio` | VARCHAR(100) | Barrio o zona |
| `localidad` | VARCHAR(100) | Ciudad |
| `provincia` | VARCHAR(100) | Provincia |
| `activo` | BOOLEAN | Estado del proveedor |
| `fecha_alta` | TIMESTAMP | Fecha de creación |
| `fecha_modificacion` | TIMESTAMP | Última modificación |

#### Tabla `alt_contacto_proveedor`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_contacto` | INT AUTO_INCREMENT | ID único del contacto |
| `id_proveedor` | INT FK | Referencia al proveedor |
| `nombre` | VARCHAR(100) | Nombre del contacto |
| `apellido` | VARCHAR(100) | Apellido del contacto |
| `cargo` | VARCHAR(100) | Puesto o cargo |
| `email` | VARCHAR(255) | Email del contacto |
| `telefono` | VARCHAR(50) | Teléfono del contacto |
| `principal` | BOOLEAN | Si es contacto principal |
| `fecha_alta` | TIMESTAMP | Fecha de creación |
| `fecha_modificacion` | TIMESTAMP | Última modificación |

#### Tabla `alt_proveedor_medicamento` (Opcional)
Relaciona proveedores con medicamentos y precios.

---

## 📊 MÓDULO DE AUDITORÍAS

### Endpoints Principales
- `GET /api/auditorias/pendientes` - Auditorías pendientes
- `GET /api/auditorias/historicas` - Auditorías procesadas
- `GET /api/auditorias/medicas` - Para médicos auditores (rol 9)
- `POST /api/auditorias/paciente` - Historial de paciente
- `GET /api/auditorias/:id` - Obtener auditoría específica
- `POST /api/auditorias/:id/procesar` - Procesar auditoría

### Ejemplo de uso:
```bash
curl -X GET "{{base_url}}/auditorias/pendientes?page=1&limit=10" \
  -H "Authorization: Bearer {token}"
```

---

## 🏥 MÓDULO DE PROVEEDORES

### Endpoints de CRUD Proveedores

#### GET /api/proveedores
**Descripción:** Listar proveedores con paginación y filtros

**Query Parameters:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Registros por página (default: 10, max: 100)
- `search` (opcional): Búsqueda por razón social, CUIT, email o localidad
- `activo` (opcional): true/false - Filtrar por estado activo
- `tipo` (opcional): Laboratorio/Droguería/Ambos/todos

**Respuesta:**
```json
{
    "success": true,
    "data": [
        {
            "id_proveedor": 1,
            "razon_social": "Laboratorios Bagó S.A.",
            "cuit": "30-12345678-9",
            "tipo_proveedor": "Laboratorio",
            "email_general": "contacto@bago.com.ar",
            "telefono_general": "011-4567-8900",
            "direccion_completa": "Av. Córdoba 3900, Palermo, CABA, Buenos Aires",
            "activo": true,
            "total_contactos": 2,
            "contacto_principal": "María González"
        }
    ],
    "pagination": {
        "total": 25,
        "page": 1,
        "limit": 10,
        "totalPages": 3
    }
}
```

#### POST /api/proveedores
**Descripción:** Crear nuevo proveedor con contactos

**Body:**
```json
{
    "razon_social": "Laboratorio Nuevo S.A.",
    "cuit": "30-99999999-9",
    "tipo_proveedor": "Laboratorio",
    "email_general": "info@laboratorio.com",
    "telefono_general": "011-1234-5678",
    "direccion_calle": "Av. Corrientes",
    "direccion_numero": "1234",
    "barrio": "San Nicolás",
    "localidad": "CABA",
    "provincia": "Buenos Aires",
    "contactos": [
        {
            "nombre": "Juan",
            "apellido": "Pérez",
            "cargo": "Director",
            "email": "jperez@laboratorio.com",
            "telefono": "011-1234-5679",
            "principal": true
        }
    ]
}
```

#### GET /api/proveedores/:id
**Descripción:** Obtener proveedor con todos sus contactos

#### PUT /api/proveedores/:id
**Descripción:** Actualizar proveedor

#### DELETE /api/proveedores/:id
**Descripción:** Desactivar proveedor (soft delete)

### Endpoints de CRUD Contactos

#### GET /api/proveedores/:id/contactos
**Descripción:** Obtener contactos de un proveedor

#### POST /api/proveedores/:id/contactos
**Descripción:** Agregar contacto a proveedor

**Body:**
```json
{
    "nombre": "Ana",
    "apellido": "Martínez",
    "cargo": "Gerente Técnico",
    "email": "amartinez@proveedor.com",
    "telefono": "011-5555-6666",
    "principal": false
}
```

#### PUT /api/proveedores/:id/contactos/:contactoId
**Descripción:** Actualizar contacto

#### DELETE /api/proveedores/:id/contactos/:contactoId
**Descripción:** Eliminar contacto

### Endpoints Auxiliares

#### GET /api/proveedores/tipos
**Descripción:** Obtener tipos de proveedores disponibles

#### GET /api/proveedores/estadisticas
**Descripción:** Obtener estadísticas de proveedores

**Respuesta:**
```json
{
    "success": true,
    "data": {
        "total_proveedores": 25,
        "proveedores_activos": 22,
        "proveedores_inactivos": 3,
        "laboratorios": 15,
        "droguerias": 8,
        "ambos": 2,
        "total_contactos": 45
    }
}
```

#### GET /api/proveedores/buscar
**Descripción:** Búsqueda rápida para autocompletar

**Query Parameters:**
- `q`: Término de búsqueda (mínimo 2 caracteres)
- `limit`: Límite de resultados (default: 10, max: 50)

---

## 📊 CÓDIGOS DE ESTADO HTTP

| Código | Descripción | Uso |
|--------|-------------|-----|
| **200** | OK | Operación exitosa |
| **201** | Created | Recurso creado exitosamente |
| **400** | Bad Request | Datos inválidos o faltantes |
| **401** | Unauthorized | Token inválido o expirado |
| **403** | Forbidden | Sin permisos para esta operación |
| **404** | Not Found | Recurso no encontrado |
| **500** | Internal Server Error | Error interno del servidor |

---

## 🔗 EJEMPLOS DE INTEGRACIÓN

### Flujo completo: Login + Auditorías + Proveedores
```bash
# 1. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "usuario", "password": "password"}'

# 2. Ver auditorías pendientes
curl -X GET http://localhost:3000/api/auditorias/pendientes \
  -H "Authorization: Bearer {token}"

# 3. Ver proveedores
curl -X GET http://localhost:3000/api/proveedores \
  -H "Authorization: Bearer {token}"

# 4. Crear nuevo proveedor
curl -X POST http://localhost:3000/api/proveedores \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "razon_social": "Laboratorio Test",
    "cuit": "30-12345678-9",
    "tipo_proveedor": "Laboratorio"
  }'
```

### Integración futura: Proveedores con Auditorías
En versiones futuras, los proveedores podrán asociarse con:
- Medicamentos específicos a través de `alt_proveedor_medicamento`
- Auditorías de medicamentos de alto costo
- Precios y vigencias por medicamento

---

## 🚀 CONFIGURACIÓN EN SERVER.JS

```javascript
// server.js - Configuración completa
const express = require('express');
const app = express();

// Middlewares existentes...

// Rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/auditorias', require('./routes/auditorias'));      // EXISTENTE
app.use('/api/proveedores', require('./routes/proveedores'));    // NUEVO

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'API funcionando correctamente - Auditorías + Proveedores',
        modules: ['auth', 'auditorias', 'proveedores'],
        timestamp: new Date().toISOString()
    });
});
```

---

## ⚠️ CONSIDERACIONES IMPORTANTES

### 🔒 **Seguridad**
- Misma autenticación JWT para ambos módulos
- Validaciones robustas en todos los endpoints
- Soft delete para proveedores (no eliminación física)

### 🗃️ **Base de Datos**
- Tablas de auditorías: Sin cambios
- Tablas nuevas: Prefijo `alt_` para proveedores
- Integridad referencial con CASCADE DELETE en contactos

### 🔍 **Búsquedas y Filtros**
- Búsqueda case-insensitive en múltiples campos
- Paginación consistente en ambos módulos
- Filtros por estado activo y tipo de proveedor

### 🎯 **Validaciones**
- CUIT único y formato XX-XXXXXXXX-X
- Un solo contacto principal por proveedor
- Campos obligatorios: razón social y CUIT

---

## 📝 CHANGELOG v1.2

### ✅ **Cambios Principales**
- **Módulo de Proveedores completo**: 22 endpoints nuevos
- **Integración completa**: Misma autenticación y estructura
- **Tablas con prefijo alt_**: Evita conflictos con sistema existente
- **Documentación unificada**: Un solo documento para todo el sistema

### 🆕 **Nuevas Funcionalidades**
- CRUD completo de proveedores y contactos
- Búsqueda y filtros avanzados
- Estadísticas y reportes
- Validaciones robustas con express-validator
- Colección Postman actualizada con 40+ requests

### 🔄 **Compatibilidad**
- Sistema de auditorías: Sin cambios
- Autenticación: Mismos tokens JWT
- Base de datos: Tablas adicionales sin impacto
- API existing: Totalmente compatible

---

## 🎯 PRÓXIMOS PASOS

1. **Ejecutar script SQL** para crear tablas `alt_*`
2. **Agregar controlador y rutas** de proveedores
3. **Actualizar server.js** con nueva ruta
4. **Importar colección Postman** actualizada
5. **Probar integración** completa

¿Listo para empezar? 🚀1234-5678",
    "direccion_calle": "Av. Rivadavia",
    "direccion_numero": "1234",
    "barrio": "San Telmo",
    "localidad": "CABA",
    "provincia": "Buenos Aires",
    "contactos": [
        {
            "nombre": "Juan",
            "apellido": "Pérez",
            "cargo": "Director",
            "email": "jperez@nuevolaboratorio.com",
            "telefono": "011-1234-5679",
            "principal": true
        }
    ]
}
```

**Respuesta exitosa:**
```json
{
    "success": true,
    "message": "Proveedor creado exitosamente",
    "data": {
        "id_proveedor": 5
    }
}
```

### PUT /api/proveedores/:id
**Descripción:** Actualizar proveedor existente

**Parámetros:**
- `id`: ID del proveedor

**Body (JSON):** Todos los campos son opcionales
```json
{
    "razon_social": "Laboratorio Actualizado S.A.",
    "email_general": "nuevo@email.com",
    "telefono_general": "011-9999-8888",
    "activo": true
}
```

**Respuesta exitosa:**
```json
{
    "success": true,
    "message": "Proveedor actualizado exitosamente"
}
```

### DELETE /api/proveedores/:id
**Descripción:** Desactivar proveedor (soft delete)

**Parámetros:**
- `id`: ID del proveedor

**Respuesta exitosa:**
```json
{
    "success": true,
    "message": "Proveedor desactivado exitosamente"
}
```

---

## 👥 ENDPOINTS DE CONTACTOS

### GET /api/proveedores/:id/contactos
**Descripción:** Obtener contactos de un proveedor

**Parámetros:**
- `id`: ID del proveedor

**Respuesta exitosa:**
```json
{
    "success": true,
    "data": [
        {
            "id_contacto": 1,
            "id_proveedor": 1,
            "nombre": "María",
            "apellido": "González",
            "cargo": "Gerente de Ventas",
            "email": "mgonzalez@bago.com.ar",
            "telefono": "011-4567-8901",
            "principal": true,
            "fecha_alta": "2024-01-15T10:30:00Z",
            "razon_social": "Laboratorios Bagó S.A."
        }
    ]
}
```

### POST /api/proveedores/:id/contactos
**Descripción:** Agregar contacto a un proveedor

**Parámetros:**
- `id`: ID del proveedor

**Body (JSON):**
```json
{
    "nombre": "Ana",
    "apellido": "Martínez",
    "cargo": "Directora Técnica",
    "email": "amartinez@proveedor.com",
    "telefono": "011-5555-6666",
    "principal": false
}
```

**Respuesta exitosa:**
```json
{
    "success": true,
    "message": "Contacto agregado exitosamente",
    "data": {
        "id_contacto": 10
    }
}
```

### PUT /api/proveedores/:id/contactos/:contactoId
**Descripción:** Actualizar contacto específico

**Parámetros:**
- `id`: ID del proveedor
- `contactoId`: ID del contacto

**Body (JSON):** Todos los campos son opcionales
```json
{
    "nombre": "Ana María",
    "cargo": "Directora Comercial",
    "email": "anamaria@proveedor.com",
    "principal": true
}
```

**Respuesta exitosa:**
```json
{
    "success": true,
    "message": "Contacto actualizado exitosamente"
}
```

### DELETE /api/proveedores/:id/contactos/:contactoId
**Descripción:** Eliminar contacto

**Parámetros:**
- `id`: ID del proveedor
- `contactoId`: ID del contacto

**Respuesta exitosa:**
```json
{
    "success": true,
    "message": "Contacto eliminado exitosamente"
}
```

---

## 🔧 ENDPOINTS AUXILIARES

### GET /api/proveedores/tipos
**Descripción:** Obtener tipos de proveedores disponibles

**Respuesta exitosa:**
```json
{
    "success": true,
    "data": [
        { "value": "Laboratorio", "label": "Laboratorio" },
        { "value": "Droguería", "label": "Droguería" },
        { "value": "Ambos", "label": "Ambos" }
    ]
}
```

### GET /api/proveedores/estadisticas
**Descripción:** Obtener estadísticas generales

**Respuesta exitosa:**
```json
{
    "success": true,
    "data": {
        "total_proveedores": 25,
        "proveedores_activos": 22,
        "proveedores_inactivos": 3,
        "laboratorios": 15,
        "droguerias": 8,
        "ambos": 2,
        "total_contactos": 45
    }
}
```

### GET /api/proveedores/buscar
**Descripción:** Búsqueda rápida para autocompletar

**Query Parameters:**
- `q`: Término de búsqueda (mínimo 2 caracteres)
- `limit`: Límite de resultados (default: 10, max: 50)

**Respuesta exitosa:**
```json
{
    "success": true,
    "data": [
        {
            "id_proveedor": 1,
            "razon_social": "Laboratorios Bagó S.A.",
            "cuit": "30-12345678-9",
            "tipo_proveedor": "Laboratorio",
            "email_general": "contacto@bago.com.ar",
            "telefono_general": "011-4567-8900"
        }
    ]
}
```

---

## 📊 CÓDIGOS DE ESTADO HTTP

| Código | Descripción | Uso |
|--------|-------------|-----|
| **200** | OK | Operación exitosa |
| **201** | Created | Recurso creado exitosamente |
| **400** | Bad Request | Datos inválidos o faltantes |
| **401** | Unauthorized | Token inválido o expirado |
| **404** | Not Found | Recurso no encontrado |
| **500** | Internal Server Error | Error interno del servidor |

---

## 🎯 EJEMPLOS DE USO

### Flujo típico: Crear proveedor completo
```bash
# 1. Crear proveedor con contactos
curl -X POST http://localhost:3000/api/proveedores \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "razon_social": "Laboratorio Ejemplo S.A.",
    "cuit": "30-12345678-9",
    "tipo_proveedor": "Laboratorio",
    "email_general": "info@ejemplo.com",
    "contactos": [
      {
        "nombre": "Juan",
        "apellido": "Pérez",
        "cargo": "Director",
        "email": "jperez@ejemplo.com",
        "principal": true
      }
    ]
  }'
```

### Flujo típico: Buscar y actualizar
```bash
# 1. Buscar proveedor
curl -X GET "http://localhost:3000/api/proveedores/buscar?q=bagó" \
  -H "Authorization: Bearer {token}"

# 2. Actualizar proveedor encontrado
curl -X PUT http://localhost:3000/api/proveedores/1 \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "telefono_general": "011-9999-8888",
    "email_general": "nuevoemail@bago.com.ar"
  }'
```

### Flujo típico: Gestionar contactos
```bash
# 1. Ver contactos actuales
curl -X GET http://localhost:3000/api/proveedores/1/contactos \
  -H "Authorization: Bearer {token}"

# 2. Agregar nuevo contacto
curl -X POST http://localhost:3000/api/proveedores/1/contactos \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Ana",
    "apellido": "López",
    "cargo": "Gerente Técnico",
    "email": "alopez@proveedor.com",
    "principal": false
  }'

# 3. Actualizar contacto
curl -X PUT http://localhost:3000/api/proveedores/1/contactos/5 \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "cargo": "Directora Técnica",
    "principal": true
  }'
```

---

## 🚀 INTEGRACIÓN CON SISTEMA EXISTENTE

### Agregar a server.js
```javascript
// Agregar en server.js después de las rutas existentes
app.use('/api/proveedores', require('./routes/proveedores'));
```

### Estructura de directorios
```
cpce-auditoria-api/
├── controllers/
│   ├── proveedoresController.js  ← ACTUALIZADO
│   ├── auditoriasController.js
│   └── authController.js
├── routes/
│   ├── proveedores.js             ← NUEVO
│   ├── auditorias.js
│   └── auth.js
└── server.js                      ← ACTUALIZAR
```

---

## ⚠️ CONSIDERACIONES IMPORTANTES

### 🔒 **Seguridad y Validaciones**
1. **Validación de CUIT:** Se valida formato XX-XXXXXXXX-X
2. **Contacto Principal:** Solo puede haber un contacto principal por proveedor
3. **Soft Delete:** Los proveedores se desactivan, no se eliminan físicamente
4. **Autenticación:** Todos los endpoints requieren JWT válido

### 📋 **Reglas de Negocio**
1. **CUIT único:** No puede haber dos proveedores con el mismo CUIT
2. **Contacto principal único:** Al marcar un contacto como principal, los demás se desmarcan automáticamente
3. **Cascada:** Al eliminar un proveedor, se eliminan todos sus contactos
4. **Estados:** Los proveedores inactivos no aparecen en búsquedas

### 🔍 **Búsqueda y Filtros**
1. **Búsqueda:** Case-insensitive en razón social, CUIT, email y localidad
2. **Paginación:** Siempre incluye información de paginación
3. **Filtros:** Por tipo de proveedor y estado activo
4. **Ordenamiento:** Por defecto ordenado por razón social

### 🗃️ **Base de Datos**
1. **Tablas:** `alt_proveedor`, `alt_contacto_proveedor`, `alt_proveedor_medicamento`
2. **Índices:** Optimizados para búsquedas frecuentes
3. **Integridad:** Claves foráneas con CASCADE DELETE
4. **Timestamps:** Automáticos para auditoría

---

## 🔗 ENDPOINTS RELACIONADOS

Para integrar con el sistema de auditorías existente:
- Los proveedores se pueden relacionar con medicamentos via `alt_proveedor_medicamento`
- Se puede extender para incluir precios y vigencias
- Compatible con el sistema de auditorías actual mediante `id_proveedor`

---

## 📝 CHANGELOG v2.0

### ✅ **Cambios Principales**
- **Tablas actualizadas:** Prefijo `alt_` en todas las tablas
- **Controlador actualizado:** Todas las consultas usan nuevos nombres
- **Documentación completa:** Estructura de BD y ejemplos actualizados
- **Compatibilidad:** Mantiene funcionalidad completa del sistema

### 🔄 **Migración desde v1.0**
1. Ejecutar script SQL con nuevas tablas `alt_*`
2. Actualizar controlador con nuevos nombres
3. Verificar funcionamiento con colección Postman
4. Migrar datos existentes si es necesario# 🏥 API PROVEEDORES - DOCUMENTACIÓN COMPLETA
**Sistema de Auditorías CPCE - Medicación de Alto Costo**

## 📋 ÍNDICE
1. [Introducción](#introducción)
2. [Autenticación](#autenticación)
3. [Endpoints de Proveedores](#endpoints-de-proveedores)
4. [Endpoints de Contactos](#endpoints-de-contactos)
5. [Endpoints Auxiliares](#endpoints-auxiliares)
6. [Códigos de Estado](#códigos-de-estado)
7. [Ejemplos de Uso](#ejemplos-de-uso)

---

## 🔐 AUTENTICACIÓN
Todos los endpoints requieren autenticación JWT. Incluir en headers:
```
Authorization: Bearer {token}
```

---

## 📊 ENDPOINTS DE PROVEEDORES

### GET /api/proveedores
**Descripción:** Obtener lista de proveedores con paginación y filtros

**Query Parameters:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Registros por página (default: 10, max: 100)
- `search` (opcional): Búsqueda por razón social, CUIT, email o localidad
- `activo` (opcional): true/false - Filtrar por estado activo
- `tipo` (opcional): Laboratorio/Droguería/Ambos/todos

**Respuesta exitosa:**
```json
{
    "success": true,
    "data": [
        {
            "id_proveedor": 1,
            "razon_social": "Laboratorios Bagó S.A.",
            "cuit": "30-12345678-9",
            "tipo_proveedor": "Laboratorio",
            "email_general": "contacto@bago.com.ar",
            "telefono_general": "011-4567-8900",
            "direccion_completa": "Av. Córdoba 3900, Palermo, CABA, Buenos Aires",
            "activo": true,
            "fecha_alta": "2024-01-15T10:30:00Z",
            "total_contactos": 2,
            "contacto_principal": "María González"
        }
    ],
    "pagination": {
        "total": 25,
        "page": 1,
        "limit": 10,
        "totalPages": 3
    }
}
```

### GET /api/proveedores/:id
**Descripción:** Obtener proveedor específico con todos sus contactos

**Parámetros:**
- `id`: ID del proveedor

**Respuesta exitosa:**
```json
{
    "success": true,
    "data": {
        "id_proveedor": 1,
        "razon_social": "Laboratorios Bagó S.A.",
        "cuit": "30-12345678-9",
        "tipo_proveedor": "Laboratorio",
        "email_general": "contacto@bago.com.ar",
        "telefono_general": "011-4567-8900",
        "direccion_calle": "Av. Córdoba",
        "direccion_numero": "3900",
        "barrio": "Palermo",
        "localidad": "CABA",
        "provincia": "Buenos Aires",
        "activo": true,
        "fecha_alta": "2024-01-15T10:30:00Z",
        "contactos": [
            {
                "id_contacto": 1,
                "nombre": "María",
                "apellido": "González",
                "cargo": "Gerente de Ventas",
                "email": "mgonzalez@bago.com.ar",
                "telefono": "011-4567-8901",
                "principal": true
            }
        ]
    }
}
```

### POST /api/proveedores
**Descripción:** Crear nuevo proveedor

**Body (JSON):**
```json
{
    "razon_social": "Nuevo Laboratorio S.A.",
    "cuit": "30-99999999-9",
    "tipo_proveedor": "Laboratorio",
    "email_general": "info@nuevolaboratorio.com",
    "telefono_general": "011-1234-5678",
    "direccion_calle": "Av. Rivadavia",
    "direccion_numero": "1234",
    "barrio": "San Telmo",
    "localidad": "CABA",
    "provincia": "Buenos Aires",
    "contactos": [
        {
            "nombre": "Juan",
            "apellido": "Pérez",
            "cargo": "Director",
            "email": "jperez@nuevolaboratorio.com",
            "telefono": "011-1234-5679",
            "principal": true
        }
    ]
}
```

**Respuesta exitosa:**
```json
{
    "success": true,
    "message": "Proveedor creado exitosamente",
    "data": {
        "id_proveedor": 5
    }
}
```

### PUT /api/proveedores/:id
**Descripción:** Actualizar proveedor existente

**Parámetros:**
- `id`: ID del proveedor

**Body (JSON):** Todos los campos son opcionales
```json
{
    "razon_social": "Laboratorio Actualizado S.A.",
    "email_general": "nuevo@email.com",
    "telefono_general": "011-9999-8888",
    "activo": true
}
```

**Respuesta exitosa:**
```json
{
    "success": true,
    "message": "Proveedor actualizado exitosamente"
}
```

### DELETE /api/proveedores/:id
**Descripción:** Desactivar proveedor (soft delete)

**Parámetros:**
- `id`: ID del proveedor

**Respuesta exitosa:**
```json
{
    "success": true,
    "message": "Proveedor desactivado exitosamente"
}
```

---

## 👥 ENDPOINTS DE CONTACTOS

### GET /api/proveedores/:id/contactos
**Descripción:** Obtener contactos de un proveedor

**Parámetros:**
- `id`: ID del proveedor

**Respuesta exitosa:**
```json
{
    "success": true,
    "data": [
        {
            "id_contacto": 1,
            "id_proveedor": 1,
            "nombre": "María",
            "apellido": "González",
            "cargo": "Gerente de Ventas",
            "email": "mgonzalez@bago.com.ar",
            "telefono": "011-4567-8901",
            "principal": true,
            "fecha_alta": "2024-01-15T10:30:00Z",
            "razon_social": "Laboratorios Bagó S.A."
        }
    ]
}
```

### POST /api/proveedores/:id/contactos
**Descripción:** Agregar contacto a un proveedor

**Parámetros:**
- `id`: ID del proveedor

**Body (JSON):**
```json
{
    "nombre": "Ana",
    "apellido": "Martínez",
    "cargo": "Directora Técnica",
    "email": "amartinez@proveedor.com",
    "telefono": "011-5555-6666",
    "principal": false
}
```

**Respuesta exitosa:**
```json
{
    "success": true,
    "message": "Contacto agregado exitosamente",
    "data": {
        "id_contacto": 10
    }
}
```

### PUT /api/proveedores/:id/contactos/:contactoId
**Descripción:** Actualizar contacto específico

**Parámetros:**
- `id`: ID del proveedor
- `contactoId`: ID del contacto

**Body (JSON):** Todos los campos son opcionales
```json
{
    "nombre": "Ana María",
    "cargo": "Directora Comercial",
    "email": "anamaria@proveedor.com",
    "principal": true
}
```

**Respuesta exitosa:**
```json
{
    "success": true,
    "message": "Contacto actualizado exitosamente"
}
```

### DELETE /api/proveedores/:id/contactos/:contactoId
**Descripción:** Eliminar contacto

**Parámetros:**
- `id`: ID del proveedor
- `contactoId`: ID del contacto

**Respuesta exitosa:**
```json
{
    "success": true,
    "message": "Contacto eliminado exitosamente"
}
```

---

## 🔧 ENDPOINTS AUXILIARES

### GET /api/proveedores/tipos
**Descripción:** Obtener tipos de proveedores disponibles

**Respuesta exitosa:**
```json
{
    "success": true,
    "data": [
        { "value": "Laboratorio", "label": "Laboratorio" },
        { "value": "Droguería", "label": "Droguería" },
        { "value": "Ambos", "label": "Ambos" }
    ]
}
```

### GET /api/proveedores/estadisticas
**Descripción:** Obtener estadísticas generales

**Respuesta exitosa:**
```json
{
    "success": true,
    "data": {
        "total_proveedores": 25,
        "proveedores_activos": 22,
        "proveedores_inactivos": 3,
        "laboratorios": 15,
        "droguerias": 8,
        "ambos": 2,
        "total_contactos": 45
    }
}
```

### GET /api/proveedores/buscar
**Descripción:** Búsqueda rápida para autocompletar

**Query Parameters:**
- `q`: Término de búsqueda (mínimo 2 caracteres)
- `limit`: Límite de resultados (default: 10, max: 50)

**Respuesta exitosa:**
```json
{
    "success": true,
    "data": [
        {
            "id_proveedor": 1,
            "razon_social": "Laboratorios Bagó S.A.",
            "cuit": "30-12345678-9",
            "tipo_proveedor": "Laboratorio",
            "email_general": "contacto@bago.com.ar",
            "telefono_general": "011-4567-8900"
        }
    ]
}
```

---

## 📊 CÓDIGOS DE ESTADO HTTP

| Código | Descripción | Uso |
|--------|-------------|-----|
| **200** | OK | Operación exitosa |
| **201** | Created | Recurso creado exitosamente |
| **400** | Bad Request | Datos inválidos o faltantes |
| **401** | Unauthorized | Token inválido o expirado |
| **404** | Not Found | Recurso no encontrado |
| **500** | Internal Server Error | Error interno del servidor |

---

## 🎯 EJEMPLOS DE USO

### Flujo típico: Crear proveedor completo
```bash
# 1. Crear proveedor con contactos
curl -X POST http://localhost:3000/api/proveedores \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "razon_social": "Laboratorio Ejemplo S.A.",
    "cuit": "30-12345678-9",
    "tipo_proveedor": "Laboratorio",
    "email_general": "info@ejemplo.com",
    "contactos": [
      {
        "nombre": "Juan",
        "apellido": "Pérez",
        "cargo": "Director",
        "email": "jperez@ejemplo.com",
        "principal": true
      }
    ]
  }'
```

### Flujo típico: Buscar y actualizar
```bash
# 1. Buscar proveedor
curl -X GET "http://localhost:3000/api/proveedores/buscar?q=bagó" \
  -H "Authorization: Bearer {token}"

# 2. Actualizar proveedor encontrado
curl -X PUT http://localhost:3000/api/proveedores/1 \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "telefono_general": "011-9999-8888",
    "email_general": "nuevoemail@bago.com.ar"
  }'
```

### Flujo típico: Gestionar contactos
```bash
# 1. Ver contactos actuales
curl -X GET http://localhost:3000/api/proveedores/1/contactos \
  -H "Authorization: Bearer {token}"

# 2. Agregar nuevo contacto
curl -X POST http://localhost:3000/api/proveedores/1/contactos \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Ana",
    "apellido": "López",
    "cargo": "Gerente Técnico",
    "email": "alopez@proveedor.com",
    "principal": false
  }'

# 3. Actualizar contacto
curl -X PUT http://localhost:3000/api/proveedores/1/contactos/5 \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "cargo": "Directora Técnica",
    "principal": true
  }'
```

---

## 🚀 INTEGRACIÓN CON SISTEMA EXISTENTE

### Agregar a server.js
```javascript
// Agregar en server.js después de las rutas existentes
app.use('/api/proveedores', require('./routes/proveedores'));
```

### Estructura de directorios
```
cpce-auditoria-api/
├── controllers/
│   ├── proveedoresController.js  ← NUEVO
│   ├── auditoriasController.js
│   └── authController.js
├── routes/
│   ├── proveedores.js             ← NUEVO
│   ├── auditorias.js
│   └── auth.js
└── ...
```

---

## ⚠️ CONSIDERACIONES IMPORTANTES

1. **Validación de CUIT:** Se valida formato XX-XXXXXXXX-X
2. **Contacto Principal:** Solo puede haber un contacto principal por proveedor
3. **Soft Delete:** Los proveedores se desactivan, no se eliminan físicamente
4. **Búsqueda:** La búsqueda es case-insensitive y busca en múltiples campos
5. **Paginación:** Siempre incluye información de paginación en respuestas de listado

---

## 🔗 ENDPOINTS RELACIONADOS

Para integrar con el sistema de auditorías existente:
- Los proveedores se pueden relacionar con medicamentos via `PROVEEDOR_MEDICAMENTO`
- Se puede extender para incluir precios y vigencias
- Compatible con el sistema de auditorías actual