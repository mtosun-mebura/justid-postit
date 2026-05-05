CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(200) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS post_its (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    tags VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deadline_date DATE,
    completed BIT(1) NOT NULL DEFAULT 0,
    archived BIT(1) NOT NULL DEFAULT 0,
    position_x DOUBLE NOT NULL DEFAULT 48,
    position_y DOUBLE NOT NULL DEFAULT 48,
    z_index INT NOT NULL DEFAULT 0,
    color_hex VARCHAR(7) NOT NULL DEFAULT '#FFF59D',
    CONSTRAINT fk_post_its_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX idx_post_its_user ON post_its (user_id);
CREATE INDEX idx_post_its_archived ON post_its (archived);

-- Bestaande DB's: als de tabel al was aangemaakt vóór color_hex, dan hiermee aanvullen. Nieuwe DB's krijgen de kolom al mee in de CREATE TABLE.
ALTER TABLE post_its ADD COLUMN color_hex VARCHAR(7) NOT NULL DEFAULT '#FFF59D';
