CREATE TABLE projetos (
    id SERIAL PRIMARY KEY,
    nome_completo VARCHAR(100) NOT NULL,
    serie_ano VARCHAR(50),
    escola VARCHAR(100),
    email VARCHAR(100),
    titulo_projeto VARCHAR(150) NOT NULL,
    area_tematica VARCHAR(50),
    resumo_projeto TEXT,
    url_imagem VARCHAR(255),
    data_evento VARCHAR(20)
);

INSERT INTO projetos (nome_completo, serie_ano, escola, email, titulo_projeto, area_tematica, resumo_projeto, url_imagem, data_evento)
VALUES (
    'Maria Oliveira', 
    '2º Ano Ensino Médio', 
    'IFMS Três Lagoas', 
    'maria@email.com', 
    'Irrigação Automática com Arduino', 
    'Tecnologia', 
    'Um sistema que detecta a umidade do solo e liga a água.', 
    'uploads/irrigacao.jpg',
    '06/11 - 14'
);

INSERT INTO projetos (nome_completo, serie_ano, escola, email, titulo_projeto, area_tematica, resumo_projeto, url_imagem, data_evento)
VALUES (
    'João da Silva', 
    '9º Ano Fundamental', 
    'Escola Estadual Padrão', 
    'joao.silva@email.com', 
    'Biofiltro de Baixo Custo', 
    'Meio Ambiente', 
    'Uso de cascas de banana para filtrar metais pesados da água.', 
    'uploads/meio_ambiente.jpg',
    '07/11 - 09'
);

INSERT INTO projetos (nome_completo, serie_ano, escola, email, titulo_projeto, area_tematica, resumo_projeto, url_imagem, data_evento)
VALUES (
    'Ana Costa e Equipe', 
    '1º Ano Ensino Médio', 
    'IFMS Três Lagoas', 
    'ana.costa@email.com', 
    'Braço Mecânico Hidráulico', 
    'Engenharia', 
    'Demonstração do princípio de Pascal usando seringas e papelão.', 
    'uploads/braco_hidralico.jpeg',
    '06/11 - 16'
);