import React, {useEffect, useState} from 'react';
import styles from "@/components/AIInstructMobile/AIInstructMobileComponent.module.css";
import {
	Button,
	Card,
	Col, DatePicker,
	DatePickerProps, Divider,
	List, Rate,
	Row, Tag,
	UploadFile,
	UploadProps
} from "antd";
import {useTranslations} from "next-intl";
import {
	AudioOutlined, CloseOutlined, LeftOutlined,
	PauseOutlined, RightOutlined
} from "@ant-design/icons";
import {api_url, ChatMessage, getApiServer, getMQTTBroker} from "@/common";
import Image from "next/image";
import commandDataContainer from "@/container/command";
import {WebSocketManager} from "@/lib/WebsocketManager";
import TextArea from "antd/es/input/TextArea";
import mqtt from "mqtt";
import SubscriptionsComponent from "@/components/Subscriptions";
import {formatDateTimeString, getCookie, getTodayDateString} from "@/lib/utils";
import dayjs from "dayjs";

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
	const t = useTranslations('AIInstruct');
	const [recorder, setRecorder] = useState<MediaRecorder>();
	const [fileList, setFileList] = useState<UploadFile[]>([]);
	const [stopped, setStopped] = useState<boolean>(true);
	const [roleOnePortrait, setRoleOnePortrait] = useState<string>("/images/two-boy.png");
	const [question, setQuestion] = useState<string>("");
	const [client, setClient] = useState<mqtt.MqttClient | null>(null);
	const [activeAgentKey, setActiveAgentKey] = useState<string>("qa");
	const [openSub, setOpenSub] = useState<boolean>(false);
	const [authorisedIds, setAuthorisedIds] = useState<{ label: string, value: string }[]>([]);
	const [selectedIndex, setSelectedIndex] = useState<number | undefined>(undefined);
	const [callid, setCallid] = useState<string>("");
	const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
	const [queryDate, setQueryDate] = useState(getTodayDateString());
	const [summary, setSummary] = useState<string>("");
	const [hideMessages, setHideMessages] = useState<boolean>(false);
	const [wsSocket, setWsSocket] = useState<WebSocketManager>();
	const command = commandDataContainer.useContainer()

	const agents = [
		{key: "qa", label: t('talk')},
		{key: "payment", label: t('payment')},
		{key: "telegram", label: "Telegram"},
		{key: "X", label: "X"},
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

	useEffect(() => {
		const cookie2 = getCookie('authorized-ids');
		if (cookie2 !== "" || cookie2 !== null) {
			const ids = cookie2.split(',');
			const idsMap = ids.filter((element)=> {return (element !== '')} )
				.map((id) => {
					return {label: id.split(":")[1], value: id.split(":")[0]};
				});
			// console.log(idsMap)
			setAuthorisedIds(idsMap);
		}
	},[]);

	const callPato = (id: string, callid: string) => {
		command.callPato(id, callid).then((res) => {
			alert(t("waitingCall"))
		})
	}
	useEffect(()=> {
		command.getProHistoryMessages(id, callid, queryDate).then((response) => {
			let messages: ChatMessage[] = []
			if (response !== null) {
				let session_messages = response
				let summary = ""
				session_messages.forEach((item) => {
					let msg = item.messages.filter((msg: ChatMessage) => {
						return (msg.question.length > 0 && msg.answer.length > 0)
					})
					messages.push(...msg)
					summary += item.summary
				})
				setSummary(summary)
				setChatMessages(messages)
			}
		})
	},[id, queryDate])

	const onChange: DatePickerProps['onChange'] = (_, dateString) => {
		changeQueryDate(dateString as string)
		// console.log(date, dateString);
	};

	const changeQueryDate = (datestring: string) => {
		setQueryDate(datestring);
	}

	const handleAutoChat = () => {
		if (callid === ""){
			alert(t(t("requireId")))
		}
		callPato(id, callid)
	};

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

	return (
			<div className={styles.voice_instruct_container}>
				<div className={styles.voice_instruct_content}>
					<>
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
						</Row>
						<Divider/>
						<div hidden={hideMessages} style={{overflow: "scroll", padding: 15}}>
							<h5>{t('pro')}</h5>
							<List
								itemLayout="horizontal"
								size="small"
								dataSource={authorisedIds}
								renderItem={(item, index) => (
									<List.Item
										key={index}
										className={selectedIndex != undefined && selectedIndex === index ? styles.list_item : ''}
										defaultValue={item.value}
										onClick={(e) => {
											setHideMessages(false)
											setSelectedIndex(index)
											setCallid(item.value)
										}}
									>
										<Row style={{width:"100%"}}>
											<Col span={22}><h5>{item.label}</h5></Col>
											<Col span={2} style={{textAlign: "end"}}><RightOutlined/></Col>
										</Row>
									</List.Item>
								)}
							/>
							<Row style={{padding: 10}}>
								<Col span={24}>
									<Button style={{width: "100%", marginTop: 20}} type={"primary"}
									        onClick={handleAutoChat}>{t('automatic_comm')}</Button>
								</Col>
							</Row>
						</div>
						<div hidden={!hideMessages} style={{overflow: "scroll", height: 700, padding: 15}}>
							<Row>
								<LeftOutlined onClick={() => setHideMessages(true)}/>
							</Row>
							<Divider/>
							<DatePicker defaultValue={dayjs(queryDate)} size={"small"} style={{marginBottom: 10}}
							            onChange={onChange}/>
							<h5>{summary}</h5>
							<List
								itemLayout="vertical"
								size="small"
								dataSource={chatMessages}
								renderItem={(item) => (
									<List.Item
										key={item.session}
									>
										<Row>
											<Col span={24}>
												<h5>{item.sender.split('(')[0]}: {item.question}</h5>
											</Col>
										</Row>
										<Row>
											<Col span={24} style={{textAlign:"end"}}>
												<h5>{item.answer} : {item.receiver.split('(')[0]}</h5>
											</Col>
										</Row>
									</List.Item>
								)}
							/>
						</div>
						{activeAgentKey !== "qa" &&
                <Row align={"middle"} justify={"space-between"} style={{marginTop: 20}}>
                    <Col span={7}/>
                    <Col span={10} style={{textAlign: "center", height: 360}}>
                        <Image onClick={() => setOpenSub(true)} src={"/images/lock.png"} fill={true} alt={"lock"}/>
                    </Col>
                    <Col span={7}/>
                </Row>
						}
						<SubscriptionsComponent mobile={true} id={id} onClose={() => setOpenSub(false)} visible={openSub}
						                        onShowProgress={onShowProgress}/>
					</>
				</div>
			</div>
	);
};

export default AIInstructMobileComponent;
