<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "Testing auth include...\n";
$cors_path = '../config/cors.php';
echo "Path: " . realpath($cors_path) . "\n";

if (file_exists($cors_path)) {
    echo "Found cors.php\n";
    require_once $cors_path;
} else {
    echo "cors.php NOT FOUND\n";
}

echo "Headers:\n";
print_r(headers_list());
?>
