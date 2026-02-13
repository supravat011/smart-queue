type MessageHandler = (data: any) => void;

export class WebSocketManager {
    private ws: WebSocket | null = null;
    private url: string;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 2; // Reduced from 5 to avoid console spam
    private reconnectDelay = 3000;
    private messageHandlers: Set<MessageHandler> = new Set();
    private isIntentionallyClosed = false;

    constructor(url: string) {
        this.url = url;
    }

    connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(this.url);
                this.isIntentionallyClosed = false;

                this.ws.onopen = () => {
                    console.log(`WebSocket connected: ${this.url}`);
                    this.reconnectAttempts = 0;
                    resolve();
                };

                this.ws.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        this.messageHandlers.forEach(handler => handler(data));
                    } catch (error) {
                        console.error('Failed to parse WebSocket message:', error);
                    }
                };

                this.ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    reject(error);
                };

                this.ws.onclose = () => {
                    console.log(`WebSocket closed: ${this.url}`);
                    if (!this.isIntentionallyClosed) {
                        this.attemptReconnect();
                    }
                };
            } catch (error) {
                reject(error);
            }
        });
    }

    private attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
            setTimeout(() => {
                this.connect().catch(console.error);
            }, this.reconnectDelay);
        } else {
            console.error('Max reconnection attempts reached');
        }
    }

    onMessage(handler: MessageHandler) {
        this.messageHandlers.add(handler);
        return () => this.messageHandlers.delete(handler);
    }

    send(data: any) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        } else {
            console.warn('WebSocket is not connected');
        }
    }

    disconnect() {
        this.isIntentionallyClosed = true;
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.messageHandlers.clear();
    }

    isConnected(): boolean {
        return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
    }
}

// Global WebSocket managers
let queueWS: WebSocketManager | null = null;
let slotsWS: WebSocketManager | null = null;
let userWS: WebSocketManager | null = null;

export const connectToQueue = () => {
    if (!queueWS) {
        queueWS = new WebSocketManager('ws://localhost:8000/ws/queue');
    }
    return queueWS.connect().then(() => queueWS!);
};

export const connectToSlots = () => {
    if (!slotsWS) {
        slotsWS = new WebSocketManager('ws://localhost:8000/ws/slots');
    }
    return slotsWS.connect().then(() => slotsWS!);
};

export const connectToUser = (userId: number) => {
    if (userWS) {
        userWS.disconnect();
    }
    userWS = new WebSocketManager(`ws://localhost:8000/ws/user/${userId}`);
    return userWS.connect().then(() => userWS!);
};

export const disconnectAll = () => {
    queueWS?.disconnect();
    slotsWS?.disconnect();
    userWS?.disconnect();
    queueWS = null;
    slotsWS = null;
    userWS = null;
};
