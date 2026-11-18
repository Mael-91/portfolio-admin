CREATE TABLE IF NOT EXISTS roles (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code VARCHAR(64) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_roles_code (code)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS permissions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code VARCHAR(96) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_permissions_code (code)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id BIGINT UNSIGNED NOT NULL,
  permission_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (role_id, permission_id),
  FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS admin_user_roles (
  admin_user_id BIGINT UNSIGNED NOT NULL,
  role_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (admin_user_id, role_id),
  KEY idx_admin_user_roles_role (role_id, admin_user_id),
  FOREIGN KEY (admin_user_id) REFERENCES admin_users (id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE
) ENGINE=InnoDB;

START TRANSACTION;

INSERT INTO roles (code) VALUES ('admin')
ON DUPLICATE KEY UPDATE code = VALUES(code);

INSERT INTO permissions (code) VALUES
  ('users.read'),
  ('users.create'),
  ('users.update'),
  ('users.reset_password'),
  ('users.set_active'),
  ('users.delete')
ON DUPLICATE KEY UPDATE code = VALUES(code);

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.code = 'admin' AND p.code IN (
  'users.read', 'users.create', 'users.update',
  'users.reset_password', 'users.set_active', 'users.delete'
)
ON DUPLICATE KEY UPDATE permission_id = VALUES(permission_id);

COMMIT;
