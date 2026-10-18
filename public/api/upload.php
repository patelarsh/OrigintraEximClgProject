<?php
/**
 * Origintra Exim - Image Upload API
 * Handles file uploads and base64 image conversion, saving directly into /uploads/ folder.
 * Prevents LocalStorage 5MB quota errors in browser and serves real static image URLs.
 */

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed. Use POST.']);
    exit;
}

$uploadsDir = dirname(__DIR__) . '/uploads';
if (!is_dir($uploadsDir)) {
    @mkdir($uploadsDir, 0755, true);
}

// 1. Check for standard multipart file upload ($_FILES)
if (!empty($_FILES['file']) && is_uploaded_file($_FILES['file']['tmp_name'])) {
    $file = $_FILES['file'];
    if ($file['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Upload error code: ' . $file['error']]);
        exit;
    }

    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $allowed = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    if (!in_array($ext, $allowed)) {
        $ext = 'jpg';
    }

    $filename = 'upload_' . time() . '_' . substr(md5(uniqid('', true)), 0, 6) . '.' . $ext;
    $targetPath = $uploadsDir . '/' . $filename;

    if (move_uploaded_file($file['tmp_name'], $targetPath)) {
        @chmod($targetPath, 0644);
        echo json_encode([
            'success' => true,
            'url' => '/uploads/' . $filename,
            'filename' => $filename
        ]);
        exit;
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to save uploaded file on server.']);
        exit;
    }
}

// 2. Check for base64 JSON payload
$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

if (is_array($data) && !empty($data['dataUrl'])) {
    $dataUrl = $data['dataUrl'];
    
    // Check if valid data URL
    if (preg_match('/^data:image\/(\w+);base64,/', $dataUrl, $matches)) {
        $type = strtolower($matches[1]);
        if ($type === 'jpeg') $type = 'jpg';
        $allowed = ['jpg', 'png', 'webp', 'gif'];
        if (!in_array($type, $allowed)) {
            $type = 'jpg';
        }

        $base64Data = substr($dataUrl, strpos($dataUrl, ',') + 1);
        $decoded = base64_decode($base64Data);

        if ($decoded === false) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Base64 decode failed.']);
            exit;
        }

        $prefix = !empty($data['prefix']) ? preg_replace('/[^a-zA-Z0-9_-]/', '', $data['prefix']) : 'spice';
        $filename = $prefix . '_' . time() . '_' . substr(md5(uniqid('', true)), 0, 6) . '.' . $type;
        $targetPath = $uploadsDir . '/' . $filename;

        if (@file_put_contents($targetPath, $decoded) !== false) {
            @chmod($targetPath, 0644);
            echo json_encode([
                'success' => true,
                'url' => '/uploads/' . $filename,
                'filename' => $filename
            ]);
            exit;
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to write file to /uploads/ folder.']);
            exit;
        }
    }
}

http_response_code(400);
echo json_encode(['success' => false, 'message' => 'No valid file or base64 image data received.']);
