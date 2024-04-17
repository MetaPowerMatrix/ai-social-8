import React, {useEffect, useState} from "react";
import {Col, Modal, Row, List, Button, Input, Form, Upload, Divider, GetProp, UploadProps, UploadFile} from "antd";
import styles from "./LiveBroadcastTownComponent.module.css";
import {
	CloseOutlined,
	LoginOutlined, PauseOutlined, UploadOutlined
} from "@ant-design/icons";
import {api_url, getApiServer, LiveOpenResponse, PortalRoomInfo} from "@/common";
import {useTranslations} from "next-intl";
import commandDataContainer from "@/container/command";
import {v4 as uuidv4} from "uuid";

const EditRoomInfo = ({id,visible,activeTown,onClose,onCreated,onShowProgress}:
    {
			id:string, visible:boolean, activeTown:string,
      onClose:(room_id: string)=>void,
	    onCreated:(room_id:string, room_name:string)=>void,
	    onShowProgress:(show: boolean)=>void
		}
) => {
	const [form] = Form.useForm();
	const [fileList, setFileList] = useState<UploadFile[]>([]);
	const [session, setSession] = useState<string>(uuidv4());
	const [roleOne, setRoleOne] = useState<string>("");
	const [roleTwo, setRoleTwo] = useState<string>("");
	const [roleOnePortrait, setRoleOnePortrait] = useState<string>("/images/placeholder2.png");
	const [roleTwoPortrait, setRoleTwoPortrait] = useState<string>("/images/placeholder2.png");
	const [open, setOpen] = useState(true);
	const t = useTranslations('travel');
	const {confirm} = Modal;
	const command = commandDataContainer.useContainer()

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
					setRoleOnePortrait(openInfo.role_1_portarit)
					alert(t('started'));
				}else{
					alert(t('start_fail'));
				}
				onShowProgress(false);
			})
			.catch((error) => {
				console.error('Error:', error);
				alert(t('start_fail'));
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
	const onChange = () => {
		setOpen(!open);
	};

	return (
		<div hidden={!visible} className={styles.room_edit_container}>
			<div className={styles.room_edit_content}>
			<CloseOutlined onClick={() => onClose('')} style={{fontSize: 18, marginBottom:20}}/>
				<Row>
					<Col span={20}>
						<Form form={form} variant="filled" onFinish={handleSubmit}>
							<Form.Item label={t("topic")} name="topic" rules={[{required: true, message: t("must")}]}>
								<Input/>
							</Form.Item>
							<Form.Item label={t("role1")} name="role_1_id" rules={[{required: true, message: t("must")}]}>
								<Input onChange={(event) => {
									let id = event.target.value
									setRoleOne(id)
								}}/>
							</Form.Item>
							<Form.Item label={t("role1_portrait")} name="role_1_dec" rules={[{required: true, message: t("must")}]}>
								<Input/>
							</Form.Item>
							<Form.Item label={t("role2")} name="role_2_id" rules={[{required: true, message: t("must")}]}>
								<Input onChange={(event) => {
									let id = event.target.value
									setRoleTwo(id)
								}}/>
							</Form.Item>
							<Form.Item label={t("role2_portrait")} name="role_2_dec" rules={[{required: true, message: t("must")}]}>
								<Input/>
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
	)
}
const LiveBroadcastTownComponent = ({activeId, onShowProgress}: {
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
					<EditRoomInfo onShowProgress={onShowProgress} id={activeId} visible={showEditRoom} activeTown={activeTown}
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
						}}
					/>
				</div>
			</div>
		</>
	)
}

export default LiveBroadcastTownComponent;
