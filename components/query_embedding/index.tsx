import React, {useEffect, useState} from "react";
import {Button, Col, Divider, Input, List, Row} from "antd";
import styles from "./QueryEmbeddingComponent.module.css";
import {
	AudioOutlined,
	LeftOutlined,
	PauseOutlined, RightOutlined, ShareAltOutlined
} from "@ant-design/icons";
import TextArea from "antd/es/input/TextArea";
import {Streaming_Server} from "@/common";
import {WebSocketManager} from "@/lib/WebsocketManager";
import {useTranslations} from "next-intl";
import commandDataContainer from "@/container/command";
import {getOS} from "@/lib/utils";

const QueryEmbeddingComponent = ({activeId, visible, onShowProgress, onClose}:{activeId:string, visible: boolean, onShowProgress: (s: boolean)=>void, onClose:()=>void}) => {
	const [query, setQuery] = useState<string>("");
	const [queryResult, setQueryResult] = useState<string>("");
	const [stopped, setStopped] = useState<boolean>(true);
	const [recorder, setRecorder] = useState<MediaRecorder>();
	const [wsSocket, setWsSocket] = useState<WebSocketManager>();
	const [knowledges, setKnowledges] = useState<{ label: string, value: string }[]>([]);
	const command = commandDataContainer.useContainer()
	const [currentSig, setCurrentSig] = useState<string>("");
	const [selectedIndex, setSelectedIndex] = useState<number | undefined>(undefined);
	const t = useTranslations('AIInstruct');

	useEffect(() => {
			initAudioStream().then(()=>{})
	}, [])

	useEffect(() =>{
		command.query_knowledges(activeId).then((res) => {
			let kList: { label: string; value: string; }[] = []
			res?.forEach((item) => {
				let k = item.split('#')
				if (k.length > 1){
					kList.push({label: k[0], value: k[1]})
				}
			})
			setKnowledges(kList)
		})
	}, [activeId, visible])

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

	const shareKnowledge = (sig: string, title:string) => {
		command.share_knowledge(activeId, sig, title).then(() => {
			alert("分享成功")
		})
	}
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
		if (sig !== ""){
			command.query_embedding(activeId, sig, q).then((res) => {
				console.log(res)
				if (res !== undefined){
					setQueryResult(res)
				}
			})
		}
	}
	return (
		<div hidden={!visible} className={styles.summary_container_mobile}>
			<div className={styles.summary_content_mobile}>
				<>
					<Row style={{padding: 10}}>
						<LeftOutlined style={{fontSize: 20}} onClick={() => onClose()}/>
					</Row>
				</>
				<List
					style={{height: 120, overflow: "scroll"}}
					itemLayout="horizontal"
					size="small"
					dataSource={knowledges}
					renderItem={(item, index) => (
						<List.Item
							key={index}
							className={selectedIndex != undefined && selectedIndex === index ? styles.list_item : ''}
							defaultValue={item.value}
							onClick={(e) => {
								setSelectedIndex(index)
								setCurrentSig(item.value)
							}}
						>
							<Row align={"middle"} style={{width: "100%"}}>
								<Col span={22}><h5>{item.label}</h5></Col>
								<Col onClick={() => shareKnowledge(item.value, item.label)} span={2}
								     style={{textAlign: "end"}}><ShareAltOutlined/></Col>
							</Row>
						</List.Item>
					)}
				/>
				<h5>**从知识库选择需要询问的内容**</h5>
				<Row align={"middle"}>
					<Col span={2}>
						{
							stopped ?
								<AudioOutlined style={{color: "black", fontSize: 20}} onClick={() => stop_record()}/>
								:
								<PauseOutlined style={{color: "black", fontSize: 20}} onClick={() => stop_record()}/>
						}
					</Col>
					<Col span={18}>
						<Input placeholder={"文章中的基金是什么意思"} value={query}/>
					</Col>
					<Col span={3}>
						<Button type={"primary"} style={{marginLeft: 5}}
						        onClick={() => handleQueryEmbeddings(currentSig, query)}>发送</Button>
					</Col>
				</Row>
				<Row>
					<h5>专家回复:</h5>
					<TextArea placeholder={"文中的基金是指xx基建基金"} value={queryResult} rows={12}/>
				</Row>
			</div>
		</div>
	)
}

export default QueryEmbeddingComponent;
