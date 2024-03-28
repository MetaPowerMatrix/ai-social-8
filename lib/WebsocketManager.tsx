export class WebSocketManager {
	private ws: WebSocket | null = null;
	private url: string;
	private reconnectInterval: number = 5000; // Reconnect every 5 seconds, if needed
	private heartbeatInterval: number = 10000; // Send heartbeat every 30 seconds
	private heartbeatMsg: string = 'ping'; // Heartbeat message content
	private heartbeatTimer: any = null;
	private callback: (event: any) => void;

	constructor(url: string, callback: (event: any)=>void) {
		this.url = url;
		this.callback = callback;
		this.connect();
	}
	public close(): void{
		this.ws?.close();
	}
	public send(data: string | ArrayBuffer | Blob | ArrayBufferView): void{
		this.ws?.send(data)
	}
	private connect(): void {
		this.ws = new WebSocket(this.url);

		this.ws.onopen = () => {
			console.log('Live Chat WebSocket connected.');
			this.startHeartbeat();
		};

		this.ws.onclose = (event) => {
			console.log('WebSocket disconnected. Attempting to reconnect...', event.reason);
			this.stopHeartbeat();
			setTimeout(() => this.connect(), this.reconnectInterval);
		};

		this.ws.onerror = (error) => {
			console.error('WebSocket error:', error);
		};

		this.ws.onmessage = (event) => {
			console.log('WebSocket message:', event.data);
			this.callback(event)
			// Handle incoming messages...
		};
	}

	private startHeartbeat(): void {
		this.stopHeartbeat(); // Prevent multiple intervals
		this.heartbeatTimer = setInterval(() => {
			if (this.ws && this.ws.readyState === WebSocket.OPEN) {
				this.ws.send(this.heartbeatMsg);
			}
		}, this.heartbeatInterval);
	}

	private stopHeartbeat(): void {
		if (this.heartbeatTimer !== null) {
			clearInterval(this.heartbeatTimer);
			this.heartbeatTimer = null;
		}
	}

	// Additional methods to send messages, close connection, etc., can be added here
}

