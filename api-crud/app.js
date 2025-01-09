const express = require('express');
const app = express();
const PORT = 8000;
app.use(express.urlencoded({extended: true}));
app.use(express.json());

// Simulating a database with an array
let database = [];

// List all books
app.get('/livros', (req, res) => {
    res.status(200).json(database);
});

// Get a book by ID
app.get('/livros/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const livro = database.find(livro => livro.id === id);
    if (livro) {
        res.status(200).json(livro);
    } else {
        res.status(404).json({ error: 'Livro não encontrado' });
    }
});

// Create a new book
app.post('/livros', (req, res) => {
    const novoLivro = req.body;
    if (database.some(livro => livro.id === novoLivro.id)) {
        return res.status(400).json({ error: 'ID já existe' });
    }
    database.push(novoLivro);
    res.status(201).json(novoLivro);
});

// Update a book by ID
app.put('/livros/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const livro = database.find(livro => livro.id === id);
    if (!livro) {
        return res.status(404).json({ error: 'Livro não encontrado' });
    }
    Object.assign(livro, req.body);
    res.status(200).json(livro);
});

// Delete a book by ID
app.delete('/livros/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = database.findIndex(livro => livro.id === id);
    if (index === -1) {
        return res.status(404).json({ error: 'Livro não encontrado' });
    }
    database.splice(index, 1);
    res.status(204).send();
});

// Get books by publisher
app.get('/livros/editora/:editora', (req, res) => {
    const editora = req.params.editora.toLowerCase();
    const resultado = database.filter(livro => livro.editora.toLowerCase() === editora);
    res.status(200).json(resultado);
});

// Get books by keyword in title
app.get('/livros/palavra_chave/:palavra', (req, res) => {
    const palavra = req.params.palavra.toLowerCase();
    const resultado = database.filter(livro => livro.titulo.toLowerCase().includes(palavra));
    res.status(200).json(resultado);
});

// Get books above a certain price
app.get('/livros/acima_preco/:preco', (req, res) => {
    const preco = parseFloat(req.params.preco);
    const resultado = database.filter(livro => livro.preco > preco);
    res.status(200).json(resultado);
});

// Get books below a certain price
app.get('/livros/abaixo_preco/:preco', (req, res) => {
    const preco = parseFloat(req.params.preco);
    const resultado = database.filter(livro => livro.preco < preco);
    res.status(200).json(resultado);
});

// Get the most recent book
app.get('/livros/mais_recentes', (req, res) => {
    const maisRecente = database.reduce((maisRecente, livro) => !maisRecente || livro.ano > maisRecente.ano ? livro : maisRecente, null);
    if (maisRecente) {
        res.status(200).json(maisRecente);
    } else {
        res.status(404).json({ error: 'Nenhum livro encontrado' });
    }
});

// Get the oldest book
app.get('/livros/mais_antigos', (req, res) => {
    const maisAntigo = database.reduce((maisAntigo, livro) => !maisAntigo || livro.ano < maisAntigo.ano ? livro : maisAntigo, null);
    if (maisAntigo) {
        res.status(200).json(maisAntigo);
    } else {
        res.status(404).json({ error: 'Nenhum livro encontrado' });
    }
});

// Get books out of stock
app.get('/livros/sem_estoque', (req, res) => {
    const resultado = database.filter(livro => livro.quant <= 0);
    res.status(200).json(resultado);
});

// Handle non-existing endpoints
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint não encontrado' });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
