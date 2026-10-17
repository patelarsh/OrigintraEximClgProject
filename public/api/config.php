<?php
/**
 * ===============================================================
 * Origintra Exim - Hostinger MySQL Database Configuration
 * ===============================================================
 *
 * To connect your website to MySQL on Hostinger:
 * 1. Log in to your Hostinger hPanel (https://hpanel.hostinger.com)
 * 2. Go to "Databases" -> "MySQL Databases"
 * 3. Create a new Database name, Username, and Password
 * 4. Paste those 3 values into the constants below:
 */

// Hostinger MySQL Host (Almost always 'localhost' on Hostinger)
define('DB_HOST', 'localhost');

// MySQL Port (Default is 3306)
define('DB_PORT', 3306);

// Your Hostinger Database Name (e.g. u123456789_origintra)
define('DB_NAME', 'u504508702_origintra');

// Your Hostinger Database User (e.g. u123456789_admin)
define('DB_USER', 'u504508702_origintra');

// Your Hostinger Database Password
define('DB_PASS', 'Arsh@1234');

// Character encoding
define('DB_CHARSET', 'utf8mb4');

// Set to true to see detailed error messages during initial setup, false for production
define('DEBUG_MODE', true);
