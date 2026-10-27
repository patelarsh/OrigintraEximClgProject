<?php
/**
 * Origintra Exim - Global Site Settings Handler
 * Stores and serves global site settings (e.g. leadership component visibility) across all devices and crawlers.
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

$settingsFile = __DIR__ . '/site-settings.json';

// Default configuration: Hidden per user requirement
$defaultSettings = [
    'leadershipVisible' => false,
    'deletedGalleryIds' => [],
    'deletedProductIds' => [],
    'updatedAt' => date('c')
];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true);

    if (!is_array($input)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid JSON input'
        ]);
        exit;
    }

    // Read current settings if exist
    $currentSettings = $defaultSettings;
    if (file_exists($settingsFile)) {
        $content = file_get_contents($settingsFile);
        $decoded = json_decode($content, true);
        if (is_array($decoded)) {
            $currentSettings = array_merge($currentSettings, $decoded);
        }
    }

    if (isset($input['leadershipVisible'])) {
        $currentSettings['leadershipVisible'] = (bool)$input['leadershipVisible'];
    }

    if (isset($input['deletedGalleryIds']) && is_array($input['deletedGalleryIds'])) {
        $currentSettings['deletedGalleryIds'] = array_values(array_unique(array_filter($input['deletedGalleryIds'], 'is_string')));
    }

    if (isset($input['deletedProductIds']) && is_array($input['deletedProductIds'])) {
        $currentSettings['deletedProductIds'] = array_values(array_unique(array_filter($input['deletedProductIds'], 'is_string')));
    }

    if (isset($input['legalPolicies']) && is_array($input['legalPolicies'])) {
        $currentSettings['legalPolicies'] = $input['legalPolicies'];
    }

    $currentSettings['updatedAt'] = date('c');

    // Save atomically
    $tempFile = $settingsFile . '.tmp';
    $jsonContent = json_encode($currentSettings, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    $saved = @file_put_contents($tempFile, $jsonContent);
    if ($saved !== false) {
        rename($tempFile, $settingsFile);
    } else {
        @file_put_contents($settingsFile, $jsonContent);
    }

    echo json_encode([
        'success' => true,
        'message' => 'Settings updated successfully',
        'settings' => $currentSettings
    ]);
    exit;
}

// GET Request: Serve current settings
if (file_exists($settingsFile)) {
    $content = file_get_contents($settingsFile);
    $decoded = json_decode($content, true);
    if (is_array($decoded)) {
        echo json_encode([
            'success' => true,
            'settings' => array_merge($defaultSettings, $decoded)
        ]);
        exit;
    }
}

// Fallback to defaults
echo json_encode([
    'success' => true,
    'settings' => $defaultSettings
]);
exit;
