-- Compte actif choisi pour la base de développement.
SET @rbac_admin_user_id = 1;

DROP PROCEDURE IF EXISTS rbac_bootstrap_admin;
DELIMITER //
CREATE PROCEDURE rbac_bootstrap_admin(IN selected_user_id BIGINT UNSIGNED)
BEGIN
  DECLARE admin_role_id BIGINT UNSIGNED DEFAULT NULL;
  DECLARE active_user_id BIGINT UNSIGNED DEFAULT NULL;
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  SELECT id INTO admin_role_id FROM roles WHERE code = 'admin' FOR UPDATE;
  IF admin_role_id IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Le rôle admin doit être migré en premier';
  END IF;

  SELECT id INTO active_user_id
  FROM admin_users
  WHERE id = selected_user_id AND is_active = 1
  FOR UPDATE;

  IF active_user_id IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Choisir explicitement un ID utilisateur actif';
  END IF;

  INSERT INTO admin_user_roles (admin_user_id, role_id)
  VALUES (active_user_id, admin_role_id)
  ON DUPLICATE KEY UPDATE role_id = VALUES(role_id);

  COMMIT;
END//
DELIMITER ;
CALL rbac_bootstrap_admin(@rbac_admin_user_id);
DROP PROCEDURE rbac_bootstrap_admin;
SET @rbac_admin_user_id = NULL;
