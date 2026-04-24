<?php
require_once 'vendor/autoload.php';
$envPath = __DIR__ . '/env.php';
$envVars = file_exists($envPath) ? require_once $envPath : [];
$stripeSecret = isset($envVars['STRIPE_SECRET_KEY']) ? $envVars['STRIPE_SECRET_KEY'] : 'sk_test_fallback';

\Stripe\Stripe::setApiKey($stripeSecret);
try {
    $bal = \Stripe\Balance::retrieve();
    echo "Stripe Key is VALID. Response: " . json_encode($bal) . "\n";
} catch (\Exception $e) {
    echo "Stripe Key is INVALID. Error: " . $e->getMessage() . "\n";
}
?>
