import React, {useEffect, useState} from 'react';
import styles from "@/components/AIInstructMobile/AIInstructMobileComponent.module.css";
import {Card, Col, Divider, Form, GetProp, Row, Upload, UploadFile, UploadProps} from "antd";
import {useTranslations} from "next-intl";
import {
	AudioOutlined, CloseOutlined,
	PauseOutlined
} from "@ant-design/icons";
import {api_url, getApiServer, getMQTTBroker, LiveOpenResponse} from "@/common";
import Image from "next/image";
import commandDataContainer from "@/container/command";
import {WebSocketManager} from "@/lib/WebsocketManager";
import TextArea from "antd/es/input/TextArea";
import mqtt from "mqtt";
import SubscriptionsComponent from "@/components/Subscriptions";

interface AIInstructPros {
	id: string,
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

const AIInstructMobileComponent: React.FC<AIInstructPros>  = ({visible, serverUrl, id, onClose, onShowProgress}) => {
	const t = useTranslations('LiveChat');
	const [recorder, setRecorder] = useState<MediaRecorder>();
	const [wsSocket, setWsSocket] = useState<WebSocketManager>();
	const [fileList, setFileList] = useState<UploadFile[]>([]);
	const [stopped, setStopped] = useState<boolean>(true);
	const [roleOnePortrait, setRoleOnePortrait] = useState<string>("/images/two-boy.png");
	const [answer, setAnswer] = useState<string>("");
	const [question, setQuestion] = useState<string>("");
	const [client, setClient] = useState<mqtt.MqttClient | null>(null);
	const [activeAgentKey, setActiveAgentKey] = useState<string>("qa");
	const [openSub, setOpenSub] = useState<boolean>(false);
	const command = commandDataContainer.useContainer()

	const agents = [
		{key: "qa", label: "问答"},
		{key: "X", label: "X"},
		{key: "telegram", label: "Telegram"},
		{key: "solana", label: "Solana"},
	]
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
		if (visible){
			initAudioStream()
		}
	}, [visible])

	const close_clean = () => {
		if (wsSocket !== undefined){
			wsSocket.close();
		}
		if (recorder !== undefined){
			recorder.stop()
		}
		onClose()
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
		console.log(event)
		setQuestion(event.data.toString())
		handleVoiceCommand({topic: event.data.toString()})
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
					alert('任务失败');
				}
				onShowProgress(false);
			})
			.catch((error) => {
				console.error('Error:', error);
				alert('任务失败');
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

	const props: UploadProps = {
		onRemove: (file) => {
			const index = fileList.indexOf(file);
			const newFileList = fileList.slice();
			newFileList.splice(index, 1);
			setFileList(newFileList);
		},
		beforeUpload: (file) => {
			setFileList([...fileList, file]);
			return false;
		},
		fileList,
	};

	const onTabChange = (key: string) => {
			setActiveAgentKey(key)
	};

	return (
		<div hidden={!visible}>
			<div className={styles.voice_instruct_container}>
				<div className={styles.voice_instruct_content}>
					<Row>
						<Col span={8}>
							<CloseOutlined style={{color: "black", fontSize: 20}} onClick={() => close_clean()}/>
						</Col>
					</Row>
					<Card
						style={{ width: '100%', marginTop:20 }}
						tabList={agents}
						activeTabKey={activeAgentKey}
						onTabChange={onTabChange}
						tabProps={{
							size: 'small',
						}}
					>
						{ activeAgentKey === "qa" &&
								<>
                    <Row align={"middle"} justify={"space-between"}>
                        <Col span={22}>
                            <TextArea placeholder={"你的指令"}  value={question} rows={1}/>
                        </Col>
                        <Col span={1}>
													{
														stopped?
															<AudioOutlined  style={{color: "black", fontSize: 20}} onClick={() => stop_record()}/>
															:
															<PauseOutlined style={{color: "black", fontSize: 20}} onClick={() => stop_record()}/>
													}
                        </Col>
                    </Row>
                    <Row align={"middle"} justify={"space-between"}>
                        <Col span={24} style={{marginTop:20, textAlign: "center", height: 160}}>
                            <Image src={roleOnePortrait} fill={true} alt={"role1"}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24} style={{marginTop: 20, textAlign: "center", height: 180}}>
                            <TextArea placeholder={"任务结果"}  value={answer} rows={8}/>
                        </Col>
                    </Row>
								</>
						}
						{ activeAgentKey !== "qa" &&
                <Row align={"middle"} justify={"space-between"} style={{marginTop:20}}>
		                <Col span={7}/>
                    <Col span={10} style={{textAlign: "center", height: 400}}>
                        <Image onClick={()=>setOpenSub(true)} src={"/images/lock.png"} fill={true} alt={"lock"}/>
                    </Col>
                    <Col span={7}/>
                </Row>
						}
					</Card>
					<SubscriptionsComponent id={id} onClose={() => setOpenSub(false)} visible={openSub} onShowProgress={onShowProgress}/>
				</div>
			</div>
		</div>

	);
};

export default AIInstructMobileComponent;
