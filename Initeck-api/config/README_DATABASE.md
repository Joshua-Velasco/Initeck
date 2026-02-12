# Configuración de Base de Datos - Initeck API

## Overview

Tu sistema ahora soporta dos bases de datos:
- **tracker**: Base de datos local (para desarrollo)
- **initeckc_tracker**: Base de datos de producción (InfinityFree)

## Configuración Automática

El sistema detecta automáticamente el entorno:
- **Local** (localhost, 127.0.0.1, ::1) → usa `tracker`
- **Producción** → usa `initeckc_tracker`

## Uso del Sistema de Base de Datos

### 1. Configuración Automática (Recomendado)
```php
include_once 'config/database.php';
$database = new Database(); // Detecta automáticamente
$db = $database->getConnection();
```

### 2. Forzar Base de Datos Específica
```php
include_once 'config/database.php';

// Forzar base de datos local
$database = new Database('tracker');
$db = $database->getConnection();

// Forzar base de datos de producción
$database = new Database('initeckc_tracker');
$db = $database->getConnection();
```

### 3. Utilidades Disponibles

#### Obtener información de la base de datos actual:
```php
$database = new Database();
$info = $database->getDatabaseInfo();
// Retorna: ['host' => 'localhost', 'database' => 'tracker', 'username' => 'root']
```

#### Probar conexión:
```php
$database = new Database();
$result = $database->testConnection();
// Retorna: ['status' => 'success', 'message' => '...', 'database' => 'tracker']
```

## Endpoints de Prueba

Usa `database_utils.php` para probar conexiones:

### Probar todas las conexiones:
```
GET /config/database_utils.php?action=test_all
```

### Probar base de datos tracker:
```
GET /config/database_utils.php?action=test_tracker
```

### Probar base de datos initeckc_tracker:
```
GET /config/database_utils.php?action=test_initeckc_tracker
```

### Obtener información actual:
```
GET /config/database_utils.php?action=current_info
```

## Configuración de Credenciales

### Base de datos tracker (local):
- Host: localhost
- Database: tracker
- Username: root
- Password: (vacío)

### Base de datos initeckc_tracker (producción):
- Host: localhost
- Database: initeckc_tracker
- Username: initeckc_adminIniteck
- Password: iEiWA$&UdU704k5b

## Ejemplos de Uso en Archivos Existentes

### Login (auth/login.php):
```php
include_once "../../../config/database.php";
$database = new Database(); // Automático
$db = $database->getConnection();
```

### Para forzar una base de datos específica:
```php
include_once "../../../config/database.php";
$database = new Database('tracker'); // Forzar local
$db = $database->getConnection();
```

## Recomendaciones

1. **Desarrollo local**: Usa la configuración automática
2. **Producción**: Usa la configuración automática
3. **Pruebas**: Usa los endpoints de `database_utils.php`
4. **Migraciones**: Especifica la base de datos explícitamente si necesitas cambiar entre ellas

## Troubleshooting

Si tienes problemas de conexión:
1. Verifica que las bases de datos existan
2. Confirma las credenciales
3. Usa los endpoints de prueba para diagnosticar
4. Revisa los logs de error del servidor

## Notas Importantes

- El sistema mantiene compatibilidad con código existente
- No es necesario modificar todos los archivos existentes
- La configuración automática es la opción recomendada
- Las nuevas funcionalidades son opcionales
