# 📍 Configuración de GPS en Background - Guía de Instalación

## ✅ Paso 1: Instalar Dependencia (Ya completado)

```bash
npm install @capacitor-community/background-geolocation
```

## 📱 Paso 2: Configurar iOS

### 2.1 Abrir el proyecto en Xcode

```bash
npx cap open ios
```

### 2.2 Editar Info.plist

**Ruta:** `ios/App/App/Info.plist`

Agrega las siguientes claves DENTRO del tag `<dict>` principal:

```xml
<!-- Permisos de ubicación -->
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>Initeck Flota necesita acceso continuo a tu ubicación para rastrear tu ruta en tiempo real, incluso cuando la app está en segundo plano. Esto mejora la seguridad y permite monitoreo preciso.</string>

<key>NSLocationWhenInUseUsageDescription</key>
<string>Initeck Flota necesita acceso a tu ubicación para mostrarte en el mapa en tiempo real.</string>

<key>NSLocationAlwaysUsageDescription</key>
<string>Initeck Flota necesita acceso continuo a tu ubicación para rastreo en segundo plano y mejorar la seguridad.</string>

<!-- Background Modes -->
<key>UIBackgroundModes</key>
<array>
    <string>location</string>
    <string>fetch</string>
    <string>processing</string>
</array>
```

**Referencia completa:** Ve el archivo `config/ios-Info.plist.template`

## 🤖 Paso 3: Configurar Android

### 3.1 Abrir el proyecto en Android Studio

```bash
npx cap open android
```

### 3.2 Editar AndroidManifest.xml

**Ruta:** `android/app/src/main/AndroidManifest.xml`

#### A) Agregar permisos ANTES del tag `<application>`:

```xml
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_LOCATION" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
```

#### B) Agregar servicio DENTRO del tag `<application>`:

```xml
<service
    android:name="com.getcapacitor.community.background.geolocation.BackgroundGeolocationService"
    android:enabled="true"
    android:exported="false"
    android:foregroundServiceType="location">
</service>
```

**Referencia completa:** Ve el archivo `config/android-AndroidManifest.xml.template`

## 🔧 Paso 4: Sincronizar Capacitor

```bash
npx cap sync
```

## 🧪 Paso 5: Compilar y Probar

### iOS

```bash
npx cap run ios --target="tu-dispositivo"
```

### Android

```bash
npx cap run android --target="tu-dispositivo"
```

## ✅ Verificación

Al iniciar sesión con un rol operativo (employee, operator, cleaning, admin, development):

1. **Primera vez:** Aparecerá un prompt solicitando permiso de ubicación "Mientras se usa la app"
2. **Segunda vez:** Aparecerá un modal explicando por qué necesita "Permitir siempre"
3. **Aceptar:** Te redirigirá a Configuración para cambiar a "Permitir siempre"
4. **Resultado:** El rastreo GPS seguirá funcionando incluso con la app minizada o pantalla bloqueada

## 🐛 Troubleshooting

### iOS: No aparece el prompt de permisos

- Verifica que las claves en `Info.plist` estén correctamente escritas
- Borra la app del dispositivo y reinstala
- Revisa los logs en Xcode

### Android: No funciona en background

- Verifica que el servicio esté declarado en `AndroidManifest.xml`
- En Ajustes del dispositivo, verifica que la app tenga permitido ejecutarse en background
- Deshabilita optimización de batería para la app

### Permisos denegados

- El usuario debe ir manualmente a Configuración → Initeck Flota → Ubicación → "Permitir siempre"
- En el código, llamamos `BackgroundGeolocation.openSettings()` para facilitar esto

## 📊 Logs de Depuración

En consola verás:

```
📍 Iniciando rastreo GPS global (Background Mode)...
📍 Estado de permisos: granted
✅ Native GPS Watcher Started, ID: xxxxx
📍 Native GPS Signal: {latitude: xxx, longitude: xxx, speed: xxx}
```

## 💡 Mejoras Aplicadas

- ✅ Solicitud explícita de permisos "Always"
- ✅ Modal explicativo antes de pedir permisos
- ✅ Redirección automática a Configuración
- ✅ Mejor manejo de errores
- ✅ Logs informativos
- ✅ Configuración optimizada (distanceFilter: 10m)
