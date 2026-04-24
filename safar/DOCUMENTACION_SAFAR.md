# Sistema de Gestión Safar - Documentación Completa

## 📋 Resumen

Sistema mejorado de gestión de viajes Safar para la flota de Initeck. Implementa:

1. **Registro de cobros por viaje** - Control total de efectivo cobrado vs esperado
2. **Panel de finanzas Safar** - Separado de Uber para reconciliación
3. **Agenda tipo Cinema** - Visualización de capacidad por chofer (salas = choferes)
4. **Panel persistente de viaje activo** - Siempre visible, optimizado para conducción segura
5. **Modo conducción** - Botones grandes (≥48px) para uso seguro mientras se conduce

---

## 🗄️ 1. Instalación de Base de Datos

### Paso 1: Ejecutar el script SQL

```bash
# En tu servidor MySQL o desde phpMyAdmin, ejecuta:
mysql -u root initeckc_tracker < /Volumes/Dev/XAMPP_External/xamppfiles/htdocs/initeck-flota/safar/api/sql/install_safar_management.sql
```

O manualmente en phpMyAdmin:
1. Abre phpMyAdmin
2. Selecciona la base de datos `initeckc_tracker`
3. Ve a la pestaña "SQL"
4. Copia y pega el contenido de `install_safar_management.sql`
5. Ejecuta

### Tablas creadas:

**`safar_cobros_efectivo`**
- Registra cada cobro de efectivo realizado por los choferes
- Campos principales:
  - `id_orden_servicio`: Viaje asociado
  - `codigo_chofer`: Chofer que cobró
  - `monto_cobrado`: Lo que el chofer reporta haber cobrado
  - `monto_esperado`: Lo que el sistema dice que debía cobrar
  - `incidencia`: Tipo de incidencia (NINGUNA, CLIENTE_NO_PAGO, etc.)
  - `observaciones`: Notas adicionales

**`safar_chofer_config`**
- Configuración de capacidad por chofer
- Campos principales:
  - `max_viajes_simultaneos`: Máximo de viajes en una ventana de tiempo (default: 3)
  - `ventana_minutos`: Ventana en minutos para considerar "simultáneo" (default: 90)

---

## 📁 2. Archivos Creados

### Backend PHP (en `/safar/api/`)

| Archivo | Función |
|---------|---------|
| `registrar_cobro_efectivo.php` | Registra el cobro de un viaje completado |
| `chofer_finanzas_safar.php` | Obtiene finanzas del chofer (separado de Uber) |
| `agenda_con_capacidad.php` | Agenda general con indicador de carga por chofer |
| `sql/install_safar_management.sql` | Script de instalación de tablas |

### Frontend React (en `/tracker/src/components/Empleados_User/SubComponents/`)

| Archivo | Función |
|---------|---------|
| `CobroModal.jsx` | Modal obligatorio para registrar cobro al finalizar viaje |
| `SafarFinanzas.jsx` | Panel de finanzas Safar (separado de Uber) |
| `DriverCapacityGrid.jsx` | Vista tipo cinema (choferes = salas) |
| `PersistentTripBar.jsx` | Banner fijo de viaje activo optimizado |
| `SafarViajes.jsx` | **Modificado** - Integración de todos los componentes |

---

## 🚀 3. Cómo Funciona Cada Módulo

### 3.1 Registro de Cobro por Viaje

**Flujo:**
1. Chofer completa un viaje (estatus: INICIADO → SOLICITAR_PAGO)
2. Se abre automáticamente `CobroModal`
3. Modal muestra:
   - Método de pago del viaje (Stripe, Efectivo, Depósito+Efectivo)
   - Monto esperado a cobrar (calculado automáticamente)
   - Campo para ingresar monto cobrado
   - Selector de incidencias (6 opciones)
   - Campo de observaciones
4. Chofer confirma el cobro
5. Se registra en `safar_cobros_efectivo`
6. Viaje se marca como COMPLETADO
7. Chofer puede aceptar otro viaje

**Incidencias disponibles:**
- ✅ **NINGUNA** - Cobro normal sin problemas
- 💳 **PAGADO_PREVIAMENTE** - Cliente ya había pagado
- ❌ **CLIENTE_NO_PAGO** - Cliente no pagó
- ⚠️ **CLIENTE_RECHAZO** - Cliente rechazó el cobro
- 💰 **MONTO_INCORRECTO** - El monto no coincide
- 📝 **OTRO** - Otra situación

### 3.2 Panel de Finanzas Safar

**Ubicación:** Pestaña "Mis Cobros" en SafarViajes.jsx

**Muestra:**
- Total cobrado en efectivo (hoy, semana, mes)
- Monto esperado vs monto real cobrado
- Diferencia (sobrante o faltante)
- Viajes completados con estado de cobro
- Alertas de viajes sin cobro registrado
- Incidencias reportadas
- Total pagado con Stripe (no pasa por chofer)

**Filtros:**
- Hoy
- Esta Semana
- Este Mes
- Rango personalizado (fecha_inicio, fecha_fin)

### 3.3 Agenda Tipo Cinema

**Concepto:** Cada chofer es una "sala de cine", los viajes son "asientos"

**Visualización:**
- **Filas:** Franjas horarias (00:00 a 23:00)
- **Columnas:** Choferes registrados
- **Celdas:** Viajes asignados a ese chofer en esa hora

**Código de colores:**
- 🟢 **Verde claro:** Chofer libre en esa hora
- 🟡 **Amarillo:** Chofer con 1-2 viajes (ocupado)
- 🔴 **Rojo claro:** Chofer saturado (≥max_viajes_simultaneos)

**Interacción:**
- Click en un viaje para ver detalles
- Navegación por día (flechas izquierda/derecha)
- Leyenda superior con total de choferes y viajes

### 3.4 Panel Persistente de Viaje Activo

**Comportamiento:**
- Siempre visible en la parte inferior de la pantalla
- Se puede minimizar pero **nunca desaparece**
- Muestra información crítica sin distracciones

**Elementos visibles:**
1. **Folio del viaje** + estatus actual
2. **Destino** con botón GPS (abre Google Maps)
3. **Monto a cobrar** (si aplica)
4. **Botones de acción:**
   - 📞 Llamar pasajero
   - 💬 WhatsApp pasajero
   - Botón de estado (EN CAMINO → LLEGUÉ → INICIAR → FINALIZAR)

**Modo Conducción (Driving Mode):**
- Todos los botones ≥48px (accesible para uso seguro)
- Sin mapas complejos
- Sin historial ni tabs
- Solo información esencial

---

## 🔧 4. Configuración

### 4.1 Configurar Capacidad por Chofer

```sql
-- Actualizar máximo de viajes simultáneos para un chofer
UPDATE safar_chofer_config 
SET max_viajes_simultaneos = 4, ventana_minutos = 120
WHERE codigo_chofer = 'chofer_usuario';

-- Ver configuración actual
SELECT * FROM safar_chofer_config;
```

### 4.2 Endpoint de Finanzas - Parámetros

```
GET /initeck-flota/safar/api/chofer_finanzas_safar.php
Params:
  - codigoChofer (requerido): Código del chofer
  - periodo (opcional): 'hoy' | 'semana' | 'mes'
  - fecha_inicio (opcional): 'YYYY-MM-DD'
  - fecha_fin (opcional): 'YYYY-MM-DD'
```

### 4.3 Endpoint de Agenda con Capacidad - Parámetros

```
GET /initeck-flota/safar/api/agenda_con_capacidad.php
Params:
  - dias (opcional): Días hacia adelante (default: 7)
  - ventana_minutos (opcional): Ventana para "simultáneo" (default: 90)
```

---

## 📊 5. API Endpoints - Detalles

### POST `/registrar_cobro_efectivo.php`

**Request:**
```json
{
  "IdOrdenServicio": 123,
  "CodigoChofer": "chofer_001",
  "MontoCobrado": 150.00,
  "Incidencia": "NINGUNA",
  "Observaciones": ""
}
```

**Response (éxito):**
```json
{
  "success": true,
  "message": "Cobro registrado correctamente.",
  "cobro_id": 45,
  "monto_esperado": 150.00,
  "monto_cobrado": 150.00,
  "diferencia": 0.00
}
```

**Response (error):**
```json
{
  "success": false,
  "message": "Ya se registró un cobro para este viaje."
}
```

### GET `/chofer_finanzas_safar.php`

**Response:**
```json
{
  "success": true,
  "periodo": {
    "desde": "2024-04-15 00:00:00",
    "hasta": "2024-04-15 23:59:59",
    "etiqueta": "hoy"
  },
  "resumen": {
    "total_viajes_completados": 5,
    "total_cobrado_esperado": 750.00,
    "total_cobrado_real": 745.00,
    "diferencia": -5.00,
    "cobrado_efectivo": 745.00,
    "pagado_stripe": 1200.00,
    "incidencia_count": 0,
    "viajes_sin_cobro": 1
  },
  "viajes": [...],
  "sin_cobro": [...]
}
```

---

## ⚠️ 6. Validaciones y Seguridad

### El sistema valida:

1. **No doble cobro:** Un viaje solo puede registrar cobro una vez
2. **Estado del viaje:** Solo se puede cobrar cuando el viaje está COMPLETADO o SOLICITAR_PAGO
3. **Cálculo automático:** El monto esperado se calcula según el método de pago:
   - **STRIPE:** $0.00 (ya pagado)
   - **EFECTIVO:** Monto total
   - **EFECTIVO_DEPOSITO:** Monto total - depósito

### Reconciliación:

El sistema compara:
- Lo que el chofer reporta haber cobrado
- Lo que el sistema calcula que debía cobrar
- Genera alertas si hay diferencias

---

## 🎯 7. Flujo de Usuario Completo

### Escenario: Chofer con 3 viajes en el día

```
┌─────────────────────────────────────────────────┐
│ 1. Chofer inicia sesión en Tracker               │
│ 2. Va a pestaña SAFAR                            │
│ 3. Ve "Mis Viajes" con 3 viajes próximos        │
│ 4. Primer viaje: click "EN CAMINO"              │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 5. Aparece PersistentTripBar en la parte inferior│
│    - Siempre visible                             │
│    - Muestra destino, botones grandes            │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 6. Chofer llega al origen → click "LLEGUÉ"      │
│ 7. Pasajero aborda → click "INICIAR"            │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 8. Chofer llega a destino → click "FINALIZAR"   │
│ 9. Se abre CobroModal automáticamente           │
│ 10. Modal muestra:                              │
│     - Método: EFECTIVO_DEPOSITO                 │
│     - Depósito: $45.00 (30%)                    │
│     - Total: $150.00                            │
│     - A cobrar: $105.00                         │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 11. Chofer cobra $105.00 al pasajero            │
│ 12. Ingresa "$105.00" en el modal               │
│ 13. Selecciona incidencia: "NINGUNA"            │
│ 14. Click "Confirmar Cobro"                     │
│ 15. Sistema registra en safar_cobros_efectivo   │
│ 16. Viaje se marca como COMPLETADO              │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 17. Chofer puede ver sus finanzas en            │
│     pestaña "Mis Cobros"                        │
│ 18. Puede ver la agenda completa en             │
│     "Agenda Cinema" para ver disponibilidad     │
└─────────────────────────────────────────────────┘
```

---

## 🐛 8. Troubleshooting

### Problema: "Ya se registró un cobro para este viaje"

**Causa:** El chofer ya confirmó el cobro anteriormente.

**Solución:**
```sql
-- Verificar cobros registrados para un viaje
SELECT * FROM safar_cobros_efectivo 
WHERE id_orden_servicio = 123;

-- Si necesitas borrar un cobro incorrecto (solo admin):
DELETE FROM safar_cobros_efectivo WHERE id = 45;
```

### Problema: "El viaje no está en estado de completarse"

**Causa:** El viaje aún no tiene estatus INICIADO o SOLICITAR_PAGO.

**Solución:** Asegúrate de seguir el flujo de estados:
`PENDIENTE → EN_CAMINO → LLEGADO → INICIADO → SOLICITAR_PAGO → COMPLETADO`

### Problema: No se ven choferes en Agenda Cinema

**Causa:** No hay choferes con `vehiculo_id` asignado.

**Solución:**
```sql
-- Verificar choferes registrados
SELECT e.id, e.nombre_completo, v.unidad_nombre, u.usuario
FROM empleados e
LEFT JOIN vehiculos v ON e.vehiculo_id = v.id
LEFT JOIN usuarios u ON e.id = u.empleado_id
WHERE e.rol IN ('employee', 'operator');

-- Asignar vehículo a un chofer
UPDATE empleados SET vehiculo_id = 5 WHERE id = 12;
```

---

## 📱 9. Accesibilidad y Seguridad Vial

### Botones ≥48px

Todos los botones en el panel de viaje activo cumplen con las recomendaciones de accesibilidad para uso en movimiento:

- **Llamar pasajero:** 56x56px
- **WhatsApp:** 56x56px
- **Botón de estado:** 56px de alto, texto grande
- **GPS:** 48x48px

### Modo Conducción

Cuando hay un viaje activo:
- No se muestran distractores (tabs, historial, gráficos)
- Solo 3 elementos visibles: destino, contacto, estado
- Colores de alto contraste para visibilidad rápida
- Feedback táctil en botones

---

## 📈 10. Métricas y Reportes

### Desde el panel de finanzas, el administrador puede:

1. **Ver diferencias de cobro:** ¿Cuánto cobró el chofer vs cuánto debía cobrar?
2. **Alertas de viajes sin cobro:** Viajes completados pero sin registro de cobro
3. **Incidencias:** Tipos y frecuencia de problemas reportados
4. **Comparativa por periodo:** Hoy, semana, mes

### Consultas SQL útiles para admin:

```sql
-- Choferes con mayores diferencias
SELECT 
    ce.codigo_chofer,
    e.nombre_completo,
    COUNT(*) AS total_cobros,
    SUM(ce.monto_cobrado) AS total_cobrado,
    SUM(ce.monto_esperado) AS total_esperado,
    SUM(ce.monto_cobrado - ce.monto_esperado) AS diferencia
FROM safar_cobros_efectivo ce
LEFT JOIN usuarios u ON ce.codigo_chofer = u.usuario
LEFT JOIN empleados e ON u.empleado_id = e.id
WHERE ce.fecha_cobro >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY ce.codigo_chofer
ORDER BY ABS(diferencia) DESC;

-- Viajes con incidencias esta semana
SELECT 
    ce.*,
    os.Folio,
    os.MontoFinal
FROM safar_cobros_efectivo ce
JOIN safar_OrdenServicio os ON ce.id_orden_servicio = os.IdOrdenServicio
WHERE ce.incidencia != 'NINGUNA'
  AND ce.fecha_cobro >= DATE_SUB(NOW(), INTERVAL 7 DAY)
ORDER BY ce.fecha_cobro DESC;
```

---

## ✅ Checklist de Instalación

- [ ] Ejecutar script SQL `install_safar_management.sql`
- [ ] Verificar que las tablas `safar_cobros_efectivo` y `safar_chofer_config` existen
- [ ] Confirmar que los archivos PHP están en `/safar/api/`
- [ ] Confirmar que los archivos JSX están en `/tracker/src/components/Empleados_User/SubComponents/`
- [ ] Verificar que `SafarViajes.jsx` tiene los imports actualizados
- [ ] Probar flujo completo: crear viaje → aceptar → iniciar → finalizar → registrar cobro
- [ ] Verificar que el panel de finanzas muestra datos correctos
- [ ] Verificar que la agenda cinema muestra choferes y viajes
- [ ] Verificar que el panel persistente aparece con viaje activo

---

## 📞 Soporte

Para dudas o problemas, contactar al equipo de desarrollo de Initeck.

**Versión:** 1.0.0  
**Fecha:** Abril 2025  
**Autor:** Sistema de Gestión Safar
