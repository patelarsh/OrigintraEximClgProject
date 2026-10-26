<?php
/**
 * ===============================================================
 * Origintra Exim - Smooth SMTP Verification Bridge
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
if (!is_array($body)) {
    $body = [];
}

$host = !empty($body['host']) ? $body['host'] : 'smtp.hostinger.com';
$port = !empty($body['port']) ? intval($body['port']) : 465;
$user = !empty($body['user']) ? $body['user'] : 'export@origintra.com';
$pass = !empty($body['pass']) ? $body['pass'] : '';

// If password not sent in current payload, check saved credentials file
if (empty($pass)) {
    $savedFile = __DIR__ . '/smtp-credentials.json';
    if (file_exists($savedFile)) {
        $saved = json_decode(file_get_contents($savedFile), true);
        if (is_array($saved)) {
            if (!empty($saved['pass'])) $pass = $saved['pass'];
            else if (!empty($saved['smtpPassword'])) $pass = $saved['smtpPassword'];
            if (empty($user) && !empty($saved['user'])) $user = $saved['user'];
            else if (empty($user) && !empty($saved['smtpUser'])) $user = $saved['smtpUser'];
        }
    }
}

$targetHost = ($port === 465) ? "ssl://{$host}" : "tcp://{$host}";
$startTime = microtime(true);
$errno = 0;
$errstr = '';

$fp = @fsockopen($targetHost, $port, $errno, $errstr, 8);
if ($fp) {
    stream_set_timeout($fp, 6);
    $banner = fgets($fp, 512);

    // EHLO
    fputs($fp, "EHLO origintra.com\r\n");
    $ehloResp = '';
    while ($line = fgets($fp, 512)) {
        $ehloResp .= $line;
        if (substr($line, 3, 1) === ' ') break;
    }

    $authSuccess = true;
    $authMsg = "Hostinger SMTP server ({$host}:{$port}) is online & reachable!";

    if (!empty($pass)) {
        fputs($fp, "AUTH LOGIN\r\n");
        $r = fgets($fp, 512);
        if (substr($r, 0, 3) === '334') {
            fputs($fp, base64_encode($user) . "\r\n");
            $r = fgets($fp, 512);
            if (substr($r, 0, 3) === '334') {
                fputs($fp, base64_encode($pass) . "\r\n");
                $r = fgets($fp, 512);
                if (substr($r, 0, 3) === '235') {
                    $authSuccess = true;
                    $authMsg = "SMTP connected and authenticated successfully! ({$host}:{$port})";
                } else {
                    $authSuccess = false;
                    $authMsg = "Authentication failed: " . trim($r) . ". Please verify your password.";
                }
            } else {
                $authSuccess = false;
                $authMsg = "Username rejected: " . trim($r);
            }
        } else {
            $authSuccess = false;
            $authMsg = "AUTH LOGIN rejected: " . trim($r);
        }
    }

    fputs($fp, "QUIT\r\n");
    fclose($fp);

    $latencyMs = round((microtime(true) - $startTime) * 1000);
    http_response_code(200);
    echo json_encode([
        'success' => $authSuccess,
        'message' => $authMsg,
        'latencyMs' => $latencyMs
    ]);
    exit;
} else {
    http_response_code(200);
    echo json_encode([
        'success' => false,
        'message' => "Could not connect to {$host}:{$port} ({$errstr})."
    ]);
    exit;
}
