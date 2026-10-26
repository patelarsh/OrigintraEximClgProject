<?php
/**
 * ===============================================================
 * Origintra Exim - Pure Nodemailer Forwarder (STRICTLY NO PHP MAIL)
 * ===============================================================
 * 
 * In compliance with system policy:
 * PHP mail() and raw PHP sockets are PERMANENTLY DISABLED.
 * 
 * All email dispatch requests received by this script are forwarded
 * directly to the Pure Node.js Nodemailer Engine running on localhost:5000 or 3001.
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    echo json_encode(['status' => 'ok']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode([
        'status' => 'online',
        'service' => 'Origintra Exim Mail Bridge (Strictly Pure Nodemailer / No PHP Mail)',
        'php_mail_enabled' => false,
        'engine' => 'Node.js Nodemailer Pooled Queue'
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed. Use POST.']);
    exit;
}

$rawInput = file_get_contents('php://input');

// Forward to local Node.js Nodemailer engine
$nodePorts = [5000, 3001];
$forwarded = false;
$lastError = 'Node.js Nodemailer service is not running on localhost:5000 or 3001.';

foreach ($nodePorts as $port) {
    $url = "http://127.0.0.1:{$port}/api/send-mail";
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
    } else if ($curlErr) {
        $lastError = "Port {$port}: {$curlErr}";
    }
}

if (!$forwarded) {
    http_response_code(503);
    echo json_encode([
        'success' => false,
        'message' => 'PHP mail() is disabled per strict policy. Pure Nodemailer Node.js engine at localhost:5000 must be started (npm run server).',
        'details' => $lastError
    ]);
}
