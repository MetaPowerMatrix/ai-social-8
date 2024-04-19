import React, {useEffect, useState} from "react";
import {Button, Col, Input, Modal, Row} from "antd";
import styles from "./AskProComponent.module.css";
import {
	AndroidOutlined,
	AudioFilled,
	ExclamationCircleFilled,
	PauseOutlined
} from "@ant-design/icons";
import {api_url, getApiServer, getMQTTBroker, Streaming_Server} from "@/common";
import {WebSocketManager} from "@/lib/WebsocketManager";
import {useTranslations} from "next-intl";
import {getOS} from "@/lib/utils";
import mqtt from "mqtt";
import commandDataContainer from "@/container/command";

const AskProComponent = ({activeId, room_id, onReply, onShowProgress}
   :{activeId:string, room_id:string, onReply: (reply:string)=>void,
	onShowProgress: (s: boolean)=>void}) =>
{
	const [query, setQuery] = useState<string>("");
	const [stopped, setStopped] = useState<boolean>(true);
	const [recorder, setRecorder] = useState<MediaRecorder>();
	const [wsSocket, setWsSocket] = useState<WebSocketManager>();
	const [client, setClient] = useState<mqtt.MqttClient | null>(null);
	const t = useTranslations('AIInstruct');
	const {confirm} = Modal;
	const command = commandDataContainer.useContainer()

	useEffect(() => {
		initAudioStream().then(()=>{})
		const mqttClient = mqtt.connect(getMQTTBroker());
		mqttClient.on("connect", () => {
			console.log("Instruct Connected to MQTT broker");
		});
		mqttClient.on("error", (err) => {
			// console.error("Error connecting to MQTT broker:", err);
		});
		setClient(mqttClient);

		return () => {
			mqttClient.end(); // Clean up the connection on component unmount
		};
	}, []);

	useEffect(() => {
		if (client) {
			const topic_instruct_voice = activeId+"/instruct/voice";
			const topic_instruct = activeId+"/instruct";

			// Handler for incoming messages
			const onMessage = (topic: string, message: Buffer) => {
				if (topic === topic_instruct){
					console.log("receive answer: ", message.toString())
					onReply(message.toString())
				}else{
					console.log("receive audio: ", message.toString())
					playAudioWithWebAudioApi(message.toString())
				}
			};

			// Subscribe to the topic
			client.subscribe([topic_instruct,topic_instruct_voice], (err) => {
				if (!err) {
					console.log("Subscribed to topic: ", [topic_instruct,topic_instruct_voice]);
					client.on('message', onMessage);
				}
			});
			// Return a cleanup function to unsubscribe and remove the message handler
			return () => {
				if (client) {
					client.unsubscribe([topic_instruct,topic_instruct_voice]);
					client.removeListener('message', onMessage);
				}
			};
		}
	}, [client]); // Re-run this effect if the `client` state changes

	async function playAudioWithWebAudioApi(url: string): Promise<void> {
		try {
			const audioContext = new (window.AudioContext || window.webkitAudioContext)();
			const response = await fetch(url);
			const arrayBuffer = await response.arrayBuffer();
			const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

			const source = audioContext.createBufferSource();
			source.buffer = audioBuffer;
			source.connect(audioContext.destination);
			source.start();

		} catch (error) {
			console.error('Error playing audio with Web Audio API:', error);
		}
	}

	const initAudioStream = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			handleAudioStream(stream);
		} catch (error) {
			console.error('Error accessing the microphone:', error);
		}
	};

	const process_ws_message = (event: any) => {
		if (event.data.toString() !== 'pong') {
			setQuery(event.data.toString())
		}
	}

	let chunks: BlobPart[] = [];
	const handleAudioStream = (stream: MediaStream) => {
		let options = {mimeType: 'audio/webm;codecs=pcm'};
		let OS = getOS()
		if (OS === 'iphone'|| OS === 'macosx'){
			options = {mimeType: 'audio/mp4;codecs=mp4a'}
		}
		const mediaRecorder = new MediaRecorder(stream, options);
		const socket = new WebSocketManager(Streaming_Server + "/up", process_ws_message);

		setWsSocket(socket)
		setRecorder(mediaRecorder)

		mediaRecorder.ondataavailable = (event) => {
			if (event.data.size > 0) {
				chunks.push(event.data);
				// socket.send(event.data);
			}
		};
		mediaRecorder.onstop = () => {
			socket.send(new Blob(chunks, { 'type' : 'audio/webm' }));
			console.log("send")
			chunks = [];
		};
		// mediaRecorder.start(2000); // Start recording, and emit data every 5s
	};

	const stop_record = () => {
		if (stopped){
			recorder?.start(1000)
			setStopped(false)
		}else{
			recorder?.stop()
			setStopped(true)
		}
	}
	const handleVoiceCommand = (topic: string, pro: string) => {
		const data = {id: activeId, message: topic, pro: pro};
		let url = getApiServer(80) + api_url.portal.interaction.instruct
		fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json;charset=utf-8'
			},
			body: JSON.stringify(data)
		})
			.then(response => response.json())
			.then(data => {
				if (data.code !== "200") {
					alert(t('assist_fail'));
				}
				onShowProgress(false);
			})
			.catch((error) => {
				console.error('Error:', error);
				alert(t('assist_fail'));
				onShowProgress(false);
			});
	};

	const inputQuestion = (event: React.ChangeEvent<HTMLInputElement>) =>{
		setQuery(event.target.value)
	}
	const callPato = (id: string, callid: string) => {
		command.callPato(id, callid).then((res) => {
			Modal.success({
				content: t("waitingCall"),
			});
		})
	}

	const handleAutoChat = (callid: string) => {
		if (callid === ""){
			Modal.warning({
				content: t("requireId"),
			});
		}else{
			callPato(activeId, callid)
		}
	};

	return (
			<div>
				<Row align={"middle"}>
					<Col span={1} style={{marginRight:5}}>
						{
							stopped ?
								<AudioFilled style={{color: "black", fontSize: 18}} onClick={() => {
									confirm({
										icon: <ExclamationCircleFilled/>,
										content: t('startAsk'),
										okText: t('confirm'),
										cancelText: t('cancel'),
										onOk() {
											stop_record()
										}
									})
								}}/>
								:
								<PauseOutlined style={{color: "black", fontSize: 18, marginRight:15}} onClick={() => stop_record()}/>
						}
					</Col>
					<Col span={16}>
						<Input placeholder={t('command')} onChange={inputQuestion} value={query}/>
					</Col>
					<Col span={4}>
						<Button type={"primary"} style={{marginLeft: 5}}
						        onClick={() => handleVoiceCommand(query, room_id)}>{t('ask')}</Button>
					</Col>
					<Col span={2} style={{textAlign:"end"}}>
						<AndroidOutlined  style={{color: "black", fontSize: 18}} onClick={() => {
							confirm({
								icon: <ExclamationCircleFilled/>,
								content: t('startTalkWithPro'),
								okText: t('confirm'),
								cancelText: t('cancel'),
								onOk() {
									handleAutoChat(room_id)
								}
							})
						}}/>
					</Col>
				</Row>
			</div>
	)
}

export default AskProComponent;
