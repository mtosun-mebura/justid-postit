-- Toevoegen demo gebruiker
INSERT INTO users (username, display_name)
VALUES ('po-demo', 'PO Demo')
ON DUPLICATE KEY UPDATE display_name = VALUES(display_name);
