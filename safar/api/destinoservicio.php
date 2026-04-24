<?php
require_once 'db_config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            $stmt = $conn->prepare("SELECT * FROM `safar_destinoservicio` WHERE `IdDestino` = ?");
            $stmt->execute([$_GET['id']]);
            echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
        } else {
            $stmt = $conn->query("SELECT * FROM `safar_destinoservicio`");
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        if ($data) {
            $cols = implode("`, `", array_keys($data));
            $placeholders = implode(", ", array_fill(0, count($data), "?"));
            $sql = "INSERT INTO `safar_destinoservicio` (`$cols`) VALUES ($placeholders)";
            $stmt = $conn->prepare($sql);
            try {
                $stmt->execute(array_values($data));
                echo json_encode(["message" => "Record created successfully", "id" => $conn->lastInsertId()]);
            } catch (Exception $e) {
                http_response_code(400);
                echo json_encode(["error" => $e->getMessage()]);
            }
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
        if ($data && isset($_GET['id'])) {
            $sets = [];
            foreach ($data as $key => $val) {
                $sets[] = "`$key` = ?";
            }
            $sql = "UPDATE `safar_destinoservicio` SET " . implode(", ", $sets) . " WHERE `IdDestino` = ?";
            $stmt = $conn->prepare($sql);
            $values = array_values($data);
            $values[] = $_GET['id'];
            try {
                $stmt->execute($values);
                echo json_encode(["message" => "Record updated successfully"]);
            } catch (Exception $e) {
                http_response_code(400);
                echo json_encode(["error" => $e->getMessage()]);
            }
        }
        break;

    case 'DELETE':
        if (isset($_GET['id'])) {
            $stmt = $conn->prepare("DELETE FROM `safar_destinoservicio` WHERE `IdDestino` = ?");
            try {
                $stmt->execute([$_GET['id']]);
                echo json_encode(["message" => "Record deleted successfully"]);
            } catch (Exception $e) {
                http_response_code(400);
                echo json_encode(["error" => $e->getMessage()]);
            }
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed"]);
        break;
}
?>
