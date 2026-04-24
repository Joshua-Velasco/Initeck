<?php
require_once 'db_config.php';

// Decode JSON input
$data = json_decode(file_get_contents("php://input"));

try {
    if (isset($data->action)) {
        if ($data->action === 'login_email') {
            if (!isset($data->email) || !isset($data->password)) {
                echo json_encode(["success" => false, "message" => "Faltan datos requeridos."]);
                exit();
            }

            $email = $data->email;
            $password = $data->password;

            // Find the Persona by email
            $query = "SELECT u.CodigoUsuario, u.NombreUsuario, u.Contraseña, u.Activo, u.CorreoVerificado, p.Telefono, p.UrlINE
                      FROM safar_usuario u
                      JOIN safar_persona p ON u.CodigoPersona = p.CodigoPersona
                      WHERE p.Correo = :email LIMIT 1";
            
            $stmt = $conn->prepare($query);
            $stmt->bindParam(':email', $email);
            $stmt->execute();
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user) {
                $password_match = false;
                if ($password === $user['Contraseña']) {
                    $password_match = true;
                } elseif (password_verify($password, $user['Contraseña'])) {
                    $password_match = true;
                }

                if ($password_match) {
                    if (!$user['Activo']) {
                        echo json_encode(["success" => false, "message" => "El usuario no está activo."]);
                        exit();
                    }

                    if ($user['CorreoVerificado'] == 0) {
                        echo json_encode(["success" => false, "requires_verification" => true, "message" => "Tu cuenta no ha sido verificada. Por favor, verifica tu correo."]);
                        exit();
                    }

                    $perfilCompleto = !empty($user['Telefono']) && !empty($user['UrlINE']);
                    echo json_encode([
                        "success" => true,
                        "user" => [
                            "codigoUsuario" => $user['CodigoUsuario'],
                            "nombre" => $user['NombreUsuario'],
                            "perfilCompleto" => $perfilCompleto
                        ]
                    ]);
                } else {
                    echo json_encode(["success" => false, "message" => "Contraseña incorrecta."]);
                }
            } else {
                echo json_encode(["success" => false, "message" => "Usuario no encontrado."]);
            }
            exit();

        } elseif ($data->action === 'register_email') {
            if (!isset($data->name) || !isset($data->email) || !isset($data->password)) {
                echo json_encode(["success" => false, "message" => "Faltan datos requeridos."]);
                exit();
            }

            $name = $data->name;
            $email = $data->email;
            $password = $data->password;

            // Validar contraseña
            if (strlen($password) < 8 || !preg_match("/[A-Z]/", $password) || !preg_match("/[a-z]/", $password) || !preg_match("/[0-9]/", $password)) {
                echo json_encode(["success" => false, "message" => "La contraseña debe tener mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número."]);
                exit();
            }

            // Check if email already exists
            $checkQuery = "SELECT p.Correo, u.CorreoVerificado FROM safar_persona p LEFT JOIN safar_usuario u ON p.CodigoPersona = u.CodigoPersona WHERE p.Correo = :email LIMIT 1";
            $checkStmt = $conn->prepare($checkQuery);
            $checkStmt->bindParam(':email', $email);
            $checkStmt->execute();
            $existingUser = $checkStmt->fetch(PDO::FETCH_ASSOC);
            
            if ($existingUser) {
                if ($existingUser['CorreoVerificado'] == 0) {
                    echo json_encode(["success" => false, "message" => "El correo electrónico ya está registrado pero no ha sido verificado. Por favor verifica tu bandeja."]);
                } else {
                    echo json_encode(["success" => false, "message" => "El correo electrónico ya está registrado."]);
                }
                exit();
            }

            require_once 'send_mail.php';

            $conn->beginTransaction();

            $codPersona = uniqid('PER-');
            $codUsuario = uniqid('USR-');
            $codCliente = uniqid('CLI-');
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
            $otp = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
            $expiration = date('Y-m-d H:i:s', strtotime('+15 minutes'));

            // Insert safar_persona
            $stmt1 = $conn->prepare("INSERT INTO safar_persona (CodigoPersona, NombrePersona, Correo, Telefono, UrlINE, Activo) VALUES (:cod, :nombre, :correo, '', '', 1)");
            $stmt1->execute([':cod' => $codPersona, ':nombre' => $name, ':correo' => $email]);

            // Insert safar_usuario
            $stmt2 = $conn->prepare("INSERT INTO safar_usuario (CodigoUsuario, NombreUsuario, Contraseña, CodigoPersona, Activo, CorreoVerificado, CodigoOTP, ExpiracionOTP) VALUES (:cod, :nombre, :pass, :codPer, 1, 0, :otp, :exp)");
            $stmt2->execute([':cod' => $codUsuario, ':nombre' => $name, ':pass' => $hashedPassword, ':codPer' => $codPersona, ':otp' => $otp, ':exp' => $expiration]);

            // Insert safar_cliente
            $stmt3 = $conn->prepare("INSERT INTO safar_cliente (CodigoCliente, CodigoUsuario, Descripcion, Activo) VALUES (:cod, :codUser, 'Registro Web', 1)");
            $stmt3->execute([':cod' => $codCliente, ':codUser' => $codUsuario]);

            $conn->commit();

            // Enviar correo de verificación
            $subject = "Verifica tu cuenta de Safar Elite";
            $body = "Hola " . htmlspecialchars($name) . ",<br><br>Bienvenido a Safar Elite. Tu código de verificación es: <b>" . $otp . "</b><br>Este código expirará en 15 minutos.";
            sendMail($email, $subject, $body);

            echo json_encode([
                "success" => true,
                "requires_verification" => true,
                "message" => "Cuenta creada. Por favor, verifica tu correo para activar tu cuenta."
            ]);
            exit();

        } elseif ($data->action === 'login_google') {
            if (!isset($data->email)) {
                echo json_encode(["success" => false, "message" => "Email de Google no proporcionado."]);
                exit();
            }

            $email = $data->email;
            $name = isset($data->name) ? $data->name : '';

            // Check if user exists
            $query = "SELECT u.CodigoUsuario, u.NombreUsuario, u.Activo, p.Telefono, p.UrlINE
                      FROM safar_usuario u
                      JOIN safar_persona p ON u.CodigoPersona = p.CodigoPersona
                      WHERE p.Correo = :email LIMIT 1";

            $stmt = $conn->prepare($query);
            $stmt->bindParam(':email', $email);
            $stmt->execute();
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user) {
                if ($user['Activo']) {
                    $perfilCompleto = !empty($user['Telefono']) && !empty($user['UrlINE']);
                    echo json_encode([
                        "success" => true,
                        "user" => [
                            "codigoUsuario" => $user['CodigoUsuario'],
                            "nombre" => $user['NombreUsuario'],
                            "perfilCompleto" => $perfilCompleto
                        ]
                    ]);
                } else {
                    echo json_encode(["success" => false, "message" => "El usuario no está activo."]);
                }
            } else {
                // Auto-register Google User
                $conn->beginTransaction();

                $codPersona = uniqid('PER-');
                $codUsuario = uniqid('USR-');
                $codCliente = uniqid('CLI-');
                $dummyPassword = password_hash(uniqid('oauth-'), PASSWORD_DEFAULT);

                // Insert safar_persona
                $stmt1 = $conn->prepare("INSERT INTO safar_persona (CodigoPersona, NombrePersona, Correo, Telefono, UrlINE, Activo) VALUES (:cod, :nombre, :correo, '', '', 1)");
                $stmt1->execute([':cod' => $codPersona, ':nombre' => $name, ':correo' => $email]);

                // Insert safar_usuario (Google users are pre-verified)
                $stmt2 = $conn->prepare("INSERT INTO safar_usuario (CodigoUsuario, NombreUsuario, Contraseña, CodigoPersona, Activo, CorreoVerificado) VALUES (:cod, :nombre, :pass, :codPer, 1, 1)");
                $stmt2->execute([':cod' => $codUsuario, ':nombre' => $name, ':pass' => $dummyPassword, ':codPer' => $codPersona]);

                // Insert safar_cliente
                $stmt3 = $conn->prepare("INSERT INTO safar_cliente (CodigoCliente, CodigoUsuario, Descripcion, Activo) VALUES (:cod, :codUser, 'Registro Google', 1)");
                $stmt3->execute([':cod' => $codCliente, ':codUser' => $codUsuario]);

                $conn->commit();

                // New Google users always need to complete profile
                echo json_encode([
                    "success" => true,
                    "user" => [
                        "codigoUsuario" => $codUsuario,
                        "nombre" => $name,
                        "perfilCompleto" => false
                    ]
                ]);
            }
            exit();
        } elseif ($data->action === 'verify_otp') {
            if (!isset($data->email) || !isset($data->otp)) {
                echo json_encode(["success" => false, "message" => "Faltan datos requeridos."]);
                exit();
            }

            $email = $data->email;
            $otp = $data->otp;

            $query = "SELECT u.CodigoUsuario, u.CodigoOTP, u.ExpiracionOTP 
                      FROM safar_usuario u 
                      JOIN safar_persona p ON u.CodigoPersona = p.CodigoPersona 
                      WHERE p.Correo = :email LIMIT 1";
            $stmt = $conn->prepare($query);
            $stmt->bindParam(':email', $email);
            $stmt->execute();
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user) {
                if ($user['CodigoOTP'] === $otp && strtotime($user['ExpiracionOTP']) > time()) {
                    // Activate account
                    $update = $conn->prepare("UPDATE safar_usuario SET CorreoVerificado = 1, CodigoOTP = NULL, ExpiracionOTP = NULL WHERE CodigoUsuario = :cod");
                    $update->execute([':cod' => $user['CodigoUsuario']]);

                    echo json_encode(["success" => true, "message" => "Cuenta verificada correctamente."]);
                } else {
                    echo json_encode(["success" => false, "message" => "Código incorrecto o ha expirado."]);
                }
            } else {
                echo json_encode(["success" => false, "message" => "Usuario no encontrado."]);
            }
            exit();

        } elseif ($data->action === 'resend_otp') {
            if (!isset($data->email)) {
                echo json_encode(["success" => false, "message" => "Correo obligatorio."]);
                exit();
            }

            $email = $data->email;
            $query = "SELECT u.CodigoUsuario, p.NombrePersona 
                      FROM safar_usuario u 
                      JOIN safar_persona p ON u.CodigoPersona = p.CodigoPersona 
                      WHERE p.Correo = :email LIMIT 1";
            $stmt = $conn->prepare($query);
            $stmt->bindParam(':email', $email);
            $stmt->execute();
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user) {
                $otp = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
                $expiration = date('Y-m-d H:i:s', strtotime('+15 minutes'));
                
                $update = $conn->prepare("UPDATE safar_usuario SET CodigoOTP = :otp, ExpiracionOTP = :exp WHERE CodigoUsuario = :cod");
                $update->execute([':otp' => $otp, ':exp' => $expiration, ':cod' => $user['CodigoUsuario']]);

                require_once 'send_mail.php';
                $subject = "Tu código Safar Elite";
                $body = "Hola " . htmlspecialchars($user['NombrePersona']) . ",<br><br>Tu código OTP de Safar Elite es: <b>" . $otp . "</b>";
                sendMail($email, $subject, $body);

                echo json_encode(["success" => true, "message" => "Código reenviado a tu correo."]);
            } else {
                echo json_encode(["success" => false, "message" => "Usuario no encontrado."]);
            }
            exit();

        } elseif ($data->action === 'forgot_password') {
            if (!isset($data->email)) {
                echo json_encode(["success" => false, "message" => "Correo obligatorio."]);
                exit();
            }

            $email = $data->email;
            $query = "SELECT u.CodigoUsuario, p.NombrePersona 
                      FROM safar_usuario u 
                      JOIN safar_persona p ON u.CodigoPersona = p.CodigoPersona 
                      WHERE p.Correo = :email LIMIT 1";
            $stmt = $conn->prepare($query);
            $stmt->bindParam(':email', $email);
            $stmt->execute();
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user) {
                $otp = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
                $expiration = date('Y-m-d H:i:s', strtotime('+15 minutes'));
                
                // LOG PARA DEPURACIÓN
                file_put_contents(__DIR__ . '/otp_debug.txt', date('Y-m-d H:i:s') . " - FORGOT REQUEST: Email[$email] New_OTP[$otp]" . PHP_EOL, FILE_APPEND);

                $update = $conn->prepare("UPDATE safar_usuario SET CodigoOTP = :otp, ExpiracionOTP = :exp WHERE CodigoUsuario = :cod");
                $update->execute([':otp' => $otp, ':exp' => $expiration, ':cod' => $user['CodigoUsuario']]);

                require_once 'send_mail.php';
                $subject = "Recuperación de contraseña - Safar Elite";
                $body = "Hola " . $user['NombrePersona'] . ",<br><br>Has solicitado restablecer tu contraseña. Tu código de recuperación es:<br><br><b style='font-size: 24px; color: #d4af37;'>" . $otp . "</b><br><br>Este código expirará en 15 minutos.";
                
                sendMail($email, $subject, $body);
            } else {
                // Log if user not found (security risk if we reveal this, so just log)
                file_put_contents(__DIR__ . '/otp_debug.txt', date('Y-m-d H:i:s') . " - FORGOT REQUEST: Email[$email] NOT FOUND" . PHP_EOL, FILE_APPEND);
            }

            // Siempre responder lo mismo por razones de seguridad
            echo json_encode(["success" => true, "message" => "Si hay una cuenta vinculada, las instrucciones han sido enviadas a la bandeja de correo."]);
            exit();

        } elseif ($data->action === 'reset_password') {
            if (!isset($data->email) || !isset($data->otp) || !isset($data->password)) {
                echo json_encode(["success" => false, "message" => "Faltan datos requeridos."]);
                exit();
            }

            $email = trim($data->email);
            $otp = trim($data->otp);
            $password = $data->password;

            // Autenticación de registro para depuración
            $debugLine = date('Y-m-d H:i:s') . " - RESET ATTEMPT: Email[$email] OTP[$otp]";
            file_put_contents(__DIR__ . '/otp_debug.txt', $debugLine . PHP_EOL, FILE_APPEND);

            if (strlen($password) < 8 || !preg_match("/[A-Z]/", $password) || !preg_match("/[a-z]/", $password) || !preg_match("/[0-9]/", $password)) {
                echo json_encode(["success" => false, "message" => "La contraseña debe tener mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número."]);
                exit();
            }

            $query = "SELECT u.CodigoUsuario, u.CodigoOTP, u.ExpiracionOTP 
                      FROM safar_usuario u 
                      JOIN safar_persona p ON u.CodigoPersona = p.CodigoPersona 
                      WHERE p.Correo = :email LIMIT 1";
            $stmt = $conn->prepare($query);
            $stmt->bindParam(':email', $email);
            $stmt->execute();
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user) {
                $debugLine = date('Y-m-d H:i:s') . " - RESET DB INFO: Found user [" . $user['CodigoUsuario'] . "] DB_OTP [" . $user['CodigoOTP'] . "] DB_EXP [" . $user['ExpiracionOTP'] . "]";
                file_put_contents(__DIR__ . '/otp_debug.txt', $debugLine . PHP_EOL, FILE_APPEND);
            } else {
                file_put_contents(__DIR__ . '/otp_debug.txt', date('Y-m-d H:i:s') . " - RESET DB INFO: User not found" . PHP_EOL, FILE_APPEND);
            }

            if (!$user) {
                echo json_encode(["success" => false, "message" => "Usuario no encontrado."]);
                exit();
            }

            if ($user['CodigoOTP'] != $otp) {
                echo json_encode(["success" => false, "message" => "El código de recuperación es incorrecto."]);
                exit();
            }

            if (strtotime($user['ExpiracionOTP']) <= time()) {
                echo json_encode(["success" => false, "message" => "El código de recuperación ha expirado."]);
                exit();
            }

            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
            $update = $conn->prepare("UPDATE safar_usuario SET Contraseña = :pass, CodigoOTP = NULL, ExpiracionOTP = NULL WHERE CodigoUsuario = :cod");
            $update->execute([':pass' => $hashedPassword, ':cod' => $user['CodigoUsuario']]);

            echo json_encode(["success" => true, "message" => "Contraseña actualizada correctamente. Puedes iniciar sesión."]);
            exit();
        }
    }
    echo json_encode(["success" => false, "message" => "Acción no válida."]);
} catch (Exception $e) {
    if ($conn->inTransaction()) {
        $conn->rollBack();
    }
    echo json_encode(["success" => false, "message" => "Error del servidor: " . $e->getMessage()]);
}
?>
