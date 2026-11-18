-- Prérequis : migrations 001 et 002.
START TRANSACTION;
SELECT id FROM roles WHERE code = 'admin' FOR UPDATE;

INSERT INTO permissions (code) VALUES
  ('messages.read'),
  ('messages.process'),
  ('messages.export_rgpd'),
  ('images.read'),
  ('images.add'),
  ('images.update'),
  ('images.publish'),
  ('images.reorder'),
  ('images.delete'),
  ('portfolio_settings.read'),
  ('portfolio_settings.write'),
  ('portfolio_settings.upload'),
  ('services.read'),
  ('services.write'),
  ('services.visibility'),
  ('about.read'),
  ('about.write'),
  ('about.upload'),
  ('about.cleanup'),
  ('legal.read'),
  ('legal.draft'),
  ('legal.publish'),
  ('legal.download')
ON DUPLICATE KEY UPDATE code = VALUES(code);

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r CROSS JOIN permissions p
WHERE r.code = 'admin' AND p.code IN (
  'messages.read',
  'messages.process',
  'messages.export_rgpd',
  'images.read',
  'images.add',
  'images.update',
  'images.publish',
  'images.reorder',
  'images.delete',
  'portfolio_settings.read',
  'portfolio_settings.write',
  'portfolio_settings.upload',
  'services.read',
  'services.write',
  'services.visibility',
  'about.read',
  'about.write',
  'about.upload',
  'about.cleanup',
  'legal.read',
  'legal.draft',
  'legal.publish',
  'legal.download'
)
ON DUPLICATE KEY UPDATE permission_id = VALUES(permission_id);

COMMIT;
