import React, {useEffect, useState} from 'react';
import styles from "@/components/AIInstructMobile/AIInstructMobileComponent.module.css";
import {
	Button, Card,
	Col, DatePicker,
	DatePickerProps, Divider,
	List, Row, Modal
} from "antd";
import {useTranslations} from "next-intl";
import {
	AndroidOutlined,
	AudioOutlined, ExclamationCircleFilled, LeftOutlined, OpenAIOutlined,
	PauseOutlined, RightOutlined, UnorderedListOutlined
} from "@ant-design/icons";
import {api_url, ChatMessage, getApiServer, getMQTTBroker, HotPro, Streaming_Server} from "@/common";
import commandDataContainer from "@/container/command";
import {WebSocketManager} from "@/lib/WebsocketManager";
import TextArea from "antd/es/input/TextArea";
import mqtt from "mqtt";
import SubscriptionsComponent from "@/components/Subscriptions";
import {getOS, getTodayDateString} from "@/lib/utils";
import dayjs from "dayjs";

interface AIInstructPros {
	id: string,
	onShowProgress: (s: boolean)=>void;
}

declare global {
	interface Window {
		webkitAudioContext: any;
		AudioContext: any;
	}
}

const AIInstructMobileComponent: React.FC<AIInstructPros>  = ({id, onShowProgress}) => {
	const t = useTranslations('AIInstruct');
	const [openSub, setOpenSub] = useState<boolean>(false);
	const [authorisedIds, setAuthorisedIds] = useState<{ label: string, value: string }[]>([]);
	const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
	const [queryDate, setQueryDate] = useState(getTodayDateString());
	const [summary, setSummary] = useState<string>("");
	const [hideMessages, setHideMessages] = useState<boolean>(true);
	const [question, setQuestion] = useState<string>("");
	const [stopped, setStopped] = useState<boolean>(true);
	const [answer, setAnswer] = useState<string>("");
	const [hotPros, setHotPros] = useState<HotPro[]>([])
	const [recorder, setRecorder] = useState<MediaRecorder>();
	const [wsSocket, setWsSocket] = useState<WebSocketManager>();
	const [client, setClient] = useState<mqtt.MqttClient | null>(null);
	const [accessAssitant, setAccessAssitant] = useState<string>()
	const [activeTabPro, setActiveTabPro] = useState<string>('mine');
	const tabHeight: number = 180
	const command = commandDataContainer.useContainer()
	let chunks: BlobPart[] = [];
	const {confirm} = Modal;

	useEffect(() => {
		initAudioStream().then(()=>{})
		let asInfoStr = localStorage.getItem("assistants")
		if (asInfoStr !== null) {
			const asInfo = JSON.parse(asInfoStr)
			const idsMap = asInfo.ids.map((id: string) => {
				const id_name = id.split(":")
				if (id_name.length > 1){
					return {label: id.split(":")[1], value: id.split(":")[0]};
				}
			});
			setAuthorisedIds(idsMap);
		}

		// Initialize MQTT client and connect
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

	useEffect(()=>{
		command.getProHots().then((resp)=>{
			setHotPros(resp)
		})
	},[])
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
		console.log("assist: ", accessAssitant)
		if (event.data.toString() !== 'pong'){
			setQuestion(event.data.toString())
			if (accessAssitant === undefined){
				handleVoiceCommand(event.data.toString(), id)
			}else{
				handleVoiceCommand(event.data.toString(), accessAssitant)
			}
		}
	}

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
		const data = {id: id, message: topic, pro: pro};
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

	const callPato = (id: string, callid: string) => {
		command.callPato(id, callid).then((res) => {
			Modal.success({
				content: t("waitingCall"),
			});
		})
	}
	const getProHistory = (id: string, callid: string) => {
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
	}

	const onChange: DatePickerProps['onChange'] = (_, dateString) => {
		changeQueryDate(dateString as string)
		// console.log(date, dateString);
	};

	const changeQueryDate = (datestring: string) => {
		setQueryDate(datestring);
	}

	const handleAutoChat = (callid: string) => {
		if (callid === ""){
			Modal.warning({
				content: t("requireId"),
			});
		}else{
			callPato(id, callid)
		}
	};

	const pro_tabs = [
		{
			key: 'mine',
			label: t('mine'),
		},
		{
			key: 'system',
			label: t('system'),
		}
	];
	const onProTabChange = (key: string) => {
		setActiveTabPro(key);
	};
	return (
			<div className={styles.voice_instruct_container}>
				<div className={styles.voice_instruct_content}>
					<div hidden={!hideMessages}>
						<Card
							bodyStyle={{padding: "0"}}
							style={{ width: '100%', marginBottom:15 }}
							tabList={pro_tabs}
							activeTabKey={activeTabPro}
							onTabChange={onProTabChange}
							tabProps={{ size: 'small'}}
						>
							{
								activeTabPro === 'mine' &&
                  <div style={{height: tabHeight, overflow: "scroll"}}>
                      <List
                          itemLayout="horizontal"
                          size="small"
                          split={false}
                          dataSource={authorisedIds}
                          renderItem={(item, index) => (
					                  <List.Item
						                  key={index}
						                  className={styles.small_list_item}
						                  defaultValue={item.value}
					                  >
						                  <Row align={"middle"} style={{width: "100%"}}>
							                  <Col span={16}><h4>{item.label}</h4></Col>
							                  {/*<Col span={10}><h5>{item.subjects.join(',')}</h5></Col>*/}
							                  <Col span={6}>
								                  <AndroidOutlined style={{marginRight:10,fontSize:18}} onClick={()=> {
																		confirm({
																			icon: <ExclamationCircleFilled />,
																			content: t('startTalkWithPro'),
																			okText: t('confirm'),
																			cancelText: t('cancel'),
																			onOk() {
																				handleAutoChat(item.value)
																			}
																		})
																	}}/>
								                  {
									                  stopped ?
										                  <AudioOutlined style={{marginRight:10,fontSize:18}}  onClick={()=>{
											                  confirm({
												                  icon: <ExclamationCircleFilled />,
												                  content: t('startAskPro'),
												                  okText: t('confirm'),
												                  cancelText: t('cancel'),
												                  onOk() {
													                  setAccessAssitant(item.value)
													                  stop_record()
												                  }
											                  })
																			}}/>
										                  :
										                  <PauseOutlined style={{marginRight:10,fontSize:18}} onClick={() => stop_record()}/>
								                  }
								                  <UnorderedListOutlined style={{fontSize:18}} onClick={()=>{
									                  Modal.info({
										                  content: t('show_pro_messages'),
										                  onOk() {
											                  getProHistory(id, item.value)
											                  setHideMessages(false)
										                  },
									                  });
								                  }}/>
							                  </Col>
						                  </Row>
					                  </List.Item>
				                  )}
                      />
                  </div>
							}
							{
								activeTabPro === 'system' &&
                  <div style={{height: tabHeight, overflow: "scroll"}}>
                      <List
                          itemLayout="horizontal"
                          size="small"
                          split={false}
                          dataSource={hotPros}
                          renderItem={(item, index) => (
														<List.Item
															key={index}
															className={styles.small_list_item}
															defaultValue={item.id}
														>
															<Row align={"middle"} style={{width: "100%"}}>
																<Col span={9}><h4>{item.name}</h4></Col>
																<Col span={9}><h5 style={{overflow:"hidden"}}>{item.subjects.join(',').substring(0,18)}</h5></Col>
																<Col span={6}>
																	<AndroidOutlined style={{marginLeft:10,fontSize:18}} onClick={()=>{
																		confirm({
																			icon: <ExclamationCircleFilled />,
																			content: t('startTalkWithPro'),
																			okText: t('confirm'),
																			cancelText: t('cancel'),
																			onOk() {
																				handleAutoChat(item.id)
																			}
																		})
																	}}/>
																	{
																		stopped ?
																			<AudioOutlined style={{marginLeft:10,fontSize:18}}  onClick={()=> {
																				confirm({
																					icon: <ExclamationCircleFilled />,
																					content: t('startAskPro'),
																					okText: t('confirm'),
																					cancelText: t('cancel'),
																					onOk() {
																						setAccessAssitant(item.id)
																						stop_record()
																					}
																				})
																			}}/>
																			:
																			<PauseOutlined style={{marginLeft:10,fontSize:18}} onClick={
																				() => stop_record()
																			}/>
																	}
																	<UnorderedListOutlined style={{marginLeft:10,fontSize:18}} onClick={()=>{
																		Modal.info({
																			content: t('show_pro_messages'),
																			onOk() {
																				getProHistory(id, item.id)
																				setHideMessages(false)
																			},
																		});
																	}}/>
																</Col>
															</Row>
														</List.Item>
													)}
                      />
                  </div>
							}
						</Card>
						<div>
							<Row align={"middle"} justify={"space-between"}>
								<Col span={24}>
									<TextArea placeholder={t('command')} value={question} rows={1}/>
								</Col>
								<TextArea placeholder={"回复"} style={{marginTop: 10}} value={answer} rows={13}/>
							</Row>
						</div>
					</div>
					<div hidden={hideMessages} style={{overflow: "scroll", height: 700, padding: 15}}>
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
										<Col span={24} style={{textAlign: "end"}}>
											<h5>{item.answer} : {item.receiver.split('(')[0]}</h5>
										</Col>
									</Row>
								</List.Item>
							)}
						/>
					</div>
					<SubscriptionsComponent mobile={true} id={id} onClose={() => setOpenSub(false)} visible={openSub}
					                        onShowProgress={onShowProgress}/>
				</div>
			</div>
	);
};

export default AIInstructMobileComponent;
