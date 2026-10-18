<?php
/**
 * Origintra Exim - Global Products API
 * Persists customized / edited product catalogue changes across all devices and crawlers.
 */

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$dataFile = __DIR__ . '/products-data.json';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true);

    if (!is_array($input)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid JSON input. Array of products expected.'
        ]);
        exit;
    }

    $tempFile = $dataFile . '.tmp';
    $jsonContent = json_encode($input, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    $saved = @file_put_contents($tempFile, $jsonContent);
    if ($saved !== false) {
        rename($tempFile, $dataFile);
    } else {
        @file_put_contents($dataFile, $jsonContent);
    }

    echo json_encode([
        'success' => true,
        'message' => 'Products synchronized successfully',
        'count' => count($input)
    ]);
    exit;
}

// GET request
if (file_exists($dataFile)) {
    $content = file_get_contents($dataFile);
    $decoded = json_decode($content, true);
    if (is_array($decoded)) {
        echo json_encode([
            'success' => true,
            'products' => $decoded
        ]);
        exit;
    }
}

echo json_encode([
    'success' => false,
    'message' => 'No custom products saved on server yet.',
    'products' => null
]);
