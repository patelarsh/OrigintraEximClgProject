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
        $changed = false;
        $uploadsDir = dirname(__DIR__) . '/uploads';

        foreach ($decoded as &$item) {
            $img = isset($item['image']) ? $item['image'] : '';
            $id = isset($item['id']) ? $item['id'] : '';

            $isBrokenUpload = false;
            if (strpos($img, '_1792319') !== false) {
                $isBrokenUpload = true;
            } elseif (strpos($img, '/uploads/') === 0) {
                $filename = basename($img);
                if (!file_exists($uploadsDir . '/' . $filename)) {
                    $isBrokenUpload = true;
                }
            } elseif (empty($img) || strlen($img) < 5) {
                $isBrokenUpload = true;
            }

            if ($isBrokenUpload && !empty($id)) {
                $canonical = '/assets/products/' . $id . '.jpg';
                if ($id === 'whole-turmeric') $canonical = '/assets/products/turmeric.jpg';
                if ($id === 'cloves') $canonical = '/assets/products/clove.jpg';
                if ($id === 'fennel-seeds') $canonical = '/assets/products/fennel.jpg';
                if ($id === 'cardamom') $canonical = '/assets/products/green-cardamom.jpg';
                if ($id === 'ginger') $canonical = '/assets/products/dry-ginger.jpg';
                if ($id === 'red-chilli') $canonical = '/assets/products/whole-red-chili.jpg';
                $item['image'] = $canonical;
                $changed = true;
            }
        }
        unset($item);

        if ($changed) {
            $jsonContent = json_encode($decoded, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
            @file_put_contents($dataFile, $jsonContent);
        }

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
