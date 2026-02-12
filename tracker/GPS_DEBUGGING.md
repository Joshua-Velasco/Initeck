# Guía de Diagnóstico GPS - Problemas de Sincronización

## Problema Reportado

La ubicación desde móvil no aparece en el mapa, y hay desfase de datos entre web y móvil.

## Diagnóstico

### 1. Verificar que el GPS esté enviando datos

**En la app móvil (Capacitor), abre la consola de desarrollo y busca:**

```
📍 Iniciando rastreo GPS global (Background Mode)...
📍 Iniciando Background Geolocation con permisos mejorados...
📍 Estado de permisos actual: granted
✅ Native GPS Watcher Started, ID: xxxxx
📍 Native GPS Signal: {latitude: xxx, longitude: xxx, speed: xxx}
```

Si NO ves estos mensajes:

- ⚠️ El plugin nativo no está funcionando
- Verifica que ejecutaste `npm run cap:sync`
- Reconstruye la app para dispositivo

### 2. Verificar que los datos se envían al backend

**Busca en consola:**

```
🛰️ Enviando ubicación al servidor...
```

Si ves errores como:

```
🛰️ Error envío GPS: 400
🛰️ Fallo red GPS: ...
```

Entonces el problema está en:

- **Usuario ID incorrecto** - Verifica `user.usuario_id` y `user.id`
- **Backend no acepta los datos** - Revisa el formato del POST request

### 3. Verificar IDs del usuario

**En TrackingProvider.jsx, línea 116:**

```javascript
empleado_id: user.id,
usuario_id: user.usuario_id,
```

**PROBLEMA COMÚN:** Si `user.id` o `user.usuario_id` son `undefined` o incorrectos, el backend rechaza la ubicación.

**Solución:** Agrega logs temporales:

```javascript
console.log("📍 IDs para tracking:", {
  empleado_id: user.id,
  usuario_id: user.usuario_id,
  nombre: user.nombre,
});
```

### 4. Verificar API endpoint

**Backend debe aceptar:**

```json
{
  "empleado_id": 123,
  "usuario_id": 456,
  "latitud": 31.7619,
  "longitud": -106.485,
  "velocidad": 0
}
```

**URL:** `EMPLEADOS_UPDATE_LOCATION_URL` en `/src/config.js`

---

## Soluciones Rápidas

### ¿Los datos SÍ se están actualizando automáticamente?

**SÍ**, cada:

- **3 segundos** - Ubicaciones de empleados
- **15 segundos** - Eventos, liquidaciones, dashboard

**Además ahora tienes:**

- ✅ **Pull-to-refresh** - Jala hacia abajo en Lista/Actividad
- ✅ **Botón manual** - Ícono de refresh en el header

### ¿El mapa no muestra tu ubicación desde móvil?

**Checklist:**

1. **¿Diste permisos "Always Allow"?**
   - iOS: Ajustes → Initeck Flota → Ubicación → Permitir siempre
   - Android: Ajustes → Apps → Initeck Flota → Permisos → Ubicación → Permitir todo el tiempo

2. **¿El GPS está activo?**
   - Revisa que la señal GPS esté funcionando en tu dispositivo

3. **¿Los IDs son correctos?**
   - Verifica `console.log` que `user.id` y `user.usuario_id` tengan valores

4. **¿El backend responde OK?**
   - Revisa Network tab en inspector para ver si POST a `/update-location` retorna 200

---

## Pull-to-Refresh: Cómo Usar

### En Móvil:

1. Ve a cualquier tab (Lista, Actividad, Mapa)
2. **Opción 1:** Desliza hacia abajo cuando estás en el tope de la lista
3. **Opción 2:** Tap en el ícono de refresh (🔄) en el header
4. Verás un spinner rojo mientras carga
5. Los datos se actualizan inmediatamente

### Funcionalidad:

- ✅ Actualiza ubicaciones inmediatamente
- ✅ Actualiza eventos, liquidaciones, dashboard
- ✅ Visual feedback con spinner animado
- ✅ No permite doble-refresh (botón disabled durante refresh)

---

## Próximos Pasos

1. **Probar en dispositivo físico:**

   ```bash
   npm run build:ios
   # o
   npm run build:android
   ```

2. **Verificar consola durante la app:**
   - Conecta el dispositivo
   - Abre Safari/Chrome DevTools
   - Revisa mensajes de GPS

3. **Revisar IDs de usuario:**
   - Temporalmente agrega logs en `TrackingProvider.jsx`
   - Verifica que `empleado_id` y `usuario_id` sean correctos

4. **Testear pull-to-refresh:**
   - En tab "Lista", jala hacia abajo
   - Verifica que aparezca el spinner
   - Confirma que los datos se actualicen

---

## Resumen de Cambios

### ✅ Lo que agregué:

1. **Pull-to-refresh** en móvil (Lista, Actividad, Mapa)
2. **Botón manual de refresh** con ícono animado
3. **Visual feedback** con spinners durante loading
4. **Refactorización** de funciones fetch para reutilización
5. **Estado de refreshing** para prevenir doble-refresh

### 📊 Intervalos de actualización:

- **Ubicaciones:** Cada 3 segundos (automático)
- **Eventos/Dashboard:** Cada 15 segundos (automático)
- **Manual:** Pull-to-refresh o botón (inmediato)

### 🐛 Debugging GPS:

Si la ubicación no aparece, el problema MÁS PROBABLE es:

- **IDs incorrectos** → Verificar `user.id` y `user.usuario_id`
- **Permisos denegados** → Cambiar a "Always Allow"
- **Backend rechaza datos** → Revisar formato del POST request
