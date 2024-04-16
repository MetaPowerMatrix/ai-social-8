import React, {useEffect, useState} from "react";
import {Col, Modal, Row, List, Button, Input} from "antd";
import styles from "./GameMishiTownComponent.module.css";
import {
	AudioFilled,
	CloseOutlined,
	ExclamationCircleFilled,
	LoginOutlined, PauseOutlined
} from "@ant-design/icons";
import {PortalRoomInfo} from "@/common";
import {useTranslations} from "next-intl";
import commandDataContainer from "@/container/command";
import TextArea from "antd/es/input/TextArea";
import GameSceneComponent from "@/components/GameScene";

const EditRoomInfo = ({id,visible,activeTown,onClose,onCreated}:
    {
			id:string, visible:boolean, activeTown:string,
      onClose:(room_id: string)=>void
	    onCreated:(room_id:string, room_name:string)=>void
		}
) => {
	const [roomName, setRoomName] = useState<string>('')
	const [roomDescription, setRoomDescription] = useState<string>('')
	const t = useTranslations('travel');
	const {confirm} = Modal;
	const command = commandDataContainer.useContainer()

	const onChangeName = (event: React.ChangeEvent<HTMLInputElement>) =>{
		setRoomName(event.target.value)
	}
	const onChangeDescription = (event: React.ChangeEvent<HTMLTextAreaElement>) =>{
		setRoomDescription(event.target.value)
	}
	const handleCreateRoom = () => {
		confirm({
			icon: <ExclamationCircleFilled/>,
			content: t('create_room_tips'),
			okText: t('confirm'),
			cancelText: t('cancel'),
			onOk() {
				command.create_game_room(id, roomName, roomDescription,activeTown).then((res)=>{
					onClose(res)
					onCreated(res, roomName)
				})
			}
		})
	}
	return (
		<div hidden={!visible} className={styles.room_edit_container}>
			<div className={styles.room_edit_content}>
				<CloseOutlined onClick={() => onClose('')} style={{fontSize: 18, marginBottom:20}}/>
				<Row>
					<Col span={24}>
						<Input onChange={onChangeName} placeholder={"房间名称"} value={roomName}/>
					</Col>
				</Row>
				<Row>
					<TextArea onChange={onChangeDescription} style={{marginTop: 10}} placeholder={"房间描述"} value={roomDescription} rows={4}/>
				</Row>
				<Row align={"middle"} style={{marginTop: 10}}>
					<Col span={8}></Col>
					<Col span={4}>
						<Button type={"primary"} style={{marginLeft: 0}}
						        onClick={() => handleCreateRoom()}>{t('create_room')}</Button>
					</Col>
				</Row>
			</div>
		</div>
	)
}
const GameMishiTownComponent = ({activeId, onShowProgress}: {
	activeId: string,
	onShowProgress: (s: boolean) => void
}) => {
	const [roomList, setRoomList] = useState<PortalRoomInfo[]>([])
	const [showGameScene, setShowGameScene] = useState<boolean>(false)
	const [showEditRoom, setShowEditRoom] = useState<boolean>(false)
	const [reload, setReload] = useState<number>(0)
	const [owner, setOwner] = useState<string>('')
	const [roomId, setRoomId] = useState<string>('')
	const [roomName, setRoomName] = useState<string>('')
	const [cover, setCover] = useState<string>('')
	const t = useTranslations('travel');
	const activeTown = "game"
	const command = commandDataContainer.useContainer()
	const {confirm} = Modal;

	useEffect(() => {
		command.log_user_activity(activeId, "game_mishi", "browse")
		console.log("cover: ", cover)
	}, [])

	useEffect(() => {
		command.query_rooms(activeTown).then((res) => {
			setRoomList(res)
		})
	}, [reload])

	return (
		<>
			<div className={styles.travel_town_mobile_container}>
				<div className={styles.travel_town_mobile_content}>
					<List
						itemLayout="horizontal"
						size="small"
						style={{height: 540}}
						dataSource={roomList}
						renderItem={(item, index) => (
							<List.Item
								key={index}
							>
								<Row align={"middle"} style={{width: "100%"}}>
									<Col span={8}>
										<h5 style={{overflow: "scroll"}}>{item.title}</h5>
									</Col>
									<Col span={12}>
										<h5 style={{overflow: "scroll"}}>{item.description}</h5>
									</Col>
									<Col span={2} style={{textAlign: "end"}}>
										<LoginOutlined onClick={() => {
											console.log("set cover ",item.cover)
											setCover(item.cover)
											console.log("set cover after ",cover)
											setRoomId(item.room_id)
											setRoomName(item.title)
											setOwner(item.owner)
											setShowGameScene(true)
										}}/>
									</Col>
								</Row>
							</List.Item>
						)}
					/>
					<Row>
						<Col span={2}></Col>
						<Col span={20}>
							<Button style={{width: "100%", fontSize: 16}} type={"primary"} onClick={() => {
								setShowEditRoom(true)
							}}>+</Button>
						</Col>
						<Col span={2}></Col>
					</Row>
					<EditRoomInfo id={activeId} visible={showEditRoom} activeTown={activeTown}
					              onCreated={(room_id, room_name) => {
						              setRoomId(room_id)
						              setRoomName(room_name)
					              }}
					              onClose={(room_id) => {
						              if (room_id !== '') {
							              setShowEditRoom(false)
							              setShowGameScene(true)
						              } else {
							              setShowEditRoom(false)
						              }
						              setReload(reload + 1)
					              }
					              }/>
					<GameSceneComponent cover={cover} roomName={roomName} visible={showGameScene} onClose={() => setShowGameScene(false)}
					                    roomId={roomId} activeId={activeId} owner={owner} onShowProgress={onShowProgress}/>
				</div>
			</div>
		</>
	)
}

export default GameMishiTownComponent;
