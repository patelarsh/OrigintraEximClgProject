<?php
/**
 * ===============================================================
 * Origintra Exim - Multi-Engine Mail Dispatcher
 * ===============================================================
 * 
 * Supports:
 * 1. Node.js Nodemailer engine on localhost:5000 / 3001 (if active)
 * 2. Native Direct Hostinger SMTP via TLS/SSL socket (Hostinger shared hosting)
 * 3. Fallback PHP mail()
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
        'service' => 'Origintra Exim Mail Bridge',
        'engine' => 'Hostinger Native SMTP & Node.js Dispatcher'
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed. Use POST.']);
    exit;
}

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

// 1. Forward to local Node.js engine if running
$nodePorts = [5000, 3001];
$forwarded = false;

foreach ($nodePorts as $port) {
    $url = "http://127.0.0.1:{$port}/api/send-mail";
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
    curl_setopt($ch, CURLOPT_POSTFIELDS, $rawInput);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 2);
    curl_setopt($ch, CURLOPT_TIMEOUT, 8);
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

// 2. Native Hostinger SMTP Dispatch via PHP Socket
if (!$forwarded) {
    $to = !empty($data['to']) ? trim($data['to']) : '';
    $subject = !empty($data['subject']) ? trim($data['subject']) : 'Origintra Exim Notification';
    $html = !empty($data['html']) ? $data['html'] : (!empty($data['body']) ? nl2br(htmlspecialchars($data['body'])) : '');
    $textBody = !empty($data['body']) ? $data['body'] : strip_tags($html);
    
    $smtp = !empty($data['smtp']) ? $data['smtp'] : [];
    $host = !empty($smtp['host']) ? $smtp['host'] : 'smtp.hostinger.com';
    $port = !empty($smtp['port']) ? intval($smtp['port']) : 465;
    $user = !empty($smtp['user']) ? $smtp['user'] : (!empty($data['senderEmail']) ? $data['senderEmail'] : 'export@origintra.com');
    $pass = !empty($smtp['pass']) ? $smtp['pass'] : '';
    $fromName = !empty($smtp['name']) ? $smtp['name'] : (!empty($data['senderName']) ? $data['senderName'] : 'Origintra Exim');

    if (empty($pass)) {
        $savedFile = __DIR__ . '/smtp-credentials.json';
        if (file_exists($savedFile)) {
            $savedData = json_decode(file_get_contents($savedFile), true);
            if (!empty($savedData['smtpPassword'])) {
                $pass = $savedData['smtpPassword'];
            }
            if (empty($user) && !empty($savedData['smtpUser'])) {
                $user = $savedData['smtpUser'];
            }
        }
    }

    if (empty($to)) {
        http_response_code(200);
        echo json_encode(['success' => false, 'message' => 'Recipient email (to) is required.']);
        exit;
    }

    $targetHost = ($port === 465) ? "ssl://{$host}" : "tcp://{$host}";
    $errno = 0;
    $errstr = '';
    $fp = @fsockopen($targetHost, $port, $errno, $errstr, 10);

    if ($fp) {
        stream_set_timeout($fp, 10);
        fgets($fp, 512);

        fputs($fp, "EHLO origintra.com\r\n");
        while ($line = fgets($fp, 512)) {
            if (substr($line, 3, 1) === ' ') break;
        }

        $authenticated = false;
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
                        $authenticated = true;
                    }
                }
            }
        }

        if ($authenticated || empty($pass)) {
            fputs($fp, "MAIL FROM: <{$user}>\r\n");
            fgets($fp, 512);
            fputs($fp, "RCPT TO: <{$to}>\r\n");
            fgets($fp, 512);
            fputs($fp, "DATA\r\n");
            fgets($fp, 512);

            $boundary = "----=_Part_" . md5(uniqid());
            $headers = "From: =?UTF-8?B?" . base64_encode($fromName) . "?= <{$user}>\r\n";
            $headers .= "To: <{$to}>\r\n";
            $headers .= "Subject: =?UTF-8?B?" . base64_encode($subject) . "?=\r\n";
            $headers .= "Date: " . date('r') . "\r\n";
            $headers .= "MIME-Version: 1.0\r\n";
            $headers .= "Content-Type: multipart/alternative; boundary=\"{$boundary}\"\r\n";
            $headers .= "X-Mailer: Origintra SMTP Engine (Hostinger Native)\r\n\r\n";

            $message = "--{$boundary}\r\n";
            $message .= "Content-Type: text/plain; charset=UTF-8\r\n";
            $message .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
            $message .= $textBody . "\r\n\r\n";

            $message .= "--{$boundary}\r\n";
            $message .= "Content-Type: text/html; charset=UTF-8\r\n";
            $message .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
            $message .= $html . "\r\n\r\n";

            $message .= "--{$boundary}--\r\n.\r\n";

            fputs($fp, $headers . $message);
            $rData = fgets($fp, 512);
            fputs($fp, "QUIT\r\n");
            fclose($fp);

            if (substr($rData, 0, 3) === '250') {
                http_response_code(200);
                echo json_encode([
                    'success' => true,
                    'message' => "Email sent successfully to {$to} via Hostinger SMTP!",
                    'id' => 'msg_' . time() . '_' . rand(1000, 9999),
                    'method' => 'Hostinger Native SMTP'
                ]);
                exit;
            }
        } else {
            fputs($fp, "QUIT\r\n");
            fclose($fp);
        }
    }

    // 3. Fallback to PHP mail()
    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    $headers .= "From: {$fromName} <{$user}>\r\n";
    $headers .= "Reply-To: {$user}\r\n";
    $sent = @mail($to, $subject, $html, $headers);

    if ($sent) {
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => "Email dispatched successfully to {$to}!",
            'id' => 'mail_' . time(),
            'method' => 'Hostinger Mail'
        ]);
        exit;
    }

    http_response_code(200);
    echo json_encode([
        'success' => false,
        'message' => "Could not deliver email via Hostinger SMTP or PHP mail. Please verify your SMTP password in Admin Settings.",
        'details' => $errstr
    ]);
}
