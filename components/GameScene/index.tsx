import React, {useEffect, useRef, useState} from "react";
import {Button, Col, Image, Modal, GetProp, Row, UploadFile, UploadProps, Spin} from "antd";
import styles from "./GameSceneComponent.module.css";
import {
	ArrowLeftOutlined, ArrowRightOutlined,
	AudioOutlined,
	CloseOutlined,
	ExclamationCircleFilled, FileImageOutlined, KeyOutlined,
	PauseOutlined,
} from "@ant-design/icons";
import {api_url, getApiServer, PortalRoomInfo, Streaming_Server} from "@/common";
import {WebSocketManager} from "@/lib/WebsocketManager";
import {useTranslations} from "next-intl";
import {getOS} from "@/lib/utils";
import commandDataContainer from "@/container/command";
import InteractivePanorama from "@/components/InteractivePanoramic";

// const EditAnswerInfo = ({owner,room_id,level, visible,onClose}: {visible:boolean, owner:string, room_id:string, level: number, onClose:()=>void}) => {
// 	const [answer, setAnswer] = useState<string>('')
// 	const t = useTranslations('travel');
//
// 	const onChangeAnswer = (event: React.ChangeEvent<HTMLTextAreaElement>) =>{
// 		setAnswer(event.target.value)
// 	}
// 	return (
// 		<div hidden={!visible} className={styles.level_answer_container}>
// 			<div className={styles.level_answer_content}>
// 				<CloseOutlined onClick={() => onClose()} style={{fontSize: 18, marginBottom:20}}/>
// 				<Row>
// 					<TextArea onChange={onChangeAnswer} style={{marginTop: 10}} placeholder={"房间描述"} value={answer} rows={4}/>
// 				</Row>
// 				<Row align={"middle"} style={{marginTop: 10}}>
// 					<Col span={8}></Col>
// 					<Col span={4}>
// 						<Button type={"primary"} style={{marginLeft: 0}} onClick={() => {}}>
// 							{t('create_room')}
// 						</Button>
// 					</Col>
// 				</Row>
// 			</div>
// 		</div>
// 	)
// }

const GameSceneComponent = ({visible,activeId,roomId, roomName, onShowProgress, owner, cover, onClose}:
    {visible:boolean,activeId:string,roomName:string, roomId:string, owner:string, cover:string, onShowProgress: (s: boolean)=>void,onClose: ()=>void}) => {
	const [stopped, setStopped] = useState<boolean>(true);
	const [recorder, setRecorder] = useState<MediaRecorder>();
	const [wsSocket, setWsSocket] = useState<WebSocketManager>();
	const [clueCounter, setClueCounter] = useState<number>(0)
	const [scene, setScene] = useState<string>('')
	const [confirmed, setConfirmed] = useState<boolean>(false)
	const [showChatDialog, setShowChatDialog] = useState<boolean>(false)
	const [message, setMessage] = useState<string>('')
	const [isOwner, setIsOwner] = useState<boolean>(false)
	const [gameLevel, setGameLevel] = useState<number>(0)
	const [sceneCount, setSceneCount] = useState<number>(2)
	const [isSendAnswer, setIsSendAnswer] = useState<boolean>(false)
	const [showEditAnswer, setShowEditAnswer] = useState<boolean>(false)
	const t = useTranslations('travel');
	const {confirm} = Modal;
	const command = commandDataContainer.useContainer()
	const isOwnerRef = useRef<boolean>();
	isOwnerRef.current = isOwner;
	const sceneRef = useRef<string>()
	sceneRef.current = scene
	const roomIdRef = useRef<string>()
	roomIdRef.current =roomId
	const isSendAnswerRef = useRef<boolean>()
	isSendAnswerRef.current = isSendAnswer
	const coverRef = useRef<string>()
	coverRef.current = cover

	useEffect(() => {
		initAudioStream().then(()=>{})
		// return () => {
		// 		recorder.
		// };
	}, [])

	useEffect(()=>{
		setIsOwner(activeId === owner)
	},[activeId, owner]);

	useEffect(()=>{
		setScene(cover)
	}, [cover])

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
		if (event.data.toString() !== 'pong') {
			setShowChatDialog(true)
			setMessage("我：" + event.data.toString())
			if (isOwnerRef.current){
				handleGenerateScene(event.data.toString())
			}else{
				if (isSendAnswerRef.current) {
					handleAnswerCommand(event.data.toString())
				}else{
					handleVoiceCommand(event.data.toString())
				}
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
			onShowProgress(true)
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
		const data = {id: activeId, message: topic, owner: activeId, image_url: sceneRef.current, room_id: roomIdRef.current, level: gameLevel};
		let url = getApiServer(80) + api_url.portal.town.game_clue
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
						setShowChatDialog(true)
						setMessage("AI：" + answer[0])
					}
					if (answer.length > 1){
						playAudioWithWebAudioApi(answer[1]).then(r => {})
					}
					setClueCounter(clueCounter + 1)
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
	const handleAnswerCommand = (answer: string) => {
		command.send_answer(activeId, owner, roomId, roomName, answer, gameLevel).then((res)=>{
			let winner: string[] = JSON.parse(res)
			if (winner.length > 0){
				Modal.success({
					content: '答案正确'
				})
			}else{
				Modal.success({
					content: '答案不正确'
				})
			}
		})
	};
	const handleGenerateScene= async (description: string) => {
		let his = await  handleImageContextHis(description)
		let arch = await handleImageContextArch(description)
		let prompt = await handleImagePrompt(description,his,arch)

		const formData = new FormData();
		console.log("room id: ", roomId)
		formData.append('message', JSON.stringify({ id: activeId, room_id: roomIdRef.current, description: prompt}));

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
						setGameLevel(gameLevel + 1)
						setSceneCount(sceneCount + 1)
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
		onShowProgress(true)
		command.image_desc_by_url(activeId, roomId, sceneRef.current ?? '')
			.then(res=>{
				let description: string = res.split('##')
				console.log(description)
				if (description.length > 0){
					setMessage(description[0])
					setShowChatDialog(true)
				}
				onShowProgress(false)
			})
	};
	const handleImageContextHis = async (description: string) => {
		onShowProgress(true)
		let his_question = "please tell me the age of the image content describe and culture of this age:"
		let res = await command.ask_image_context(activeId, description, his_question, coverRef.current ?? '')
		console.log(res)
		setMessage(res)
		setShowChatDialog(true)
		return res
	};
	const handleImageContextArch = async (description: string) => {
		onShowProgress(true)
		let arch_question = "please tell me what furniture,equipment,facility should this building has:"
		let res = await command.ask_image_context(activeId, description, arch_question, coverRef.current ?? '')
		console.log(res)
		setMessage(res)
		setShowChatDialog(true)
		return res
	};
	const handleImagePrompt = async (description: string, his: string, arch: string) => {
		onShowProgress(true)
		let res = await command.ask_image_prompt(activeId, description, his, arch)
		console.log(res)
		let prompt = res.split(':')[1]
		setMessage(prompt)
		setShowChatDialog(true)
		return prompt
	};

	const handleJoin = (owner: string, room_id: string, room_name: string, level:number, clockWise: boolean) => {
		confirm({
			icon: <ExclamationCircleFilled />,
			content: clockWise? t('joinTips'):t('backTips'),
			okText: t('confirm'),
			cancelText: t('cancel'),
			onOk() {
				onShowProgress(true)
				command.join_game(activeId, owner, room_id, room_name, level).then((res) => {
					setSceneCount(res[0])
					if (res[1] !== '') {
						setScene(res[1])
						if (clockWise){
							setGameLevel(gameLevel + 1)
						}else{
							setGameLevel(gameLevel - 1)
						}
						Modal.success({
							content: clockWise ? '进入下一关!' : "回到上一关"
						})
					}else{
						Modal.success({
							content: "游戏关卡设定还没有完成"
						})
					}
					onShowProgress(false)
				})
			}
		})
	}

	const ChatDialog = ({visible, message, onClose}:{visible:boolean,message:string, onClose: ()=>void}) => {
		return(
			<div hidden={!visible} className={styles.dialog_layer}>
				<CloseOutlined onClick={() => onClose()} style={{color: "white", fontSize: 18, padding: 10}}/>
				<div className={styles.dialog_layer_content}>
					<Row>
						<Col span={24}>
							<h5 style={{color: "papayawhip", margin: 0, padding: 5}}>{message}</h5>
						</Col>
					</Row>
				</div>
			</div>
		)
	}
	return (
		<div hidden={!visible} className={styles.game_scene_container}>
			<div className={styles.game_scene_content}>
				<Row align={"middle"}>
					<Col span={2}>
						<CloseOutlined onClick={() =>{
							setGameLevel(0)
							setSceneCount(2)
							setShowChatDialog(false)
							setClueCounter(0)
							onClose()
						}} style={{color: "white", fontSize: 18, padding: 10}}/>
					</Col>
					<Col span={22} style={{textAlign:"center"}}>
						<span style={{color:"white", fontSize:18}}>{roomName}</span>
					</Col>
				</Row>
				<Row>
					<Col span={24}>
						{/*<InteractivePanorama/>*/}
						<Image
							preview={false}
							src={scene}
							height={580}
							alt="scene"
							onLoadStart={()=>onShowProgress(true)}
							onLoad={()=>{
								onShowProgress(false)
							}}
						/>
					</Col>
				</Row>
				<Row align={"middle"} style={{padding:10}}>
					<Col span={8} style={{textAlign:"center"}}>
						<Button onClick={() =>{
							if (!isOwner && gameLevel === 0) {
								Modal.warning({
									content: '请先进入关卡，这里是封面'
								})
								return
							}
							if (!isOwner && clueCounter > 3) {
								Modal.warning({
									content: '三次询问线索的机会已用完'
								})
								return
							}
							if (confirmed){
								setIsOwner(isOwner)
								stop_record()
								setIsSendAnswer(false)
							}else{
								confirm({
									icon: <ExclamationCircleFilled />,
									content: isOwner? t('startRecordingSceneDescription'):t('startAskClu'),
									okText: t('confirm'),
									cancelText: t('cancel'),
									onOk() {
										setConfirmed(true)
										stop_record()
										setIsOwner(isOwner)
										setIsSendAnswer(false)
									}
								})
							}
						}}>
							{isOwner ? '生成场景':'询问线索'}
							{stopped ? <AudioOutlined style={{color: "black"}}/> : <PauseOutlined style={{color: "black"}}/>}
						</Button>
					</Col>
					{
						isOwner ?
							<>
								<Col span={6} style={{textAlign:"center"}}>
									<Button onClick={()=>{
										if (gameLevel === 0 || gameLevel === undefined) {
											Modal.warning({
												content: '请先进入关卡，这里是封面'
											})
											return
										}
										onShowProgress(true)
										var prompt = ''
										let hints = message.split("Hints")
										if (hints.length > 1) {
											prompt = "Hints: " + hints[1]
										}
										let input = 'please tell me the specific escaping method according to Hints and picture, it should be a specific clue or object, please generate output using Chinese, the answer is:'
										command.gen_answer(activeId, sceneRef.current ?? '', roomId, gameLevel, prompt, input).then((res)=>{
											let msg: string = res
											setShowChatDialog(true)
											setMessage(msg)
											onShowProgress(false)
										})
									}}>生成答案</Button>
								</Col>
								<Col span={2} style={{textAlign:"center"}}>
									<ArrowLeftOutlined style={{color:"white",fontSize:16}} onClick={() =>{
										if (gameLevel > 1) {
											handleJoin(owner, roomId, roomName, gameLevel-1, false)
										}else {
											Modal.warning({
												content: '这是第一关了'
											})
										}
									}}/>
								</Col>
								<Col span={2} style={{textAlign:"center"}}>
									<ArrowRightOutlined style={{color:"white",fontSize:16}} onClick={() =>{
										if (gameLevel < sceneCount - 1) {
											handleJoin(owner, roomId, roomName, gameLevel+1, true)
										}else {
											Modal.warning({
												content: '这是最后一关了'
											})
										}
									}}/>
								</Col>
							</>
							:
							<>
								<Col span={6} style={{textAlign:"center"}}>
									<Button style={{color:"black"}} onClick={() =>{
										if (gameLevel === 0) {
											Modal.warning({
												content: '请先进入关卡，这里是封面'
											})
											return
										}
										setIsSendAnswer(true)
										stop_record()
									}}>发送答案</Button>
								</Col>
								<Col span={2} style={{textAlign:"center"}}>
									<ArrowLeftOutlined style={{color:"white",fontSize:16}} onClick={() =>{
										if (gameLevel > 1) {
											handleJoin(owner, roomId, roomName, gameLevel-1, false)
										}else {
											Modal.warning({
												content: '这是第一关了'
											})
										}
									}}/>
								</Col>
								<Col span={2} style={{textAlign:"center"}}>
									<ArrowRightOutlined style={{color:"white",fontSize:16}} onClick={() =>{
										if (gameLevel < sceneCount - 1) {
											handleJoin(owner, roomId, roomName, gameLevel+1, true)
										}else {
											Modal.warning({
												content: '这是最后一关了'
											})
										}
									}}/>
								</Col>
								<Col span={2} style={{textAlign:"center"}}>
									<FileImageOutlined disabled={(gameLevel === 0||gameLevel===undefined)&&!isOwner} style={{color:"white",fontSize:16}}
                   onClick={() =>{
	                   if (gameLevel === 0) {
		                   Modal.warning({
			                   content: '请先进入关卡，这里是封面'
		                   })
		                   return
	                   }
										Modal.info({
											content: "主持人会给出场景的基本描述"
										})
										handleImageDescription()
									}}/>
								</Col>
								<Col span={2} style={{textAlign:"center"}}>
									<KeyOutlined disabled={(gameLevel === 0||gameLevel===undefined)&&!isOwner} style={{color:"white",fontSize:16}} onClick={() =>{
										if (gameLevel === 0) {
											Modal.warning({
												content: '请先进入关卡，这里是封面'
											})
											return
										}
										confirm({
											icon: <ExclamationCircleFilled />,
											content: '确定查看答案吗，需要消耗50原力值',
											okText: t('confirm'),
											cancelText: t('cancel'),
											onOk() {
												command.reveal_answer(activeId, owner, roomId, gameLevel).then((res)=>{
													setShowChatDialog(true)
													if (res === ''){
														setMessage('AI还没有给出答案')
													}else{
														setMessage(res)
													}
												})
											}
										})
									}}/>
								</Col>
							</>
					}
				</Row>
				<ChatDialog visible={showChatDialog} message={message} onClose={()=>setShowChatDialog(false)}/>
			</div>
		</div>
	)
}

export default GameSceneComponent;
