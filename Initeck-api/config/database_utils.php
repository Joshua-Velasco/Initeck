<?php

include_once 'database.php';

/**
 * Función para obtener conexión a una base de datos específica
 */
function getDatabaseConnection($database_type = null) {
    $database = new Database($database_type);
    return $database->getConnection();
}

/**
 * Función para probar ambas conexiones a bases de datos
 */
function testAllConnections() {
    $results = [];
    
    // Probar base de datos tracker
    $db_tracker = new Database('tracker');
    $results['tracker'] = $db_tracker->testConnection();
    
    // Probar base de datos initeckc_tracker
    $db_initeck = new Database('initeckc_tracker');
    $results['initeckc_tracker'] = $db_initeck->testConnection();
    
    return $results;
}

/**
 * Función para obtener información de la base de datos actual
 */
function getCurrentDatabaseInfo() {
    $database = new Database();
    return $database->getDatabaseInfo();
}

// Endpoint para probar conexiones
if (isset($_GET['action'])) {
    switch ($_GET['action']) {
        case 'test_all':
            echo json_encode(testAllConnections());
            break;
            
        case 'test_tracker':
            $db = new Database('tracker');
            echo json_encode($db->testConnection());
            break;
            
        case 'test_initeckc_tracker':
            $db = new Database('initeckc_tracker');
            echo json_encode($db->testConnection());
            break;
            
        case 'current_info':
            echo json_encode(getCurrentDatabaseInfo());
            break;
            
        default:
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Acción no válida']);
    }
}
?>
