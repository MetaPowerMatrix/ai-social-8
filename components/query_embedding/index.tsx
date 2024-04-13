import React, {useEffect, useState} from "react";
import {Button, Col, Divider, Input, List, Modal, Row} from "antd";
import styles from "./QueryEmbeddingComponent.module.css";
import {
	AudioFilled,
	AudioOutlined, CloseCircleOutlined, CloseOutlined, ExclamationCircleFilled,
	PauseOutlined, PlusOutlined, RightOutlined, ShareAltOutlined
} from "@ant-design/icons";
import TextArea from "antd/es/input/TextArea";
import {Streaming_Server} from "@/common";
import {WebSocketManager} from "@/lib/WebsocketManager";
import {useTranslations} from "next-intl";
import commandDataContainer from "@/container/command";
import {getOS} from "@/lib/utils";

const QueryEmbeddingComponent = ({activeId, visible, bookname, bookSig, onClose, onShowProgress}:{activeId:string, visible:boolean, bookname:string, bookSig:string, onClose: ()=>void, onShowProgress: (s: boolean)=>void}) => {
	const [query, setQuery] = useState<string>("");
	const [queryResult, setQueryResult] = useState<string>("");
	const [stopped, setStopped] = useState<boolean>(true);
	const [recorder, setRecorder] = useState<MediaRecorder>();
	const [wsSocket, setWsSocket] = useState<WebSocketManager>();
	const command = commandDataContainer.useContainer()
	const t = useTranslations('AIInstruct');
	const {confirm} = Modal;

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
		if (event.data.toString() !== 'pong') {
			setQuery(event.data.toString())
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
	const handleQueryEmbeddings = (sig: string, q: string) => {
		command.query_embedding(activeId, sig, q).then((res) => {
			console.log(res)
			if (res !== undefined){
				setQueryResult(res)
			}
		})
	}
	const inputQuestion = (event: React.ChangeEvent<HTMLInputElement>) =>{
		setQuery(event.target.value)
	}
	return (
		<div hidden={!visible} className={styles.summary_container_mobile}>
			<div className={styles.summary_content_mobile}>
				<CloseOutlined onClick={()=>onClose()} style={{fontSize: 18}}/>
				<div style={{textAlign:"center",marginBottom:5}}>{bookname}</div>
				<Row>
					<Col span={24}>
						<Input onChange={inputQuestion} placeholder={"文章中的基金是什么意思"} value={query}/>
					</Col>
				</Row>
				<Row>
					<TextArea style={{marginTop: 10}} placeholder={"文中的基金是指xx基建基金"} value={queryResult} rows={14}/>
				</Row>
				<Row align={"middle"} style={{marginTop:10}}>
					<Col span={8}></Col>
					<Col span={4}>
						{
							stopped ?
								<AudioFilled style={{color: "black", fontSize: 22}} onClick={() => {
									confirm({
										icon: <ExclamationCircleFilled/>,
										content: t('startAsk'),
										okText: t('confirm'),
										cancelText: t('cancel'),
										onOk() {
											stop_record()
										}
									})
								}}/>
								:
								<PauseOutlined style={{color: "black", fontSize: 22}} onClick={() => stop_record()}/>
						}
					</Col>
					<Col span={4}>
						<Button type={"primary"} style={{marginLeft: 0}}
						        onClick={() => handleQueryEmbeddings(bookSig, query)}>{t('ask')}</Button>
					</Col>
				</Row>
			</div>
		</div>
	)
}

export default QueryEmbeddingComponent;
