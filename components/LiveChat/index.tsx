import React, { useEffect } from 'react';
import styles from "@/components/LiveChat/LiveChatComponent.module.css";

interface LiveChatPros {
	id: string,
	serverUrl: string;
	onClose: ()=>void;
	visible: boolean;
}

const LiveChatComponent: React.FC<LiveChatPros>  = ({visible, serverUrl, id, onClose}) => {
	// Function to initialize audio recording and streaming
	const initAudioStream = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			handleAudioStream(stream);
		} catch (error) {
			console.error('Error accessing the microphone:', error);
		}
	};
	const handleAudioStream = (stream: MediaStream) => {
		const mediaRecorder = new MediaRecorder(stream);
		const socket = new WebSocket(serverUrl);

		mediaRecorder.ondataavailable = (event) => {
			if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
				socket.send(event.data);
			}
		};

		mediaRecorder.start(100); // Start recording, and emit data every 100ms

		socket.onopen = () => {
			console.log('WebSocket connection established. Streaming can start.');
		};

		useEffect(() => {
			// Call the function to start the process
			initAudioStream();
		}, []);
		// Remember to handle WebSocket closure and errors appropriately
		useEffect(() => {
			// Create a new WebSocket connection to the Rust server
			const ws = new WebSocket(serverUrl);

			ws.onmessage = (event) => {
				// Received an audio frame from the server
				const audioFrame = event.data;
				console.log('Received audio frame:', audioFrame);

				// Here you would process and play the audio data
				// Actual implementation depends on the audio data format and application requirements
			};

			ws.onerror = (error) => {
				console.error('WebSocket Error:', error);
			};

			// Clean up the WebSocket connection when the component unmounts
			return () => {
				ws.close();
			};
		}, [serverUrl]);
	};

	return (
		<div hidden={!visible} className={styles.live_chat_container}>
			<div className={styles.live_chat_content}>
				<h2>Audio Recorder</h2>
			{/* UI elements can go here */}
			</div>
		</div>
	);
};

export default LiveChatComponent;
