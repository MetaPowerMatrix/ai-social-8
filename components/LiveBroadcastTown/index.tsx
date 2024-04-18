import React, {useEffect, useState} from "react";
import {Col, Modal, Row, List, Button, Input, Form, Upload, Divider, GetProp, UploadProps, UploadFile} from "antd";
import styles from "./LiveBroadcastTownComponent.module.css";
import {
	CloseOutlined, ExclamationCircleFilled,
	LoginOutlined, PauseOutlined, PlusOutlined, UploadOutlined
} from "@ant-design/icons";
import {api_url, getApiServer, LiveOpenResponse, PortalLiveRoomInfo, PortalRoomInfo, Streaming_Server} from "@/common";
import {useTranslations} from "next-intl";
import commandDataContainer from "@/container/command";
import {v4 as uuidv4} from "uuid";
import HotAI from "@/components/HotAI";
import TextArea from "antd/es/input/TextArea";
import LiveChatSceneComponent from "@/components/LiveChatScene";

const EditRoomInfo = ({id,visible,onClose,onShowProgress}:
    {
			id:string, visible:boolean,
      onClose:(room_id:string, room_name:string, cover:string, role1_id:string, role2_id:string, role1_name:string, role2_name:string)=>void,
	    onShowProgress:(show: boolean)=>void
		}
) => {
	const [form] = Form.useForm();
	const [session, setSession] = useState<string>(uuidv4());
	const [showHot, setShowHot] = useState<boolean>(false)
	const [selInx, setSelInx] = useState<number>(1)
	const [roleOneName, setRoleOneName]= useState<string>('')
	const [roleOneId, setRoleOneId]= useState<string>('')
	const [roleTwoName, setRoleTwoName]= useState<string>('')
	const [roleTwoId, setRoleTwoId]= useState<string>('')
	const t = useTranslations('LiveChat');
	const {confirm} = Modal;

	const handleSubmit = (values: any) => {
		confirm({
			icon: <ExclamationCircleFilled />,
			content: '确认创建直播间',
			okText: t('confirm'),
			cancelText: t('cancel'),
			onOk() {
				onShowProgress(true);
				let data = {id: id, title: values.title, roles:[roleOneId,roleTwoId], topic: values.topic, session: session}
				let url = getApiServer(80) + api_url.portal.interaction.live.open
				fetch(url, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json;charset=utf-8'
					},
					body: JSON.stringify(data),
				})
					.then(response => response.json())
					.then(data => {
						if (data.code === "200") {
							let openInfo: LiveOpenResponse = JSON.parse(data.content)
							console.log(openInfo)
							Modal.success({
								content:  (t('started'))
							})
							onClose(openInfo.room_id, values.title, openInfo.cover, roleOneId, roleTwoId, roleOneName, roleTwoName)
						}else{
							Modal.warning({
								content:  (t('start_fail'))
							})
						}
						onShowProgress(false);
					})
					.catch((error) => {
						console.error('Error:', error);
						Modal.warning({
							content:  (t('start_fail'))
						})
						onShowProgress(false);
					});
			}
		})
	};

	const setRoleInfo = (name: string, id:string)=>{
		if (selInx == 1){
			setRoleOneName(name)
			setRoleOneId(id)
		}
		if (selInx == 2){
			setRoleTwoName(name)
			setRoleTwoId(id)
		}
		setShowHot(false)
	}
	return (
		<div hidden={!visible} className={styles.room_edit_container}>
			<div className={styles.room_edit_content}>
			<CloseOutlined onClick={() => onClose('','','','','','','')} style={{fontSize: 18, marginBottom:20}}/>
				<Row>
					<Col span={20}>
						<Form form={form} variant="filled" onFinish={handleSubmit}>
							<Form.Item label={t("title")} name="title" rules={[{required: true, message: t('must')}]}>
								<Input/>
							</Form.Item>
							<Form.Item label={t("topic")} name="topic" rules={[{required: true, message: t('must')}]}>
								<TextArea rows={2}/>
							</Form.Item>
							<Form.Item label={t("role1")}>
								<>
									<Input value={roleOneName} style={{fontSize:15, width:240, display: "inline"}}/>
									<PlusOutlined style={{fontSize:20, marginLeft: 10}} onClick={()=>{
										setSelInx(1)
										setShowHot(true)
									}}/>
								</>
							</Form.Item>
							<Form.Item label={t("role2")}>
								<>
									<Input value={roleTwoName} style={{fontSize:15, width: 240, display: "inline"}}/>
									<PlusOutlined style={{fontSize:20, marginLeft: 10}} onClick={
										()=>{
											setSelInx(2)
											setShowHot(true)
										}}/>
								</>
							</Form.Item>
							<Form.Item>
								<Button type="primary" htmlType="submit">
									{t("confirm")}
								</Button>
							</Form.Item>
						</Form>
					</Col>
				</Row>
				<HotAI onClose={()=>setShowHot(false)} visible={showHot} canSelect={true} onSelectName={setRoleInfo}/>
			</div>
		</div>
	)
}
const LiveBroadcastTownComponent = ({activeId, onShowProgress}: {
	activeId: string,
	onShowProgress: (s: boolean) => void
}) => {
	const [roomList, setRoomList] = useState<PortalLiveRoomInfo[]>([])
	const [showGameScene, setShowGameScene] = useState<boolean>(false)
	const [showEditRoom, setShowEditRoom] = useState<boolean>(false)
	const [reload, setReload] = useState<number>(0)
	const [owner, setOwner] = useState<string>('')
	const [roomId, setRoomId] = useState<string>('')
	const [roleOneName, setRoleOneName]= useState<string>('')
	const [roleOneId, setRoleOneId]= useState<string>('')
	const [roleTwoName, setRoleTwoName]= useState<string>('')
	const [roleTwoId, setRoleTwoId]= useState<string>('')
	const [roomName, setRoomName] = useState<string>('')
	const [cover, setCover] = useState<string>('')
	const t = useTranslations('travel');
	const command = commandDataContainer.useContainer()
	const {confirm} = Modal;

	useEffect(() => {
		command.log_user_activity(activeId, "live_broadcast", "browse")
		console.log("cover: ", cover)
	}, [])

	useEffect(() => {
		command.query_live_rooms().then((res) => {
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
						style={{height: 540,overflow:"scroll"}}
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
											setCover(item.cover)
											setRoomId(item.room_id)
											setRoomName(item.title)
											setOwner(item.owner)
											setRoleOneId(item.roles[0])
											setRoleTwoId(item.roles[1])
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
					<EditRoomInfo onShowProgress={onShowProgress} id={activeId} visible={showEditRoom}
            onClose={(room_id, room_name, cover, role1_id, role2_id, role1_name, role2_name) => {
	            setShowEditRoom(false)
	            setReload(reload + 1)
              if (room_id !== '') {
	              setRoomId(room_id)
	              setCover(cover)
	              setOwner(activeId)
	              setRoomName(room_name)
	              setRoleOneId(role1_id)
	              setRoleTwoId(role2_id)
	              setRoleOneName(role1_name)
	              setRoleTwoName(role2_name)
	              setShowGameScene(true)
              }
						}}
					/>
					<LiveChatSceneComponent owner={owner} id={activeId} cover={cover} room_name={roomName} roleOne={roleOneId} roleTwo={roleTwoId}
            session={roomId} serverUrl={Streaming_Server} onClose={()=>{setShowGameScene(false)}} visible={showGameScene}
            onShowProgress={onShowProgress}
					/>
				</div>
			</div>
		</>
	)
}

export default LiveBroadcastTownComponent;
