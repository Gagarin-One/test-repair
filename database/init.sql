CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('dispatcher', 'master')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS requests (
  id SERIAL PRIMARY KEY,
  client_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  problem_text TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'assigned', 'in_progress', 'done', 'canceled')),
  assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Тестовые пользователи (пароль в реальности должен быть хеширован)
INSERT INTO users (username, password, role) VALUES
('dispatcher1', 'plaintext_password', 'dispatcher'),
('master1', 'plaintext_password', 'master'),
('master2', 'plaintext_password', 'master');

-- Несколько заявок
INSERT INTO requests (client_name, phone, address, problem_text, status, assigned_to) VALUES
('Иван Петров', '+7 999 111-22-33', 'ул. Ленина, д.1, кв.5', 'Не работает розетка', 'new', NULL),
('Мария Сидорова', '+7 999 444-55-66', 'пр. Мира, д.10, кв.20', 'Течёт кран', 'assigned', 2),
('Пётр Иванов', '+7 999 777-88-99', 'ул. Гагарина, д.3, кв.15', 'Сломалась стиральная машина', 'in_progress', 3);