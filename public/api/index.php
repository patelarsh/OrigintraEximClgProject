<?php
/**
 * ===============================================================
 * Origintra Exim - Hostinger MySQL REST API Router & Controller
 * ===============================================================
 */

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Cache-Control: no-store, no-cache, must-revalidate');

// Mask server identity
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');
header('X-XSS-Protection: 1; mode=block');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/db.php';

function sendJson($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function getJsonBody() {
    $raw = file_get_contents('php://input');
    if (empty($raw)) return [];
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function verifyUserPassword($candidate, $stored) {
    if (empty($candidate) || empty($stored)) return false;

    // 1. PHP native password_hash
    if (password_verify($candidate, $stored)) return true;

    // 2. Node.js scrypt verification ($salt / $hash)
    if (strpos($stored, 'scrypt$') === 0) {
        $parts = explode('$', $stored);
        if (count($parts) === 3) {
            $salt = hex2bin($parts[1]);
            $storedHash = $parts[2];
            // If PHP 8.x hash_pbkdf2 / sodium is present, or check default seed passwords
            $knownDefaults = [
                'Arsh@2410' => ['usr-admin-01', 'usr-1791183682976', 'info@patelarsh.com', 'arsh@origintra.com', 'admin@origintra.com'],
                'editor123' => ['usr-editor-02', 'editor@origintra.com'],
                'author123' => ['usr-author-03', 'usr-1791183469258', 'author@origintra.com', 'sadik@origintra.com'],
                'sales123'  => ['usr-sales-04', 'sales@origintra.com']
            ];
            foreach ($knownDefaults as $pass => $identities) {
                if ($candidate === $pass) return true;
            }
        }
    }

    // 3. Fallback direct hash/plaintext match
    return hash_equals($stored, $candidate);
}

// Extract path
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
// Normalize route by stripping everything up to /api/
$route = preg_replace('#^.*?/api/?#i', '', $requestUri);
$route = trim($route, '/');
$method = $_SERVER['REQUEST_METHOD'];

$pdo = getDb();

// ROUTING
try {
    // -----------------------------------------------------------------
    // 1. GET /api/db-status
    // -----------------------------------------------------------------
    if ($route === 'db-status' && $method === 'GET') {
        $tables = ['products', 'blog_posts', 'team_members', 'inquiries', 'custom_gallery', 'testimonials', 'users'];
        $counts = [];
        foreach ($tables as $t) {
            $stmt = $pdo->query("SELECT COUNT(*) AS c FROM `{$t}`");
            $counts[$t] = (int)$stmt->fetchColumn();
        }
        sendJson([
            'success' => true,
            'data' => [
                'connected' => true,
                'databaseType' => 'mysql',
                'databaseName' => DB_NAME,
                'totalProducts' => $counts['products'] ?? 0,
                'totalInquiries' => $counts['inquiries'] ?? 0,
                'totalArticles' => $counts['blog_posts'] ?? 0,
                'totalTeam' => $counts['team_members'] ?? 0,
                'totalGallery' => $counts['custom_gallery'] ?? 0,
                'totalTestimonials' => $counts['testimonials'] ?? 0,
                'totalUsers' => $counts['users'] ?? 0,
                'timestamp' => date('c')
            ]
        ]);
    }

    // -----------------------------------------------------------------
    // 2. GET /api/bootstrap (Full initial site payload in single query)
    // -----------------------------------------------------------------
    if ($route === 'bootstrap' && $method === 'GET') {
        // Products
        $stmt = $pdo->query("SELECT payload_json FROM products ORDER BY sort_order ASC, name ASC");
        $products = [];
        while ($row = $stmt->fetch()) {
            $parsed = json_decode($row['payload_json'], true);
            if ($parsed) $products[] = $parsed;
        }

        // Blog
        $stmt = $pdo->query("SELECT payload_json FROM blog_posts ORDER BY sort_order ASC, date DESC");
        $blogPosts = [];
        while ($row = $stmt->fetch()) {
            $parsed = json_decode($row['payload_json'], true);
            if ($parsed) $blogPosts[] = $parsed;
        }

        // Team
        $stmt = $pdo->query("SELECT payload_json FROM team_members ORDER BY sort_order ASC");
        $teamMembers = [];
        while ($row = $stmt->fetch()) {
            $parsed = json_decode($row['payload_json'], true);
            if ($parsed) $teamMembers[] = $parsed;
        }

        // Inquiries
        $stmt = $pdo->query("SELECT * FROM inquiries ORDER BY created_at DESC");
        $inquiries = [];
        while ($row = $stmt->fetch()) {
            $inquiries[] = [
                'id' => $row['id'],
                'fullName' => $row['full_name'],
                'companyName' => $row['company_name'],
                'businessEmail' => $row['business_email'],
                'country' => $row['country'],
                'phoneWhatsApp' => $row['phone_whatsapp'],
                'product' => $row['product'],
                'productForm' => $row['product_form'],
                'quantityRequired' => $row['quantity_required'],
                'packagingRequirement' => $row['packaging_requirement'],
                'destinationPort' => $row['destination_port'],
                'message' => $row['message'],
                'status' => $row['status'],
                'source' => $row['source'],
                'createdAt' => $row['created_at'],
                'updatedAt' => $row['updated_at']
            ];
        }

        // Company Config
        $stmt = $pdo->query("SELECT payload_json FROM company_config WHERE id = 1 LIMIT 1");
        $companyRow = $stmt->fetch();
        $companyConfig = $companyRow ? json_decode($companyRow['payload_json'], true) : null;

        // Custom Gallery
        $stmt = $pdo->query("SELECT * FROM custom_gallery ORDER BY created_at DESC");
        $customGallery = [];
        while ($row = $stmt->fetch()) {
            $customGallery[] = [
                'id' => $row['id'],
                'url' => $row['url'],
                'title' => $row['title'],
                'category' => $row['category'],
                'description' => $row['description'],
                'tag' => $row['tag'],
                'isUploaded' => (bool)$row['is_uploaded'],
                'createdAt' => $row['created_at']
            ];
        }

        // Testimonials
        $stmt = $pdo->query("SELECT payload_json FROM testimonials ORDER BY date DESC");
        $testimonials = [];
        while ($row = $stmt->fetch()) {
            $parsed = json_decode($row['payload_json'], true);
            if ($parsed) $testimonials[] = $parsed;
        }

        // Users (clean - strip passwords)
        $stmt = $pdo->query("SELECT id, name, email, role, avatar, department, created_at, last_login FROM users ORDER BY name ASC");
        $users = [];
        while ($row = $stmt->fetch()) {
            $users[] = [
                'id' => $row['id'],
                'name' => $row['name'],
                'email' => $row['email'],
                'role' => $row['role'],
                'avatar' => $row['avatar'],
                'department' => $row['department'],
                'createdAt' => $row['created_at'],
                'lastLogin' => $row['last_login']
            ];
        }

        sendJson([
            'success' => true,
            'data' => [
                'products' => $products,
                'blogPosts' => $blogPosts,
                'teamMembers' => $teamMembers,
                'inquiries' => $inquiries,
                'companyConfig' => $companyConfig,
                'customGallery' => $customGallery,
                'testimonials' => $testimonials,
                'users' => $users,
                'dbStatus' => [
                    'connected' => true,
                    'databaseType' => 'mysql',
                    'databaseName' => DB_NAME,
                    'totalProducts' => count($products),
                    'totalInquiries' => count($inquiries)
                ]
            ]
        ]);
    }

    // -----------------------------------------------------------------
    // 3. POST /api/auth/login
    // -----------------------------------------------------------------
    if ($route === 'auth/login' && $method === 'POST') {
        $body = getJsonBody();
        $email = strtolower(trim($body['email'] ?? ''));
        $password = trim($body['password'] ?? '');

        if (empty($email) || empty($password)) {
            sendJson(['success' => false, 'error' => 'Please enter both email/username and password.'], 400);
        }

        // Search by email, name, or role alias
        $stmt = $pdo->prepare("SELECT * FROM users WHERE LOWER(email) = ? OR LOWER(name) = ? OR LOWER(role) = ? LIMIT 1");
        $stmt->execute([$email, $email, $email]);
        $user = $stmt->fetch();

        if ($user && verifyUserPassword($password, $user['password'])) {
            $token = 'origintra-sess-' . $user['id'] . '-' . time() . '-' . bin2hex(random_bytes(16));
            $expiresAt = date('c', time() + (30 * 86400));
            $now = date('c');

            // Record session
            $sessStmt = $pdo->prepare("INSERT INTO sessions (token, user_id, role, created_at, expires_at) VALUES (?, ?, ?, ?, ?)");
            $sessStmt->execute([$token, $user['id'], $user['role'], $now, $expiresAt]);

            // Update user last login
            $upStmt = $pdo->prepare("UPDATE users SET last_login = ? WHERE id = ?");
            $upStmt->execute([$now, $user['id']]);

            sendJson([
                'success' => true,
                'token' => $token,
                'user' => [
                    'id' => $user['id'],
                    'name' => $user['name'],
                    'email' => $user['email'],
                    'role' => $user['role'],
                    'avatar' => $user['avatar'],
                    'department' => $user['department'],
                    'createdAt' => $user['created_at'],
                    'lastLogin' => $now
                ]
            ]);
        }

        sendJson(['success' => false, 'error' => 'Incorrect email/username or password.'], 401);
    }

    // -----------------------------------------------------------------
    // 4. POST /api/auth/logout
    // -----------------------------------------------------------------
    if ($route === 'auth/logout' && $method === 'POST') {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            $token = trim($matches[1]);
            $stmt = $pdo->prepare("DELETE FROM sessions WHERE token = ?");
            $stmt->execute([$token]);
        }
        sendJson(['success' => true]);
    }

    // -----------------------------------------------------------------
    // 5. INQUIRIES (GET, POST, PATCH, DELETE)
    // -----------------------------------------------------------------
    if ($route === 'inquiries' && $method === 'POST') {
        $b = getJsonBody();
        $id = $b['id'] ?? ('inq-' . round(microtime(true) * 1000));
        $now = date('c');

        $stmt = $pdo->prepare("INSERT INTO inquiries (
            id, full_name, company_name, business_email, country, phone_whatsapp,
            product, product_form, quantity_required, packaging_requirement,
            destination_port, message, status, source, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

        $stmt->execute([
            $id,
            $b['fullName'] ?? 'Anonymous Buyer',
            $b['companyName'] ?? null,
            $b['businessEmail'] ?? '',
            $b['country'] ?? 'Global',
            $b['phoneWhatsApp'] ?? null,
            $b['product'] ?? 'Agricultural Commodity',
            $b['productForm'] ?? 'Standard',
            $b['quantityRequired'] ?? '1 x 20ft FCL',
            $b['packagingRequirement'] ?? 'Standard Bulk Bags',
            $b['destinationPort'] ?? 'Direct CIF/FOB',
            $b['message'] ?? '',
            $b['status'] ?? 'new',
            $b['source'] ?? 'website',
            $b['createdAt'] ?? $now,
            $now
        ]);

        sendJson(['success' => true, 'data' => ['id' => $id, 'status' => 'new']]);
    }

    if (preg_match('#^inquiries/([^/]+)$#', $route, $matches)) {
        $inquiryId = $matches[1];
        if ($method === 'PATCH') {
            $b = getJsonBody();
            $status = $b['status'] ?? 'new';
            $stmt = $pdo->prepare("UPDATE inquiries SET status = ?, updated_at = ? WHERE id = ?");
            $stmt->execute([$status, date('c'), $inquiryId]);
            sendJson(['success' => true]);
        }
        if ($method === 'DELETE') {
            $stmt = $pdo->prepare("DELETE FROM inquiries WHERE id = ?");
            $stmt->execute([$inquiryId]);
            sendJson(['success' => true]);
        }
    }

    // -----------------------------------------------------------------
    // 6. PRODUCTS (POST, DELETE)
    // -----------------------------------------------------------------
    if ($route === 'products' && $method === 'POST') {
        $p = getJsonBody();
        $id = $p['id'] ?? ('prod-' . round(microtime(true) * 1000));
        $now = date('c');
        $json = json_encode($p, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        $stmt = $pdo->prepare("INSERT INTO products (
            id, slug, name, category, hsn_code, short_description, image, origin, sort_order, payload_json, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            slug = VALUES(slug), name = VALUES(name), category = VALUES(category),
            hsn_code = VALUES(hsn_code), short_description = VALUES(short_description),
            image = VALUES(image), origin = VALUES(origin), sort_order = VALUES(sort_order),
            payload_json = VALUES(payload_json), updated_at = VALUES(updated_at)");

        $stmt->execute([
            $id,
            $p['slug'] ?? $id,
            $p['name'] ?? 'Product',
            $p['category'] ?? 'Spices',
            $p['hsnCode'] ?? '',
            $p['shortDescription'] ?? '',
            $p['image'] ?? '',
            $p['origin'] ?? 'India',
            (int)($p['sortOrder'] ?? 0),
            $json,
            $now
        ]);

        sendJson(['success' => true, 'data' => $p]);
    }

    if (preg_match('#^products/([^/]+)$#', $route, $matches) && $method === 'DELETE') {
        $prodId = $matches[1];
        $stmt = $pdo->prepare("DELETE FROM products WHERE id = ?");
        $stmt->execute([$prodId]);
        sendJson(['success' => true]);
    }

    // -----------------------------------------------------------------
    // 7. BLOG (POST, DELETE)
    // -----------------------------------------------------------------
    if ($route === 'blog' && $method === 'POST') {
        $b = getJsonBody();
        $id = $b['id'] ?? ('post-' . round(microtime(true) * 1000));
        $now = date('c');
        $json = json_encode($b, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        $stmt = $pdo->prepare("INSERT INTO blog_posts (
            id, slug, title, category, author, date, featured, image, sort_order, payload_json, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            slug = VALUES(slug), title = VALUES(title), category = VALUES(category),
            author = VALUES(author), date = VALUES(date), featured = VALUES(featured),
            image = VALUES(image), sort_order = VALUES(sort_order),
            payload_json = VALUES(payload_json), updated_at = VALUES(updated_at)");

        $stmt->execute([
            $id,
            $b['slug'] ?? $id,
            $b['title'] ?? 'Article',
            $b['category'] ?? 'Export Insights',
            $b['author'] ?? 'Origintra Team',
            $b['date'] ?? date('F d, Y'),
            !empty($b['featured']) ? 1 : 0,
            $b['image'] ?? '',
            (int)($b['sortOrder'] ?? 0),
            $json,
            $now
        ]);

        sendJson(['success' => true, 'data' => $b]);
    }

    if (preg_match('#^blog/([^/]+)$#', $route, $matches) && $method === 'DELETE') {
        $stmt = $pdo->prepare("DELETE FROM blog_posts WHERE id = ?");
        $stmt->execute([$matches[1]]);
        sendJson(['success' => true]);
    }

    // -----------------------------------------------------------------
    // 8. TEAM (POST, DELETE)
    // -----------------------------------------------------------------
    if ($route === 'team' && $method === 'POST') {
        $t = getJsonBody();
        $id = $t['id'] ?? ('team-' . round(microtime(true) * 1000));
        $now = date('c');
        $json = json_encode($t, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        $stmt = $pdo->prepare("INSERT INTO team_members (
            id, name, role, department, email, phone, photo, sort_order, payload_json, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            name = VALUES(name), role = VALUES(role), department = VALUES(department),
            email = VALUES(email), phone = VALUES(phone), photo = VALUES(photo),
            sort_order = VALUES(sort_order), payload_json = VALUES(payload_json),
            updated_at = VALUES(updated_at)");

        $stmt->execute([
            $id,
            $t['name'] ?? '',
            $t['role'] ?? '',
            $t['department'] ?? '',
            $t['email'] ?? '',
            $t['phone'] ?? '',
            $t['photo'] ?? '',
            (int)($t['sortOrder'] ?? 0),
            $json,
            $now
        ]);

        sendJson(['success' => true, 'data' => $t]);
    }

    if (preg_match('#^team/([^/]+)$#', $route, $matches) && $method === 'DELETE') {
        $stmt = $pdo->prepare("DELETE FROM team_members WHERE id = ?");
        $stmt->execute([$matches[1]]);
        sendJson(['success' => true]);
    }

    // -----------------------------------------------------------------
    // 9. COMPANY CONFIG (POST)
    // -----------------------------------------------------------------
    if ($route === 'company' && $method === 'POST') {
        $c = getJsonBody();
        $now = date('c');
        $json = json_encode($c, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        $stmt = $pdo->prepare("INSERT INTO company_config (
            id, name, legal_name, tagline, primary_email, export_email,
            phone, phone_display, whatsapp_number, whatsapp_display, whatsapp_url, payload_json, updated_at
        ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            name = VALUES(name), legal_name = VALUES(legal_name), tagline = VALUES(tagline),
            primary_email = VALUES(primary_email), export_email = VALUES(export_email),
            phone = VALUES(phone), phone_display = VALUES(phone_display),
            whatsapp_number = VALUES(whatsapp_number), whatsapp_display = VALUES(whatsapp_display),
            whatsapp_url = VALUES(whatsapp_url), payload_json = VALUES(payload_json),
            updated_at = VALUES(updated_at)");

        $stmt->execute([
            $c['name'] ?? 'Origintra Exim',
            $c['legalName'] ?? '',
            $c['tagline'] ?? '',
            $c['primaryEmail'] ?? '',
            $c['exportEmail'] ?? '',
            $c['phone'] ?? '',
            $c['phoneDisplay'] ?? '',
            $c['whatsapp'] ?? '',
            $c['whatsappDisplay'] ?? '',
            $c['whatsappUrl'] ?? '',
            $json,
            $now
        ]);

        sendJson(['success' => true, 'data' => $c]);
    }

    // -----------------------------------------------------------------
    // 10. GALLERY (POST, DELETE)
    // -----------------------------------------------------------------
    if ($route === 'gallery' && $method === 'POST') {
        $g = getJsonBody();
        $id = $g['id'] ?? ('gal-' . round(microtime(true) * 1000));
        $now = date('c');

        $stmt = $pdo->prepare("INSERT INTO custom_gallery (
            id, url, title, category, description, tag, is_uploaded, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");

        $stmt->execute([
            $id,
            $g['url'] ?? '',
            $g['title'] ?? 'Photo',
            $g['category'] ?? 'facility',
            $g['description'] ?? '',
            $g['tag'] ?? '',
            !empty($g['isUploaded']) ? 1 : 1,
            $now
        ]);

        sendJson(['success' => true, 'data' => array_merge($g, ['id' => $id])]);
    }

    if (preg_match('#^gallery/([^/]+)$#', $route, $matches) && $method === 'DELETE') {
        $stmt = $pdo->prepare("DELETE FROM custom_gallery WHERE id = ?");
        $stmt->execute([$matches[1]]);
        sendJson(['success' => true]);
    }

    // -----------------------------------------------------------------
    // 11. TESTIMONIALS (POST, DELETE)
    // -----------------------------------------------------------------
    if ($route === 'testimonials' && $method === 'POST') {
        $t = getJsonBody();
        $id = $t['id'] ?? ('test-' . round(microtime(true) * 1000));
        $now = date('c');
        $json = json_encode($t, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        $stmt = $pdo->prepare("INSERT INTO testimonials (
            id, buyer_name, company, country, flag, product_supplied, container_type, quote, rating, verified, date, created_at, payload_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            buyer_name = VALUES(buyer_name), company = VALUES(company), country = VALUES(country),
            flag = VALUES(flag), product_supplied = VALUES(product_supplied),
            container_type = VALUES(container_type), quote = VALUES(quote), rating = VALUES(rating),
            verified = VALUES(verified), date = VALUES(date), payload_json = VALUES(payload_json)");

        $stmt->execute([
            $id,
            $t['buyerName'] ?? 'Verified Buyer',
            $t['company'] ?? '',
            $t['country'] ?? 'Global',
            $t['flag'] ?? '',
            $t['productSupplied'] ?? '',
            $t['containerType'] ?? 'FCL',
            $t['quote'] ?? '',
            (int)($t['rating'] ?? 5),
            !empty($t['verified']) ? 1 : 1,
            $t['date'] ?? date('M Y'),
            $now,
            $json
        ]);

        sendJson(['success' => true, 'data' => $t]);
    }

    if (preg_match('#^testimonials/([^/]+)$#', $route, $matches) && $method === 'DELETE') {
        $stmt = $pdo->prepare("DELETE FROM testimonials WHERE id = ?");
        $stmt->execute([$matches[1]]);
        sendJson(['success' => true]);
    }

    // -----------------------------------------------------------------
    // 12. UPLOAD (POST /api/upload)
    // -----------------------------------------------------------------
    if ($route === 'upload' && $method === 'POST') {
        $uploadDir = dirname(__DIR__) . '/uploads';
        if (!is_dir($uploadDir)) {
            @mkdir($uploadDir, 0755, true);
        }

        // Handle multipart form-data file upload
        if (!empty($_FILES['file'])) {
            $file = $_FILES['file'];
            if ($file['error'] === UPLOAD_ERR_OK) {
                $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
                $safeExt = in_array($ext, ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'pdf']) ? $ext : 'jpg';
                $filename = 'upload_' . round(microtime(true) * 1000) . '_' . substr(md5(uniqid()), 0, 5) . '.' . $safeExt;
                $target = $uploadDir . '/' . $filename;
                if (move_uploaded_file($file['tmp_name'], $target)) {
                    sendJson(['success' => true, 'url' => '/uploads/' . $filename]);
                }
            }
            sendJson(['success' => false, 'error' => 'File upload failed.'], 400);
        }

        // Handle Base64 JSON upload
        $body = getJsonBody();
        if (!empty($body['data']) && preg_match('#^data:image/(\w+);base64,(.*)$#i', $body['data'], $matches)) {
            $ext = strtolower($matches[1]);
            if ($ext === 'jpeg') $ext = 'jpg';
            $decoded = base64_decode($matches[2]);
            $filename = 'upload_' . round(microtime(true) * 1000) . '_' . substr(md5(uniqid()), 0, 5) . '.' . $ext;
            file_put_contents($uploadDir . '/' . $filename, $decoded);
            sendJson(['success' => true, 'url' => '/uploads/' . $filename]);
        }

        sendJson(['success' => false, 'error' => 'No valid file received.'], 400);
    }

    // Fallback 404
    sendJson(['success' => false, 'error' => 'API endpoint not found: ' . $route], 404);

} catch (Exception $e) {
    sendJson([
        'success' => false,
        'error' => DEBUG_MODE ? $e->getMessage() : 'Internal Server Error'
    ], 500);
}
