import React, {useEffect, useRef, useState} from 'react';
import styles from "@/components/AIInstructMobile/AIInstructMobileComponent.module.css";
import {
	Col, List, Row, Modal, Button, Select
} from "antd";
import {useTranslations} from "next-intl";
import {
	ExclamationCircleFilled, LeftOutlined
} from "@ant-design/icons";
import {ChatMessage, HotPro} from "@/common";
import commandDataContainer from "@/container/command";
import {getTodayDateString, isMarkdown} from "@/lib/utils";
import AskProComponent from "@/components/ask_pro";
import MarkdownViewer from "@/components/MarkdownViewer";

interface AIInstructPros {
	id: string,
	room_id: string,
	kol_name: string,
	my_name: string,
	visible: boolean,
	follower_ids: string[],
	onShowProgress: (s: boolean)=>void;
	onClose: ()=>void;
}

declare global {
	interface Window {
		webkitAudioContext: any;
		AudioContext: any;
	}
}

interface EditableListItemProps {
	initialValue: ChatMessage;
	onSave: (value: ChatMessage) => void;
	t: any
}

const EditableListItem: React.FC<EditableListItemProps> = ({ initialValue, onSave, t }) => {
	const [editing, setEditing] = useState(false);
	const [value, setValue] = useState(initialValue);

	const handleEdit = () => {
		setEditing(true);
	};

	const handleSave = () => {
		onSave(value);
		setEditing(false);
	};

	const handleCancel = () => {
		setValue(initialValue);
		setEditing(false);
	};

	const handleChangeQuestion = (event: React.ChangeEvent<HTMLInputElement>) => {
		setValue((prevState) => {
			return {
				...prevState,
				question: event.target.value,
			};
		});
	};
	const handleChangeAnswer = (event: React.ChangeEvent<HTMLInputElement>) => {
		setValue((prevState) => {
			return {
				...prevState,
				answer: event.target.value,
			};
		});
	};

	if (editing) {
		return (
			<List.Item>
				<div>{initialValue.sender}: <input style={{width:"100%"}} autoFocus={true} value={value.question} onChange={handleChangeQuestion} /></div>
				<div>{initialValue.receiver}: <input style={{width:"100%"}} autoFocus={true} value={value.answer} onChange={handleChangeAnswer} /></div>
				<button style={{marginTop:10, marginRight: 10}} onClick={handleSave}>{t('confirm')}</button>
				<button onClick={handleCancel}>{t('cancel')}</button>
			</List.Item>
		);
	}

	return (
		<List.Item
			key={initialValue.subject}
			onClick={handleEdit}
		>
			<Row>
				<Col span={24}>
					<h5>{initialValue.sender.split('(')[0]}: {initialValue.question}</h5>
				</Col>
			</Row>
			<Row>
				<Col span={24} style={{textAlign:"end"}}>
					<h5>{initialValue.answer} : {initialValue.receiver.split('(')[0]}</h5>
				</Col>
			</Row>

			{/*<h5>{initialValue.sender}: {initialValue.question}</h5>*/}
			{/*<h5>{initialValue.receiver === initialValue.sender ? initialValue.receiver + "#2" : initialValue.receiver}: {initialValue.answer}</h5>*/}
			{/*<h5>{formatDateTimeString(initialValue.created_at*1000)} <Tag color="green">{initialValue.place}</Tag><Tag color="yellow">{initialValue.subject}</Tag></h5>*/}
		</List.Item>
	);
};

const AIInstructMobileComponent: React.FC<AIInstructPros>  = ({id, room_id,kol_name, my_name, follower_ids, visible, onShowProgress, onClose}) => {
	const t = useTranslations('AIInstruct');
	const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
	const [queryDate, setQueryDate] = useState(getTodayDateString());
	const [reload, setReload] = useState<number>(0)
	const [followers, setFollowers] = useState<HotPro[]>([])
	const [isOwner, setIsOwner] = useState<boolean>(false)
	const [queryId, setQueryId] = useState<string>(id)
	const [queryName, setQueryName] = useState<string>(my_name)
	const command = commandDataContainer.useContainer()
	const isOwnerRef = useRef<boolean>();
	isOwnerRef.current = isOwner;
	const {confirm} = Modal;

	useEffect(()=>{
		console.log(id, room_id)
		// getProHistory(id, room_id)
		setIsOwner(id === room_id)
		getFollowers(follower_ids)
	},[id, room_id, follower_ids])

	useEffect(()=>{
		getProHistory(queryId, room_id)
	},[id, queryId, room_id, reload])

	const getProHistory = (id: string, callid: string) => {
		command.getProHistoryMessages(id, callid, queryDate).then((response) => {
				if (response !== null) {
					setChatMessages(response)
				}
		})
	}
	const getFollowers = (ids: string[]) => {
		command.get_pato_names(ids).then((response) => {
			let f : HotPro[] = [{id: "select", name: "选择粉丝查询聊天记录", subjects: []}]
			f.push(...response)
			setFollowers(f)
		})
	}
	const handleEditMessages = () => {
		command.edit_session_messages(queryId, room_id, chatMessages).then((res) =>
		{
			Modal.success({content: "修改成功,修改结果将影响之后的聊天"})
		})
	}
	const handleSave = (index: number, value: ChatMessage) => {
		value.sender = queryId;
		value.receiver = room_id;
		setChatMessages(chatMessages.map((item, i) => i === index ? value : item));
	};

	return (
			<div hidden={!visible}  className={styles.voice_instruct_container}>
				<div className={styles.voice_instruct_content}>
					<Row style={{padding: 10}}>
						<LeftOutlined style={{fontSize: 18}} onClick={() =>{
							setReload(reload+1)
							onClose()
						}}/>
					</Row>
					{isOwner &&
              <Row style={{padding:10}}>
                  <select style={{padding: 10, width: "100%"}} id="queryId" name="queryId" onChange={(e)=>{
										setQueryId(e.target.value)
										setQueryName(e.target.selectedOptions[0].innerText)
										console.log(queryName)
									}}>
										{followers.map((option) => (
											<option key={option.id} value={option.id}>
												{option.name}
											</option>
										))}
                  </select>
              </Row>
					}
					<List
						itemLayout="vertical"
						style={{height: 560, overflow: "scroll"}}
						size="small"
						split={false}
						dataSource={chatMessages}
						renderItem={(item, index) => {
							if (isOwnerRef.current) {
								let edit_item: ChatMessage = {
									sender: queryName,
									receiver: kol_name,
									question: item.question,
									answer: item.answer,
									subject: item.subject,
									created_at: item.created_at,
									session: item.session,
									place: item.place,
									sender_role: item.sender_role
								}
								return <EditableListItem t={t} initialValue={edit_item} onSave={(value) => handleSave(index, value)}/>
							} else {
								return (
									<List.Item
										key={item.subject}
									>
										<Row>
											<Col span={24}>
												<h5>{queryName}: {item.question}</h5>
											</Col>
										</Row>
										<Row>
											<Col span={24} style={{textAlign: "end"}}>
												{
													isMarkdown(item.answer) ?
														<MarkdownViewer markdownText={item.answer}/>
														:
														<h5>{item.answer} :{kol_name}</h5>
												}
											</Col>
										</Row>
									</List.Item>
								)
							}
						}}
					/>
					{
						<div style={{padding: 5}}>
							{isOwnerRef.current ?
								<Button style={{width: "100%"}} type={"primary"} onClick={() =>
									confirm({
										icon: <ExclamationCircleFilled/>,
										content: t('save_tips'),
										okText: t('confirm'),
										cancelText: t('cancel'),
										onOk() {
											handleEditMessages()
										}
									})
								}>{t('save')}</Button>
								:
								<AskProComponent activeId={id} room_id={room_id} onShowProgress={onShowProgress}
								                 onReply={(message) => {
									                 setReload(reload + 1)
								                 }}/>
							}
						</div>
					}
				</div>
			</div>
	);
};

export default AIInstructMobileComponent;
