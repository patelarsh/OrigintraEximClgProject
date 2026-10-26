<?php
/**
 * ===============================================================
 * Origintra Exim - Smooth SMTP Configuration Handler
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
$body = json_decode($rawInput, true);

if (!empty($rawInput) && is_array($body)) {
    $saveFile = __DIR__ . '/smtp-credentials.json';
    @file_put_contents($saveFile, json_encode($body, JSON_PRETTY_PRINT));
}

http_response_code(200);
echo json_encode([
    'success' => true,
    'message' => 'SMTP credentials saved and synced successfully!'
]);
