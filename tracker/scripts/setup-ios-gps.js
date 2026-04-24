#!/usr/bin/env node

/**
 * Script de automatización: Configurar permisos GPS para iOS
 * Se ejecuta automáticamente después de "npx cap sync"
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const INFO_PLIST_PATH = path.join(__dirname, '../ios/App/App/Info.plist');

// Configuraciones a inyectar
const GPS_PERMISSIONS = `
	<!-- ============================================ -->
	<!-- PERMISOS DE UBICACIÓN BACKGROUND GPS         -->
	<!-- Agregado automáticamente por scripts/setup-ios-gps.js -->
	<!-- ============================================ -->
	
	<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
	<string>Initeck Flota necesita acceso continuo a tu ubicación para rastrear tu ruta en tiempo real, incluso cuando la app está en segundo plano. Esto mejora la seguridad y permite monitoreo preciso.</string>
	
	<key>NSLocationWhenInUseUsageDescription</key>
	<string>Initeck Flota necesita acceso a tu ubicación para mostrarte en el mapa en tiempo real.</string>
	
	<key>NSLocationAlwaysUsageDescription</key>
	<string>Initeck Flota necesita acceso continuo a tu ubicación para rastreo en segundo plano y mejorar la seguridad.</string>
	
	<key>UIBackgroundModes</key>
	<array>
		<string>location</string>
		<string>fetch</string>
		<string>processing</string>
		<string>audio</string>
	</array>
	
	<key>BGTaskSchedulerPermittedIdentifiers</key>
	<array>
		<string>com.initeck.flota.refresh</string>
	</array>`;

function setupIOSGPS() {
  try {
    // Verificar si el archivo existe
    if (!fs.existsSync(INFO_PLIST_PATH)) {
      console.log('⚠️  Info.plist no encontrado. Asegúrate de ejecutar "npx cap sync ios" primero.');
      return;
    }

    // Leer el archivo
    let content = fs.readFileSync(INFO_PLIST_PATH, 'utf8');

    // Verificar si ya está configurado
    if (content.includes('NSLocationAlwaysAndWhenInUseUsageDescription')) {
      console.log('✅ iOS GPS ya está configurado en Info.plist');
      return;
    }

    // Encontrar el último </dict> antes de </plist>
    const lastDictIndex = content.lastIndexOf('</dict>');
    
    if (lastDictIndex === -1) {
      console.error('❌ No se pudo encontrar </dict> en Info.plist');
      return;
    }

    // Insertar las configuraciones antes del último </dict>
    content = content.slice(0, lastDictIndex) + GPS_PERMISSIONS + '\n' + content.slice(lastDictIndex);

    // Guardar el archivo
    fs.writeFileSync(INFO_PLIST_PATH, content, 'utf8');

    console.log('✅ Configuración GPS inyectada en iOS Info.plist');
    console.log('📍 Permisos agregados:');
    console.log('   - NSLocationAlwaysAndWhenInUseUsageDescription');
    console.log('   - NSLocationWhenInUseUsageDescription');
    console.log('   - UIBackgroundModes (location, fetch, processing)');

  } catch (error) {
    console.error('❌ Error configurando iOS GPS:', error.message);
    process.exit(1);
  }
}

// Ejecutar
setupIOSGPS();
