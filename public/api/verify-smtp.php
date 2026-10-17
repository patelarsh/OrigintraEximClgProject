<?php
/**
 * ===============================================================
 * Origintra Exim - SMTP Verification Endpoint (Hostinger PHP)
 * ===============================================================
 * 
 * Secure endpoint to test and verify Hostinger SMTP credentials
 * directly from the Admin Portal Email Settings.
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=UTF-8');

// Handle CORS Pre-flight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    echo json_encode(['status' => 'ok']);
    exit;
}

// Health check / GET status
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode([
        'status' => 'online',
        'service' => 'Origintra Exim SMTP Verifier',
        'php_version' => PHP_VERSION,
        'sockets_available' => function_exists('stream_socket_client')
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed. Use POST.']);
    exit;
}

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true) ?: [];

$host = trim($data['host'] ?? 'smtp.hostinger.com');
$port = (int)($data['port'] ?? 465);
$user = trim($data['user'] ?? '');
$pass = trim($data['pass'] ?? '');

if (empty($user)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'SMTP Username / Account Email is required.'
    ]);
    exit;
}

if (empty($pass)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'SMTP Password is required to verify the connection. Please enter your Hostinger email password.'
    ]);
    exit;
}

try {
    $timeout = 15;
    $isSsl = ($port === 465);
    $remoteHost = $isSsl ? "ssl://{$host}" : $host;

    $context = stream_context_create([
        'ssl' => [
            'verify_peer' => false,
            'verify_peer_name' => false,
            'allow_self_signed' => true
        ]
    ]);

    $socket = @stream_socket_client("{$remoteHost}:{$port}", $errno, $errstr, $timeout, STREAM_CLIENT_CONNECT, $context);
    if (!$socket) {
        throw new Exception("Could not connect to {$host}:{$port} - {$errstr} ({$errno})");
    }

    stream_set_timeout($socket, $timeout);

    $readResponse = function() use ($socket) {
        $response = '';
        while ($line = fgets($socket, 515)) {
            $response .= $line;
            if (substr($line, 3, 1) === ' ') break;
        }
        return $response;
    };

    $sendCommand = function($cmd, $expectedCode, $label = '') use ($socket, $readResponse) {
        fputs($socket, $cmd . "\r\n");
        $res = $readResponse();
        $code = (int)substr($res, 0, 3);
        if ($code !== $expectedCode && ($expectedCode === 250 && !in_array($code, [250, 251, 252]))) {
            $msg = trim($res);
            if ($code === 535) {
                throw new Exception("Authentication failed (535): Incorrect email address or password for '{$cmd}'. Please check your Hostinger email password in hPanel.");
            }
            throw new Exception(($label ?: $cmd) . " failed: {$msg}");
        }
        return $res;
    };

    // 1. Initial Greeting
    $greeting = $readResponse();
    if ((int)substr($greeting, 0, 3) !== 220) {
        fclose($socket);
        throw new Exception("Invalid greeting from mail server: " . trim($greeting));
    }

    // 2. EHLO
    $sendCommand("EHLO origintra.com", 250, "EHLO handshake");

    // 3. STARTTLS if port 587
    if ($port === 587) {
        $sendCommand("STARTTLS", 220, "STARTTLS");
        if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
            fclose($socket);
            throw new Exception("TLS encryption negotiation failed on port 587.");
        }
        $sendCommand("EHLO origintra.com", 250, "EHLO post-TLS");
    }

    // 4. AUTH LOGIN
    $sendCommand("AUTH LOGIN", 334, "AUTH LOGIN initiation");
    $sendCommand(base64_encode($user), 334, "Username submission");
    $sendCommand(base64_encode($pass), 235, "Password authentication");

    // 5. QUIT
    fputs($socket, "QUIT\r\n");
    fclose($socket);

    echo json_encode([
        'success' => true,
        'message' => "SMTP connection to {$host}:{$port} and credentials for {$user} verified successfully!"
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
