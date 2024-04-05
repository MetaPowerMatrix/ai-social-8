import React, {useEffect, useState} from "react";
import {Button, Col, Divider, GetProp, Input, Row, Upload, UploadFile, UploadProps} from "antd";
import styles from "./SummaryComponent.module.css";
import {
	AudioOutlined,
	LeftOutlined,
	PauseOutlined,
	UploadOutlined
} from "@ant-design/icons";
import TextArea from "antd/es/input/TextArea";
import {api_url, getApiServer, Streaming_Server} from "@/common";
import {WebSocketManager} from "@/lib/WebsocketManager";
import {useTranslations} from "next-intl";
import commandDataContainer from "@/container/command";
import SharedKnowledges from "@/components/SharedKnowledges";

const SummaryComponent = ({activeId, visible, onShowProgress, onClose}:{activeId:string, visible: boolean, onShowProgress: (s: boolean)=>void, onClose:()=>void}) => {
	const [transcriptFile, setTranscriptFile] = useState<string>("");
	const [stopped, setStopped] = useState<boolean>(true);
	const [recorder, setRecorder] = useState<MediaRecorder>();
	const [wsSocketRecorder, setWsSocketRecorder] = useState<WebSocketManager>();
	const [knowledge, setKnowledge] = useState('');
	const [fileList, setFileList] = useState<UploadFile[]>([]);
	const [summarys, setSummarys] = useState<string[]>([]);
	const [isUploadRecord, setIsUploadRecord] = useState(true);
	const [sigs, setSig] = useState<string[]>([]);
	const [showShared, setShowShared] = useState<boolean>(false)
	const command = commandDataContainer.useContainer()
	const t = useTranslations('AIInstruct');

	type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

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

	const process_recorder_message = (event: any) => {
		console.log(event.data.toString())
		setTranscriptFile(event.data.toString())
	}

	let chunks: BlobPart[] = [];
	const handleAudioStream = (stream: MediaStream) => {
		const options = {mimeType: 'audio/webm;codecs=pcm'};
		const mediaRecorder = new MediaRecorder(stream, options);
		const socketRecorder = new WebSocketManager(Streaming_Server + "/up2", process_recorder_message);

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
			if (isUploadRecord){
				socketRecorder.send(new Blob(chunks, { 'type' : 'audio/webm' }));
			}else{
				// socket.send(new Blob(chunks, { 'type' : 'audio/webm' }));
			}
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
	const handleKnowledge= (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
		event.preventDefault(); // Prevent the default form submission
		const formData = new FormData();
		if (fileList.length > 0){
			formData.append('file', fileList[0] as FileType);
		}
		formData.append('message', JSON.stringify({ id: activeId, link: knowledge, transcript: transcriptFile}));

		onShowProgress(true);
		let url = getApiServer(80) + api_url.portal.task.knowledge_embedding
		fetch(url, {
			method: 'POST',
			body: formData,
		})
			.then(response => response.json())
			.then(data => {
				if (data.code === "200") {
					let sigs: string[] = JSON.parse(data.content)
					sigs = sigs.filter((sig) => {return sig !== ''})
					alert('文档上传成功，等待学习结果!');
					setSig(sigs)
					console.log(sigs)
					handleQuerySummary(sigs)
				}else{
					alert('文档上传失败.');
				}
				onShowProgress(false);
			})
			.catch((error) => {
				console.error('Error:', error);
				alert('文档上传失败');
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
	const knowledgeInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		event.preventDefault();
		setKnowledge(event.target.value)
	}

	const handleQuerySummary = (query_sigs: string[]) => {
		let newSummarys: string[] = []
		query_sigs.forEach((sig) => {
			command.query_summary(activeId, sig).then((res) => {
				console.log(res)
				if (res !== undefined){
					newSummarys.push(res)
					setSummarys((prev) => {
						prev = [...newSummarys]
						return prev
					})
					console.log(summarys)
				}
			})
		})
	}
	return (
		<div hidden={!visible} className={styles.summary_container_mobile}>
			<div className={styles.summary_content_mobile}>
				<>
					<Row style={{padding: 10}}>
						<LeftOutlined style={{fontSize: 20}} onClick={() => onClose()}/>
					</Row>
				</>
				<Row>
					<Col span={20}>
						<h5>要阅读文章的在线链接</h5>
						<TextArea placeholder={"https://zh.wikipedia.org/wiki/Web3"} value={knowledge} rows={1} onChange={knowledgeInput}/>
					</Col>
				</Row>
				<Row justify="space-between">
					<Col span={12}>
						<h5>上传准备阅读的文章</h5>
						<Upload {...props}>
							<Button icon={<UploadOutlined/>}>{t('Upload')}</Button>
						</Upload>
					</Col>
					<Col span={12}>
						<h5>选取社区热门文章</h5>
						<Button onClick={()=>setShowShared(true)}>社区知识</Button>
					</Col>
				</Row>
				<Row align={"middle"} justify={"space-between"}>
					<h5>录制学习内容</h5>
					<Col span={24}>
						{
							stopped ?
								<AudioOutlined style={{color: "black", fontSize: 20}} onClick={() => stop_record()}/>
								:
								<PauseOutlined style={{color: "black", fontSize: 20}} onClick={() => stop_record()}/>
						}
					</Col>
				</Row>
				<Row>
					<Col span={24}>
						<Button type={"primary"} style={{width:"100%", marginTop:15}} onClick={(e) => handleKnowledge(e)}>{t('do_summary')}</Button>
					</Col>
				</Row>
				<Divider/>
				<Row>
					<h5>学到的知识</h5>
						<TextArea placeholder={"学习成果"} value={summarys.join('\n')} rows={8}/>
				</Row>
			</div>
			<SharedKnowledges visible={showShared} canSelect={true} onSelectName={()=>{}} onClose={()=>setShowShared(false)}/>
		</div>
	)
}

export default SummaryComponent;
