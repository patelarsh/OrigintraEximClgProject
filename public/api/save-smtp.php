<?php
/**
 * ===============================================================
 * Origintra Exim - Save Server-Side SMTP Configuration Endpoint
 * ===============================================================
 * 
 * Securely persists Hostinger SMTP credentials to the server so that
 * all public inquiries, quote submissions, and notifications are 
 * dispatched via authenticated SMTP (smtp.hostinger.com:465) even
 * when submitted by anonymous visitors.
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    echo json_encode(['status' => 'ok']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed. Use POST.']);
    exit;
}

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true) ?: [];

$host = trim($data['host'] ?? 'smtp.hostinger.com');
$port = (int)($data['port'] ?? 465);
$user = trim($data['user'] ?? 'export@origintra.com');
$pass = trim($data['pass'] ?? '');
$from = trim($data['from'] ?? $user);
$name = trim($data['name'] ?? 'Origintra Exim');
$adminAlertEmail = trim($data['adminAlertEmail'] ?? 'export@origintra.com, info@patelarsh.com');

if (empty($pass)) {
    http_response_code(400);
    echo json_encode([
        'success' => false, 
        'message' => 'SMTP Password is required to save server configuration.'
    ]);
    exit;
}

// Write mail-config.php securely
$configFile = __DIR__ . '/mail-config.php';
$escapedHost = addslashes($host);
$escapedUser = addslashes($user);
$escapedPass = addslashes($pass);
$escapedFrom = addslashes($from);
$escapedName = addslashes($name);
$escapedAdmin = addslashes($adminAlertEmail);

$content = "<?php\n" .
           "// Origintra Exim - Server-Side SMTP Configuration\n" .
           "defined('SECURE_MAIL_CONFIG') or die('Restricted access');\n" .
           "return [\n" .
           "    'host' => '{$escapedHost}',\n" .
           "    'port' => {$port},\n" .
           "    'user' => '{$escapedUser}',\n" .
           "    'pass' => '{$escapedPass}',\n" .
           "    'from' => '{$escapedFrom}',\n" .
           "    'name' => '{$escapedName}',\n" .
           "    'adminAlertEmail' => '{$escapedAdmin}'\n" .
           "];\n";

if (@file_put_contents($configFile, $content) !== false) {
    echo json_encode([
        'success' => true,
        'message' => 'Hostinger SMTP credentials saved securely to server! All incoming inquiries will now be sent via authenticated SMTP.',
        'host' => $host,
        'port' => $port,
        'user' => $user
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to write configuration file on server. Check file permissions in public_html/api/.'
    ]);
}
