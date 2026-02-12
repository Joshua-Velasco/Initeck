#!/usr/bin/env node

/**
 * Script maestro: Configura automáticamente GPS en iOS y Android
 * Se ejecuta después de "npx cap sync"
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('\n🚀 Configurando permisos GPS automáticamente...\n');

try {
  // Ejecutar script de iOS
  console.log('📱 Configurando iOS...');
  execSync('node ' + join(__dirname, 'setup-ios-gps.js'), { stdio: 'inherit' });
  
  console.log('\n');
  
  // Ejecutar script de Android
  console.log('🤖 Configurando Android...');
  execSync('node ' + join(__dirname, 'setup-android-gps.js'), { stdio: 'inherit' });
  
  console.log('\n✅ ¡Configuración GPS completada exitosamente!');
  console.log('💡 Ahora puedes compilar la app para iOS/Android sin configuración manual.\n');

} catch (error) {
  console.error('\n❌ Error en la configuración automática:', error.message);
  process.exit(1);
}
