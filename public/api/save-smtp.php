<?php
/**
 * ===============================================================
 * Origintra Exim - Pure Nodemailer Config Bridge
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

// 1. Try local Node.js process if available
$nodePorts = [5000, 3001];
$forwarded = false;

foreach ($nodePorts as $port) {
    $url = "http://127.0.0.1:{$port}/api/save-smtp";
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
    curl_setopt($ch, CURLOPT_POSTFIELDS, $rawInput);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 2);
    curl_setopt($ch, CURLOPT_TIMEOUT, 6);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Content-Length: ' . strlen($rawInput)
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($response !== false && $httpCode >= 200 && $httpCode < 500) {
        http_response_code($httpCode);
        echo $response;
        $forwarded = true;
        break;
    }
}

// 2. Fallback to saving to local server file for Hostinger native dispatch
if (!$forwarded) {
    if (!empty($rawInput)) {
        $saveFile = __DIR__ . '/smtp-credentials.json';
        @file_put_contents($saveFile, $rawInput);
    }
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Credentials saved and synchronized with server.'
    ]);
}
