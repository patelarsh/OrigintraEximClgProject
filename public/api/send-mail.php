<?php
/**
 * ===============================================================
 * Origintra Exim - Corporate Mailer Endpoint (Hostinger PHP)
 * ===============================================================
 * 
 * Secure endpoint to dispatch corporate emails (welcome credentials,
 * inquiry confirmations, notifications) via Hostinger SMTP or PHP mail().
 */

// Allow cross-origin requests from front-end
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
        'service' => 'Origintra Exim PHP Mailer',
        'server' => $_SERVER['SERVER_NAME'] ?? 'hostinger',
        'php_version' => PHP_VERSION,
        'mail_available' => function_exists('mail'),
        'sockets_available' => function_exists('fsockopen') || function_exists('stream_socket_client')
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed. Use POST.']);
    exit;
}

// Read and decode input
$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

if (!$data || !is_array($data)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid JSON payload received.']);
    exit;
}

$rawTo = $data['to'] ?? '';
$toAddresses = is_array($rawTo) ? $rawTo : explode(',', (string)$rawTo);
$validRecipients = [];
foreach ($toAddresses as $addr) {
    $cleaned = filter_var(trim($addr), FILTER_VALIDATE_EMAIL);
    if ($cleaned) $validRecipients[] = $cleaned;
}
if (empty($validRecipients)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Valid recipient email (to) is required.']);
    exit;
}
$to = implode(', ', $validRecipients);

$subject = trim($data['subject'] ?? 'Origintra Exim Notification');
$bodyText = trim($data['body'] ?? $data['text'] ?? '');
$bodyHtml = trim($data['html'] ?? '');
$senderEmail = filter_var($data['senderEmail'] ?? 'export@origintra.com', FILTER_VALIDATE_EMAIL) ?: 'export@origintra.com';
$senderName = trim($data['senderName'] ?? 'Origintra Exim Administration');
$smtp = $data['smtp'] ?? null;

/**
 * Send via pure PHP SMTP socket connection (Hostinger SSL/TLS)
 */
function sendViaSocketSmtp($host, $port, $user, $pass, $from, $fromName, $to, $subject, $bodyText, $bodyHtml = null) {
    $timeout = 15;
    $isSsl = ($port == 465 || $port == 587);
    $remoteHost = ($port == 465) ? "ssl://{$host}" : $host;

    $socket = @stream_socket_client("{$remoteHost}:{$port}", $errno, $errstr, $timeout, STREAM_CLIENT_CONNECT);
    if (!$socket) {
        throw new Exception("Could not connect to SMTP server {$host}:{$port} - {$errstr} ({$errno})");
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

    $sendCommand = function($cmd, $expectedCode) use ($socket, $readResponse) {
        fputs($socket, $cmd . "\r\n");
        $res = $readResponse();
        $code = (int)substr($res, 0, 3);
        if ($code !== $expectedCode && ($expectedCode === 250 && !in_array($code, [250, 251, 252]))) {
            throw new Exception("SMTP command [{$cmd}] failed: {$res}");
        }
        return $res;
    };

    // 1. Initial Greeting
    $greeting = $readResponse();
    if ((int)substr($greeting, 0, 3) !== 220) {
        fclose($socket);
        throw new Exception("Invalid greeting from SMTP server: {$greeting}");
    }

    // 2. EHLO
    $sendCommand("EHLO origintra.com", 250);

    // 3. STARTTLS if port 587
    if ($port == 587) {
        $sendCommand("STARTTLS", 220);
        if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
            fclose($socket);
            throw new Exception("TLS negotiation failed with {$host}");
        }
        $sendCommand("EHLO origintra.com", 250);
    }

    // 4. AUTH LOGIN
    if (!empty($user) && !empty($pass)) {
        $sendCommand("AUTH LOGIN", 334);
        $sendCommand(base64_encode($user), 334);
        $sendCommand(base64_encode($pass), 235);
    }

    // 5. MAIL FROM
    $sendCommand("MAIL FROM: <{$from}>", 250);

    // 6. RCPT TO (supports multiple recipients)
    $recipientsList = array_map('trim', explode(',', $to));
    foreach ($recipientsList as $rcptAddr) {
        if (!empty($rcptAddr)) {
            $sendCommand("RCPT TO: <{$rcptAddr}>", 250);
        }
    }

    // 7. DATA
    $sendCommand("DATA", 354);

    // 8. Construct Headers & Body
    $boundary = "----=_Part_" . md5(uniqid(microtime(true), true));
    $encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
    $encodedFromName = '=?UTF-8?B?' . base64_encode($fromName) . '?=';

    $headers = [
        "From: {$encodedFromName} <{$from}>",
        "Reply-To: {$from}",
        "To: {$to}",
        "Subject: {$encodedSubject}",
        "Date: " . date('r'),
        "MIME-Version: 1.0",
        "X-Mailer: OrigintraExim-Hostinger-Mailer"
    ];

    if (!empty($bodyHtml)) {
        $headers[] = "Content-Type: multipart/alternative; boundary=\"{$boundary}\"";
        
        $messageContent = "--{$boundary}\r\n" .
                          "Content-Type: text/plain; charset=UTF-8\r\n" .
                          "Content-Transfer-Encoding: base64\r\n\r\n" .
                          chunk_split(base64_encode($bodyText)) . "\r\n" .
                          "--{$boundary}\r\n" .
                          "Content-Type: text/html; charset=UTF-8\r\n" .
                          "Content-Transfer-Encoding: base64\r\n\r\n" .
                          chunk_split(base64_encode($bodyHtml)) . "\r\n" .
                          "--{$boundary}--";
    } else {
        $headers[] = "Content-Type: text/plain; charset=UTF-8";
        $headers[] = "Content-Transfer-Encoding: 8bit";
        $messageContent = $bodyText;
    }

    $emailData = implode("\r\n", $headers) . "\r\n\r\n" . $messageContent . "\r\n.";
    $sendCommand($emailData, 250);

    // 9. QUIT
    fputs($socket, "QUIT\r\n");
    fclose($socket);

    return true;
}

// Execution Strategy
$sent = false;
$methodUsed = '';
$errorDetails = '';

// Strategy A: If SMTP credentials provided, try direct SMTP connection
if ($smtp && !empty($smtp['host']) && !empty($smtp['user']) && !empty($smtp['pass'])) {
    try {
        $host = trim($smtp['host']);
        $port = (int)($smtp['port'] ?? 465);
        $user = trim($smtp['user']);
        $pass = trim($smtp['pass']);
        $from = filter_var($smtp['from'] ?? $senderEmail, FILTER_VALIDATE_EMAIL) ?: $user;
        $name = trim($smtp['name'] ?? $senderName);

        sendViaSocketSmtp($host, $port, $user, $pass, $from, $name, $to, $subject, $bodyText, $bodyHtml);
        $sent = true;
        $methodUsed = "SMTP ({$host}:{$port})";
    } catch (Exception $e) {
        $errorDetails = $e->getMessage();
    }
}

// Strategy B: Fallback to PHP native mail() if on live server
if (!$sent && function_exists('mail')) {
    $headers = [
        "From: {$senderName} <{$senderEmail}>",
        "Reply-To: {$senderEmail}",
        "X-Mailer: PHP/" . phpversion(),
        "MIME-Version: 1.0"
    ];

    if (!empty($bodyHtml)) {
        $headers[] = "Content-Type: text/html; charset=UTF-8";
        $content = $bodyHtml;
    } else {
        $headers[] = "Content-Type: text/plain; charset=UTF-8";
        $content = $bodyText;
    }

    $mailResult = @mail($to, $subject, $content, implode("\r\n", $headers), "-f{$senderEmail}");
    if ($mailResult) {
        $sent = true;
        $methodUsed = 'PHP mail() system agent';
    } else if (empty($errorDetails)) {
        $errorDetails = 'Standard mail() returned false. Check Hostinger mail server settings.';
    }
}

// Final Response
if ($sent) {
    echo json_encode([
        'success' => true,
        'message' => "Email sent successfully to {$to}",
        'method' => $methodUsed,
        'recipient' => $to,
        'timestamp' => date('c')
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => "Email delivery failed: {$errorDetails}",
        'details' => $errorDetails
    ]);
}
