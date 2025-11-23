const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(cors());

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, '../')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Configuração do multer para upload de imagens
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../uploads');
        // Cria a pasta uploads se não existir
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Gera um nome único para o arquivo
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Apenas arquivos de imagem são permitidos!'), false);
        }
    }
});

// Configuração do Banco
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'fecitel',
    password: '123',
    port: 5432,
});

// Testar conexão
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Erro ao conectar com o banco:', err);
    } else {
        console.log('Conexão com o banco estabelecida:', res.rows[0].now);
    }
});

// ROTA: Listar projetos
app.get('/projetos', async (req, res) => {
    console.log("--- TENTANDO BUSCAR PROJETOS ---");
    try {
        const resultado = await pool.query('SELECT * FROM projetos');
        console.log("Sucesso! Encontrei " + resultado.rows.length + " projetos.");
        
        const projetosFormatados = resultado.rows.map(p => ({
            id: p.id,
            title: p.titulo_projeto,
            students: p.nome_completo,
            description: p.resumo_projeto,
            image: p.url_imagem,
            date: p.data_evento
        }));

        res.json(projetosFormatados);
    } catch (err) {
        console.error("ERRO SQL:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// ROTA: Salvar projeto com upload de imagem
app.post('/projetos', upload.single('image'), async (req, res) => {
    console.log("--- RECEBENDO NOVO PROJETO VIA POST ---");
    console.log("Dados recebidos:", req.body);
    console.log("Arquivo recebido:", req.file);
    
    try {
        const { title, students, description, date } = req.body;
        
        // Validação básica
        if (!title || !students || !description) {
            return res.status(400).json({ error: 'Título, alunos e descrição são obrigatórios' });
        }

        // Se há um arquivo de imagem, salva o caminho relativo
        let imagePath = '';
        if (req.file) {
            imagePath = 'uploads/' + req.file.filename;
        }

        const resultado = await pool.query(
            'INSERT INTO projetos (titulo_projeto, nome_completo, resumo_projeto, url_imagem, data_evento) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [title, students, description, imagePath, date || new Date().toLocaleDateString('pt-BR') + " - 14h"]
        );
        
        console.log("Projeto salvo com ID:", resultado.rows[0].id);
        res.status(201).json(resultado.rows[0]);
    } catch (err) {
        console.error("ERRO AO SALVAR PROJETO:", err.message);
        res.status(500).json({ error: err.message });
    }
});

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});