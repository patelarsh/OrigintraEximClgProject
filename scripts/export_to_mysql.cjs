const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

function escapeSql(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return val;
  const str = String(val);
  return "'" + str.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
}

function exportToMysql() {
  const dbPath = path.join(process.cwd(), 'data', 'origintra.sqlite');
  if (!fs.existsSync(dbPath)) {
    console.error('SQLite database not found at:', dbPath);
    process.exit(1);
  }

  const db = new DatabaseSync(dbPath);
  const outPath = path.join(process.cwd(), 'hostinger_database.sql');
  const lines = [];

  lines.push('-- ===============================================================');
  lines.push('-- ORIGINTRA EXIM - HOSTINGER MYSQL DATABASE SCHEMA & INITIAL DATA');
  lines.push('-- Generated: ' + new Date().toISOString());
  lines.push('-- Tested with MySQL 5.7 / 8.0 / 8.4 and MariaDB 10.x');
  lines.push('-- ===============================================================');
  lines.push('');
  lines.push('SET NAMES utf8mb4;');
  lines.push('SET FOREIGN_KEY_CHECKS = 0;');
  lines.push('SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";');
  lines.push('');

  // 1. users table
  lines.push('-- -------------------------------------------------------------');
  lines.push('-- Table: users');
  lines.push('-- -------------------------------------------------------------');
  lines.push('DROP TABLE IF EXISTS `users`;');
  lines.push('CREATE TABLE `users` (');
  lines.push('  `id` VARCHAR(100) NOT NULL,');
  lines.push('  `name` VARCHAR(255) NOT NULL,');
  lines.push('  `email` VARCHAR(255) NOT NULL UNIQUE,');
  lines.push('  `password` TEXT NOT NULL,');
  lines.push('  `role` VARCHAR(50) NOT NULL,');
  lines.push('  `avatar` TEXT NULL,');
  lines.push('  `department` VARCHAR(255) NULL,');
  lines.push('  `created_at` VARCHAR(100) NOT NULL,');
  lines.push('  `last_login` VARCHAR(100) NULL,');
  lines.push('  PRIMARY KEY (`id`),');
  lines.push('  INDEX `idx_users_email` (`email`)');
  lines.push(') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;');
  lines.push('');

  const users = db.prepare('SELECT * FROM users').all();
  if (users.length) {
    lines.push('INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `avatar`, `department`, `created_at`, `last_login`) VALUES');
    const userValues = users.map(u => 
      `(${escapeSql(u.id)}, ${escapeSql(u.name)}, ${escapeSql(u.email)}, ${escapeSql(u.password)}, ${escapeSql(u.role)}, ${escapeSql(u.avatar)}, ${escapeSql(u.department)}, ${escapeSql(u.created_at)}, ${escapeSql(u.last_login)})`
    );
    lines.push(userValues.join(',\n') + ';');
    lines.push('');
  }

  // 2. products table
  lines.push('-- -------------------------------------------------------------');
  lines.push('-- Table: products');
  lines.push('-- -------------------------------------------------------------');
  lines.push('DROP TABLE IF EXISTS `products`;');
  lines.push('CREATE TABLE `products` (');
  lines.push('  `id` VARCHAR(100) NOT NULL,');
  lines.push('  `slug` VARCHAR(255) NOT NULL,');
  lines.push('  `name` VARCHAR(255) NOT NULL,');
  lines.push('  `category` VARCHAR(100) NOT NULL,');
  lines.push('  `hsn_code` VARCHAR(50) NULL,');
  lines.push('  `short_description` TEXT NULL,');
  lines.push('  `image` TEXT NULL,');
  lines.push('  `origin` VARCHAR(255) NULL,');
  lines.push('  `sort_order` INT NOT NULL DEFAULT 0,');
  lines.push('  `payload_json` LONGTEXT NOT NULL,');
  lines.push('  `updated_at` VARCHAR(100) NOT NULL,');
  lines.push('  PRIMARY KEY (`id`),');
  lines.push('  INDEX `idx_products_slug` (`slug`),');
  lines.push('  INDEX `idx_products_category` (`category`)');
  lines.push(') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;');
  lines.push('');

  const products = db.prepare('SELECT * FROM products').all();
  if (products.length) {
    lines.push('INSERT INTO `products` (`id`, `slug`, `name`, `category`, `hsn_code`, `short_description`, `image`, `origin`, `sort_order`, `payload_json`, `updated_at`) VALUES');
    const prodValues = products.map(p => 
      `(${escapeSql(p.id)}, ${escapeSql(p.slug)}, ${escapeSql(p.name)}, ${escapeSql(p.category)}, ${escapeSql(p.hsn_code)}, ${escapeSql(p.short_description)}, ${escapeSql(p.image)}, ${escapeSql(p.origin)}, ${p.sort_order || 0}, ${escapeSql(p.payload_json)}, ${escapeSql(p.updated_at)})`
    );
    lines.push(prodValues.join(',\n') + ';');
    lines.push('');
  }

  // 3. blog_posts table
  lines.push('-- -------------------------------------------------------------');
  lines.push('-- Table: blog_posts');
  lines.push('-- -------------------------------------------------------------');
  lines.push('DROP TABLE IF EXISTS `blog_posts`;');
  lines.push('CREATE TABLE `blog_posts` (');
  lines.push('  `id` VARCHAR(100) NOT NULL,');
  lines.push('  `slug` VARCHAR(255) NOT NULL,');
  lines.push('  `title` VARCHAR(255) NOT NULL,');
  lines.push('  `category` VARCHAR(100) NULL,');
  lines.push('  `author` VARCHAR(100) NULL,');
  lines.push('  `date` VARCHAR(50) NULL,');
  lines.push('  `featured` TINYINT(1) NOT NULL DEFAULT 0,');
  lines.push('  `image` TEXT NULL,');
  lines.push('  `sort_order` INT NOT NULL DEFAULT 0,');
  lines.push('  `payload_json` LONGTEXT NOT NULL,');
  lines.push('  `updated_at` VARCHAR(100) NOT NULL,');
  lines.push('  PRIMARY KEY (`id`),');
  lines.push('  INDEX `idx_blog_slug` (`slug`)');
  lines.push(') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;');
  lines.push('');

  const blogs = db.prepare('SELECT * FROM blog_posts').all();
  if (blogs.length) {
    lines.push('INSERT INTO `blog_posts` (`id`, `slug`, `title`, `category`, `author`, `date`, `featured`, `image`, `sort_order`, `payload_json`, `updated_at`) VALUES');
    const blogValues = blogs.map(b => 
      `(${escapeSql(b.id)}, ${escapeSql(b.slug)}, ${escapeSql(b.title)}, ${escapeSql(b.category)}, ${escapeSql(b.author)}, ${escapeSql(b.date)}, ${b.featured ? 1 : 0}, ${escapeSql(b.image)}, ${b.sort_order || 0}, ${escapeSql(b.payload_json)}, ${escapeSql(b.updated_at)})`
    );
    lines.push(blogValues.join(',\n') + ';');
    lines.push('');
  }

  // 4. team_members table
  lines.push('-- -------------------------------------------------------------');
  lines.push('-- Table: team_members');
  lines.push('-- -------------------------------------------------------------');
  lines.push('DROP TABLE IF EXISTS `team_members`;');
  lines.push('CREATE TABLE `team_members` (');
  lines.push('  `id` VARCHAR(100) NOT NULL,');
  lines.push('  `name` VARCHAR(255) NOT NULL,');
  lines.push('  `role` VARCHAR(255) NOT NULL,');
  lines.push('  `department` VARCHAR(255) NULL,');
  lines.push('  `email` VARCHAR(255) NULL,');
  lines.push('  `phone` VARCHAR(100) NULL,');
  lines.push('  `photo` TEXT NULL,');
  lines.push('  `sort_order` INT NOT NULL DEFAULT 0,');
  lines.push('  `payload_json` LONGTEXT NOT NULL,');
  lines.push('  `updated_at` VARCHAR(100) NOT NULL,');
  lines.push('  PRIMARY KEY (`id`)');
  lines.push(') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;');
  lines.push('');

  const team = db.prepare('SELECT * FROM team_members').all();
  if (team.length) {
    lines.push('INSERT INTO `team_members` (`id`, `name`, `role`, `department`, `email`, `phone`, `photo`, `sort_order`, `payload_json`, `updated_at`) VALUES');
    const teamValues = team.map(t => 
      `(${escapeSql(t.id)}, ${escapeSql(t.name)}, ${escapeSql(t.role)}, ${escapeSql(t.department)}, ${escapeSql(t.email)}, ${escapeSql(t.phone)}, ${escapeSql(t.photo)}, ${t.sort_order || 0}, ${escapeSql(t.payload_json)}, ${escapeSql(t.updated_at)})`
    );
    lines.push(teamValues.join(',\n') + ';');
    lines.push('');
  }

  // 5. inquiries table
  lines.push('-- -------------------------------------------------------------');
  lines.push('-- Table: inquiries');
  lines.push('-- -------------------------------------------------------------');
  lines.push('DROP TABLE IF EXISTS `inquiries`;');
  lines.push('CREATE TABLE `inquiries` (');
  lines.push('  `id` VARCHAR(100) NOT NULL,');
  lines.push('  `full_name` VARCHAR(255) NOT NULL,');
  lines.push('  `company_name` VARCHAR(255) NULL,');
  lines.push('  `business_email` VARCHAR(255) NOT NULL,');
  lines.push('  `country` VARCHAR(100) NULL,');
  lines.push('  `phone_whatsapp` VARCHAR(100) NULL,');
  lines.push('  `product` VARCHAR(255) NULL,');
  lines.push('  `product_form` VARCHAR(100) NULL,');
  lines.push('  `quantity_required` VARCHAR(100) NULL,');
  lines.push('  `packaging_requirement` VARCHAR(255) NULL,');
  lines.push('  `destination_port` VARCHAR(255) NULL,');
  lines.push('  `message` TEXT NULL,');
  lines.push('  `status` VARCHAR(50) NOT NULL DEFAULT "new",');
  lines.push('  `source` VARCHAR(100) NULL,');
  lines.push('  `created_at` VARCHAR(100) NOT NULL,');
  lines.push('  `updated_at` VARCHAR(100) NOT NULL,');
  lines.push('  PRIMARY KEY (`id`),');
  lines.push('  INDEX `idx_inquiries_status` (`status`),');
  lines.push('  INDEX `idx_inquiries_created` (`created_at`)');
  lines.push(') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;');
  lines.push('');

  const inquiries = db.prepare('SELECT * FROM inquiries').all();
  if (inquiries.length) {
    lines.push('INSERT INTO `inquiries` (`id`, `full_name`, `company_name`, `business_email`, `country`, `phone_whatsapp`, `product`, `product_form`, `quantity_required`, `packaging_requirement`, `destination_port`, `message`, `status`, `source`, `created_at`, `updated_at`) VALUES');
    const inqValues = inquiries.map(i => 
      `(${escapeSql(i.id)}, ${escapeSql(i.full_name)}, ${escapeSql(i.company_name)}, ${escapeSql(i.business_email)}, ${escapeSql(i.country)}, ${escapeSql(i.phone_whatsapp)}, ${escapeSql(i.product)}, ${escapeSql(i.product_form)}, ${escapeSql(i.quantity_required)}, ${escapeSql(i.packaging_requirement)}, ${escapeSql(i.destination_port)}, ${escapeSql(i.message)}, ${escapeSql(i.status)}, ${escapeSql(i.source)}, ${escapeSql(i.created_at)}, ${escapeSql(i.updated_at)})`
    );
    lines.push(inqValues.join(',\n') + ';');
    lines.push('');
  }

  // 6. company_config table
  lines.push('-- -------------------------------------------------------------');
  lines.push('-- Table: company_config');
  lines.push('-- -------------------------------------------------------------');
  lines.push('DROP TABLE IF EXISTS `company_config`;');
  lines.push('CREATE TABLE `company_config` (');
  lines.push('  `id` INT NOT NULL,');
  lines.push('  `name` VARCHAR(255) NULL,');
  lines.push('  `legal_name` VARCHAR(255) NULL,');
  lines.push('  `tagline` VARCHAR(255) NULL,');
  lines.push('  `primary_email` VARCHAR(255) NULL,');
  lines.push('  `export_email` VARCHAR(255) NULL,');
  lines.push('  `phone` VARCHAR(100) NULL,');
  lines.push('  `phone_display` VARCHAR(100) NULL,');
  lines.push('  `whatsapp_number` VARCHAR(100) NULL,');
  lines.push('  `whatsapp_display` VARCHAR(100) NULL,');
  lines.push('  `whatsapp_url` TEXT NULL,');
  lines.push('  `payload_json` LONGTEXT NOT NULL,');
  lines.push('  `updated_at` VARCHAR(100) NOT NULL,');
  lines.push('  PRIMARY KEY (`id`)');
  lines.push(') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;');
  lines.push('');

  const company = db.prepare('SELECT * FROM company_config').all();
  if (company.length) {
    lines.push('INSERT INTO `company_config` (`id`, `name`, `legal_name`, `tagline`, `primary_email`, `export_email`, `phone`, `phone_display`, `whatsapp_number`, `whatsapp_display`, `whatsapp_url`, `payload_json`, `updated_at`) VALUES');
    const compValues = company.map(c => 
      `(${c.id || 1}, ${escapeSql(c.name)}, ${escapeSql(c.legal_name)}, ${escapeSql(c.tagline)}, ${escapeSql(c.primary_email)}, ${escapeSql(c.export_email)}, ${escapeSql(c.phone)}, ${escapeSql(c.phone_display)}, ${escapeSql(c.whatsapp_number)}, ${escapeSql(c.whatsapp_display)}, ${escapeSql(c.whatsapp_url)}, ${escapeSql(c.payload_json)}, ${escapeSql(c.updated_at)})`
    );
    lines.push(compValues.join(',\n') + ';');
    lines.push('');
  }

  // 7. custom_gallery table
  lines.push('-- -------------------------------------------------------------');
  lines.push('-- Table: custom_gallery');
  lines.push('-- -------------------------------------------------------------');
  lines.push('DROP TABLE IF EXISTS `custom_gallery`;');
  lines.push('CREATE TABLE `custom_gallery` (');
  lines.push('  `id` VARCHAR(100) NOT NULL,');
  lines.push('  `url` TEXT NOT NULL,');
  lines.push('  `title` VARCHAR(255) NOT NULL,');
  lines.push('  `category` VARCHAR(100) NOT NULL,');
  lines.push('  `description` TEXT NULL,');
  lines.push('  `tag` VARCHAR(100) NULL,');
  lines.push('  `is_uploaded` TINYINT(1) NOT NULL DEFAULT 1,');
  lines.push('  `created_at` VARCHAR(100) NOT NULL,');
  lines.push('  PRIMARY KEY (`id`),');
  lines.push('  INDEX `idx_gallery_category` (`category`)');
  lines.push(') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;');
  lines.push('');

  const gallery = db.prepare('SELECT * FROM custom_gallery').all();
  if (gallery.length) {
    lines.push('INSERT INTO `custom_gallery` (`id`, `url`, `title`, `category`, `description`, `tag`, `is_uploaded`, `created_at`) VALUES');
    const galValues = gallery.map(g => 
      `(${escapeSql(g.id)}, ${escapeSql(g.url)}, ${escapeSql(g.title)}, ${escapeSql(g.category)}, ${escapeSql(g.description)}, ${escapeSql(g.tag)}, ${g.is_uploaded ? 1 : 0}, ${escapeSql(g.created_at)})`
    );
    lines.push(galValues.join(',\n') + ';');
    lines.push('');
  }

  // 8. testimonials table
  lines.push('-- -------------------------------------------------------------');
  lines.push('-- Table: testimonials');
  lines.push('-- -------------------------------------------------------------');
  lines.push('DROP TABLE IF EXISTS `testimonials`;');
  lines.push('CREATE TABLE `testimonials` (');
  lines.push('  `id` VARCHAR(100) NOT NULL,');
  lines.push('  `buyer_name` VARCHAR(255) NOT NULL,');
  lines.push('  `company` VARCHAR(255) NULL,');
  lines.push('  `country` VARCHAR(100) NOT NULL,');
  lines.push('  `flag` VARCHAR(50) NULL,');
  lines.push('  `product_supplied` VARCHAR(255) NULL,');
  lines.push('  `container_type` VARCHAR(100) NULL,');
  lines.push('  `quote` TEXT NOT NULL,');
  lines.push('  `rating` INT NOT NULL DEFAULT 5,');
  lines.push('  `verified` TINYINT(1) NOT NULL DEFAULT 1,');
  lines.push('  `date` VARCHAR(50) NULL,');
  lines.push('  `created_at` VARCHAR(100) NOT NULL,');
  lines.push('  `payload_json` LONGTEXT NOT NULL,');
  lines.push('  PRIMARY KEY (`id`)');
  lines.push(') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;');
  lines.push('');

  const testimonials = db.prepare('SELECT * FROM testimonials').all();
  if (testimonials.length) {
    lines.push('INSERT INTO `testimonials` (`id`, `buyer_name`, `company`, `country`, `flag`, `product_supplied`, `container_type`, `quote`, `rating`, `verified`, `date`, `created_at`, `payload_json`) VALUES');
    const testValues = testimonials.map(t => 
      `(${escapeSql(t.id)}, ${escapeSql(t.buyer_name)}, ${escapeSql(t.company)}, ${escapeSql(t.country)}, ${escapeSql(t.flag)}, ${escapeSql(t.product_supplied)}, ${escapeSql(t.container_type)}, ${escapeSql(t.quote)}, ${t.rating || 5}, ${t.verified ? 1 : 0}, ${escapeSql(t.date)}, ${escapeSql(t.created_at)}, ${escapeSql(t.payload_json)})`
    );
    lines.push(testValues.join(',\n') + ';');
    lines.push('');
  }

  // 9. sessions table
  lines.push('-- -------------------------------------------------------------');
  lines.push('-- Table: sessions');
  lines.push('-- -------------------------------------------------------------');
  lines.push('DROP TABLE IF EXISTS `sessions`;');
  lines.push('CREATE TABLE `sessions` (');
  lines.push('  `token` VARCHAR(255) NOT NULL,');
  lines.push('  `user_id` VARCHAR(100) NOT NULL,');
  lines.push('  `role` VARCHAR(50) NOT NULL,');
  lines.push('  `created_at` VARCHAR(100) NOT NULL,');
  lines.push('  `expires_at` VARCHAR(100) NOT NULL,');
  lines.push('  PRIMARY KEY (`token`),');
  lines.push('  INDEX `idx_sessions_user` (`user_id`)');
  lines.push(') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;');
  lines.push('');

  // 10. audit_logs table
  lines.push('-- -------------------------------------------------------------');
  lines.push('-- Table: audit_logs');
  lines.push('-- -------------------------------------------------------------');
  lines.push('DROP TABLE IF EXISTS `audit_logs`;');
  lines.push('CREATE TABLE `audit_logs` (');
  lines.push('  `id` INT NOT NULL AUTO_INCREMENT,');
  lines.push('  `action` VARCHAR(100) NOT NULL,');
  lines.push('  `entity_type` VARCHAR(100) NOT NULL,');
  lines.push('  `entity_id` VARCHAR(100) NULL,');
  lines.push('  `summary` TEXT NOT NULL,');
  lines.push('  `created_at` VARCHAR(100) NOT NULL,');
  lines.push('  PRIMARY KEY (`id`)');
  lines.push(') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;');
  lines.push('');

  lines.push('SET FOREIGN_KEY_CHECKS = 1;');
  lines.push('');

  fs.writeFileSync(outPath, lines.join('\n'), 'utf8');
  console.log(`[OK] MySQL SQL dump generated successfully: ${outPath} (${(fs.statSync(outPath).size / 1024).toFixed(1)} KB)`);
}

exportToMysql();
