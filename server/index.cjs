const express = require('express');
const cors = require('cors');
const path = require('path');

const { createChatServer } = require('./ws.cjs');

const app = express();

const port = 8001;

app.use(
    cors({
        origin: '*',
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type'],
    }),
);

createChatServer(app);

// Route для получения истории
app.get('/history', (_, res) => {
    res.json(allMessages);
});

app.use(express.static(path.resolve('./dist')));

app.get('/', (_, res) => {
    res.sendFile(path.resolve('./dist/index.html'));
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

