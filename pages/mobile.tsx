import React, {useEffect, useState} from 'react';
import Head from 'next/head';
import {
	Avatar, Button,
	Card,
	Col,
	DatePicker,
	DatePickerProps,
	Divider,
	Input,
	List, notification,
	Rate,
	Row,
	Space,
	Tag,
	Tooltip
} from "antd";
import {DeleteOutlined, LeftOutlined, RedoOutlined, RightOutlined} from "@ant-design/icons";
import commandDataContainer from "@/container/command"
import {ChatMessage, getMQTTBroker, SessionList} from "@/common";
import {useTranslations} from 'next-intl';
import {formatDateTimeString, getCookie, getTodayDateString} from "@/lib/utils";
import dayjs from "dayjs";
import LayoutMobile from "@/components/layout_mobile";
import mqtt from "mqtt";

const MessageHeader = ({onChangeDate, onClickReload, queryDate}:{
	onChangeDate: (datestring: string)=>void,
	onClickReload: ()=>void,
	queryDate: string,
}) => {
	const t = useTranslations('Index');
	const onChange: DatePickerProps['onChange'] = (_, dateString) => {
		onChangeDate(dateString as string)
		// console.log(date, dateString);
	};

	return (
		<>
			<Row justify="space-between">
				<Col span={8}><span>{t('taskMessage')}</span>
					<Divider type={"vertical"}/>
					<RedoOutlined onClick={onClickReload}/>
					<Divider type={"vertical"}/>
				</Col>
				<Col span={16} style={{ textAlign: 'right' }}>
					<DatePicker defaultValue={dayjs(queryDate)} size={"small"} style={{textAlign: "end"}} onChange={onChange} />
				</Col>
			</Row>
		</>
	)
}

interface EditableListItemProps {
	initialValue: ChatMessage;
	onSave: (value: ChatMessage) => void;
}

const EditableListItem: React.FC<EditableListItemProps> = ({ initialValue, onSave }) => {
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
				<button style={{marginTop:10, marginRight: 10}} onClick={handleSave}>Save</button>
				<button onClick={handleCancel}>Cancel</button>
			</List.Item>
		);
	}

	return (
		<List.Item
			key={initialValue.subject}
			onClick={handleEdit}
		>
			<h5>{initialValue.sender}: {initialValue.question}</h5>
			<h5>{initialValue.receiver === initialValue.sender ? initialValue.receiver + "#2" : initialValue.receiver}: {initialValue.answer}</h5>
			<h5>{formatDateTimeString(initialValue.created_at*1000)} <Tag color="green">{initialValue.place}</Tag><Tag color="yellow">{initialValue.subject}</Tag></h5>
		</List.Item>
	);
};

export default function Home() {
	const [activeId, setActiveId] = useState("");
	const command = commandDataContainer.useContainer()
	const [pageHeight, setPageHeight] = useState<number>(660)
	const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
	const [queryDate, setQueryDate] = useState(getTodayDateString());
	const [reloadTimes, setReloadTimes] = useState(0);
	const [sessionList, setSessionList] = useState<SessionList[]>([])
	const [dailyEvent, setDailyEvent] = useState('');
	const [client, setClient] = useState<mqtt.MqttClient | null>(null);
	const [isMySeesion, setIsMySession] = useState<boolean>(false)
	const [activeName, setActiveName] = useState<string>("")
	const [continueTalk, setContinueTalk] = useState<boolean>(true)
	const [api, contextHolder] = notification.useNotification();
	const [currentSession, setCurrentSession] = useState<string>("")
	const [hideDetail, setHideDetail] = useState<boolean>(true)
	const [summary, setSummary] = useState<string>("")

	const t = useTranslations('Index');

	const openNotification = (title: string, message: string) => {
		api.open({
			message: title,
			description:
			message,
			duration: 0,
		});
	};

	const handleTodayEvent = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		event.preventDefault();
		if (dailyEvent === ""){
			alert(t('event'))
			return
		}
		command.create_today_event(activeId, dailyEvent).then((response) => {
			alert(t('waiting'))
		})
	};
	const dailyInput = (event: React.ChangeEvent<HTMLInputElement>) => {
		event.preventDefault();
		setDailyEvent(event.target.value)
	}
	const changeQueryDate = (datestring: string) => {
		setQueryDate(datestring);
	}

	const increaseReloadTimes = () => {
		setReloadTimes(reloadTimes + 1);
	}
	const archiveSession = (session_id: string) =>{
		command.archive_session(activeId, session_id, queryDate).then((res) => {
			if (res){
				alert(t("delete"))
			}
		})
	}

	useEffect(()=> {
		const cookie1 = getCookie('active-id');
		if (cookie1 !== "" && cookie1 !== null) {
			setActiveId(cookie1);
		}
		const mqttClient = mqtt.connect(getMQTTBroker());
		mqttClient.on("connect", () => {
			console.log("Messages Connected to MQTT broker");
		});
		mqttClient.on("error", (err) => {
			console.error("Error connecting to MQTT broker:", err);
		});
		setClient(mqttClient);

		return () => {
			console.log("Messages Disconnecting from MQTT broker")
			mqttClient.end(); // Clean up the connection on component unmount
		};
	},[])

	useEffect(()=> {
		command.getPatoHistoryMessages(activeId, queryDate).then((response) => {
			setSessionList([])
			if (response !== null) {
				let session_messages = response
				let sessions: SessionList[] = session_messages?.map((item) => {
					return {
						session: item.session,
						receiver: item.messages[0]?.receiver,
						place: item.messages[0]?.place,
						subject: item.messages[0]?.subject,
						summary: item.summary,
						created_at: item.messages[0]?.created_at,
						messages: item.messages
					}
				})
				setSessionList(sessions)
			}
		})
	},[activeId, queryDate, reloadTimes])
	useEffect(() => {
		if (client && currentSession !== '') {
			const msg_refresh = activeId+"/refresh";
			const chat_continue = activeId+"/continue";

			// Handler for incoming messages
			const onMessage = async (topic: string, message: Buffer) => {
				console.log("receive ", topic, " ", message.toString())
				if (topic === msg_refresh){
					increaseReloadTimes()
				}else{
					console.log("set continue session: ", currentSession)
					if ( currentSession === message.toString()){
						setContinueTalk(true)
					}else{
						setContinueTalk(false)
					}
				}
			};

			// Subscribe to the topic
			client.subscribe([msg_refresh, chat_continue], (err) => {
				if (!err) {
					console.log("Messages Subscribed to topic: ", [msg_refresh, chat_continue]);
					client.on('message', onMessage);
				}
			});

			// Return a cleanup function to unsubscribe and remove the message handler
			return () => {
				if (client) {
					console.log("Messages unsubscribe from ", [msg_refresh, chat_continue])
					client.unsubscribe([msg_refresh, chat_continue]);
					client.removeListener('message', onMessage);
				}
			};
		}
	}, [client, currentSession]);

	const showSessionDetail = (session: string) => {
		let session_message = sessionList.filter((item) => item.session === session)
		if (session_message.length > 0){
			setChatMessages(session_message[0].messages)
			if (session_message[0].messages.length > 0){
				let realname = session_message[0].messages[0].sender.split('(')[0]
				if ( realname === activeName){
					setIsMySession(true)
				}else{
					setIsMySession(false)
				}
				setSummary(session_message[0].summary)
				setCurrentSession(session_message[0].session)
			}
			setHideDetail(false)
		}
	};

	const handleSave = (index: number, value: ChatMessage) => {
		setChatMessages(chatMessages.map((item, i) => i === index ? value : item));
	};

	const handleEditMessages = () => {
		command.edit_session_messages(activeId, currentSession, queryDate, chatMessages).then((res) =>
		{
			openNotification("修改成功", "修改结果将影响之后的聊天")
		})
	}
	const handleContinueChat = (continued: boolean) => {
		command.continue_session_chat(activeId, currentSession, queryDate, continued).then((res) => {
			openNotification("继续聊天", "支付了对方1个原力")
		})
	}

	return (
		<LayoutMobile onRefresh={(name: string) => setActiveName(name)} onChangeId={(newId: string) => setActiveId(newId)}
		              title={t('title')}
		              description={t('description')}>
			<Head>
				<title>{t('title')}</title>
			</Head>
			<div hidden={!hideDetail} style={{overflow: "scroll", height: pageHeight, padding: 10}}>
				<Row align={"middle"}>
					<Col span={5} style={{textAlign: "start"}}><label>{t('event')}</label></Col>
					<Col span={16} style={{textAlign: "center"}}>
						<Input placeholder={t('taskDailyTips')} onChange={(e) => dailyInput(e)}/>
					</Col>
					<Col span={4} style={{textAlign: "center"}}>
						<button onClick={(e) => handleTodayEvent(e)}>{t('submit')}</button>
					</Col>
				</Row>
				<List
					itemLayout="horizontal"
					header={<MessageHeader queryDate={queryDate} onChangeDate={changeQueryDate}
					                       onClickReload={increaseReloadTimes}/>}
					size="small"
					dataSource={sessionList}
					renderItem={(item) => (
						<List.Item
							key={item.session}
							actions={[
								<DeleteOutlined key={"delete"} onClick={() => archiveSession(item.session)}/>,
								<RightOutlined key={"detail"} onClick={() => showSessionDetail(item.session)}/>
							]}
						>
							<List.Item.Meta
								avatar={<Avatar src={"/images/notlogin.png"}/>}
								title={item.receiver.substring(0, 16)}
								description={<><Tag color="green">{item.place}</Tag><Tag
									color="green">{item.subject}</Tag>{formatDateTimeString(item.created_at)}</>}
							/>
							<Tooltip title={item.summary} color={"cyan"} key={"cyan"}>
								<h5>{item.summary.substring(0, 8)}</h5>
							</Tooltip>
						</List.Item>
					)}
				/>
			</div>
			<div hidden={hideDetail} style={{overflow: "scroll", height: pageHeight, padding: 15}}>
				<Row>
					<LeftOutlined onClick={() => setHideDetail(true)}/>
				</Row>
				<Divider/>
				<List
					itemLayout="vertical"
					header={summary}
					size="small"
					split={false}
					dataSource={chatMessages}
					renderItem={(item, index) => {
						if (isMySeesion) {
							return <EditableListItem initialValue={item} onSave={(value) => handleSave(index, value)}/>
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
				{isMySeesion &&
            <>
                <Divider/>
                <Row>
                    <Col span={4} style={{marginTop: 10}}>
                        <label>是否继续聊天?</label>
                    </Col>
                    <Col span={12} style={{marginTop: 10}}>
                        <Button onClick={() => handleContinueChat(true)} disabled={!continueTalk} type={"primary"}
                                style={{marginRight: 30}}>是</Button>
                        <Button onClick={() => handleContinueChat(false)} disabled={!continueTalk}>否</Button>
                    </Col>
                </Row>
            </>
				}
			</div>
		</LayoutMobile>
	)
		;
}

export async function getStaticProps({
	                                     locale
                                     }: {
	locale: string
}) {
	return {
		props: {
			messages: {
				...require(`../messages/${locale}.json`),
			}
		},
	};
}
