-- Prérequis : 001_rbac_foundation.sql.
START TRANSACTION;

SELECT id FROM roles WHERE code = 'admin' FOR UPDATE;

INSERT INTO permissions (code) VALUES
  ('rgpd.read'),
  ('rgpd.write'),
  ('general.read'),
  ('general.write')
ON DUPLICATE KEY UPDATE code = VALUES(code);

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.code = 'admin' AND p.code IN (
  'rgpd.read', 'rgpd.write', 'general.read', 'general.write'
)
ON DUPLICATE KEY UPDATE permission_id = VALUES(permission_id);

COMMIT;
