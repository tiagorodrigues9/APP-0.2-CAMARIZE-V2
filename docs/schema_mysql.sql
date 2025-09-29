-- Execute em MySQL/MariaDB (HeidiSQL)
SET NAMES utf8mb4;

-- Criação e seleção do banco de dados
CREATE DATABASE IF NOT EXISTS camarize
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE camarize;

SET FOREIGN_KEY_CHECKS = 0;

-- DROP em ordem segura (dependências primeiro)
DROP TABLE IF EXISTS conversation_participants;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS conversations;

DROP TABLE IF EXISTS requests;

DROP TABLE IF EXISTS email_settings;
DROP TABLE IF EXISTS push_subscriptions;

DROP TABLE IF EXISTS sensores_cativeiros;
DROP TABLE IF EXISTS dietas_cativeiros;
DROP TABLE IF EXISTS fazendas_cativeiros;
DROP TABLE IF EXISTS usuarios_fazendas;

DROP TABLE IF EXISTS parametros_atuais;
DROP TABLE IF EXISTS sensores;

DROP TABLE IF EXISTS cativeiros;
DROP TABLE IF EXISTS condicoes_ideais;
DROP TABLE IF EXISTS especif_camarao;

DROP TABLE IF EXISTS dietas;
DROP TABLE IF EXISTS tipos_sensor;
DROP TABLE IF EXISTS tipos_camaraoes;
DROP TABLE IF EXISTS fazendas;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- FAZENDAS
CREATE TABLE fazendas (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  codigo INT NOT NULL UNIQUE,
  nome VARCHAR(255) NOT NULL,
  rua VARCHAR(255) NOT NULL,
  bairro VARCHAR(255) NOT NULL,
  cidade VARCHAR(255) NOT NULL,
  numero INT NOT NULL,
  foto_sitio VARCHAR(1024) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_fazendas_codigo (codigo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- USERS
CREATE TABLE users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  senha VARCHAR(255) NOT NULL,
  foto_perfil VARCHAR(1024) NULL,
  fazenda_id BIGINT UNSIGNED NULL,
  role ENUM('membro','admin','master') NOT NULL DEFAULT 'membro',
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_fazenda (fazenda_id),
  CONSTRAINT fk_users_fazenda
    FOREIGN KEY (fazenda_id) REFERENCES fazendas(id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- TIPOS DE CAMARÕES (TiposCamaroes)
CREATE TABLE tipos_camaraoes (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome VARCHAR(100) NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- CONDIÇÕES IDEAIS
CREATE TABLE condicoes_ideais (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_tipo_camarao BIGINT UNSIGNED NOT NULL,
  temp_ideal DECIMAL(10,2) NULL,
  ph_ideal DECIMAL(10,2) NULL,
  amonia_ideal DECIMAL(10,2) NULL,
  PRIMARY KEY (id),
  KEY idx_condicoes_tipo (id_tipo_camarao),
  CONSTRAINT fk_condicoes_tipo
    FOREIGN KEY (id_tipo_camarao) REFERENCES tipos_camaraoes(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- CATIVEIROS
CREATE TABLE cativeiros (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_cativeiro INT NULL,
  nome VARCHAR(255) NOT NULL,
  id_tipo_camarao BIGINT UNSIGNED NOT NULL,
  data_instalacao DATE NOT NULL,
  foto_cativeiro LONGBLOB NULL,
  temp_media_diaria VARCHAR(64) NULL,
  ph_medio_diario VARCHAR(64) NULL,
  amonia_media_diaria VARCHAR(64) NULL,
  condicoes_ideais_id BIGINT UNSIGNED NULL,
  user_id BIGINT UNSIGNED NULL,
  PRIMARY KEY (id),
  KEY idx_cativ_tipo (id_tipo_camarao),
  KEY idx_cativ_cond (condicoes_ideais_id),
  KEY idx_cativ_user (user_id),
  CONSTRAINT fk_cativ_tipo
    FOREIGN KEY (id_tipo_camarao) REFERENCES tipos_camaraoes(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_cativ_cond
    FOREIGN KEY (condicoes_ideais_id) REFERENCES condicoes_ideais(id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_cativ_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- TIPOS DE SENSOR (catálogo)
CREATE TABLE tipos_sensor (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  descricao VARCHAR(100) NULL,
  foto_sensor LONGBLOB NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- SENSORES
CREATE TABLE sensores (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_tipo_sensor BIGINT UNSIGNED NOT NULL,
  apelido VARCHAR(100) NULL,
  foto_sensor LONGBLOB NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (id),
  KEY idx_sens_tipo (id_tipo_sensor),
  KEY idx_sens_user (user_id),
  CONSTRAINT fk_sens_tipo
    FOREIGN KEY (id_tipo_sensor) REFERENCES tipos_sensor(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_sens_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- PARAMETROS ATUAIS (leituras)
CREATE TABLE parametros_atuais (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  datahora DATETIME NOT NULL,
  temp_atual DECIMAL(10,2) NOT NULL,
  ph_atual DECIMAL(10,2) NOT NULL,
  amonia_atual DECIMAL(10,2) NOT NULL,
  cativeiro_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (id),
  KEY idx_param_cativ (cativeiro_id),
  CONSTRAINT fk_param_cativ
    FOREIGN KEY (cativeiro_id) REFERENCES cativeiros(id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- DIETAS
CREATE TABLE dietas (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  descricao VARCHAR(100) NULL,
  hora_alimentacao VARCHAR(16) NULL,
  quantidade DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ESPECIFICAÇÃO DE CAMARÃO (associações)
CREATE TABLE especif_camarao (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_tipo_camarao BIGINT UNSIGNED NOT NULL,
  id_dieta BIGINT UNSIGNED NOT NULL,
  id_condicao BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (id),
  KEY idx_esp_tipo (id_tipo_camarao),
  KEY idx_esp_dieta (id_dieta),
  KEY idx_esp_cond (id_condicao),
  CONSTRAINT fk_esp_tipo
    FOREIGN KEY (id_tipo_camarao) REFERENCES tipos_camaraoes(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_esp_dieta
    FOREIGN KEY (id_dieta) REFERENCES dietas(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_esp_cond
    FOREIGN KEY (id_condicao) REFERENCES condicoes_ideais(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- JUNÇÃO: SENSORES x CATIVEIROS (N:N)
CREATE TABLE sensores_cativeiros (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  sensor_id BIGINT UNSIGNED NOT NULL,
  cativeiro_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_sensor_cativeiro (sensor_id, cativeiro_id),
  KEY idx_sc_cativ (cativeiro_id),
  CONSTRAINT fk_sc_sensor
    FOREIGN KEY (sensor_id) REFERENCES sensores(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_sc_cativ
    FOREIGN KEY (cativeiro_id) REFERENCES cativeiros(id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- JUNÇÃO: DIETAS x CATIVEIROS (histórico/versões)
CREATE TABLE dietas_cativeiros (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  cativeiro_id BIGINT UNSIGNED NOT NULL,
  dieta_id BIGINT UNSIGNED NOT NULL,
  inicio_vigencia DATETIME NULL,
  fim_vigencia DATETIME NULL,
  ativo TINYINT(1) NOT NULL DEFAULT 1,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_dc_cativ (cativeiro_id),
  KEY idx_dc_dieta (dieta_id),
  KEY idx_dc_cativ_ativo (cativeiro_id, ativo),
  CONSTRAINT fk_dc_cativ
    FOREIGN KEY (cativeiro_id) REFERENCES cativeiros(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_dc_dieta
    FOREIGN KEY (dieta_id) REFERENCES dietas(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- JUNÇÃO: FAZENDAS x CATIVEIROS (N:N)
CREATE TABLE fazendas_cativeiros (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  fazenda_id BIGINT UNSIGNED NOT NULL,
  cativeiro_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_faz_cativ (fazenda_id, cativeiro_id),
  KEY idx_fc_cativ (cativeiro_id),
  CONSTRAINT fk_fc_faz
    FOREIGN KEY (fazenda_id) REFERENCES fazendas(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_fc_cativ
    FOREIGN KEY (cativeiro_id) REFERENCES cativeiros(id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- JUNÇÃO: USUARIOS x FAZENDAS (N:N)
CREATE TABLE usuarios_fazendas (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario_id BIGINT UNSIGNED NOT NULL,
  fazenda_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_user_faz (usuario_id, fazenda_id),
  KEY idx_uf_faz (fazenda_id),
  CONSTRAINT fk_uf_user
    FOREIGN KEY (usuario_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_uf_faz
    FOREIGN KEY (fazenda_id) REFERENCES fazendas(id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- EMAIL SETTINGS (1:1 com user)
CREATE TABLE email_settings (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  email_enabled TINYINT(1) NOT NULL DEFAULT 1,
  email_address VARCHAR(255) NOT NULL,
  -- template
  template_language VARCHAR(16) NOT NULL DEFAULT 'pt-BR',
  template_includeCharts TINYINT(1) NOT NULL DEFAULT 1,
  template_includeActions TINYINT(1) NOT NULL DEFAULT 1,
  -- quiet hours
  quietHours_enabled TINYINT(1) NOT NULL DEFAULT 0,
  quietHours_startTime VARCHAR(5) NOT NULL DEFAULT '22:00',
  quietHours_endTime VARCHAR(5) NOT NULL DEFAULT '07:00',
  -- frequency
  frequency_maxEmailsPerHour INT NOT NULL DEFAULT 5,
  frequency_maxEmailsPerDay INT NOT NULL DEFAULT 20,
  frequency_minIntervalMinutes INT NOT NULL DEFAULT 10,
  -- test flags
  testEmailSent TINYINT(1) NOT NULL DEFAULT 0,
  lastTestEmail DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_email_settings_user (user_id),
  KEY idx_email_address (email_address),
  CONSTRAINT fk_email_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- PUSH SUBSCRIPTIONS (1:N com user)
CREATE TABLE push_subscriptions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  subscription_endpoint VARCHAR(1024) NOT NULL,
  subscription_keys_p256dh VARCHAR(1024) NOT NULL,
  subscription_keys_auth VARCHAR(1024) NOT NULL,
  deviceInfo_userAgent VARCHAR(255) NULL,
  deviceInfo_platform VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  UNIQUE KEY uq_push_endpoint (subscription_endpoint),
  KEY idx_push_user (user_id),
  CONSTRAINT fk_push_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- REQUESTS (workflow de aprovação)
CREATE TABLE requests (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  requester_user_id BIGINT UNSIGNED NOT NULL,
  requester_role ENUM('membro','admin') NOT NULL,
  target_role ENUM('admin','master') NOT NULL,
  type ENUM('leve','pesada') NOT NULL,
  action VARCHAR(255) NOT NULL,
  payload JSON NOT NULL,
  status ENUM('pendente','aprovado','recusado') NOT NULL DEFAULT 'pendente',
  approver_user_id BIGINT UNSIGNED NULL,
  fazenda_id BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_req_requester (requester_user_id),
  KEY idx_req_approver (approver_user_id),
  KEY idx_req_fazenda (fazenda_id),
  CONSTRAINT fk_req_requester
    FOREIGN KEY (requester_user_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_req_approver
    FOREIGN KEY (approver_user_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_req_fazenda
    FOREIGN KEY (fazenda_id) REFERENCES fazendas(id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- CONVERSATIONS
CREATE TABLE conversations (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  lastMessageAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- PARTICIPANTES DA CONVERSA (N:N com contagem de não lidas)
CREATE TABLE conversation_participants (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  conversation_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  unread_count INT NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uq_conv_user (conversation_id, user_id),
  KEY idx_cp_user (user_id),
  CONSTRAINT fk_cp_conv
    FOREIGN KEY (conversation_id) REFERENCES conversations(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_cp_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- MESSAGES
CREATE TABLE messages (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  conversation_id BIGINT UNSIGNED NOT NULL,
  sender_id BIGINT UNSIGNED NOT NULL,
  text TEXT NOT NULL,
  read_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_msg_conv (conversation_id),
  KEY idx_msg_sender (sender_id),
  CONSTRAINT fk_msg_conv
    FOREIGN KEY (conversation_id) REFERENCES conversations(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_msg_sender
    FOREIGN KEY (sender_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Índices auxiliares sugeridos
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_sens_user_tipo ON sensores(user_id, id_tipo_sensor);
CREATE INDEX idx_param_data ON parametros_atuais(datahora);
CREATE INDEX idx_dc_periodo ON dietas_cativeiros (cativeiro_id, inicio_vigencia, fim_vigencia);

-- Observações:
-- 1) users.fazenda_id é opcional (como no modelo MongoDB).
-- 2) conversation_participants materializa participants e unreadCounts (map) do Mongo.
-- 3) sensores.id_tipo_sensor referencia tipos_sensor; conversão string->catálogo é aplicada na app no Mongo.


