<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
echo json_encode([
    "post_max_size" => ini_get('post_max_size'),
    "upload_max_filesize" => ini_get('upload_max_filesize'),
    "memory_limit" => ini_get('memory_limit')
]);
