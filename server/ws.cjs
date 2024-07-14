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

    const wsApp = expressWs(app);

    app.ws('/chat', (ws, _) => {
        ws.on('message', (message) => {
            console.log('received: %s', message);

            allMessages.push(JSON.parse(atob(message)));

            // Рассылаем сообщение всем подключенным клиентам
            wsApp.getWss().clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(message.toString());
                }
            });
        });
    })

    // Route для получения истории
    app.get('/history', (_, res) => {
        res.json(allMessages);
    });
}

module.exports = { createChatServer };