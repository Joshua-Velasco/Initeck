<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Verifica si Composer autoload existe
$hasMailer = file_exists(__DIR__ . '/vendor/autoload.php');
if ($hasMailer) {
    require_once __DIR__ . '/vendor/autoload.php';
}

/**
 * Envia el correo OTP al usuario.
 * Prioridad: PHPMailer SMTP > PHP mail() nativo > Log local
 * @param string $to Dirección de correo
 * @param string $subject Asunto del correo
 * @param string $body Contenido HTML del correo
 * @return bool
 */
function sendMail($to, $subject, $body) {
    global $hasMailer;

    // =====================================================
    // CONFIGURACIÓN - Actualiza estos valores con los datos
    // de la cuenta de correo que creaste en cPanel
    // =====================================================
    $smtpConfig = [
        'host'     => 'mail.initeck.com.mx',
        'username' => 'noreply@safar.initeck.com.mx',
        'password' => '^OsOURxhW.qOi;m4',
        'port'     => 465,
        'secure'   => 'ssl',
        'fromName' => 'Safar Elite',
    ];

    // --- ENVÍO DE CORREO (funciona en local y en servidor) ---

    // Opción 1: PHPMailer con SMTP (preferido)
    if ($hasMailer) {
        $mail = new PHPMailer(true);
        try {
            $mail->isSMTP();
            $mail->Host       = $smtpConfig['host'];
            $mail->SMTPAuth   = true;
            $mail->Username   = $smtpConfig['username'];
            $mail->Password   = $smtpConfig['password'];
            $mail->Port       = $smtpConfig['port'];

            if ($smtpConfig['secure'] === 'ssl') {
                $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
            } else {
                $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            }

            // Recipientes
            $mail->setFrom($smtpConfig['username'], $smtpConfig['fromName']);
            $mail->addAddress($to);

            // Contenido
            $mail->isHTML(true);
            $mail->CharSet = 'UTF-8';
            $mail->Subject = $subject;
            $mail->Body    = buildEmailTemplate($subject, $body);
            $mail->AltBody = strip_tags(str_replace('<br>', "\n", $body));

            $mail->send();
            return true;
        } catch (Exception $e) {
            error_log("PHPMailer Error: {$mail->ErrorInfo}");
            // Intentar con mail() nativo como respaldo
        }
    }

    // Opción 2: PHP mail() nativo (respaldo - funciona en la mayoría de hostings con cPanel)
    $headers  = "MIME-Version: 1.0\r\n";
    $headers .= "Content-type: text/html; charset=UTF-8\r\n";
    $headers .= "From: " . $smtpConfig['fromName'] . " <" . $smtpConfig['username'] . ">\r\n";
    $headers .= "Reply-To: " . $smtpConfig['username'] . "\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";

    $htmlBody = buildEmailTemplate($subject, $body);
    $result = mail($to, $subject, $htmlBody, $headers);
    
    if (!$result) {
        error_log("PHP mail() falló al enviar a: $to");
    }
    
    return $result;
}

/**
 * Genera una plantilla de correo HTML profesional
 */
function buildEmailTemplate($subject, $content) {
    return '
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0; padding:0; background-color:#0a0a0f; font-family: Arial, Helvetica, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0f; padding: 40px 20px;">
            <tr>
                <td align="center">
                    <table width="500" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #13131a, #1a1a2e); border-radius: 16px; border: 1px solid rgba(212,175,55,0.2); overflow: hidden;">
                        <!-- Header -->
                        <tr>
                            <td style="padding: 30px 40px 20px; text-align: center; border-bottom: 1px solid rgba(212,175,55,0.15);">
                                <h1 style="color: #d4af37; font-size: 28px; letter-spacing: 6px; margin: 0;">SAFAR</h1>
                                <p style="color: rgba(212,175,55,0.6); font-size: 11px; letter-spacing: 3px; margin: 5px 0 0;">ELITE TRANSPORT</p>
                            </td>
                        </tr>
                        <!-- Content -->
                        <tr>
                            <td style="padding: 30px 40px;">
                                <h2 style="color: #ffffff; font-size: 18px; margin: 0 0 20px;">' . htmlspecialchars($subject) . '</h2>
                                <div style="color: #cccccc; font-size: 15px; line-height: 1.6;">
                                    ' . $content . '
                                </div>
                            </td>
                        </tr>
                        <!-- Footer -->
                        <tr>
                            <td style="padding: 20px 40px 30px; text-align: center; border-top: 1px solid rgba(212,175,55,0.15);">
                                <p style="color: #666; font-size: 12px; margin: 0;">Este es un correo automático de Safar Elite.</p>
                                <p style="color: #444; font-size: 11px; margin: 5px 0 0;">Si no solicitaste este correo, puedes ignorarlo.</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>';
}
?>
