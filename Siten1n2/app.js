const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const app = express();
const port = 3000;

// Conectar ao MongoDB
mongoose.connect('mongodb://localhost:27017/relatorios', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Conectado ao MongoDB"))
    .catch(err => console.log("Erro de conexão com MongoDB:", err));

// Definir um esquema e modelo para armazenar os arquivos
const fileSchema = new mongoose.Schema({
    nome: String,
    dataEnvio: { type: Date, default: Date.now }
});

const File = mongoose.model('File', fileSchema);

// Configuração do multer para aceitar somente .txt
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // nome do arquivo com timestamp
    }
});

// Filtro para aceitar somente .txt
const fileFilter = (req, file, cb) => {
    const filetypes = /txt$/; // Aceitar apenas arquivos .txt
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
        return cb(null, true);
    } else {
        return cb(new Error('Somente arquivos .txt são permitidos.'));
    }
};

// Configuração do multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter
});

// Middleware para permitir o envio de arquivos estáticos
app.use(express.static('public'));
app.use(express.json()); // Adicionado para processar JSON no backend
app.use(express.urlencoded({ extended: true })); // Para processar formulários corretamente

// Rota para exibir o formulário de upload
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Rota para lidar com o envio do arquivo
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, error: 'Nenhum arquivo selecionado.' });
    }

    // Salvar no banco de dados
    const file = new File({
        nome: req.file.filename
    });

    file.save()
        .then(() => {
            // Após salvar no banco de dados, ler o arquivo e gerar o relatório
            fs.readFile(path.join(__dirname, 'uploads', req.file.filename), 'utf8', (err, data) => {
                if (err) {
                    return res.status(500).json({ success: false, error: 'Erro ao ler o arquivo.' });
                }

                // Gerar um relatório simples com o conteúdo do arquivo
                const report = `Relatório gerado em: ${new Date().toLocaleString()}\n\nConteúdo do arquivo:\n\n${data}`;

                // Retornar o relatório como JSON
                res.status(200).json({ success: true, report: report });
            });
        })
        .catch(err => {
            res.status(500).json({ success: false, error: 'Erro ao salvar no banco de dados: ' + err });
        });
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
