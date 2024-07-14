const WebSocket = require('ws');
const expressWs = require('express-ws')

const createChatServer = (app) => {
    // История сообщений
    const allMessages = [
        {
            user: { name: 'bot', id: '' },
            text: 'Hello world!',
            timestamp: new Date().toISOString(),
        },
    ];

    expressWs(app);

    app.ws('/chat', (wss, _) => {
        wss.on('connection', (ws) => {
            ws.on('message', (message) => {
                console.log('received: %s', message);
    
                allMessages.push(JSON.parse(atob(message)));
    
                // Рассылаем сообщение всем подключенным клиентам
                wss.clients.forEach(function each(client) {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(message.toString());
                    }
                });
            });
    
            ws.send('connection ready');
        });
    })

    // Route для получения истории
    app.get('/history', (_, res) => {
        res.json(allMessages);
    });
}

module.exports = { createChatServer };