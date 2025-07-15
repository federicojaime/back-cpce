# 📋 DOCUMENTACIÓN API - SISTEMA AUDITORÍAS CPCE

## 🔐 AUTENTICACIÓN

### POST /api/auth/login
Iniciar sesión y obtener JWT token
```json
{
    "username": "tu_usuario",
    "password": "tu_password"
}
```

### GET /api/auth/profile
Obtener perfil del usuario (requiere token)

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

### GET /api/auditorias/historicas
Obtener auditorías ya procesadas

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
Historial completo de un paciente
```json
{
    "dni": "12345678",
    "fechaDesde": "2024-01-01",
    "fechaHasta": "2024-12-31"
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

**Respuesta:**
```json
{
    "success": true,
    "auditoria": {
        "id": "123",
        "botonesDeshabilitados": false,
        "paciente": {
            "apellido": "Pérez",
            "nombre": "Juan",
            "dni": "12345678",
            "edad": 45,
            "sexo": "M",
            "talla": "175",
            "peso": "80"
        },
        "diagnostico": {
            "diagnostico": "Hipertensión arterial",
            "diagnostico2": "Historia clínica completa...",
            "fechaemision": "2024-12-01"
        },
        "medicamentos": [
            {
                "renglon": 1,
                "nombre": "Enalapril 10mg",
                "monodroga": "Enalapril maleato",
                "presentacion": "Comprimidos x 30",
                "cantprescripta": 2,
                "posologia": "1 comp cada 12 hs",
                "idreceta1": 123,
                "idreceta2": 124
            }
        ]
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

- **Rol 9**: Médico auditor (solo ve auditorías bloqueadas)
- **Rol 10**: Auditor farmacéutico (puede enviar a médico)
- **Otros roles**: Acceso completo

---

## 🎯 FLUJO TÍPICO DE USO

1. **Login** → Obtener token
2. **Ver pendientes** → `GET /api/auditorias/pendientes`
3. **Seleccionar auditoría** → `GET /api/auditorias/:id`
4. **Procesar** → `POST /api/auditorias/:id/procesar`
5. **O enviar a médico** → `POST /api/auditorias/:id/enviar-medico`

---

## 📝 NOTAS IMPORTANTES

- Todos los endpoints (excepto login y health) requieren JWT token
- Los filtros por rol se aplican automáticamente
- Las auditorías bloqueadas solo pueden ser vistas por médicos auditores
- El sistema mantiene compatibilidad completa con el PHP original

---

## 🚀 EQUIVALENCIAS PHP → API

| **Archivo PHP** | **Endpoint API** | **Función** |
|----------------|------------------|-------------|
| `validar.php` | `POST /api/auth/login` | Login |
| `auditar.php` | `GET /api/auditorias/pendientes` | Pendientes |
| `historico_s.php` | `GET /api/auditorias/historicas` | Históricas |
| `audi_trataprolongado.php` | `GET /api/auditorias/:id` | Datos para auditar |
| `audi_grabar_s.php` | `POST /api/auditorias/:id/procesar` | Procesar auditoría |
| `back_excel1.php` | `POST /api/auditorias/excel` | Generar Excel |
