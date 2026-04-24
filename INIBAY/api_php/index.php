<?php
// index.php
require_once 'config.php';
header("Content-Type: application/json");

$database = new Database();
$conn = $database->getConnection();

$request_uri = $_SERVER['REQUEST_URI'];
$parsed_url = parse_url($request_uri);
$path = $parsed_url['path'];

if (isset($_SERVER['PATH_INFO'])) {
    $path = $_SERVER['PATH_INFO'];
} else if (isset($_SERVER['REDIRECT_URL'])) {
    $path = $_SERVER['REDIRECT_URL'];
}

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

// ----------------------------------------------------
// AUTENTICACIÓN
// ----------------------------------------------------

if (preg_match('/\/api\/auth\/register/', $path)) {
    if ($method === 'POST') {
        $username   = $input['username']   ?? '';
        $password   = $input['password']   ?? '';
        $admin_code = $input['admin_code'] ?? '';

        if (empty($username) || empty($password) || empty($admin_code)) {
            http_response_code(400);
            echo json_encode(["error" => "Todos los campos son obligatorios"]);
            exit;
        }

        if ($admin_code !== 'streamingLuis') {
            http_response_code(403);
            echo json_encode(["error" => "Código de autorización inválido"]);
            exit;
        }

        try {
            $checkStmt = $conn->prepare("SELECT id FROM usuarios_admin WHERE username = ?");
            $checkStmt->execute([$username]);
            if ($checkStmt->fetch()) {
                http_response_code(409);
                echo json_encode(["error" => "El usuario ya existe"]);
                exit;
            }

            $password_hash = password_hash($password, PASSWORD_DEFAULT);
            $insertStmt = $conn->prepare("INSERT INTO usuarios_admin (username, password_hash) VALUES (?, ?)");
            $insertStmt->execute([$username, $password_hash]);
            echo json_encode(["success" => true, "message" => "Usuario registrado exitosamente"]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "Error del servidor al registrarse", "details" => $e->getMessage()]);
        }
        exit;
    }
}

if (preg_match('/\/api\/auth\/login/', $path)) {
    if ($method === 'POST') {
        $username = $input['username'] ?? '';
        $password = $input['password'] ?? '';

        if (empty($username) || empty($password)) {
            http_response_code(400);
            echo json_encode(["error" => "Usuario y contraseña son requeridos"]);
            exit;
        }

        try {
            $stmt = $conn->prepare("SELECT id, username, password_hash FROM usuarios_admin WHERE username = ?");
            $stmt->execute([$username]);
            $user = $stmt->fetch();

            if ($user && password_verify($password, $user['password_hash'])) {
                echo json_encode([
                    "success" => true,
                    "token"   => "INIBAY_REAL_TOKEN_MOCK_" . $user['id'],
                    "user"    => ["id" => $user['id'], "username" => $user['username']]
                ]);
            } else {
                http_response_code(401);
                echo json_encode(["error" => "Credenciales incorrectas"]);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "Error del servidor", "details" => $e->getMessage()]);
        }
        exit;
    }
}

// ----------------------------------------------------
// DASHBOARD
// ----------------------------------------------------

if (preg_match('/\/api\/dashboard\/stats/', $path)) {
    if ($method === 'GET') {
        $mes_actual  = (int) date('n');
        $anio_actual = (int) date('Y');

        $clientsStmt = $conn->query("SELECT COUNT(*) as total FROM clientes");
        $subsStmt    = $conn->query("SELECT COUNT(*) as active FROM suscripciones WHERE estatus = 1");
        $revStmt     = $conn->query("SELECT SUM(costo) as revenue FROM suscripciones WHERE estatus = 1");

        $cobradoStmt = $conn->prepare("
            SELECT SUM(COALESCE(p.monto, s.costo)) as cobrado
            FROM pagos p
            JOIN suscripciones s ON p.suscripcion_id = s.id
            WHERE p.mes = ? AND p.anio = ? AND p.pagado = 1
        ");
        $cobradoStmt->execute([$mes_actual, $anio_actual]);

        $pendienteStmt = $conn->prepare("
            SELECT COUNT(s.id) as pendientes, SUM(s.costo) as monto_pendiente
            FROM suscripciones s
            WHERE s.estatus = 1 AND (s.vip = 0 OR s.vip IS NULL)
            AND s.id NOT IN (
                SELECT suscripcion_id FROM pagos WHERE mes = ? AND anio = ? AND pagado = 1
            )
        ");
        $pendienteStmt->execute([$mes_actual, $anio_actual]);

        $clients   = $clientsStmt->fetch();
        $subs      = $subsStmt->fetch();
        $rev       = $revStmt->fetch();
        $cobrado   = $cobradoStmt->fetch();
        $pendiente = $pendienteStmt->fetch();

        // Distribución por servicio
        $distSrvStmt = $conn->query("SELECT tipo_servicio as name, COUNT(*) as value FROM suscripciones WHERE estatus = 1 GROUP BY tipo_servicio");
        $distSrv = $distSrvStmt->fetchAll(PDO::FETCH_ASSOC);

        // Estado de pagos
        $pagados_count = $conn->prepare("SELECT COUNT(DISTINCT suscripcion_id) FROM pagos WHERE mes = ? AND anio = ? AND pagado = 1");
        $pagados_count->execute([$mes_actual, $anio_actual]);
        $count_p = (int) $pagados_count->fetchColumn();
        
        $estadoPagos = [
            ["name" => "Pagados", "value" => $count_p],
            ["name" => "Pendientes", "value" => (int)$pendiente['pendientes']]
        ];

        // NUEVAS MÉTRICAS DASHBOARD
        $vipCount       = (int) $conn->query("SELECT COUNT(*) FROM suscripciones WHERE estatus = 1 AND vip = 1")->fetchColumn();
        $inactivosCount = (int) $conn->query("SELECT COUNT(*) FROM suscripciones WHERE estatus = 0")->fetchColumn();
        $vencidosCount  = (int) $conn->query("SELECT COUNT(*) FROM suscripciones WHERE estatus = 1 AND (vip = 0 OR vip IS NULL) AND fecha_renovacion IS NOT NULL AND fecha_renovacion < CURDATE()")->fetchColumn();
        $porVencerCount = (int) $conn->query("SELECT COUNT(*) FROM suscripciones WHERE estatus = 1 AND (vip = 0 OR vip IS NULL) AND fecha_renovacion >= CURDATE() AND fecha_renovacion <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)")->fetchColumn();

        echo json_encode([
            "totalClients"          => (int)   $clients['total'],
            "activeSubscriptions"   => (int)   $subs['active'],
            "monthlyRevenue"        => (float) ($rev['revenue'] ?? 0),
            "cobradoEsteMes"        => (float) ($cobrado['cobrado'] ?? 0),
            "clientesPendientes"    => (int)   ($pendiente['pendientes'] ?? 0),
            "montoPendiente"        => (float) ($pendiente['monto_pendiente'] ?? 0),
            "vipCount"              => $vipCount,
            "inactivosCount"        => $inactivosCount,
            "vencidosCount"         => $vencidosCount,
            "porVencerCount"        => $porVencerCount,
            "distribucionServicios" => $distSrv,
            "estadoPagos"           => $estadoPagos
        ]);
        exit;
    }
}

if (preg_match('/\/api\/dashboard\/chart-data/', $path)) {
    if ($method === 'GET') {
        // Últimos 6 meses reales por servicio
        $stmt = $conn->query("
            SELECT
                p.anio, p.mes,
                SUM(CASE WHEN s.tipo_servicio = 'ELITE'  THEN COALESCE(p.monto, s.costo) ELSE 0 END) as Elite,
                SUM(CASE WHEN s.tipo_servicio = 'FUTURE' THEN COALESCE(p.monto, s.costo) ELSE 0 END) as Future
            FROM pagos p
            JOIN suscripciones s ON p.suscripcion_id = s.id
            WHERE p.pagado = 1
            GROUP BY p.anio, p.mes
            ORDER BY p.anio DESC, p.mes DESC
            LIMIT 6
        ");
        $rows = array_reverse($stmt->fetchAll(PDO::FETCH_ASSOC));
        $meses = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
        $result = array_map(function($r) use ($meses) {
            return [
                "name"   => $meses[(int)$r['mes'] - 1],
                "Elite"  => (float) $r['Elite'],
                "Future" => (float) $r['Future'],
            ];
        }, $rows);
        echo json_encode($result ?: [["name" => date('M'), "Elite" => 0, "Future" => 0]]);
        exit;
    }
}

// ----------------------------------------------------
// ESTADÍSTICAS POR MÓDULO
// ----------------------------------------------------

if (preg_match('/\/api\/module-stats/', $path)) {
    if ($method === 'GET') {
        $type        = $_GET['type'] ?? 'ELITE';
        $mes_actual  = (int) date('n');
        $anio_actual = (int) date('Y');

        $summaryStmt = $conn->prepare("
            SELECT COUNT(id) as totalUsers, SUM(costo) as totalIncome
            FROM suscripciones WHERE tipo_servicio = ? AND estatus = 1
        ");
        $summaryStmt->execute([$type]);
        $summary = $summaryStmt->fetch();

        // Cobrado real este mes
        $cobradoMesStmt = $conn->prepare("
            SELECT COUNT(p.id) as cobrados, SUM(COALESCE(p.monto, s.costo)) as ingreso_cobrado
            FROM pagos p
            JOIN suscripciones s ON p.suscripcion_id = s.id
            WHERE s.tipo_servicio = ? AND p.mes = ? AND p.anio = ? AND p.pagado = 1
        ");
        $cobradoMesStmt->execute([$type, $mes_actual, $anio_actual]);
        $cobradoMes = $cobradoMesStmt->fetch();

        // Pendientes este mes (incluye VIPs — también se cobran, solo no se suspenden)
        $pendientesMesStmt = $conn->prepare("
            SELECT COUNT(s.id) as pendientes, SUM(s.costo) as monto_pendiente
            FROM suscripciones s
            WHERE s.tipo_servicio = ? AND s.estatus = 1
            AND s.id NOT IN (
                SELECT suscripcion_id FROM pagos WHERE mes = ? AND anio = ? AND pagado = 1
            )
        ");
        $pendientesMesStmt->execute([$type, $mes_actual, $anio_actual]);
        $pendientesMes = $pendientesMesStmt->fetch();

        // Inactivos (suspendidos por corte)
        $inactivosStmt = $conn->prepare("
            SELECT COUNT(*) as inactivos FROM suscripciones
            WHERE tipo_servicio = ? AND estatus = 0
        ");
        $inactivosStmt->execute([$type]);
        $inactivos = $inactivosStmt->fetch();

        // Vencidos: activos pero con fecha_renovacion ya pasada (y sin VIP)
        $vencidosStmt = $conn->prepare("
            SELECT COUNT(*) as vencidos FROM suscripciones
            WHERE tipo_servicio = ? AND estatus = 1 AND (vip = 0 OR vip IS NULL)
            AND fecha_renovacion IS NOT NULL AND fecha_renovacion < CURDATE()
        ");
        $vencidosStmt->execute([$type]);
        $vencidos = $vencidosStmt->fetch();

        // Historial por mes (usa monto real si existe)
        $historyStmt = $conn->prepare("
            SELECT
                p.anio, p.mes,
                COUNT(s.id)                           as cobrados,
                SUM(COALESCE(p.monto, s.costo))       as ingreso_mes
            FROM pagos p
            JOIN suscripciones s ON p.suscripcion_id = s.id
            WHERE s.tipo_servicio = ? AND p.pagado = 1
            GROUP BY p.anio, p.mes
            ORDER BY p.anio DESC, p.mes DESC
        ");
        $historyStmt->execute([$type]);
        $history = $historyStmt->fetchAll(PDO::FETCH_ASSOC);

        $meses_nombres = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
        foreach ($history as &$h) {
            $m = (int) $h['mes'];
            $h['mes_descriptivo'] = $meses_nombres[$m - 1] . " " . $h['anio'];
            $h['mes_raw']         = $h['anio'] . "-" . str_pad($m, 2, '0', STR_PAD_LEFT);
        }

        echo json_encode([
            "summary" => [
                "totalUsers"       => (int)   ($summary['totalUsers']  ?? 0),
                "totalIncome"      => (float) ($summary['totalIncome'] ?? 0),
                "cobrado_mes"      => (float) ($cobradoMes['ingreso_cobrado'] ?? 0),
                "cobrados_count"   => (int)   ($cobradoMes['cobrados'] ?? 0),
                "pendientes_count" => (int)   ($pendientesMes['pendientes'] ?? 0),
                "monto_pendiente"  => (float) ($pendientesMes['monto_pendiente'] ?? 0),
                "inactivos_count"  => (int)   ($inactivos['inactivos'] ?? 0),
                "vencidos_count"   => (int)   ($vencidos['vencidos'] ?? 0),
                "currentMonth"     => $meses_nombres[$mes_actual - 1] . " " . $anio_actual,
            ],
            "history" => $history
        ]);
        exit;
    }
}

// ----------------------------------------------------
// COBROS DEL MES (resumen para Finanzas)
// ----------------------------------------------------

if (preg_match('/\/api\/cobros-mes/', $path)) {
    if ($method === 'GET') {
        $mes  = isset($_GET['mes'])  ? (int) $_GET['mes']  : (int) date('n');
        $anio = isset($_GET['anio']) ? (int) $_GET['anio'] : (int) date('Y');

        try {
            // Cobrado por servicio
            $cobradoStmt = $conn->prepare("
                SELECT
                    s.tipo_servicio,
                    COUNT(p.id)                     as cantidad_cobrada,
                    SUM(COALESCE(p.monto, s.costo)) as total_cobrado
                FROM pagos p
                JOIN suscripciones s ON p.suscripcion_id = s.id
                WHERE p.mes = ? AND p.anio = ? AND p.pagado = 1
                GROUP BY s.tipo_servicio
            ");
            $cobradoStmt->execute([$mes, $anio]);
            $cobrado = $cobradoStmt->fetchAll(PDO::FETCH_ASSOC);

            // Pendiente por servicio (incluye VIPs — se cobran pero no se suspenden)
            $pendienteStmt = $conn->prepare("
                SELECT
                    s.tipo_servicio,
                    COUNT(s.id)                                          as cantidad_pendiente,
                    SUM(s.costo)                                         as total_pendiente,
                    SUM(CASE WHEN s.vip = 1 THEN 1 ELSE 0 END)          as cantidad_vip_pendiente
                FROM suscripciones s
                WHERE s.estatus = 1
                AND s.id NOT IN (
                    SELECT suscripcion_id FROM pagos WHERE mes = ? AND anio = ? AND pagado = 1
                )
                GROUP BY s.tipo_servicio
            ");
            $pendienteStmt->execute([$mes, $anio]);
            $pendiente = $pendienteStmt->fetchAll(PDO::FETCH_ASSOC);

            // Clientes pendientes con detalle — todos (VIPs incluidos, marcados)
            $listaStmt = $conn->prepare("
                SELECT s.id, s.tipo_servicio, s.costo, s.fecha_renovacion, s.vip,
                       c.nombre, c.no_cliente, c.telefono
                FROM suscripciones s
                JOIN clientes c ON s.cliente_id = c.id
                WHERE s.estatus = 1
                AND s.id NOT IN (
                    SELECT suscripcion_id FROM pagos WHERE mes = ? AND anio = ? AND pagado = 1
                )
                ORDER BY s.vip DESC, s.fecha_renovacion ASC
            ");
            $listaStmt->execute([$mes, $anio]);
            $listaPendientes = $listaStmt->fetchAll(PDO::FETCH_ASSOC);
            foreach ($listaPendientes as &$lp) {
                $lp['vip'] = (bool) ($lp['vip'] ?? false);
            }

            // VIPs pendientes de cobro este mes
            $vipPendStmt = $conn->prepare("
                SELECT COUNT(*) as vip_pendientes
                FROM suscripciones
                WHERE estatus = 1 AND vip = 1
                AND id NOT IN (SELECT suscripcion_id FROM pagos WHERE mes = ? AND anio = ? AND pagado = 1)
            ");
            $vipPendStmt->execute([$mes, $anio]);
            $vipPend = $vipPendStmt->fetch();

            $meses_nombres = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

            echo json_encode([
                "mes"              => $mes,
                "anio"             => $anio,
                "mes_descriptivo"  => $meses_nombres[$mes - 1] . " " . $anio,
                "cobrado"          => $cobrado,
                "pendiente"        => $pendiente,
                "lista_pendientes" => $listaPendientes,
                "vip_pendientes"   => (int) ($vipPend['vip_pendientes'] ?? 0),
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "Error al obtener cobros del mes", "details" => $e->getMessage()]);
        }
        exit;
    }
}

// ----------------------------------------------------
// COBROS PENDIENTES (lista rápida para BaseServiceManager)
// ----------------------------------------------------

if (preg_match('/\/api\/cobros-pendientes/', $path)) {
    if ($method === 'GET') {
        $mes  = isset($_GET['mes'])  ? (int) $_GET['mes']  : (int) date('n');
        $anio = isset($_GET['anio']) ? (int) $_GET['anio'] : (int) date('Y');
        $type = $_GET['type'] ?? null;

        try {
            $sql = "
                SELECT s.id, s.tipo_servicio, s.costo, s.fecha_renovacion, s.vip,
                       c.nombre, c.no_cliente, c.telefono
                FROM suscripciones s
                JOIN clientes c ON s.cliente_id = c.id
                WHERE s.estatus = 1 AND (s.vip = 0 OR s.vip IS NULL)
                AND s.id NOT IN (
                    SELECT suscripcion_id FROM pagos WHERE mes = ? AND anio = ? AND pagado = 1
                )
            ";
            $params = [$mes, $anio];
            if ($type) {
                $sql .= " AND s.tipo_servicio = ?";
                $params[] = $type;
            }
            $sql .= " ORDER BY s.fecha_renovacion ASC";

            $stmt = $conn->prepare($sql);
            $stmt->execute($params);
            $pendientes = $stmt->fetchAll(PDO::FETCH_ASSOC);
            foreach ($pendientes as &$p) {
                $p['vip'] = (bool) ($p['vip'] ?? false);
            }

            echo json_encode(["total" => count($pendientes), "pendientes" => $pendientes]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "Error al obtener cobros pendientes", "details" => $e->getMessage()]);
        }
        exit;
    }
}

// ----------------------------------------------------
// CORTE DE MES (versión corregida — única)
// ----------------------------------------------------

if (preg_match('/\/api\/corte/', $path)) {
    if ($method === 'POST') {
        try {
            $mes  = isset($input['mes'])  ? (int) $input['mes']  : (int) date('n');
            $anio = isset($input['anio']) ? (int) $input['anio'] : (int) date('Y');

            $conn->beginTransaction();

            // Solo suspender activos NO VIP sin pago este mes
            $stmtActivos = $conn->query("SELECT id FROM suscripciones WHERE estatus = 1 AND (vip = 0 OR vip IS NULL)");
            $suscripcionesActivas = $stmtActivos->fetchAll(PDO::FETCH_COLUMN);

            $suspendidos = 0;
            foreach ($suscripcionesActivas as $sub_id) {
                $checkPago = $conn->prepare("SELECT id FROM pagos WHERE suscripcion_id = ? AND mes = ? AND anio = ? AND pagado = 1");
                $checkPago->execute([$sub_id, $mes, $anio]);
                if (!$checkPago->fetch()) {
                    $conn->prepare("UPDATE suscripciones SET estatus = 0 WHERE id = ?")->execute([$sub_id]);
                    $suspendidos++;
                }
            }

            // Ingreso total real del mes
            $stmtIngreso = $conn->prepare("
                SELECT SUM(COALESCE(p.monto, s.costo)) as total
                FROM pagos p
                JOIN suscripciones s ON p.suscripcion_id = s.id
                WHERE p.mes = ? AND p.anio = ? AND p.pagado = 1
            ");
            $stmtIngreso->execute([$mes, $anio]);
            $ingresoRow = $stmtIngreso->fetch();
            $ingreso    = $ingresoRow['total'] ? (float) $ingresoRow['total'] : 0.0;

            $conn->commit();

            $meses_nombres = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
            echo json_encode([
                "success" => true,
                "message" => "Corte de " . $meses_nombres[$mes - 1] . " procesado exitosamente",
                "datos"   => [
                    "suspendidos"  => $suspendidos,
                    "ingreso_corte"=> $ingreso,
                    "mes"          => $mes,
                    "anio"         => $anio
                ]
            ]);
        } catch (PDOException $e) {
            $conn->rollBack();
            http_response_code(500);
            echo json_encode(["error" => "Error al procesar el corte", "details" => $e->getMessage()]);
        }
        exit;
    }

    // GET — vista previa del corte (¿a quiénes suspendería?)
    if ($method === 'GET') {
        $mes  = isset($_GET['mes'])  ? (int) $_GET['mes']  : (int) date('n');
        $anio = isset($_GET['anio']) ? (int) $_GET['anio'] : (int) date('Y');

        try {
            $stmt = $conn->prepare("
                SELECT s.id, s.tipo_servicio, s.costo, c.nombre, c.no_cliente
                FROM suscripciones s
                JOIN clientes c ON s.cliente_id = c.id
                WHERE s.estatus = 1 AND (s.vip = 0 OR s.vip IS NULL)
                AND s.id NOT IN (
                    SELECT suscripcion_id FROM pagos WHERE mes = ? AND anio = ? AND pagado = 1
                )
                ORDER BY s.tipo_servicio, c.nombre
            ");
            $stmt->execute([$mes, $anio]);
            $afectados = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(["total_afectados" => count($afectados), "afectados" => $afectados]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "Error al obtener vista previa del corte", "details" => $e->getMessage()]);
        }
        exit;
    }
}

// ----------------------------------------------------
// SUSCRIPCIONES (CRUD)
// ----------------------------------------------------

// Rutas con ID: /api/subscriptions/:id
if (preg_match('/\/api\/subscriptions\/(\d+)/', $path, $matches)) {
    $id = (int) $matches[1];

    if ($method === 'DELETE') {
        try {
            $conn->beginTransaction();
            $conn->prepare("DELETE FROM pagos WHERE suscripcion_id = ?")->execute([$id]);
            $stmt2 = $conn->prepare("DELETE FROM suscripciones WHERE id = ?");
            if ($stmt2->execute([$id])) {
                $conn->commit();
                echo json_encode(["success" => true]);
            } else {
                throw new Exception("No se pudo eliminar");
            }
        } catch (PDOException $e) {
            $conn->rollBack();
            http_response_code(500);
            echo json_encode(["error" => "Error al eliminar suscripción", "details" => $e->getMessage()]);
        }
        exit;
    }

    if ($method === 'PUT') {
        $estatus          = !empty($input['estatus']) ? 1 : 0;
        $demo             = !empty($input['demo']) ? 1 : 0;
        $equipo_1         = $input['equipo_1'] ?? '';
        $tv_1             = !empty($input['tv_1']) ? 1 : 0;
        $equipo_2         = $input['equipo_2'] ?? '';
        $tv_2             = !empty($input['tv_2']) ? 1 : 0;
        $detalles         = $input['detalles'] ?? '';
        $fecha_activacion = !empty($input['fecha_activacion']) ? $input['fecha_activacion'] : null;
        $meses_activos    = (int) ($input['meses_activos'] ?? 1);
        $fecha_renovacion = !empty($input['fecha_renovacion']) ? $input['fecha_renovacion'] : null;
        $costo            = (float) ($input['costo'] ?? 0);
        $vip              = (isset($input['vip']) && $input['vip']) ? 1 : 0;
        $nombre           = $input['nombre'] ?? '';
        $telefono         = $input['telefono'] ?? '';

        try {
            $conn->beginTransaction();

            $subStmt = $conn->prepare("SELECT cliente_id FROM suscripciones WHERE id = ?");
            $subStmt->execute([$id]);
            $subRow = $subStmt->fetch();

            if ($subRow && $nombre) {
                $conn->prepare("UPDATE clientes SET nombre=?, telefono=? WHERE id=?")
                     ->execute([$nombre, $telefono, $subRow['cliente_id']]);
            }

            $conn->prepare("UPDATE suscripciones SET
                estatus=:estatus, demo=:demo, equipo_1=:equipo_1, tv_1=:tv_1,
                equipo_2=:equipo_2, tv_2=:tv_2, detalles=:detalles,
                fecha_activacion=:fecha_activacion, meses_activos=:meses_activos,
                fecha_renovacion=:fecha_renovacion, costo=:costo, vip=:vip
                WHERE id=:id")->execute([
                    'estatus'          => $estatus,
                    'demo'             => $demo,
                    'equipo_1'         => $equipo_1,
                    'tv_1'             => $tv_1,
                    'equipo_2'         => $equipo_2,
                    'tv_2'             => $tv_2,
                    'detalles'         => $detalles,
                    'fecha_activacion' => $fecha_activacion,
                    'meses_activos'    => $meses_activos,
                    'fecha_renovacion' => $fecha_renovacion,
                    'costo'            => $costo,
                    'vip'              => $vip,
                    'id'               => $id
                ]);

            $conn->commit();
            echo json_encode(["success" => true]);
        } catch (PDOException $e) {
            $conn->rollBack();
            http_response_code(500);
            echo json_encode(["error" => "Error actualizando suscripción", "details" => $e->getMessage()]);
        }
        exit;
    }
}

// Rutas sin ID: /api/subscriptions
if (preg_match('/\/api\/subscriptions/', $path)) {

    if ($method === 'GET') {
        $type        = $_GET['type'] ?? '';
        $mes_actual  = (int) date('n');
        $anio_actual = (int) date('Y');

        // Incluir pagado_este_mes desde la BD + meses pagados en el año actual para checklist
        $sql = "
            SELECT s.*, c.no_cliente, c.nombre, c.telefono,
                CASE WHEN p_mes.id IS NOT NULL THEN 1 ELSE 0 END as pagado_este_mes,
                p_mes.fecha_pago  as fecha_ultimo_pago,
                p_mes.monto       as monto_ultimo_pago,
                p_mes.nota        as nota_ultimo_pago,
                DATEDIFF(s.fecha_renovacion, CURDATE()) as dias_para_vencer,
                (SELECT GROUP_CONCAT(mes ORDER BY mes SEPARATOR ',')
                 FROM pagos
                 WHERE suscripcion_id = s.id AND anio = ? AND pagado = 1) as meses_pagados_anio,
                (SELECT CONCAT(p2.anio, '-', LPAD(p2.mes, 2, '0'))
                 FROM pagos p2
                 WHERE p2.suscripcion_id = s.id AND p2.pagado = 1
                 ORDER BY p2.anio DESC, p2.mes DESC
                 LIMIT 1) as ultimo_mes_pagado
            FROM suscripciones s
            JOIN clientes c ON s.cliente_id = c.id
            LEFT JOIN pagos p_mes
                ON p_mes.suscripcion_id = s.id
               AND p_mes.mes   = ?
               AND p_mes.anio  = ?
               AND p_mes.pagado = 1
        ";
        $params = [$anio_actual, $mes_actual, $anio_actual];

        if ($type) {
            $sql .= " WHERE s.tipo_servicio = ?";
            $params[] = $type;
        }
        $sql .= " ORDER BY s.id DESC";

        $stmt = $conn->prepare($sql);
        $stmt->execute($params);
        $result = $stmt->fetchAll();

        $subs = [];
        foreach ($result as $row) {
            $row['estatus']          = (bool)  $row['estatus'];
            $row['demo']             = (bool)  $row['demo'];
            $row['tv_1']             = (bool)  $row['tv_1'];
            $row['tv_2']             = (bool)  $row['tv_2'];
            $row['vip']              = (bool)  ($row['vip'] ?? false);
            $row['pagado_este_mes']  = (bool)  $row['pagado_este_mes'];
            $row['dias_para_vencer'] = is_null($row['dias_para_vencer']) ? null : (int) $row['dias_para_vencer'];

            // Meses con registro explícito de pago en el año actual
            $row['meses_pagados_anio'] = $row['meses_pagados_anio']
                ? array_map('intval', explode(',', $row['meses_pagados_anio']))
                : [];

            // NOTA: Eliminada la lógica de "meses cubiertos por fecha".
            // Solo se considera pagado si existe registro explícito en la tabla pagos.
            // Esto evita confusiones donde meses sin pago real aparecían como "pagados".

            unset($row['ultimo_mes_pagado']);

            $subs[] = $row;
        }
        echo json_encode($subs);
        exit;
    }

    if ($method === 'POST') {
        $no_cliente       = $input['no_cliente'] ?? '';
        $nombre           = $input['nombre'] ?? '';
        $telefono         = $input['telefono'] ?? '';
        $tipo_servicio    = $input['tipo_servicio'] ?? 'ELITE';
        $estatus          = !empty($input['estatus']) ? 1 : 0;
        $demo             = !empty($input['demo']) ? 1 : 0;
        $equipo_1         = $input['equipo_1'] ?? '';
        $tv_1             = !empty($input['tv_1']) ? 1 : 0;
        $equipo_2         = $input['equipo_2'] ?? '';
        $tv_2             = !empty($input['tv_2']) ? 1 : 0;
        $detalles         = $input['detalles'] ?? '';
        $fecha_activacion = !empty($input['fecha_activacion']) ? $input['fecha_activacion'] : null;
        $meses_activos    = (int) ($input['meses_activos'] ?? 1);
        $fecha_renovacion = !empty($input['fecha_renovacion']) ? $input['fecha_renovacion'] : null;
        $costo            = (float) ($input['costo'] ?? 0);
        $vip              = (isset($input['vip']) && $input['vip']) ? 1 : 0;

        try {
            $conn->beginTransaction();

            $stmtExist = $conn->prepare("SELECT id FROM clientes WHERE no_cliente = ?");
            $stmtExist->execute([$no_cliente]);
            $clientRow = $stmtExist->fetch();

            if ($clientRow) {
                $cliente_id = $clientRow['id'];
                $conn->prepare("UPDATE clientes SET nombre=?, telefono=? WHERE id=?")
                     ->execute([$nombre, $telefono, $cliente_id]);
            } else {
                $conn->prepare("INSERT INTO clientes (no_cliente, nombre, telefono) VALUES (?, ?, ?)")
                     ->execute([$no_cliente, $nombre, $telefono]);
                $cliente_id = $conn->lastInsertId();
            }

            $subIns = $conn->prepare("INSERT INTO suscripciones (
                cliente_id, tipo_servicio, estatus, demo,
                equipo_1, tv_1, equipo_2, tv_2, detalles,
                fecha_activacion, meses_activos, fecha_renovacion, costo, vip
            ) VALUES (
                :cliente_id, :tipo_servicio, :estatus, :demo,
                :equipo_1, :tv_1, :equipo_2, :tv_2, :detalles,
                :fecha_activacion, :meses_activos, :fecha_renovacion, :costo, :vip
            )");
            $subIns->execute([
                'cliente_id'       => $cliente_id,
                'tipo_servicio'    => $tipo_servicio,
                'estatus'          => $estatus,
                'demo'             => $demo,
                'equipo_1'         => $equipo_1,
                'tv_1'             => $tv_1,
                'equipo_2'         => $equipo_2,
                'tv_2'             => $tv_2,
                'detalles'         => $detalles,
                'fecha_activacion' => $fecha_activacion,
                'meses_activos'    => $meses_activos,
                'fecha_renovacion' => $fecha_renovacion,
                'costo'            => $costo,
                'vip'              => $vip
            ]);
            $sub_id = $conn->lastInsertId();
            $conn->commit();
            echo json_encode(["success" => true, "id" => $sub_id]);
        } catch (PDOException $e) {
            $conn->rollBack();
            http_response_code(500);
            echo json_encode(["error" => "Error creando suscripción", "details" => $e->getMessage()]);
        }
        exit;
    }
}

// ----------------------------------------------------
// PAGOS — historial y gestión
// ----------------------------------------------------

if (preg_match('/\/api\/pagos\/(\d+)/', $path, $matches)) {
    $pago_id = (int) $matches[1];

    if ($method === 'DELETE') {
        try {
            $conn->beginTransaction();

            // Obtener datos del pago a eliminar
            $pagoStmt = $conn->prepare("SELECT suscripcion_id FROM pagos WHERE id = ?");
            $pagoStmt->execute([$pago_id]);
            $pago = $pagoStmt->fetch();

            if (!$pago) {
                http_response_code(404);
                echo json_encode(["error" => "Pago no encontrado"]);
                exit;
            }

            $suscripcion_id = $pago['suscripcion_id'];

            // Eliminar el pago
            $conn->prepare("DELETE FROM pagos WHERE id = ?")->execute([$pago_id]);

            // Recalcular fecha_renovacion desde los registros restantes
            // (más robusto que restar meses a la fecha actual)
            $remainingStmt = $conn->prepare(
                "SELECT mes, anio FROM pagos WHERE suscripcion_id = ? AND pagado = 1 ORDER BY anio DESC, mes DESC LIMIT 1"
            );
            $remainingStmt->execute([$suscripcion_id]);
            $lastPago = $remainingStmt->fetch();

            if ($lastPago) {
                // La fecha de renovación es el último día del último mes pagado
                $newReno = new DateTime();
                $newReno->setDate((int)$lastPago['anio'], (int)$lastPago['mes'], 1);
                $newReno->modify('last day of this month');
                $nueva_fecha = $newReno->format('Y-m-d');
            } else {
                // Sin pagos restantes: usar la fecha de activación o dejar null
                $subActiv = $conn->prepare("SELECT fecha_activacion FROM suscripciones WHERE id = ?");
                $subActiv->execute([$suscripcion_id]);
                $subRow = $subActiv->fetch();
                $nueva_fecha = $subRow['fecha_activacion'] ?? null;
            }

            $conn->prepare("UPDATE suscripciones SET fecha_renovacion = ? WHERE id = ?")
                 ->execute([$nueva_fecha, $suscripcion_id]);

            $conn->commit();
            echo json_encode(["success" => true, "message" => "Pago eliminado y fecha de renovación actualizada"]);
        } catch (PDOException $e) {
            if ($conn->inTransaction()) $conn->rollBack();
            http_response_code(500);
            echo json_encode(["error" => "Error al revertir pago", "details" => $e->getMessage()]);
        }
        exit;
    }
}

if (preg_match('/\/api\/pagos/', $path)) {
    if ($method === 'GET') {
        $sub_id = $_GET['suscripcion_id'] ?? null;
        if (!$sub_id) {
            http_response_code(400);
            echo json_encode(["error" => "Suscripción ID requerida"]);
            exit;
        }

        try {
            $stmt = $conn->prepare("SELECT * FROM pagos WHERE suscripcion_id = ? ORDER BY anio DESC, mes DESC, fecha_pago DESC");
            $stmt->execute([$sub_id]);
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "Error al obtener historial", "details" => $e->getMessage()]);
        }
        exit;
    }

    if ($method === 'POST') {
        $suscripcion_id = $input['suscripcion_id'] ?? null;
        if (!$suscripcion_id) {
            http_response_code(400);
            echo json_encode(["error" => "ID de suscripción requerido"]);
            exit;
        }

        try {
            // La fecha de pago la envía el frontend (en hora local del usuario).
            // Derivar mes/año de esa fecha para no depender del reloj del servidor.
            $fecha_pago = !empty($input['fecha_pago']) ? $input['fecha_pago'] : date('Y-m-d');
            $fecha_obj  = new DateTime($fecha_pago);
            $mes_pago   = (int) $fecha_obj->format('n');
            $anio_pago  = (int) $fecha_obj->format('Y');
            $nota       = $input['nota'] ?? null;

            // Obtener datos de la suscripción
            $subStmt = $conn->prepare("SELECT id, costo, fecha_renovacion, meses_activos, estatus, vip FROM suscripciones WHERE id = ?");
            $subStmt->execute([$suscripcion_id]);
            $sub = $subStmt->fetch();

            if (!$sub) {
                http_response_code(404);
                echo json_encode(["error" => "Suscripción no encontrada"]);
                exit;
            }

            $monto         = isset($input['monto']) && $input['monto'] !== '' ? (float) $input['monto'] : (float) $sub['costo'];
            $costo_mensual = (float) $sub['costo'];
            if ($costo_mensual <= 0) $costo_mensual = 250;

            // Obtener todos los meses ya pagados para esta suscripción
            $paidStmt = $conn->prepare("SELECT mes, anio FROM pagos WHERE suscripcion_id = ? AND pagado = 1 ORDER BY anio, mes");
            $paidStmt->execute([$suscripcion_id]);
            $paidSet = [];
            foreach ($paidStmt->fetchAll() as $pr) {
                $paidSet[$pr['anio'] . '-' . str_pad($pr['mes'], 2, '0', STR_PAD_LEFT)] = true;
            }

            $monthsToRegister = [];

            // ── Ruta A: meses específicos (pago adelantado con selección manual) ──
            if (!empty($input['meses_especificos']) && is_array($input['meses_especificos'])) {
                foreach ($input['meses_especificos'] as $item) {
                    $m  = (int)($item['mes']  ?? 0);
                    $y  = (int)($item['anio'] ?? 0);
                    $mt = isset($item['monto']) && $item['monto'] !== '' ? (float)$item['monto'] : $costo_mensual;
                    $fp = !empty($item['fecha_pago']) ? $item['fecha_pago']
                        : $y . '-' . str_pad($m, 2, '0', STR_PAD_LEFT) . '-15';
                    if ($m < 1 || $m > 12 || $y < 2020) continue;
                    $key = $y . '-' . str_pad($m, 2, '0', STR_PAD_LEFT);
                    if (!isset($paidSet[$key])) {
                        $monthsToRegister[] = [
                            'mes'            => $m,
                            'anio'           => $y,
                            'monto_override' => $mt,
                            'fecha_override' => $fp,
                        ];
                    }
                }

            // ── Ruta B: pago normal (deuda + mes actual + adelantos por monto) ────
            } else {
                $meses_a_pagar = max(1, (int) floor($monto / $costo_mensual));

                $owedMonths = [];
                $base_reno  = $sub['fecha_renovacion'] ? new DateTime($sub['fecha_renovacion']) : null;

                $reno_mes_num = $base_reno
                    ? (int)$base_reno->format('Y') * 12 + (int)$base_reno->format('n')
                    : 0;
                $pago_mes_num = $anio_pago * 12 + $mes_pago;

                if ($base_reno && $reno_mes_num < $pago_mes_num) {
                    $cursor = clone $base_reno;
                    $cursor->setDate((int)$base_reno->format('Y'), (int)$base_reno->format('n'), 1);
                    $cursor->modify('+1 month');

                    $limite = new DateTime();
                    $limite->setDate($anio_pago, $mes_pago, 1);

                    while ($cursor <= $limite) {
                        $key = $cursor->format('Y') . '-' . str_pad((int)$cursor->format('n'), 2, '0', STR_PAD_LEFT);
                        if (!isset($paidSet[$key])) {
                            $owedMonths[] = ['mes' => (int)$cursor->format('n'), 'anio' => (int)$cursor->format('Y')];
                        }
                        $cursor->modify('+1 month');
                    }
                } else {
                    $keyActual = $anio_pago . '-' . str_pad($mes_pago, 2, '0', STR_PAD_LEFT);
                    if (!isset($paidSet[$keyActual])) {
                        $owedMonths[] = ['mes' => $mes_pago, 'anio' => $anio_pago];
                    }
                }

                foreach ($owedMonths as $om) {
                    if (count($monthsToRegister) >= $meses_a_pagar) break;
                    $monthsToRegister[] = $om;
                }

                if (count($monthsToRegister) < $meses_a_pagar) {
                    if (!empty($monthsToRegister)) {
                        $last = end($monthsToRegister);
                        $advance = new DateTime();
                        $advance->setDate($last['anio'], $last['mes'], 1);
                        $advance->modify('+1 month');
                    } else {
                        $advance = clone $fecha_obj;
                        $advance->modify('first day of next month');
                    }

                    while (count($monthsToRegister) < $meses_a_pagar) {
                        $key = $advance->format('Y') . '-' . str_pad((int)$advance->format('n'), 2, '0', STR_PAD_LEFT);
                        if (!isset($paidSet[$key])) {
                            $monthsToRegister[] = ['mes' => (int)$advance->format('n'), 'anio' => (int)$advance->format('Y')];
                        }
                        $advance->modify('+1 month');
                    }
                }
            }

            if (empty($monthsToRegister)) {
                http_response_code(409);
                echo json_encode(["error" => "Todos los meses cubiertos por este pago ya están registrados"]);
                exit;
            }

            $conn->beginTransaction();

            // Preservar el día original de fecha_renovacion para mantener consistencia
            // (ej. si era día 26, la nueva fecha también será día 26 del mes siguiente)
            $dia_original = 1;
            if (!empty($sub['fecha_renovacion'])) {
                $reno_orig = new DateTime($sub['fecha_renovacion']);
                $dia_original = (int) $reno_orig->format('j'); // día del mes (1-31)
            }

            $insertStmt = $conn->prepare(
                "INSERT INTO pagos (suscripcion_id, mes, anio, pagado, fecha_pago, monto, nota) VALUES (?, ?, ?, 1, ?, ?, ?)"
            );
            $totalMeses = count($monthsToRegister);
            foreach ($monthsToRegister as $i => $month) {
                // Ruta A: cada mes tiene su propio monto/fecha
                if (isset($month['monto_override'])) {
                    $montoMes  = $month['monto_override'];
                    $fechaMes  = $month['fecha_override'];
                // Ruta B: distribuir monto total entre meses
                } elseif ($totalMeses === 1) {
                    $montoMes = $monto;
                    $fechaMes = $fecha_pago;
                } else {
                    $montoMes = ($i === 0) ? $monto - ($costo_mensual * ($totalMeses - 1)) : $costo_mensual;
                    if ($montoMes < 0) $montoMes = $costo_mensual;
                    $fechaMes = $fecha_pago;
                }
                $insertStmt->execute([$suscripcion_id, $month['mes'], $month['anio'], $fechaMes, $montoMes, $nota]);
            }

            // Nueva fecha_renovacion: avanzar un mes desde la fecha actual, respetando el día original
            $last = end($monthsToRegister);
            $newReno = new DateTime();
            $newReno->setDate($last['anio'], $last['mes'], 1);
            $newReno->modify('+1 month');
            // Usar el día original (o el último día del mes si el día original no existe, ej. 31 en febrero)
            $ultimo_dia_mes = (int) $newReno->format('t');
            $dia_a_usar = min($dia_original, $ultimo_dia_mes);
            $newReno->setDate($newReno->format('Y'), $newReno->format('m'), $dia_a_usar);
            $nueva_fecha = $newReno->format('Y-m-d');

            // Actualizar suscripción: nueva fecha + reactivar
            $conn->prepare("UPDATE suscripciones SET fecha_renovacion = ?, estatus = 1 WHERE id = ?")
                 ->execute([$nueva_fecha, $suscripcion_id]);

            $conn->commit();

            $mesesNombres = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
            $mesesTexto = implode(', ', array_map(fn($m) => $mesesNombres[$m['mes']-1].' '.$m['anio'], $monthsToRegister));

            echo json_encode([
                "success"               => true,
                "message"               => "Pago registrado: {$mesesTexto}",
                "meses_registrados"     => $totalMeses,
                "meses_detalle"         => $monthsToRegister,
                "nueva_fecha_renovacion"=> $nueva_fecha,
                "monto"                 => $monto
            ]);
        } catch (PDOException $e) {
            if ($conn->inTransaction()) $conn->rollBack();
            http_response_code(500);
            echo json_encode(["error" => "Error al registrar pago", "details" => $e->getMessage()]);
        }
        exit;
    }
}

// ----------------------------------------------------
// SERVICIOS (gestión de módulos)
// ----------------------------------------------------

if (preg_match('/\/api\/services\/(\d+)/', $path, $matches)) {
    $serv_id = (int) $matches[1];
    if ($method === 'DELETE') {
        try {
            $conn->prepare("DELETE FROM servicios_tv WHERE id = ?")->execute([$serv_id]);
            echo json_encode(["success" => true]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "Error al eliminar servicio", "details" => $e->getMessage()]);
        }
        exit;
    }
}

if (preg_match('/\/api\/services/', $path)) {
    if ($method === 'GET') {
        $stmt = $conn->query("SELECT * FROM servicios_tv ORDER BY nombre ASC");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        exit;
    }

    if ($method === 'POST') {
        $nombre = $input['nombre'] ?? '';
        $slug   = strtoupper($input['slug'] ?? '');
        $icono  = $input['icono'] ?? 'Tv';
        $costo  = (float) ($input['costo_default'] ?? 250);

        if (empty($nombre) || empty($slug)) {
            http_response_code(400);
            echo json_encode(["error" => "Nombre y slug son obligatorios"]);
            exit;
        }

        try {
            $stmt = $conn->prepare("INSERT INTO servicios_tv (nombre, slug, icono, costo_default) VALUES (?, ?, ?, ?)");
            $stmt->execute([$nombre, $slug, $icono, $costo]);
            echo json_encode(["success" => true, "id" => $conn->lastInsertId()]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "Error al crear servicio", "details" => $e->getMessage()]);
        }
        exit;
    }
}

// ----------------------------------------------------
// INVENTARIO
// ----------------------------------------------------

if (preg_match('/\/api\/inventory\/(\d+)/', $path, $matches)) {
    $id = (int) $matches[1];

    if ($method === 'DELETE') {
        try {
            $conn->prepare("DELETE FROM inventario WHERE id = ?")->execute([$id]);
            echo json_encode(["success" => true]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "Error al eliminar equipo", "details" => $e->getMessage()]);
        }
        exit;
    }

    if ($method === 'PUT') {
        $part_number  = $input['partNumber']  ?? '';
        $categoria    = $input['categoria']   ?? '';
        $estado       = $input['estado']      ?? 'nuevo';
        $fecha_ingreso= $input['fechaIngreso']?? date('Y-m-d');
        $detalles     = $input['detalles']    ?? '';

        try {
            $conn->prepare("UPDATE inventario SET part_number=?, categoria=?, estado=?, fecha_ingreso=?, detalles=? WHERE id=?")
                 ->execute([$part_number, $categoria, $estado, $fecha_ingreso, $detalles, $id]);
            echo json_encode(["success" => true]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "Error al actualizar equipo", "details" => $e->getMessage()]);
        }
        exit;
    }
}

if (preg_match('/\/api\/inventory/', $path)) {
    if ($method === 'GET') {
        try {
            $stmt  = $conn->query("SELECT * FROM inventario ORDER BY id DESC");
            $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $mapped = array_map(fn($item) => [
                "id"          => (int) $item['id'],
                "partNumber"  => $item['part_number'],
                "categoria"   => $item['categoria'],
                "estado"      => $item['estado'],
                "fechaIngreso"=> $item['fecha_ingreso'],
                "detalles"    => $item['detalles']
            ], $items);
            echo json_encode($mapped);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "Error al listar inventario", "details" => $e->getMessage()]);
        }
        exit;
    }

    if ($method === 'POST') {
        $part_number   = $input['partNumber']   ?? '';
        $categoria     = $input['categoria']    ?? '';
        $estado        = $input['estado']       ?? 'nuevo';
        $fecha_ingreso = $input['fechaIngreso'] ?? date('Y-m-d');
        $detalles      = $input['detalles']     ?? '';

        if (empty($part_number) || empty($categoria)) {
            http_response_code(400);
            echo json_encode(["error" => "Número de parte y categoría son obligatorios"]);
            exit;
        }

        try {
            $conn->prepare("INSERT INTO inventario (part_number, categoria, estado, fecha_ingreso, detalles) VALUES (?, ?, ?, ?, ?)")
                 ->execute([$part_number, $categoria, $estado, $fecha_ingreso, $detalles]);
            echo json_encode(["success" => true, "id" => $conn->lastInsertId()]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "Error al registrar equipo", "details" => $e->getMessage()]);
        }
        exit;
    }
}

// Default 404
http_response_code(404);
echo json_encode(["error" => "Endpoint no encontrado"]);
?>
