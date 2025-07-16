# 📋 DOCUMENTACIÓN API - SISTEMA AUDITORÍAS CPCE
**Versión 1.1 - Actualizada con correcciones de base de datos**

## 🔐 AUTENTICACIÓN

### POST /api/auth/login
Iniciar sesión y obtener JWT token
```json
{
    "username": "tu_usuario",
    "password": "tu_password"
}
```

**Respuesta exitosa:**
```json
{
    "success": true,
    "message": "Login exitoso",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "idauditor": 1,
        "nombre": "Juan",
        "apellido": "Pérez",
        "rol": 10,
        "foto": "foto.jpg",
        "firma": "firma.jpg"
    }
}
```

### GET /api/auth/profile
Obtener perfil del usuario (requiere token)

### GET /api/auth/verify
Verificar si el token es válido
**Headers:** `Authorization: Bearer {token}`

### PUT /api/auth/change-password
Cambiar contraseña usando usuario + DNI
```json
{
    "username": "usuario",
    "dni": "12345678",
    "password_nuevo": "nueva123",
    "password_nuevo_repetir": "nueva123"
}
```

### POST /api/auth/logout
Cerrar sesión (requiere token)

---

## 📊 AUDITORÍAS - LISTADOS

### GET /api/auditorias/pendientes
Obtener auditorías pendientes (filtradas por rol)

**Query Parameters:**
- `search` (opcional): Búsqueda por apellido, nombre, DNI o médico
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Registros por página (default: 10)

**Respuesta:**
```json
{
    "success": true,
    "data": [
        {
            "id": "123",
            "apellido": "Pérez",
            "nombre": "Juan",
            "dni": "12345678",
            "fecha": "01-12-2024",
            "medico": "Dr. García MP-12345",
            "renglones": 3,
            "meses": 6,
            "auditado": null
        }
    ],
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
}
```

### GET /api/auditorias/historicas
Obtener auditorías ya procesadas

**Query Parameters:**
- `search` (opcional): Búsqueda en múltiples campos
- `page` (opcional): Número de página
- `limit` (opcional): Registros por página

**Respuesta:**
```json
{
    "success": true,
    "data": [
        {
            "id": "123",
            "apellido": "Pérez",
            "nombre": "Juan",
            "dni": "12345678",
            "fecha": "01-12-2024",
            "medico": "Dr. García MP-12345",
            "renglones": 3,
            "meses": 6,
            "auditado": 1,
            "auditor": "Dr. López",
            "fechaAuditoria": "15-12-2024"
        }
    ],
    "total": 150,
    "page": 1,
    "limit": 10,
    "totalPages": 15
}
```

### 🩺 GET /api/auditorias/medicas
Obtener auditorías médicas pendientes (solo para médicos auditores - rol 9)

**Permisos requeridos:** Médico auditor (rol 9)

**Respuesta:**
```json
{
    "success": true,
    "data": [
        {
            "id": "123",
            "apellido": "Pérez",
            "nombre": "Juan",
            "dni": "12345678",
            "fecha": "01-12-2024",
            "medico": "Dr. García MP-12345",
            "renglones": 3,
            "meses": 6,
            "auditado": null,
            "fecha_bloqueo": "15-12-2024 14:30"
        }
    ],
    "message": "Encontradas 5 auditorías médicas pendientes"
}
```

### POST /api/auditorias/listado
Listado con filtros opcionales
```json
{
    "dni": "12345678",
    "fechaDesde": "2024-01-01",
    "fechaHasta": "2024-12-31"
}
```

### POST /api/auditorias/paciente
Historial completo de un paciente *(CORREGIDO - sin campos inexistentes)*
```json
{
    "dni": "12345678",
    "fechaDesde": "2024-01-01",
    "fechaHasta": "2024-12-31"
}
```

**Respuesta actualizada:**
```json
{
    "success": true,
    "data": [
        {
            "pac_apnom": "Pérez Juan",
            "dni": "12345678",
            "sexo": "M",
            "fecnac": "1980-01-01",
            "talla": "175",
            "peso": "80",
            "telefono": "123456789",
            "email": "juan@email.com",
            "id": "123",
            "nro_orden": 1,
            "fecha_auditoria": "15-12-2024",
            "estado_auditoria": 1,
            "medico": "Dr. García MP-12345",
            "fecha": "01-12-2024",
            "renglones": 3,
            "meses": 6,
            "auditor": "Dr. López"
        }
    ]
}
```

### POST /api/auditorias/excel
Generar reporte Excel por mes
```json
{
    "fecha": "2024-12"
}
```

---

## ⚙️ AUDITORÍAS - PROCESAMIENTO

### GET /api/auditorias/:id
Obtener datos completos para auditar (paciente, diagnóstico, medicamentos)

**Query Parameters:**
- `tipo` (opcional): 'pendiente' o 'historica' (default: 'pendiente')

**Respuesta:**
```json
{
    "success": true,
    "data": {
        "auditoria": {
            "id": "123",
            "fecha_origen": "01-12-2024",
            "fecha_auditoria": "15-12-2024",
            "renglones": 3,
            "cantmeses": 6,
            "auditado": 1,
            "nota": "Auditoría aprobada"
        },
        "paciente": {
            "apellido": "Pérez",
            "nombre": "Juan",
            "dni": "12345678",
            "sexo": "M",
            "fecha_nacimiento": "01-01-1980",
            "talla": "175",
            "peso": "80",
            "telefono": "123456789",
            "email": "juan@email.com"
        },
        "medico": {
            "nombre": "Dr. García",
            "matricula": "12345"
        },
        "auditor": "Dr. López",
        "recetas": {
            "123": {
                "idreceta": 123,
                "medicamentos": [
                    {
                        "id": 1,
                        "idmedicamento": 456,
                        "nombrecomercial": "Medicamento 456",
                        "cantidad": 2,
                        "estado": 1
                    }
                ]
            }
        },
        "tipo": "pendiente"
    }
}
```

### POST /api/auditorias/:id/procesar
Procesar auditoría (aprobar/denegar medicamentos)
```json
{
    "chequedos": "123-1,124-2",
    "nochequeados": "125-1",
    "cobert1": "70",
    "cobert2": "50", 
    "cobert3": "100",
    "cobert4": "50",
    "cobert2_1": "BIAC",
    "cobert2_2": "CE",
    "cobert2_3": "ONC", 
    "cobert2_4": "BIAC",
    "nota": "Auditoría procesada correctamente",
    "estadoIdentidad": 0
}
```

**Explicación de campos:**
- `chequedos`: Medicamentos aprobados (formato: "idreceta-renglon,...")
- `nochequeados`: Medicamentos rechazados
- `cobert1-4`: Porcentaje cobertura por renglón (50, 70, 100)
- `cobert2_1-4`: Tipo cobertura (BIAC, CE, DSC, HO, etc.)
- `nota`: Observaciones de la auditoría
- `estadoIdentidad`: 0=normal, 1=identidad reservada

### POST /api/auditorias/:id/enviar-medico
Enviar auditoría a médico auditor (bloquear para otros roles)

### POST /api/auditorias/:id/revertir-borrar
Revertir o eliminar auditoría
```json
{
    "accion": "1",
    "nota": "Motivo de la reversión"
}
```
- `accion`: "1"=revertir, "2"=borrar

---

## 🔧 ROLES Y PERMISOS

| **Rol** | **Descripción** | **Permisos Especiales** |
|---------|----------------|------------------------|
| **9** | Médico auditor | Solo ve auditorías bloqueadas (`/medicas`) |
| **10** | Auditor farmacéutico | Puede enviar a médico auditor |
| **Otros** | Usuarios estándar | Acceso completo según permisos |

---

## 🎯 FLUJO TÍPICO DE USO

### **Para Auditor Farmacéutico (Rol 10):**
1. **Login** → `POST /api/auth/login`
2. **Ver pendientes** → `GET /api/auditorias/pendientes`
3. **Seleccionar auditoría** → `GET /api/auditorias/:id`
4. **Opción A: Procesar** → `POST /api/auditorias/:id/procesar`
5. **Opción B: Enviar a médico** → `POST /api/auditorias/:id/enviar-medico`

### **Para Médico Auditor (Rol 9):**
1. **Login** → `POST /api/auth/login`
2. **Ver auditorías médicas** → `GET /api/auditorias/medicas`
3. **Seleccionar auditoría** → `GET /api/auditorias/:id`
4. **Procesar** → `POST /api/auditorias/:id/procesar`

---

## 🛠️ CORRECCIONES APLICADAS (v1.1)

### **❌ Problemas Resueltos:**
- **Error SQL**: `Unknown column 'e.estado'` → Corregido a `e.estado_auditoria`
- **Campo inexistente**: `e.observacion` → Removido de consultas
- **Falta endpoint**: Agregado `/api/auditorias/medicas` para médicos auditores

### **✅ Mejoras Implementadas:**
- Paginación en endpoints de listado
- Búsqueda mejorada con múltiples campos
- Control estricto de roles
- Normalización de nombres (Primera letra mayúscula)
- Manejo mejorado de errores

---

## 📝 NOTAS IMPORTANTES

- Todos los endpoints (excepto login y health) requieren JWT token
- Los filtros por rol se aplican automáticamente
- Las auditorías bloqueadas solo pueden ser vistas por médicos auditores
- El sistema mantiene compatibilidad completa con el PHP original
- **Fechas en formato DD-MM-YYYY**
- **Paginación disponible en listados principales**

---

## 🚀 EQUIVALENCIAS PHP → API

| **Archivo PHP** | **Endpoint API** | **Estado** |
|----------------|------------------|------------|
| `validar.php` | `POST /api/auth/login` | ✅ Funcionando |
| `auditar.php` | `GET /api/auditorias/pendientes` | ✅ Corregido |
| `historico_s.php` | `GET /api/auditorias/historicas` | ✅ Corregido |
| `historialpaciente_s.php` | `POST /api/auditorias/paciente` | ✅ Corregido |
| `audi_trataprolongado.php` | `GET /api/auditorias/:id` | ✅ Funcionando |
| `audi_grabar_s.php` | `POST /api/auditorias/:id/procesar` | 🔄 En desarrollo |
| `back_excel1.php` | `POST /api/auditorias/excel` | ✅ Funcionando |
| **NUEVO** | `GET /api/auditorias/medicas` | ✅ Agregado |

---

## 🏥 HEALTH CHECK

### GET /api/health
Verificar estado del servidor
```json
{
    "status": "OK",
    "message": "API funcionando correctamente",
    "timestamp": "2024-12-16T15:30:00.000Z"
}
```