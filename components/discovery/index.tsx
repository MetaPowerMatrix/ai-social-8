import React, {useEffect, useState} from "react";
import {Col, Row} from "antd";
import styles from "./DiscoveryComponent.module.css";
import {AudioOutlined, DownOutlined, PauseOutlined, RightOutlined} from "@ant-design/icons";
import TextArea from "antd/es/input/TextArea";
import {api_url, getApiServer, getMQTTBroker, Streaming_Server} from "@/common";
import {WebSocketManager} from "@/lib/WebsocketManager";
import mqtt from "mqtt";
import {useTranslations} from "next-intl";
import SummaryComponent from "@/components/summary";
import QueryEmbeddingComponent from "@/components/query_embedding";

const DiscoveryComponent = ({id, onShowProgress, showLiveChat}:{id:string, onShowProgress: (s: boolean)=>void, showLiveChat:()=>void}) => {
	const [question, setQuestion] = useState<string>("");
	const [stopped, setStopped] = useState<boolean>(true);
	const [answer, setAnswer] = useState<string>("");
	const [recorder, setRecorder] = useState<MediaRecorder>();
	const [wsSocket, setWsSocket] = useState<WebSocketManager>();
	const [client, setClient] = useState<mqtt.MqttClient | null>(null);
	const [showSummary, setShowSummary] = useState<boolean>(false);
	const [showQuery, setShowQuery] = useState<boolean>(false);
	const t = useTranslations('AIInstruct');

	useEffect(() => {
		// Initialize MQTT client and connect
		const mqttClient = mqtt.connect(getMQTTBroker());
		mqttClient.on("connect", () => {
			console.log("Instruct Connected to MQTT broker");
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
			const topic_instruct_voice = id+"/instruct/voice";
			const topic_instruct = id+"/instruct";

			// Handler for incoming messages
			const onMessage = (topic: string, message: Buffer) => {
				if (topic === topic_instruct){
					console.log("receive answer: ", message.toString())
					setAnswer(message.toString())
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

	useEffect(() => {
			initAudioStream().then(()=>{})
	}, [])

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
		console.log(event.data.toString())
		setQuestion(event.data.toString())
		handleVoiceCommand({topic: event.data.toString()})
	}

	let chunks: BlobPart[] = [];
	const handleAudioStream = (stream: MediaStream) => {
		const options = {mimeType: 'audio/webm;codecs=pcm'};
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
			recorder?.start()
			setStopped(false)
		}else{
			recorder?.stop()
			setStopped(true)
		}
	}
	const handleVoiceCommand = (values: any) => {
		console.log(values);
		// onShowProgress(true);
		const data = {id: id, message: values.topic};
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
				if (data.code === "200") {
					// let answer = data.content
					// setAnswer(answer)
					// setRoleOnePortrait(openInfo.role_1_portarit)
					// alert('等待助手执行任务');
				}else{
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

	return (
		<div className={styles.container}>
			<h4 style={{textAlign:"center"}}>发现</h4>
			<Row className={styles.header_meta} onClick={() => showLiveChat()}>
				<Col className={styles.colorBar} span={12}>
					<h5>{t("live")}</h5>
				</Col>
				<Col className={styles.colorBarEnd} span={12}>
					<h5><RightOutlined/></h5>
				</Col>
			</Row>
			<Row className={styles.header_meta} onClick={() => {setShowSummary(true)}}>
				<Col className={styles.colorBar} span={12}>
					<h5>{t("summary")}</h5>
				</Col>
				<Col className={styles.colorBarEnd} span={12}>
					<h5><RightOutlined/></h5>
				</Col>
			</Row>
			<Row className={styles.header_meta} onClick={() => {setShowQuery(true)}}>
				<Col className={styles.colorBar} span={12}>
					<h5>{t("query")}</h5>
				</Col>
				<Col className={styles.colorBarEnd} span={12}>
					<h5><RightOutlined/></h5>
				</Col>
			</Row>
			<div className={styles.header_meta}>
				<Row onClick={() => {}}>
					<Col className={styles.colorBar} span={12}>
						<h5>{t("talk")}</h5>
					</Col>
					<Col className={styles.colorBarEnd} span={12}>
						<h5><DownOutlined /></h5>
					</Col>
				</Row>
				<Row align={"middle"} justify={"space-between"}>
					<Col span={20}>
						<TextArea placeholder={t('command')} value={question} rows={1}/>
					</Col>
					<Col span={2}>
						{
							stopped ?
								<AudioOutlined style={{color: "black", fontSize: 20}} onClick={() => stop_record()}/>
								:
								<PauseOutlined style={{color: "black", fontSize: 20}} onClick={() => stop_record()}/>
						}
					</Col>
					<TextArea placeholder={"回答"} style={{marginTop:10}} value={answer} cols={3}/>
				</Row>
			</div>
			<SummaryComponent onClose={()=>setShowSummary(false)} activeId={id} visible={showSummary} onShowProgress={onShowProgress}/>
			<QueryEmbeddingComponent activeId={id} visible={showQuery} onShowProgress={onShowProgress} onClose={()=>setShowQuery(false)}/>
		</div>
	)
}

export default DiscoveryComponent;
