<?php
/**
 * ===============================================================
 * Origintra Exim - Pure Nodemailer SMTP Verification Bridge
 * ===============================================================
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

$rawInput = file_get_contents('php://input');

$nodePorts = [5000, 3001];
$forwarded = false;
$lastError = 'Node.js Nodemailer service is not running on localhost:5000 or 3001.';

foreach ($nodePorts as $port) {
    $url = "http://127.0.0.1:{$port}/api/verify-smtp";
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
    curl_setopt($ch, CURLOPT_POSTFIELDS, $rawInput);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 3);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Content-Length: ' . strlen($rawInput)
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlErr = curl_error($ch);
    curl_close($ch);

    if ($response !== false && $httpCode >= 200 && $httpCode < 500) {
        http_response_code($httpCode);
        echo $response;
        $forwarded = true;
        break;
    }
}

if (!$forwarded) {
    http_response_code(503);
    echo json_encode([
        'success' => false,
        'message' => 'Node.js Nodemailer engine must be running on localhost:5000 (npm run server).'
    ]);
}
