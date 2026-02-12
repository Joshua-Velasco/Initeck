<?php
// Mock environment for CLI debugging
$_SERVER['REQUEST_METHOD'] = 'GET';
$_SERVER['HTTP_ORIGIN'] = 'http://localhost';
$_GET['id'] = 13; // ID from the error log

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include the target script
require 'c:\xampp\htdocs\Inimovil\Initeck-api\v1\empleados\monitor_stats.php';
?>
