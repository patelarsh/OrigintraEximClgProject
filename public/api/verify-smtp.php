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
$body = json_decode($rawInput, true);

$nodePorts = [5000, 3001];
$forwarded = false;

// 1. Try local Node.js Nodemailer engine if running
foreach ($nodePorts as $port) {
    $url = "http://127.0.0.1:{$port}/api/verify-smtp";
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

// 2. Direct PHP Hostinger SMTP verification fallback (when on Hostinger shared hosting without Node.js)
if (!$forwarded) {
    $host = !empty($body['host']) ? $body['host'] : 'smtp.hostinger.com';
    $port = !empty($body['port']) ? intval($body['port']) : 465;
    $user = !empty($body['user']) ? $body['user'] : '';
    $pass = !empty($body['pass']) ? $body['pass'] : '';

    $targetHost = ($port === 465) ? "ssl://{$host}" : "tcp://{$host}";
    $startTime = microtime(true);
    $errno = 0;
    $errstr = '';

    $fp = @fsockopen($targetHost, $port, $errno, $errstr, 6);
    if ($fp) {
        stream_set_timeout($fp, 5);
        $banner = fgets($fp, 512);

        // EHLO
        fputs($fp, "EHLO origintra.com\r\n");
        $ehloResp = '';
        while ($line = fgets($fp, 512)) {
            $ehloResp .= $line;
            if (substr($line, 3, 1) === ' ') break;
        }

        $authSuccess = true;
        $authMsg = "SMTP Server {$host}:{$port} is online and responding!";

        if (!empty($user) && !empty($pass)) {
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
                        $authMsg = "SMTP connection and credentials verified successfully ({$host}:{$port})!";
                    } else {
                        $authSuccess = false;
                        $authMsg = "Authentication failed: " . trim($r);
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
            'latencyMs' => $latencyMs,
            'engine' => 'Hostinger Native SMTP Bridge'
        ]);
        exit;
    } else {
        http_response_code(200);
        echo json_encode([
            'success' => false,
            'message' => "Could not connect to {$host}:{$port} ({$errstr})",
            'engine' => 'Hostinger Native SMTP Bridge'
        ]);
        exit;
    }
}
