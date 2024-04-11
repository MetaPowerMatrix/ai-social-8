import React, {useEffect, useState} from "react";
import {Button, Col, Image, Modal, GetProp, Input, Row, Upload, UploadFile, UploadProps} from "antd";
import styles from "./TravelTownComponent.module.css";
import {
	AudioOutlined, CheckOutlined, ExclamationCircleFilled,
	PauseOutlined,
	UploadOutlined
} from "@ant-design/icons";
import {api_url, getApiServer, Streaming_Server} from "@/common";
import {WebSocketManager} from "@/lib/WebsocketManager";
import {useTranslations} from "next-intl";
import {getOS} from "@/lib/utils";
import utilStyles from "@/styles/utils.module.css";

const TravelTownComponent = ({activeId, onShowProgress}:{activeId:string, onShowProgress: (s: boolean)=>void}) => {
	const [stopped, setStopped] = useState<boolean>(true);
	const [recorder, setRecorder] = useState<MediaRecorder>();
	const [wsSocketRecorder, setWsSocketRecorder] = useState<WebSocketManager>();
	const [description, setDescription] = useState('');
	const [fileList, setFileList] = useState<UploadFile[]>([]);
	const [isUploadRecord, setIsUploadRecord] = useState(true);
	const [uploaded, setUploaded] = useState<boolean>(false)
	const [scene, setScene] = useState<string>("/images/notlogin.png")
	const [sample, setSample] = useState<string>("/images/notlogin.png")
	const [confirmed, setConfirmed] = useState<boolean>(false)
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

	const process_recorder_message = (event: any) => {
		console.log(event.data.toString())
		if (event.data.toString() !== 'pong') {
			setDescription(event.data.toString())
			handleGenerateScene(event.data.toString())
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
		const socketRecorder = new WebSocketManager(Streaming_Server + "/up", process_recorder_message);

		setWsSocketRecorder(socketRecorder)
		setRecorder(mediaRecorder)

		mediaRecorder.ondataavailable = (event) => {
			console.log(event)
			if (event.data.size > 0) {
				chunks.push(event.data);
				// socket.send(event.data);
			}
		};
		mediaRecorder.onstop = () => {
			socketRecorder.send(new Blob(chunks, { 'type' : 'audio/webm' }));
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
	const handleGenerateScene= (description: string) => {
		const formData = new FormData();
		if (fileList.length > 0){
			formData.append('file', fileList[0] as FileType);
		}
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
					if (images.length > 1 && images[1] !== ''){
						setSample(images[1])
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
	const decriptionInput = (event: React.ChangeEvent<HTMLInputElement>) => {
		event.preventDefault();
		setDescription(event.target.value)
	}

	return (
		<div className={styles.travel_town_mobile_container}>
			<div className={styles.travel_town_mobile_content}>
				<Row align={"middle"} style={{marginTop: 20, marginBottom:20,padding:10}}>
					<Col span={2}>
						{
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
											}
										})
									}
								}}/>
								:
								<PauseOutlined style={{color: "black", fontSize: 18}} onClick={() => stop_record()}/>
						}
					</Col>
					<Col span={3}>
						<>
							<Button icon={uploaded ? <CheckOutlined /> : <UploadOutlined/>} onClick={(e)=>{
								Modal.info({
									content: t('uploadKnowledge'),
									onOk(){
										document.getElementById('upload-input')?.click();
									}
								})
							}}></Button>
							<Upload id="upload-input" maxCount={1} showUploadList={false} {...props}>
								<Button style={{display: "none"}}  icon={<UploadOutlined/>}></Button>
							</Upload>
						</>
					</Col>
					<Col span={19}>
						<Input value={description} onChange={decriptionInput}/>
					</Col>
				</Row>
				<div>
					<Image
						src={scene}
						height={500}
						alt="scene"
					/>
					<div style={{position: "fixed", top: 150, left: 0, zIndex: 2, border:"1px solid red"}}>
						<img
							height={72}
							width={72}
							src={sample}
							alt="sample"
						/>
					</div>
				</div>
			</div>
		</div>
	)
}

export default TravelTownComponent;
