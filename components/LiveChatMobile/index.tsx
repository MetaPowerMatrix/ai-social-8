import React, {useEffect, useState} from 'react';
import styles from "@/components/LiveChatMobile/LiveChatMobileComponent.module.css";
import {
	Button,
	Col,
	Divider,
	FloatButton,
	Form,
	GetProp,
	Input,
	List,
	Row, Timeline, TimelineProps,
	Upload,
	UploadFile,
	UploadProps
} from "antd";
import {useTranslations} from "next-intl";
import {
	AudioOutlined,
	CloseOutlined,
	EuroOutlined,
	FormOutlined,
	LoginOutlined,
	LogoutOutlined,
	MenuOutlined,
	PauseOutlined, PlusOutlined, PoweroffOutlined,
	QrcodeOutlined,
	SettingOutlined,
	TikTokOutlined,
	UploadOutlined,
	UserOutlined
} from "@ant-design/icons";
import {api_url, getApiServer, getMQTTBroker, LiveOpenResponse} from "@/common";
import Image from "next/image";
import commandDataContainer from "@/container/command";
import {WebSocketManager} from "@/lib/WebsocketManager";
import { v4 as uuidv4 } from 'uuid';
import {SequentialAudioPlayer} from "@/lib/SequentialAudioPlayer";
import mqtt from "mqtt";
import {TimeLineItemProps} from "antd/lib/timeline/TimelineItem";

interface LiveChatPros {
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

const LiveChatMobileComponent: React.FC<LiveChatPros>  = ({visible, serverUrl, id, onClose, onShowProgress}) => {
	const [form] = Form.useForm();
	const t = useTranslations('LiveChat');
	const [recorder, setRecorder] = useState<MediaRecorder>();
	const [wsSocket, setWsSocket] = useState<WebSocketManager>();
	const [fileList, setFileList] = useState<UploadFile[]>([]);
	const [hideSettings, setHideSettings] = useState<boolean>(true);
	const [stopped, setStopped] = useState<boolean>(true);
	const [lyrics, setLyrics] = useState<TimeLineItemProps[]>([]);
	const [roleOnePortrait, setRoleOnePortrait] = useState<string>("/images/placeholder2.png");
	const [roleTwoPortrait, setRoleTwoPortrait] = useState<string>("/images/placeholder2.png");
	const [roleOne, setRoleOne] = useState<string>("");
	const [roleTwo, setRoleTwo] = useState<string>("");
	const [session, setSession] = useState<string>(uuidv4());
	const [voiceUrls, setVoiceUrls] = useState<string[]>([]);
	const [startPlay, setStartPlay] = useState<boolean>(false);
	const [client, setClient] = useState<mqtt.MqttClient | null>(null);
	const [player, setPlayer] = useState<SequentialAudioPlayer | undefined>(undefined);
	const [open, setOpen] = useState(true);
	const command = commandDataContainer.useContainer()

	useEffect(() => {
		// if (stopped){
			console.log("init player")
			setPlayer(new SequentialAudioPlayer(voiceUrls, window));
	// 	}
	// }, [stopped]);
	// useEffect(() => {
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
		console.log("init player: ", player)
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
			alert(t('restore'))
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
	const hide_settings = () => {
		if (hideSettings){
			setHideSettings(false)
		}else{
			setHideSettings(true)
		}
	}

	// useEffect(() => {
	// 	// Create a new WebSocket connection to the Rust server
	// 	const ws = new WebSocket(serverUrl);
	// 	ws.onmessage = (event) => {
	// 		// Received an audio frame from the server
	// 		const audioFrame = event.data;
	// 		console.log('Received audio frame:', audioFrame);
	//
	// 		// Here you would process and play the audio data
	// 		// Actual implementation depends on the audio data format and application requirements
	// 	};
	//
	// 	ws.onerror = (error) => {
	// 		console.error('WebSocket Error:', error);
	// 	};
	//
	// 	// Clean up the WebSocket connection when the component unmounts
	// 	return () => {
	// 		ws.close();
	// 	};
	// }, [serverUrl]);

	type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];
	const handleSubmit = (values: any) => {
		console.log(values);
		onShowProgress(true);
		const formData = new FormData();
		formData.append('file', fileList[0] as FileType);
		formData.append('message', JSON.stringify({
			id: id,
			roles:[
				[values.role_1_id, values.role_1_dec],
				[values.role_2_id,values.role_2_dec]
			],
			topic: values.topic,
			session: session
		}));
		let url = getApiServer(80) + api_url.portal.interaction.live.open
		fetch(url, {
			method: 'POST',
			body: formData,
		})
			.then(response => response.json())
			.then(data => {
				if (data.code === "200") {
					let openInfo: LiveOpenResponse = JSON.parse(data.content)
					// setSession(openInfo.session)
					// form.setFieldsValue({session: openInfo.session})
					setRoleOne(values.role_1_id)
					setRoleTwo(values.role_2_id)
					setRoleOnePortrait(openInfo.role_1_portarit)
					// setRoleTwoPortrait(openInfo.role_2_portrait)
					initAudioStream().then(() => {});
					alert(t('started'));
					setHideSettings(true)
				}else{
					alert(t('start_fail'));
				}
				onShowProgress(false);
			})
			.catch((error) => {
				console.error('Error:', error);
				alert(t('start_fail'));
				onShowProgress(false);
			});
	};

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
	const onChange = () => {
		setOpen(!open);
	};

	return (
		<div hidden={!visible}>
			<div className={styles.live_chat_container}>
				<div className={styles.live_chat_content}>
					<div  hidden={!hideSettings}>
						<FloatButton.Group open={open} trigger="click" style={{right: 15, bottom: 280}} onClick={onChange}
						                   icon={<MenuOutlined/>}>
							<FloatButton onClick={() => {
								close_clean()
							}} icon={<PoweroffOutlined/>}/>
							<FloatButton onClick={() => {
								hide_settings()
							}} icon={<FormOutlined/>}/>
							<FloatButton onClick={() => {
								stop_record()
							}} icon={stopped ? <AudioOutlined/> : <PauseOutlined/>}/>
							<FloatButton onClick={() => {
								end_session()
							}} icon={<LogoutOutlined/>}/>
							<FloatButton onClick={() => {
								reload_session()
							}} icon={<LoginOutlined/>}/>
						</FloatButton.Group>
						<Row align={"middle"} justify={"space-between"}>
							<Col span={24} style={{textAlign: "center", height: 660}}>
								<Image src={roleOnePortrait} fill={true} alt={"role1"}/>
							</Col>
						</Row>
						<Row className={styles.live_chat_message}>
							<Col span={24} style={{height: 200, color: "white", overflow:"scroll"}}>
								<Timeline
									pending="..."
									reverse={true}
									items={lyrics}
								/>
							</Col>
						</Row>
					</div>

					<div hidden={hideSettings} className={styles.live_chat_settings}>
						<Row>
							<Col span={20}>
								<Form form={form} variant="filled" onFinish={handleSubmit}>
									<Form.Item label={t("topic")} name="topic" rules={[{required: true, message: t('must')}]}>
										<Input/>
									</Form.Item>
									<Form.Item label={t("role1")} name="role_1_id" rules={[{required: true, message: t('must')}]}>
										<Input onChange={(event) => {
											let id = event.target.value
											setRoleOne(id)
										}}/>
									</Form.Item>
									<Form.Item label={t("role1_portrait")} name="role_1_dec"
									           rules={[{required: true, message: t('must')}]}>
										<Input/>
									</Form.Item>
									<Form.Item label={t("role2")} name="role_2_id" rules={[{required: true, message: t('must')}]}>
										<Input onChange={(event) => {
											let id = event.target.value
											setRoleTwo(id)
										}}/>
									</Form.Item>
									<Form.Item label={t("role2_portrait")} name="role_2_dec"
									           rules={[{required: true, message: t('must')}]}>
										<Input/>
									</Form.Item>
									<Form.Item label={t("context")} required>
										<Upload {...props}>
											<Button icon={<UploadOutlined/>}>{t('Upload')}</Button>
										</Upload>
									</Form.Item>
									<Form.Item>
										<Button type="primary" htmlType="submit">
											{t("confirm")}
										</Button>
										<Divider type={"vertical"}/>
										<Button onClick={() => setHideSettings(true)}>{t("close")}</Button>
									</Form.Item>
								</Form>
							</Col>
						</Row>
					</div>
				</div>
			</div>
		</div>

	);
};

export default LiveChatMobileComponent;
