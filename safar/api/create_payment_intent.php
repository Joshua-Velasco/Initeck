<?php
require_once 'db_config.php';
require_once 'vendor/autoload.php';

// Set your secret key. Remember to switch to your live secret key in production.
// See your keys here: https://dashboard.stripe.com/apikeys
$envPath = __DIR__ . '/env.php';
$envVars = file_exists($envPath) ? require_once $envPath : [];
$stripeSecret = isset($envVars['STRIPE_SECRET_KEY']) ? $envVars['STRIPE_SECRET_KEY'] : 'sk_test_fallback';

\Stripe\Stripe::setApiKey($stripeSecret);

header('Content-Type: application/json');

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

try {
    // retrieve JSON from POST body
    $json = file_get_contents('php://input');
    file_put_contents('debug.log', "Incoming payload: $json\n", FILE_APPEND);
    $data = json_decode($json);

    if (!isset($data->amount) || !isset($data->currency)) {
        throw new Exception('Invalid input: amount and currency required.');
    }

    $paymentIntent = \Stripe\PaymentIntent::create([
        'amount' => $data->amount, // amount in cents
        'currency' => $data->currency,
        'automatic_payment_methods' => ['enabled' => true],
    ]);

    $output = [
        'clientSecret' => $paymentIntent->client_secret,
    ];

    echo json_encode($output);
} catch (Error $e) {
    http_response_code(500);
    $msg = "Stripe Error: " . $e->getMessage() . " at " . $e->getFile() . ":" . $e->getLine();
    error_log($msg);
    file_put_contents('debug.log', "$msg\n", FILE_APPEND);
    echo json_encode(['error' => $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500);
    $msg = "Stripe Exception: " . $e->getMessage();
    error_log($msg);
    file_put_contents('debug.log', "$msg\n", FILE_APPEND);
    echo json_encode(['error' => $e->getMessage()]);
}
file_put_contents('debug.log', "Request processed: " . date('Y-m-d H:i:s') . "\n", FILE_APPEND);
?>
