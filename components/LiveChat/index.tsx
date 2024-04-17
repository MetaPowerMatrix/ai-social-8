import React, {useEffect, useState} from 'react';
import styles from "@/components/LiveChat/LiveChatComponent.module.css";
import {
	Col,
	Row,
	Timeline
} from "antd";
import {useTranslations} from "next-intl";
import {
	AudioOutlined, CloseOutlined,
	LoginOutlined, LogoutOutlined, PauseOutlined
} from "@ant-design/icons";
import {getMQTTBroker} from "@/common";
import commandDataContainer from "@/container/command";
import {WebSocketManager} from "@/lib/WebsocketManager";
import { v4 as uuidv4 } from 'uuid';
import {SequentialAudioPlayer} from "@/lib/SequentialAudioPlayer";
import mqtt from "mqtt";
import {TimeLineItemProps} from "antd/lib/timeline/TimelineItem";

interface LiveChatPros {
	id: string,
	room_name: string,
	roleOne:string,
	roleTwo:string,
	session: string,
	serverUrl: string;
	onClose: ()=>void;
	visible: boolean;
	onShowProgress: (s: boolean)=>void;
}

declare global {
	interface Window {
		webkitAudioContext: any;
		AudioContext: any;
	}
}

const LiveChatComponent: React.FC<LiveChatPros>  = ({visible, serverUrl, id,
  room_name, session, roleOne, roleTwo, onClose, onShowProgress}) =>
{
	const t = useTranslations('LiveChat');
	const [recorder, setRecorder] = useState<MediaRecorder>();
	const [wsSocket, setWsSocket] = useState<WebSocketManager>();
	const [stopped, setStopped] = useState<boolean>(true);
	const [lyrics, setLyrics] = useState<TimeLineItemProps[]>([]);
	const [voiceUrls, setVoiceUrls] = useState<string[]>([]);
	const [startPlay, setStartPlay] = useState<boolean>(false);
	const [client, setClient] = useState<mqtt.MqttClient | null>(null);
	const [player, setPlayer] = useState<SequentialAudioPlayer | undefined>(undefined);
	const command = commandDataContainer.useContainer()

	useEffect(() => {
		console.log("init player")
		initAudioStream()
		setPlayer(new SequentialAudioPlayer(voiceUrls, window));
		// Initialize MQTT client and connect
		const mqttClient = mqtt.connect(getMQTTBroker());
		mqttClient.on("connect", () => {
			console.log("LiveChat Connected to MQTT broker");
		});
		mqttClient.on("error", (err) => {
			console.error("Error connecting to MQTT broker:", err);
		});
		setClient(mqttClient);

		return () => {
			mqttClient.end(); // Clean up the connection on component unmount
		};
	}, []);

	useEffect(() => {
		if (client) {
			const topic_voice = session+"/voice";
			const topic_text = session+"/text";

			// Handler for incoming messages
			const onMessage = async (topic: string, message: Buffer) => {
				console.log("receive ", topic, " ", message.toString())
				if (topic === topic_text){
					let newMsg = {children: message.toString()}
					setLyrics((prev)=>{
						const newLyrics = [...prev]
						newLyrics.shift()
						newLyrics.push(newMsg)
						return newLyrics
					})
				}else{
					await player?.addUrl(message.toString())
					setVoiceUrls((prevUrl) =>{
						const newUrls = [...prevUrl]
						newUrls.push(message.toString())
						return newUrls
					})
				}
			};

			// Subscribe to the topic
			client.subscribe([topic_text, topic_voice], (err) => {
				if (!err) {
					console.log("Subscribed to topic: ", [topic_text, topic_voice]);
					client.on('message', onMessage);
				}
			});

			// Return a cleanup function to unsubscribe and remove the message handler
			return () => {
				if (client) {
					client.unsubscribe([topic_text, topic_voice]);
					client.removeListener('message', onMessage);
				}
			};
		}
	}, [client]); // Re-run this effect if the `client` state changes

	useEffect(() => {
		if (voiceUrls.length > 0 && !startPlay) {
			setTimeout(() => {
				console.log(player)
				let isStart = player?.play((empty: boolean)=>setStartPlay(!empty))
				console.log(voiceUrls)
				console.log("started: ", isStart)
				setStartPlay( isStart === undefined ? false : isStart)
			}, 1000);
			// setStartPlay(true)
		}
	},[voiceUrls])

	const close_clean = () => {
		if (wsSocket !== undefined){
			wsSocket.close();
		}
		if (recorder !== undefined){
			recorder.stop()
		}
		onClose()
	}
	const end_session = () => {
		command.end_live_chat([roleOne, roleTwo]).then((res) => {
			console.log(res)
			alert(t('end'))
		})
	}
	const reload_session = () => {
		command.restore_live_chat([roleOne, roleTwo], session).then((res) => {
			console.log(res)
			alert(t("restore"))
		})
	}
	// Function to initialize audio recording and streaming
	const initAudioStream = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			handleAudioStream(stream);
		} catch (error) {
			console.error('Error accessing the microphone:', error);
		}
	};

	const process_ws_message = (event: any) => {
		console.log('Received message:', event.data);
		console.log(roleOne, roleTwo, session)
		let message = event.data.toString()
		command.continue_live_chat(id, [roleOne, roleTwo], message, session)
			.then((res) => {
				setLyrics((prev)=>{
					const newLyrics = [...prev]
					newLyrics.push(message)
					return newLyrics
				})
			})
	}

	let chunks: BlobPart[] = [];
	const handleAudioStream = (stream: MediaStream) => {
		const options = {mimeType: 'audio/webm;codecs=pcm'};
		const mediaRecorder = new MediaRecorder(stream, options);
		// const socket = new WebSocket(serverUrl + "/up");
		const socket = new WebSocketManager(serverUrl + "/up", process_ws_message);

		setWsSocket(socket);
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
			recorder?.start()
			setStopped(false)
		}else{
			recorder?.stop()
			setStopped(true)
		}
	}

	const ChatDialog = ({visible, message, onClose}:{visible:boolean,message:string, onClose: ()=>void}) => {
		return(
			<div hidden={!visible} className={styles.dialog_layer}>
				<CloseOutlined onClick={() => onClose()} style={{color: "white", fontSize: 18, padding: 10}}/>
				<Row className={styles.live_chat_message}>
					<Col span={24} style={{height: 100, color: "white", overflow: "scroll"}}>
						<Timeline
							style={{color: "white"}}
							pending="..."
							reverse={true}
							items={lyrics}
						/>
					</Col>
				</Row>
			</div>
		)
	}

	return (
		<div hidden={!visible} className={styles.live_chat_container}>
			<div className={styles.live_chat_content}>
				<Row align={"middle"}>
					<Col span={2}>
						<CloseOutlined onClick={() => onClose()} style={{color: "white", fontSize: 18, padding: 10}}/>
					</Col>
					<Col span={22} style={{textAlign: "center"}}>
						<span style={{color: "white", fontSize: 18}}>{room_name}</span>
					</Col>
				</Row>
				<Row style={{height: "100%"}} align={"middle"} justify={"space-between"}>
					<Col span={24} style={{height: "100%"}}>
						<iframe title="Daft Punk in End of Line Club" frameBorder="0" allowFullScreen
						        allow="autoplay; fullscreen; xr-spatial-tracking" xr-spatial-tracking="true"
						        execution-while-out-of-viewport="true" execution-while-not-rendered="true" web-share="true"
						        style={{height: "100%", width: "100%"}}
						        src="https://sketchfab.com/models/a3c357d308004c6abed1abe2e0cf62b0/embed"></iframe>
						{/*<Image src={roleOnePortrait} fill={true} alt={"role1"}/>*/}
					</Col>
				</Row>
				<Row align={"middle"} style={{padding:10}}>
					<Col span={8} style={{textAlign:"center"}}>
						{ stopped ? <AudioOutlined onClick={() => {stop_record()}}/> : <PauseOutlined onClick={() => {stop_record()}}/>}
					</Col>
					<Col span={8} style={{textAlign:"center"}}>
						<LoginOutlined onClick={() => { reload_session() }}/>
					</Col>
					<Col span={8} onClick={() => { end_session() }} style={{textAlign:"center"}}>
						<LogoutOutlined/>
					</Col>
				</Row>
			</div>
		</div>
)
	;
};

export default LiveChatComponent;
