import React, {useEffect, useState} from 'react';
import styles from "@/components/AIInstruct/AIInstructComponent.module.css";
import {Col, Divider, Form, GetProp, Row, Upload, UploadFile, UploadProps} from "antd";
import {useTranslations} from "next-intl";
import {
	AudioOutlined, CloseOutlined,
	PauseOutlined
} from "@ant-design/icons";
import {api_url, getApiServer, LiveOpenResponse} from "@/common";
import Image from "next/image";
import {subscribe_topic} from "@/lib/utils";
import commandDataContainer from "@/container/command";
import {WebSocketManager} from "@/lib/WebsocketManager";
import TextArea from "antd/es/input/TextArea";

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

const AIInstructComponent: React.FC<AIInstructPros>  = ({visible, serverUrl, id, onClose, onShowProgress}) => {
	const t = useTranslations('LiveChat');
	const [recorder, setRecorder] = useState<MediaRecorder>();
	const [wsSocket, setWsSocket] = useState<WebSocketManager>();
	const [fileList, setFileList] = useState<UploadFile[]>([]);
	const [stopped, setStopped] = useState<boolean>(true);
	const [roleOnePortrait, setRoleOnePortrait] = useState<string>("/images/two-boy.png");
	const [answer, setAnswer] = useState<string>("");
	const [question, setQuestion] = useState<string>("");
	const command = commandDataContainer.useContainer()

	useEffect(() => {
		if (visible){
			initAudioStream().then(() => {});
		}
	}, [visible]);

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
		setQuestion(event.data.toString)
		handleVoiceCommand({topic: event.data.toString})
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
					let answer = data.content
					// setRoleOnePortrait(openInfo.role_1_portarit)
					subscribe_topic(id+"/instruct", (message: string) => {
						setAnswer(message)
					})
					subscribe_topic(id+"/instruct/voice", async (message: string) => {
						playAudioWithWebAudioApi(message)
					})
					alert('等待助手执行任务');
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

	return (
		<div hidden={!visible}>
			<div className={styles.voice_instruct_container}>
				<div className={styles.voice_instruct_content}>
					<Row>
						<Col span={8}>
							<CloseOutlined style={{color: "black", fontSize: 20}} onClick={() => close_clean()}/>
							<Divider type={"vertical"}/>
							{
								stopped?
									<AudioOutlined  style={{color: "black", fontSize: 20}} onClick={() => stop_record()}/>
									:
									<PauseOutlined style={{color: "black", fontSize: 20}} onClick={() => stop_record()}/>
							}
						</Col>
					</Row>
					<Row align={"middle"} justify={"space-between"}  style={{marginTop:20}}>
						<Col span={24}>
							<TextArea placeholder={"你的指令"}  value={question} rows={1}/>
						</Col>
					</Row>
					<Row align={"middle"} justify={"space-between"} style={{marginTop:20}}>
						<Col span={8} style={{textAlign: "center", height: 400}}>
							<Image src={roleOnePortrait} fill={true} alt={"role1"}/>
						</Col>
						<Col span={14} style={{textAlign: "center", height: 400}}>
							<TextArea placeholder={"任务结果"}  value={answer} rows={17}/>
						</Col>
					</Row>
				</div>
			</div>
		</div>

	);
};

export default AIInstructComponent;
