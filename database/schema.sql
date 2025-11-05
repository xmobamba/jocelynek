-- Schema de base de données pour le POS Jocelyne K
-- Compatible MySQL 8.0+

CREATE DATABASE IF NOT EXISTS pos_jocelynek CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pos_jocelynek;

-- Table des boutiques
CREATE TABLE shops (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(10) NOT NULL UNIQUE,
    phone VARCHAR(30),
    address VARCHAR(255),
    city VARCHAR(120) DEFAULT 'Abidjan',
    country VARCHAR(120) DEFAULT 'Côte d\'Ivoire',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Table des utilisateurs
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    shop_id BIGINT UNSIGNED NULL,
    first_name VARCHAR(120) NOT NULL,
    last_name VARCHAR(120) NOT NULL,
    email VARCHAR(180) NOT NULL UNIQUE,
    phone VARCHAR(30) UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'manager', 'cashier') NOT NULL DEFAULT 'cashier',
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    last_login_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    FOREIGN KEY (shop_id) REFERENCES shops(id)
) ENGINE=InnoDB;

-- Table des catégories de produits
CREATE TABLE categories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    shop_id BIGINT UNSIGNED NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    UNIQUE KEY unique_category_shop (shop_id, name),
    FOREIGN KEY (shop_id) REFERENCES shops(id)
) ENGINE=InnoDB;

-- Table des produits
CREATE TABLE products (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    shop_id BIGINT UNSIGNED NULL,
    category_id BIGINT UNSIGNED NULL,
    sku VARCHAR(100) NOT NULL UNIQUE,
    barcode VARCHAR(150) UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    purchase_price DECIMAL(15,2) NOT NULL DEFAULT 0,
    sale_price DECIMAL(15,2) NOT NULL,
    tax_rate DECIMAL(5,2) NOT NULL DEFAULT 18.00,
    unit VARCHAR(30) DEFAULT 'unité',
    image_url VARCHAR(255),
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    FOREIGN KEY (shop_id) REFERENCES shops(id),
    FOREIGN KEY (category_id) REFERENCES categories(id)
) ENGINE=InnoDB;

-- Table des clients
CREATE TABLE customers (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    shop_id BIGINT UNSIGNED NULL,
    first_name VARCHAR(120) NOT NULL,
    last_name VARCHAR(120) NOT NULL,
    email VARCHAR(180),
    phone VARCHAR(30),
    address VARCHAR(255),
    credit_limit DECIMAL(15,2) DEFAULT 0,
    balance DECIMAL(15,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    UNIQUE KEY unique_customer_shop (shop_id, phone),
    FOREIGN KEY (shop_id) REFERENCES shops(id)
) ENGINE=InnoDB;

-- Table des caisses
CREATE TABLE cash_registers (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    shop_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(100) NOT NULL,
    status ENUM('open','closed') DEFAULT 'closed',
    opened_at DATETIME,
    closed_at DATETIME,
    opening_amount DECIMAL(15,2) DEFAULT 0,
    closing_amount DECIMAL(15,2) DEFAULT 0,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (shop_id) REFERENCES shops(id)
) ENGINE=InnoDB;

-- Table des ventes
CREATE TABLE sales (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    shop_id BIGINT UNSIGNED NOT NULL,
    cash_register_id BIGINT UNSIGNED,
    customer_id BIGINT UNSIGNED,
    cashier_id BIGINT UNSIGNED NOT NULL,
    reference VARCHAR(50) NOT NULL UNIQUE,
    subtotal DECIMAL(15,2) NOT NULL,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    total DECIMAL(15,2) NOT NULL,
    paid_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    balance DECIMAL(15,2) NOT NULL DEFAULT 0,
    status ENUM('draft','completed','refunded','void') DEFAULT 'completed',
    notes TEXT,
    sold_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    FOREIGN KEY (shop_id) REFERENCES shops(id),
    FOREIGN KEY (cash_register_id) REFERENCES cash_registers(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (cashier_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- Table des items de vente
CREATE TABLE sale_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    sale_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    quantity DECIMAL(12,3) NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    total DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB;

-- Table des paiements
CREATE TABLE payments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    sale_id BIGINT UNSIGNED NOT NULL,
    method ENUM('cash','card','mobile_money','credit') NOT NULL,
    provider ENUM('orange_money','mtn_money','moov_money','wave','visa','mastercard','other') DEFAULT 'other',
    amount DECIMAL(15,2) NOT NULL,
    transaction_reference VARCHAR(150),
    paid_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT UNSIGNED NULL,
    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table du stock par produit et boutique
CREATE TABLE stock (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    shop_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    quantity DECIMAL(12,3) NOT NULL DEFAULT 0,
    min_threshold DECIMAL(12,3) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_stock (shop_id, product_id),
    FOREIGN KEY (shop_id) REFERENCES shops(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB;

-- Table des mouvements de stock
CREATE TABLE stock_movements (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    shop_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    source_shop_id BIGINT UNSIGNED NULL,
    target_shop_id BIGINT UNSIGNED NULL,
    sale_id BIGINT UNSIGNED NULL,
    type ENUM('purchase','sale','adjustment','transfer_out','transfer_in','inventory') NOT NULL,
    quantity DECIMAL(12,3) NOT NULL,
    reference VARCHAR(150) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT UNSIGNED NULL,
    FOREIGN KEY (shop_id) REFERENCES shops(id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (sale_id) REFERENCES sales(id)
) ENGINE=InnoDB;

-- Table pour le suivi des sessions caisse
CREATE TABLE cash_register_sessions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    cash_register_id BIGINT UNSIGNED NOT NULL,
    opened_by BIGINT UNSIGNED NOT NULL,
    closed_by BIGINT UNSIGNED NULL,
    opened_at DATETIME NOT NULL,
    closed_at DATETIME NULL,
    opening_amount DECIMAL(15,2) DEFAULT 0,
    closing_amount DECIMAL(15,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cash_register_id) REFERENCES cash_registers(id),
    FOREIGN KEY (opened_by) REFERENCES users(id),
    FOREIGN KEY (closed_by) REFERENCES users(id)
) ENGINE=InnoDB;

-- Table des logs d'audit
CREATE TABLE audit_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED,
    action VARCHAR(120) NOT NULL,
    entity VARCHAR(120) NOT NULL,
    entity_id BIGINT UNSIGNED,
    payload JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- Vues pour les rapports
CREATE OR REPLACE VIEW view_daily_sales AS
SELECT
    s.shop_id,
    DATE(s.sold_at) AS sale_date,
    SUM(s.total) AS total_sales,
    SUM(s.tax_amount) AS total_tax,
    SUM(s.discount_amount) AS total_discount
FROM sales s
WHERE s.status = 'completed'
GROUP BY s.shop_id, DATE(s.sold_at);

CREATE OR REPLACE VIEW view_top_products AS
SELECT
    si.product_id,
    p.name,
    SUM(si.quantity) AS total_quantity,
    SUM(si.total) AS total_amount
FROM sale_items si
JOIN products p ON p.id = si.product_id
JOIN sales s ON s.id = si.sale_id AND s.status = 'completed'
GROUP BY si.product_id, p.name
ORDER BY total_quantity DESC;

