#!/usr/bin/env node

/**
 * Script de automatización: Configurar permisos GPS para Android
 * Se ejecuta automáticamente después de "npx cap sync"
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MANIFEST_PATH = path.join(__dirname, '../android/app/src/main/AndroidManifest.xml');

// Permisos a inyectar
const GPS_PERMISSIONS = `
    <!-- ============================================ -->
    <!-- PERMISOS GPS BACKGROUND - Auto-inyectado    -->
    <!-- ============================================ -->
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_LOCATION" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    
    <uses-feature
        android:name="android.hardware.location.gps"
        android:required="false" />
    <uses-feature
        android:name="android.hardware.location.network"
        android:required="false" />
`;

// Servicio a inyectar dentro de <application>
const GPS_SERVICE = `
        <!-- Background Geolocation Service - Auto-inyectado -->
        <service
            android:name="com.getcapacitor.community.background.geolocation.BackgroundGeolocationService"
            android:enabled="true"
            android:exported="false"
            android:foregroundServiceType="location">
        </service>
`;

function setupAndroidGPS() {
  try {
    // Verificar si el archivo existe
    if (!fs.existsSync(MANIFEST_PATH)) {
      console.log('⚠️  AndroidManifest.xml no encontrado. Ejecuta "npx cap sync android" primero.');
      return;
    }

    // Leer el archivo
    let content = fs.readFileSync(MANIFEST_PATH, 'utf8');

    // PASO 1: Inyectar permisos antes de <application> si no existen
    if (!content.includes('ACCESS_BACKGROUND_LOCATION')) {
      const applicationIndex = content.indexOf('<application');
      
      if (applicationIndex === -1) {
        console.error('❌ No se encontró <application> en AndroidManifest.xml');
        return;
      }

      content = content.slice(0, applicationIndex) + GPS_PERMISSIONS + '\n    ' + content.slice(applicationIndex);
      console.log('✅ Permisos GPS inyectados en AndroidManifest.xml');
    } else {
      console.log('✅ Permisos GPS ya configurados en AndroidManifest.xml');
    }

    // PASO 2: Inyectar servicio dentro de <application> si no existe
    if (!content.includes('BackgroundGeolocationService')) {
      const applicationEndIndex = content.indexOf('</application>');
      
      if (applicationEndIndex === -1) {
        console.error('❌ No se encontró </application> en AndroidManifest.xml');
        return;
      }

      content = content.slice(0, applicationEndIndex) + GPS_SERVICE + '\n    ' + content.slice(applicationEndIndex);
      console.log('✅ Servicio GPS inyectado en AndroidManifest.xml');
    } else {
      console.log('✅ Servicio GPS ya configurado en AndroidManifest.xml');
    }

    // Guardar el archivo
    fs.writeFileSync(MANIFEST_PATH, content, 'utf8');

    console.log('📍 Configuración Android GPS completada');
    console.log('   - ACCESS_FINE_LOCATION');
    console.log('   - ACCESS_BACKGROUND_LOCATION');
    console.log('   - FOREGROUND_SERVICE_LOCATION');
    console.log('   - BackgroundGeolocationService');

  } catch (error) {
    console.error('❌ Error configurando Android GPS:', error.message);
    process.exit(1);
  }
}

// Ejecutar
setupAndroidGPS();
