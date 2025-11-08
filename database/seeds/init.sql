-- Script de inicialização do banco MySQL para EcoMonitor
-- Criação das tabelas e inserção dos dados do CSV

USE ecomonitor;

-- Tabela de pontos de monitoramento
CREATE TABLE IF NOT EXISTS monitoringpoint (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    regiao VARCHAR(50) NOT NULL,
    umidade DECIMAL(5,2) NOT NULL,
    velocidade_vento DECIMAL(5,2) NOT NULL,
    temperatura DECIMAL(5,2) NOT NULL,
    nivel_fumaca DECIMAL(5,2) NOT NULL,
    nivel_risco ENUM('baixo', 'medio', 'alto', 'critico') NOT NULL,
    data_medicao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    latitude DECIMAL(10,6),
    longitude DECIMAL(10,6),
    estado VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de alertas
CREATE TABLE IF NOT EXISTS alert (
    id INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(200) NOT NULL,
    status ENUM('ativo', 'monitorando', 'resolvido') NOT NULL DEFAULT 'ativo',
    nivel_criticidade ENUM('baixo', 'medio', 'alto', 'critico') NOT NULL,
    tipo VARCHAR(100) NOT NULL,
    descricao TEXT,
    regiao VARCHAR(50) NOT NULL,
    estado VARCHAR(50) NOT NULL,
    data_inicio TIMESTAMP,
    data_fim TIMESTAMP NULL,
    recomendacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Inserir dados dos pontos de monitoramento (baseado no CSV)
INSERT INTO monitoringpoint (nome, regiao, umidade, velocidade_vento, temperatura, nivel_fumaca, nivel_risco, data_medicao, latitude, longitude, estado) VALUES
('Foco #1', 'Cerrado', 20, 9.4, 31.4, 30, 'baixo', '2025-03-10 00:00:00', -7.8951, -43.5155, 'PIAUÍ'),
('Foco #2', 'Amazônia', 54, 5.9, 33.6, 87, 'critico', '2025-03-10 00:00:00', -4.5712, -46.5022, 'MARANHÃO'),
('Foco #3', 'Cerrado', 44, 15.8, 39.2, 60, 'baixo', '2025-03-10 00:00:00', -6.0605, -44.6061, 'MARANHÃO'),
('Foco #4', 'Cerrado', 50, 6.8, 31.2, 73, 'baixo', '2025-03-10 00:00:00', -12.6131, -46.9725, 'TOCANTINS'),
('Foco #5', 'Pantanal', 23, 8.8, 37, 70, 'baixo', '2025-03-10 00:00:00', -17.8812, -57.6206, 'MATO GROSSO DO SUL'),
('Foco #6', 'Cerrado', 58, 7.4, 39.1, 72, 'medio', '2025-03-10 00:00:00', -14.8937, -46.9718, 'GOIÁS'),
('Foco #7', 'Cerrado', 23, 11, 43.5, 90, 'baixo', '2025-03-10 00:00:00', -6.2406, -4.5365, 'MARANHÃO'),
('Foco #8', 'Pantanal', 21, 24.5, 42.2, 75, 'alto', '2025-03-10 00:00:00', -17.8614, -57.623, 'MATO GROSSO DO SUL'),
('Foco #9', 'Cerrado', 53, 10.3, 31.7, 35, 'alto', '2025-03-10 00:00:00', -5.8657, -43.3981, 'MARANHÃO'),
('Foco #10', 'Cerrado', 34, 19.2, 37.5, 94, 'alto', '2025-03-10 00:00:00', -5.6174, -43.9272, 'MARANHÃO'),
('Foco #11', 'Caatinga', 47, 20, 44.1, 42, 'alto', '2025-03-10 00:00:00', -11.1631, -43.4054, 'BAHIA'),
('Foco #12', 'Cerrado', 21, 8.8, 36.3, 71, 'medio', '2025-03-10 00:00:00', -4.7895, -44.6022, 'MARANHÃO'),
('Foco #13', 'Amazônia', 54, 7.6, 40.9, 96, 'medio', '2025-03-10 00:00:00', -8.6324, -54.9747, 'PARÁ'),
('Foco #14', 'Cerrado', 22, 14.6, 42.1, 65, 'medio', '2025-03-10 00:00:00', -7.2578, -48.4699, 'TOCANTINS'),
('Foco #15', 'Cerrado', 49, 14.3, 34, 37, 'alto', '2025-03-10 00:00:00', -12.6327, -46.9471, 'TOCANTINS'),
('Foco #16', 'Pantanal', 60, 17.6, 41.3, 42, 'medio', '2025-03-10 00:00:00', -17.8617, -57.6024, 'MATO GROSSO DO SUL'),
('Foco #17', 'Cerrado', 37, 16.4, 31.3, 45, 'alto', '2025-03-10 00:00:00', -5.8469, -43.3995, 'MARANHÃO'),
('Foco #18', 'Amazônia', 52, 12.6, 36.2, 71, 'alto', '2025-03-10 00:00:00', -8.6139, -54.9558, 'PARÁ'),
('Foco #19', 'Amazônia', 21, 13.7, 40.5, 68, 'critico', '2025-03-10 00:00:00', -4.6504, -45.8077, 'MARANHÃO'),
('Foco #20', 'Cerrado', 53, 8.7, 31.1, 77, 'baixo', '2025-03-10 00:00:00', -14.9342, -46.8965, 'GOIÁS');

-- Inserir alertas baseados nos dados
INSERT INTO alert (titulo, status, nivel_criticidade, tipo, descricao, regiao, estado, data_inicio, recomendacoes) VALUES
('Risco Crítico Detectado - Amazônia', 'ativo', 'critico', 'risco_incendio', 'Foco #2 na Amazônia apresenta nível crítico com alta concentração de fumaça (87%) e temperatura elevada (33.6°C).', 'Amazônia', 'MARANHÃO', '2025-03-10 00:00:00', 'Mobilizar equipes de emergência e monitorar continuamente.'),
('Múltiplos Focos de Alto Risco - Cerrado', 'monitorando', 'alto', 'multiplos_focos', 'Detectados múltiplos focos com nível de risco alto na região do Cerrado.', 'Cerrado', 'MARANHÃO', '2025-03-10 00:00:00', 'Aumentar frequência de monitoramento e preparar recursos de combate.'),
('Condições Favoráveis - Pantanal', 'resolvido', 'medio', 'condicoes_meteorologicas', 'Condições meteorológicas no Pantanal apresentam risco médio controlado.', 'Pantanal', 'MATO GROSSO DO SUL', '2025-03-09 12:00:00', 'Manter monitoramento de rotina.'),
('Alerta Caatinga - Bahia', 'ativo', 'alto', 'risco_incendio', 'Foco #11 na Caatinga apresenta temperatura muito alta (44.1°C) com vento forte.', 'Caatinga', 'BAHIA', '2025-03-10 00:00:00', 'Monitorar evolução e preparar brigadas locais.');

-- Criar índices para melhor performance
CREATE INDEX idx_monitoringpoint_regiao ON monitoringpoint(regiao);
CREATE INDEX idx_monitoringpoint_nivel_risco ON monitoringpoint(nivel_risco);
CREATE INDEX idx_monitoringpoint_data_medicao ON monitoringpoint(data_medicao);
CREATE INDEX idx_alert_status ON alert(status);
CREATE INDEX idx_alert_nivel_criticidade ON alert(nivel_criticidade);
CREATE INDEX idx_alert_created_at ON alert(created_at);