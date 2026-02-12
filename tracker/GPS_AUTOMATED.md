# 🤖 Configuración GPS Automatizada

## ¿Qué hace esto?

Este sistema **inyecta automáticamente** las configuraciones de GPS en background en los archivos nativos de iOS y Android cada vez que sincronizas el proyecto con Capacitor.

**NO necesitas editar manualmente ningún archivo nativo.** Todo es automático.

---

## 🚀 Uso Rápido

### Sincronizar proyecto (automático)

```bash
npm run cap:sync
```

Este comando hará **automáticamente**:

1. ✅ `npx cap sync` - Sincroniza archivos web → nativo
2. ✅ Inyecta permisos GPS en `ios/App/App/Info.plist`
3. ✅ Inyecta permisos GPS en `android/app/src/main/AndroidManifest.xml`
4. ✅ Inyecta servicio de background en Android

### Compilar para producción (automático)

```bash
# iOS
npm run build:ios

# Android
npm run build:android
```

Ambos comandos ejecutan automáticamente `npm run setup:gps` después de compilar.

---

## 📝 Scripts Disponibles

| Comando                 | Descripción                                 |
| ----------------------- | ------------------------------------------- |
| `npm run setup:gps`     | Configura GPS en iOS y Android manualmente  |
| `npm run cap:sync`      | Sync + configuración GPS automática         |
| `npm run cap:build`     | Build + sync + configuración GPS automática |
| `npm run build:ios`     | Build + sync + GPS + abre Xcode             |
| `npm run build:android` | Build + sync + GPS + abre Android Studio    |

---

## 🔧 ¿Qué se inyecta?

### iOS (`Info.plist`)

- ✅ `NSLocationAlwaysAndWhenInUseUsageDescription`
- ✅ `NSLocationWhenInUseUsageDescription`
- ✅ `NSLocationAlwaysUsageDescription`
- ✅ `UIBackgroundModes` (location, fetch, processing)
- ✅ `BGTaskSchedulerPermittedIdentifiers`

### Android (`AndroidManifest.xml`)

- ✅ `ACCESS_FINE_LOCATION`
- ✅ `ACCESS_BACKGROUND_LOCATION`
- ✅ `FOREGROUND_SERVICE_LOCATION`
- ✅ `BackgroundGeolocationService` (servicio)

---

## ✨ Ventajas

1. **Cero configuración manual** - Los scripts detectan e inyectan automáticamente
2. **Idempotente** - Puedes ejecutar múltiples veces sin duplicar configuraciones
3. **Seguro** - Verifica que el archivo exista antes de modificarlo
4. **Multi-dispositivo** - Una vez configurado, funciona para todos los builds
5. **Versionable** - Los scripts están en Git, todos los devs tienen la misma config

---

## 🧪 Probar el GPS

1. **Sincronizar:**

   ```bash
   npm run cap:sync
   ```

2. **Compilar y abrir en IDE:**

   ```bash
   npm run build:ios
   # o
   npm run build:android
   ```

3. **Ejecutar en dispositivo físico** (GPS en background NO funciona en simuladores)

4. **Iniciar sesión** con un rol operativo (employee, operator, admin, etc.)

5. **Observar:**
   - Prompt pidiendo permisos de ubicación
   - Si no das "Siempre", modal explicativo aparece
   - Clic en "Sí" abre Configuración nativa
   - Cambiar a "Permitir siempre"
   - GPS funciona en background ✅

---

## 📂 Archivos del Sistema

```
tracker/
├── scripts/
│   ├── setup-gps.js           # Script maestro
│   ├── setup-ios-gps.js       # Configura iOS
│   └── setup-android-gps.js   # Configura Android
├── package.json               # Scripts npm actualizados
└── GPS_AUTOMATED.md           # Este archivo
```

---

## 🐛 Troubleshooting

### Los permisos no se inyectaron

```bash
# Ejecuta manualmente
npm run setup:gps
```

### Quiero ver qué se inyectó

```bash
# iOS
cat ios/App/App/Info.plist | grep -A 5 "NSLocationAlways"

# Android
cat android/app/src/main/AndroidManifest.xml | grep -A 3 "BACKGROUND_LOCATION"
```

### Quiero resetear y empezar de cero

```bash
# Borra carpetas nativas
rm -rf ios android

# Regenera todo
npm run cap:sync
```

---

## 💡 Notas Técnicas

### ¿Por qué Node.js y no Gradle/Podfile?

Los scripts Node.js son:

- ✅ Multi-plataforma (Windows, Mac, Linux)
- ✅ Fáciles de debugear
- ✅ No requieren conocimiento de Swift/Kotlin
- ✅ Se ejecutan del lado del proyecto web

### ¿Son seguros los scripts?

Sí:

- Solo modifican archivos dentro de `ios/` y `android/`
- Verifican que el archivo exista antes de modificar
- No duplican configuraciones (idempotentes)
- Todos los cambios son rastreables en Git

### ¿Funcionará con actualizaciones de Capacitor?

Sí, los scripts inyectan las configuraciones después de cada `cap sync`, por lo que incluso si actualizas Capacitor y regeneras las carpetas nativas, las configuraciones se aplican automáticamente.

---

## ✅ Checklist de Verificación

Antes de desplegar a producción:

- [ ] Ejecutaste `npm run cap:sync`
- [ ] Compilaste para iOS y Android
- [ ] Probaste en dispositivo físico (no simulador)
- [ ] Verificaste que el GPS pide permisos "Siempre"
- [ ] Confirmaste que el tracking funciona con app minimizada
- [ ] Confirmaste que el tracking funciona con pantalla bloqueada

---

**¡Listo!** Ahora la configuración GPS es 100% automática para todos tus dispositivos. 🎉
