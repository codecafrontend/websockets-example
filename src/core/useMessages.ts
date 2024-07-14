import { useCallback, useContext, useEffect, useState } from 'react';
import { User, UserContext } from './UserContext';
import { sortMessages } from './lib';
import { nanoid } from 'nanoid';

export type Message = {
    id: string;
    user: User;
    text: string;
    timestamp: string;
};

export type UseMessagesProps = {
    onBeforeReceiveMessages?: () => void;
};

const WS_ORIGIN = import.meta.env.VITE_WS_ORIGIN || `wss://${location.host}`;

export const useMessages = ({ onBeforeReceiveMessages }: UseMessagesProps) => {
    const user = useContext(UserContext);

    const [messages, setMessages] = useState<Record<string, Message>>({});
    const [isOnline, setIsOnline] = useState(false);
    const [ws, setWs] = useState<WebSocket>();

    const updateMessages = useCallback((messagesList: Message[]) => {
        setMessages((state) => ({
            ...state,
            ...messagesList.reduce((acc, curr) => ({...acc, [curr.id]: curr}), {}),
        }));
    }, []);

    const loadHistory = useCallback(async () => {
        const response = await fetch('/history');
        const history = (await response.json()) as Message[];
        updateMessages(history);
    }, [updateMessages]);

    const reconnect = useCallback(() => {
        setTimeout(() => {
            setWs(undefined);
        }, 2000);
    }, []);

    useEffect(() => {
        if (!ws) {
            const socket = new WebSocket(`${WS_ORIGIN}/chat`);

            socket.onmessage = (event) => {
                onBeforeReceiveMessages?.();
                const message = JSON.parse(atob(event.data));
                updateMessages([message]);
            };

            socket.onopen = () => {
                setIsOnline(true);
            }

            socket.onclose = () => {
                setIsOnline(false);
            };

            socket.onerror = () => {
                setIsOnline(false);
                reconnect();
            };

            setWs(socket);
            loadHistory();
        }
    }, [ws, reconnect]);

    const sendMessage = useCallback(
        (text: string) => {
            if (!ws) {
                return;
            }

            const message: Message = {
                id: nanoid(),
                user,
                text,
                timestamp: new Date().toISOString(),
            };

            ws.send(btoa(JSON.stringify(message)));

            updateMessages([message]);
        },
        [user, updateMessages, ws],
    );

    return {
        messages: sortMessages(Object.values(messages)),
        sendMessage,
        isOnline,
    };
};
