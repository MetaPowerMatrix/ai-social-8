import React, {useEffect, useState} from "react";
import {Button, Col, Image, Modal, GetProp, Input, Row, Upload, UploadFile, UploadProps, FloatButton} from "antd";
import styles from "./TravelTownComponent.module.css";
import {
	AudioOutlined, CheckOutlined, ExclamationCircleFilled, FileImageOutlined, MenuOutlined, MessageOutlined,
	PauseOutlined, QrcodeOutlined, SettingOutlined, TikTokOutlined,
	UploadOutlined, UserOutlined
} from "@ant-design/icons";
import {api_url, getApiServer, Streaming_Server} from "@/common";
import {WebSocketManager} from "@/lib/WebsocketManager";
import {useTranslations} from "next-intl";
import {getOS} from "@/lib/utils";

const TravelTownComponent = ({activeId, onShowProgress}:{activeId:string, onShowProgress: (s: boolean)=>void}) => {
	const [stopped, setStopped] = useState<boolean>(true);
	const [recorder, setRecorder] = useState<MediaRecorder>();
	const [wsSocket, setWsSocket] = useState<WebSocketManager>();
	const [description, setDescription] = useState('');
	const [fileList, setFileList] = useState<UploadFile[]>([]);
	const [uploaded, setUploaded] = useState<boolean>(false)
	const [scene, setScene] = useState<string>("/images/notlogin.png")
	const [confirmed, setConfirmed] = useState<boolean>(false)
	const [open, setOpen] = useState(true);
	const [sendDescription, setSendDescription] = useState<boolean>(true)
	const t = useTranslations('travel');
	const {confirm} = Modal;

	type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

	useEffect(() => {
		initAudioStream().then(()=>{})
		// return () => {
		// 		recorder.
		// };
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
		if (event.data.toString() !== 'pong') {
			setDescription(event.data.toString())
			if (sendDescription){
				handleGenerateScene(event.data.toString())
			}else{
				handleVoiceCommand(event.data.toString())
			}
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
	const handleVoiceCommand = (topic: string) => {
		const data = {id: activeId, message: topic, pro: activeId, image_url: scene};
		let url = getApiServer(80) + api_url.portal.town.image_chat
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
					let answer: string[] = JSON.parse(data.content)
					if (answer.length > 0){
						setDescription(answer[0])
					}
					if (answer.length > 1){
						playAudioWithWebAudioApi(answer[1]).then(r => {})
					}
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
	const handleGenerateScene= (description: string) => {
		const formData = new FormData();
		// if (fileList.length > 0){
		// 	formData.append('file', fileList[0] as FileType);
		// }
		formData.append('message', JSON.stringify({ id: activeId, description: description}));

		onShowProgress(true);
		let url = getApiServer(80) + api_url.portal.town.gen_scene
		fetch(url, {
			method: 'POST',
			body: formData,
		})
			.then(response => response.json())
			.then(data => {
				if (data.code === "200") {
					let images: string[] = JSON.parse(data.content)
					if (images.length > 0){
						setScene(images[0])
					}
				}else{
					Modal.warning({
						content: '场景生成失败.'
					})
				}
				onShowProgress(false);
			})
			.catch((error) => {
				console.error('Error:', error);
				Modal.warning({
					content: '场景生成失败.'
				})
				onShowProgress(false);
			});
	};
	const handleImageDescription= () => {
		const formData = new FormData();
		if (fileList.length > 0){
			formData.append('file', fileList[0] as FileType);
		}
		formData.append('message', JSON.stringify({ id: activeId, description: scene}));

		onShowProgress(true);
		let url = getApiServer(80) + api_url.portal.town.image_parse
		fetch(url, {
			method: 'POST',
			body: formData,
		})
			.then(response => response.json())
			.then(data => {
				if (data.code === "200") {
					let description: string = data.content.split(',')
					if (description.length > 0){
						setDescription(description[0])
					}
					if (description.length > 1){
						setScene(description[1])
					}
				}else{
					Modal.warning({
						content: '图片描述失败.'
					})
				}
				onShowProgress(false);
			})
			.catch((error) => {
				console.error('Error:', error);
				Modal.warning({
					content: '图片描述失败.'
				})
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
			setUploaded(true)
			return false;
		},
		fileList,
	};

	const onChange = () => {
		setOpen(!open);
	};

	return (
		<div className={styles.travel_town_mobile_container}>
			<div className={styles.travel_town_mobile_content}>
				<div className={styles.layer}>
					<FloatButton.Group open={open} trigger="click" style={{right: 10, bottom: 300}} onClick={onChange} icon={<MenuOutlined/>}>
						<FloatButton icon={
							stopped ?
								<AudioOutlined style={{color: "black", fontSize: 18}} onClick={() =>{
									if (confirmed){
										stop_record()
									}else{
										confirm({
											icon: <ExclamationCircleFilled />,
											content: t('startRecordingSceneDescription'),
											okText: t('confirm'),
											cancelText: t('cancel'),
											onOk() {
												stop_record()
												setConfirmed(true)
												setSendDescription(true)
											}
										})
									}
								}}/>
								:
								<PauseOutlined style={{color: "black", fontSize: 18}} onClick={() => stop_record()}/>
						}/>
						<FloatButton icon={
								<Upload id="upload-input" maxCount={1} showUploadList={true} {...props}>
									<Button icon={uploaded ? <CheckOutlined /> : <UploadOutlined/>}></Button>
								</Upload>
						}/>
						<FloatButton icon={
							<FileImageOutlined style={{color: "black", fontSize: 18}} onClick={() => handleImageDescription()}/>
						}/>
						<FloatButton icon={
							<MessageOutlined style={{color: "black", fontSize: 18}} onClick={() =>{
								stop_record()
								setSendDescription(false)
							}}/>
						}/>
					</FloatButton.Group>
					<Row>
						<Col span={24}>
							<h5 style={{color:"black"}}>{description}</h5>
							{/*<TextArea value= rows={3} onChange={decriptionInput}/>*/}
						</Col>
					</Row>
				</div>
				<div>
					<Image
						src={scene}
						height={570}
						alt="scene"
					/>
				</div>
			</div>
		</div>
	)
}

export default TravelTownComponent;
