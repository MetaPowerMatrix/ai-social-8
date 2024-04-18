import React, {useEffect, useRef, useState} from 'react';
import styles from "@/components/AIInstructMobile/AIInstructMobileComponent.module.css";
import {
	Col, List, Row, Modal, Button
} from "antd";
import {useTranslations} from "next-intl";
import {
	ExclamationCircleFilled, LeftOutlined
} from "@ant-design/icons";
import {ChatMessage} from "@/common";
import commandDataContainer from "@/container/command";
import {getTodayDateString} from "@/lib/utils";
import AskProComponent from "@/components/ask_pro";

interface AIInstructPros {
	id: string,
	room_id: string,
	visible: boolean,
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

const AIInstructMobileComponent: React.FC<AIInstructPros>  = ({id, room_id, visible, onShowProgress, onClose}) => {
	const t = useTranslations('AIInstruct');
	const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
	const [queryDate, setQueryDate] = useState(getTodayDateString());
	const [summary, setSummary] = useState<string>("");
	const [isOwner, setIsOwner] = useState<boolean>(false)
	const command = commandDataContainer.useContainer()
	const isOwnerRef = useRef<boolean>();
	isOwnerRef.current = isOwner;
	const {confirm} = Modal;

	useEffect(()=>{
		console.log(id, room_id)
		getProHistory(id, room_id)
		setIsOwner(id === room_id)
	},[id, room_id])

	const getProHistory = (id: string, callid: string) => {
		command.getProHistoryMessages(id, callid, queryDate).then((response) => {
				let messages: ChatMessage[] = []
				if (response !== null) {
					let session_messages = response
					let summary = ""
					session_messages.forEach((item) => {
						let msg = item.messages.filter((msg: ChatMessage) => {
							return (msg.question.length > 0 && msg.answer.length > 0)
						})
						messages.push(...msg)
						summary += item.summary
					})
					setSummary(summary)
					setChatMessages(messages)
				}
		})
	}
	const handleEditMessages = () => {
		command.edit_session_messages(id, room_id, queryDate, chatMessages).then((res) =>
		{
			Modal.success({content: "修改成功,修改结果将影响之后的聊天"})
		})
	}
	const handleSave = (index: number, value: ChatMessage) => {
		setChatMessages(chatMessages.map((item, i) => i === index ? value : item));
	};

	return (
			<div hidden={!visible}  className={styles.voice_instruct_container}>
				<div className={styles.voice_instruct_content}>
						<Row style={{padding:10}}>
							<LeftOutlined style={{fontSize:18}} onClick={()=>onClose()}/>
						</Row>
					<List
						itemLayout="vertical"
						style={{height:560,overflow:"scroll"}}
						size="small"
						split={false}
						dataSource={chatMessages}
						renderItem={(item, index) => {
							if (isOwnerRef.current) {
								return <EditableListItem t={t} initialValue={item} onSave={(value) => handleSave(index, value)}/>
							} else {
								return (
									<List.Item
										key={item.subject}
									>
										<Row>
											<Col span={24}>
												<h5>{item.sender.split('(')[0]}: {item.question}</h5>
											</Col>
										</Row>
										<Row>
											<Col span={24} style={{textAlign:"end"}}>
												<h5>{item.answer} : {item.receiver.split('(')[0]}</h5>
											</Col>
										</Row>
									</List.Item>
								)
							}
						}}
					/>
					{
						<div style={{padding:5}}>
							{isOwnerRef.current ?
								<Button style={{width:"100%"}} type={"primary"} onClick={() =>
									confirm({
										icon: <ExclamationCircleFilled />,
										content: t('save_tips'),
										okText: t('confirm'),
										cancelText: t('cancel'),
										onOk() {
											handleEditMessages()
										}
									})
								}>{t('save')}</Button>
							:
								<AskProComponent activeId={id}  room_id={room_id} onShowProgress={onShowProgress}
							                 onReply={() => {}}/>
							}
						</div>
					}
				</div>
			</div>
	);
};

export default AIInstructMobileComponent;
