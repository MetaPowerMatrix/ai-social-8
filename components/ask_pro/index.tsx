import React, {useEffect, useState} from "react";
import {Button, Col, Input, Modal, Row} from "antd";
import styles from "./AskProComponent.module.css";
import {
	AudioFilled,
	CloseOutlined, ExclamationCircleFilled,
	PauseOutlined
} from "@ant-design/icons";
import TextArea from "antd/es/input/TextArea";
import {api_url, getApiServer, getMQTTBroker, Streaming_Server} from "@/common";
import {WebSocketManager} from "@/lib/WebsocketManager";
import {useTranslations} from "next-intl";
import {getOS} from "@/lib/utils";
import mqtt from "mqtt";

const AskProComponent = ({activeId, visible, pro_name, pro_id, onClose, onShowProgress}:{activeId:string, visible:boolean, pro_name:string, pro_id:string, onClose: ()=>void, onShowProgress: (s: boolean)=>void}) => {
	const [query, setQuery] = useState<string>("");
	const [queryResult, setQueryResult] = useState<string>("");
	const [stopped, setStopped] = useState<boolean>(true);
	const [recorder, setRecorder] = useState<MediaRecorder>();
	const [wsSocket, setWsSocket] = useState<WebSocketManager>();
	const [client, setClient] = useState<mqtt.MqttClient | null>(null);
	const t = useTranslations('AIInstruct');
	const {confirm} = Modal;

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
					setQueryResult(message.toString())
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
		console.log(event.data.toString())
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
			console.log(event)
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
	return (
		<div hidden={!visible} className={styles.ask_pro_mobile_container}>
			<div className={styles.ask_pro_mobile_content}>
				<CloseOutlined onClick={()=>onClose()} style={{fontSize: 18}}/>
				<div style={{textAlign:"center",marginBottom:5}}>{pro_name}</div>
				<Row>
					<Col span={24}>
						<Input placeholder={t('command')} onChange={inputQuestion} value={query}/>
					</Col>
				</Row>
				<Row>
					<TextArea placeholder={t('reply')} style={{marginTop: 10}} value={queryResult} rows={14}/>
				</Row>
				<Row align={"middle"} style={{marginTop:10}}>
					<Col span={8}></Col>
					<Col span={4}>
						{
							stopped ?
								<AudioFilled style={{color: "black", fontSize: 22}} onClick={() => {
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
								<PauseOutlined style={{color: "black", fontSize: 22}} onClick={() => stop_record()}/>
						}
					</Col>
					<Col span={4}>
						<Button type={"primary"} style={{marginLeft: 0}}
						        onClick={() => handleVoiceCommand(query, pro_id)}>{t('ask')}</Button>
					</Col>
				</Row>
			</div>
		</div>
	)
}

export default AskProComponent;
