import React, {useEffect, useState} from 'react';
import styles from "@/components/LiveChat/LiveChatComponent.module.css";
import {Button, Col, Divider, Form, GetProp, Input, Row, Upload, UploadFile, UploadProps} from "antd";
import {useTranslations} from "next-intl";
import {
	AudioOutlined, CloseOutlined,
	FormOutlined, LoginOutlined, LogoutOutlined, PauseOutlined,
	UploadOutlined
} from "@ant-design/icons";
import {api_url, getApiServer, LiveOpenResponse} from "@/common";
import Image from "next/image";
import {subscribe_topic} from "@/lib/utils";
import commandDataContainer from "@/container/command";
import {WebSocketManager} from "@/lib/WebsocketManager";
import { v4 as uuidv4 } from 'uuid';
import {SequentialAudioPlayer} from "@/lib/SequentialAudioPlayer";

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

const LiveChatComponent: React.FC<LiveChatPros>  = ({visible, serverUrl, id, onClose, onShowProgress}) => {
	const [form] = Form.useForm();
	const t = useTranslations('LiveChat');
	const [recorder, setRecorder] = useState<MediaRecorder>();
	const [wsSocket, setWsSocket] = useState<WebSocketManager>();
	const [fileList, setFileList] = useState<UploadFile[]>([]);
	const [hideSettings, setHideSettings] = useState<boolean>(true);
	const [stopped, setStopped] = useState<boolean>(true);
	const [lyrics, setLyrics] = useState<string[]>(["字幕一","字幕二"]);
	const [roleOnePortrait, setRoleOnePortrait] = useState<string>("/images/two-boy.png");
	const [roleTwoPortrait, setRoleTwoPortrait] = useState<string>("/images/two-boy.png");
	const [roleOne, setRoleOne] = useState<string>("");
	const [roleTwo, setRoleTwo] = useState<string>("");
	const [session, setSession] = useState<string>(uuidv4());
	const [voiceUrls, setVoiceUrls] = useState<string[]>([]);
	const [startPlay, setStartPlay] = useState<boolean>(false);

	let player: SequentialAudioPlayer | undefined = undefined;
	useEffect(() => {
		console.log("init player")
		player = new SequentialAudioPlayer(voiceUrls, window);
	})

	const command = commandDataContainer.useContainer()

	// useEffect(() => {
	// 	if (visible){
	// 		initAudioStream().then(() => {});
	// 	}
	// }, [visible]);

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
			alert("结束直播成功")
		})
	}
	const reload_session = () => {
		command.restore_live_chat([roleOne, roleTwo], session).then((res) => {
			console.log(res)
			alert("恢复直播成功")
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
					newLyrics.shift()
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
					setSession(openInfo.session)
					form.setFieldsValue({session: openInfo.session})
					setRoleOne(values.role_1_id)
					setRoleTwo(values.role_2_id)
					setRoleOnePortrait(openInfo.role_1_portarit)
					setRoleTwoPortrait(openInfo.role_2_portrait)
					subscribe_topic(openInfo.session+"/text", (message: string) => {
						setLyrics((prev)=>{
							const newLyrics = [...prev]
							newLyrics.shift()
							newLyrics.push(message.toString())
							return newLyrics
						})
					})
					subscribe_topic(openInfo.session+"/voice", async (message: string) => {
						await player?.addUrl(message)
						setVoiceUrls((prevUrl) =>{
							const newUrls = [...prevUrl]
							newUrls.push(message)
							return newUrls
						})
					})
					initAudioStream().then(() => {});
					alert('进入直播成功');
					setHideSettings(true)
				}else{
					alert('进入直播失败');
				}
				onShowProgress(false);
			})
			.catch((error) => {
				console.error('Error:', error);
				alert('进入直播失败');
				onShowProgress(false);
			});
	};

	// async function playAudioWithWebAudioApi(url: string): Promise<void> {
	// 	try {
	// 		const audioContext = new (window.AudioContext || window.webkitAudioContext)();
	// 		const response = await fetch(url);
	// 		const arrayBuffer = await response.arrayBuffer();
	// 		const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
	//
	// 		const source = audioContext.createBufferSource();
	// 		source.buffer = audioBuffer;
	// 		source.connect(audioContext.destination);
	// 		source.start();
	//
	// 	} catch (error) {
	// 		console.error('Error playing audio with Web Audio API:', error);
	// 	}
	// }

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

	useEffect(() => {
		if (voiceUrls.length > 0 && !startPlay) {
			setTimeout(() => {
				console.log(player)
				let isStart = player?.play()
				console.log(voiceUrls)
				console.log("started: ", isStart)
				setStartPlay( isStart === undefined ? false : isStart)
			}, 1000);
			// setStartPlay(true)
		}
	},[voiceUrls])

	return (
		<div hidden={!visible}>
			<div className={styles.live_chat_container}>
				<div className={styles.live_chat_content}>
					<Row>
						<Col span={8}>
							<CloseOutlined style={{color: "white", fontSize: 20}} onClick={() => close_clean()}/>
							<Divider type={"vertical"}/>
							<FormOutlined style={{color: "white", fontSize: 20}} onClick={() => hide_settings()}/>
							<Divider type={"vertical"}/>
							{
								stopped?
									<AudioOutlined  style={{color: "white", fontSize: 20}} onClick={() => stop_record()}/>
									:
									<PauseOutlined style={{color: "white", fontSize: 20}} onClick={() => stop_record()}/>
							}
							<Divider type={"vertical"}/>
							<LogoutOutlined style={{color: "white", fontSize: 20}} onClick={()=>end_session()} />
							<Divider type={"vertical"}/>
							<LoginOutlined style={{color: "white", fontSize: 20}} onClick={()=>reload_session()}/>
						</Col>
					</Row>
					<Divider type={"horizontal"}/>
					<Row align={"middle"} justify={"space-between"}>
						<Col span={8} style={{textAlign: "center", height: 400}}>
							<Image src={roleOnePortrait} fill={true} alt={"role1"}/>
						</Col>
						<Col span={8} style={{textAlign: "center"}}>
							<AudioOutlined style={{color: "white", fontSize: 40}} spin={!stopped} />
						</Col>
						<Col span={8} style={{textAlign: "center", height: 400}}>
							<Image fill={true} src={roleTwoPortrait} alt={"role1"}/>
						</Col>
					</Row>
					<Divider type={"horizontal"}/>
					<Row>
						<Col span={24}
						     style={{color: "white", backgroundColor: "rgba(106, 120, 121,0.8)", textAlign: "center", height: 80}}>
							<h4>{lyrics[0]}</h4>
							<h4>{lyrics[1]}</h4>
						</Col>
					</Row>
				</div>
				<div hidden={true} className={styles.live_chat_message}>
						<Row><span>xxxxxxxxx</span></Row>
				</div>
				<div hidden={hideSettings} className={styles.live_chat_settings}>
					<Row>
						<Col span={20}>
							<Form form={form} variant="filled" onFinish={handleSubmit}>
								<Form.Item label={t("topic")} name="topic" rules={[{required: true, message: '必填项'}]}>
									<Input/>
								</Form.Item>
								<Form.Item label={t("role1")} name="role_1_id" rules={[{required: true, message: '必填项'}]}>
									<Input onChange={(event)=>{
										let id = event.target.value
										setRoleOne(id)
									}}/>
								</Form.Item>
								<Form.Item label={t("role1_portrait")} name="role_1_dec" rules={[{required: true, message: '必填项'}]}>
									<Input/>
								</Form.Item>
								<Form.Item label={t("role2")} name="role_2_id" rules={[{required: true, message: '必填项'}]}>
									<Input onChange={(event)=>{
										let id = event.target.value
										setRoleTwo(id)
									}}/>
								</Form.Item>
								<Form.Item label={t("role2_portrait")} name="role_2_dec" rules={[{required: true, message: '必填项'}]}>
									<Input/>
								</Form.Item>
								<Form.Item hidden={true} name="session">
									<Input onChange={(event)=>{
										let value = event.target.value
										setSession(value)
									}}/>
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
								</Form.Item>
							</Form>
						</Col>
					</Row>
				</div>
			</div>
		</div>

	);
};

export default LiveChatComponent;
