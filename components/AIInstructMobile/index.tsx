import React, {useEffect, useState} from 'react';
import styles from "@/components/AIInstructMobile/AIInstructMobileComponent.module.css";
import {
	Button, Card,
	Col, DatePicker,
	DatePickerProps, Divider,
	List, Row, Modal
} from "antd";
import {useTranslations} from "next-intl";
import {
	AndroidOutlined,
	AudioOutlined, CommentOutlined, ExclamationCircleFilled, LeftOutlined, OpenAIOutlined,
	PauseOutlined, RightOutlined, UnorderedListOutlined
} from "@ant-design/icons";
import {api_url, ChatMessage, getApiServer, getMQTTBroker, HotPro, Streaming_Server} from "@/common";
import commandDataContainer from "@/container/command";
import {WebSocketManager} from "@/lib/WebsocketManager";
import TextArea from "antd/es/input/TextArea";
import mqtt from "mqtt";
import SubscriptionsComponent from "@/components/Subscriptions";
import {getOS, getTodayDateString} from "@/lib/utils";
import dayjs from "dayjs";
import AskProComponent from "@/components/ask_pro";

interface AIInstructPros {
	id: string,
	onShowProgress: (s: boolean)=>void;
}

declare global {
	interface Window {
		webkitAudioContext: any;
		AudioContext: any;
	}
}

const AIInstructMobileComponent: React.FC<AIInstructPros>  = ({id, onShowProgress}) => {
	const t = useTranslations('AIInstruct');
	const [authorisedIds, setAuthorisedIds] = useState<{ label: string, value: string }[]>([]);
	const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
	const [queryDate, setQueryDate] = useState(getTodayDateString());
	const [summary, setSummary] = useState<string>("");
	const [hideMessages, setHideMessages] = useState<boolean>(true);
	const [hotPros, setHotPros] = useState<HotPro[]>([])
	const [activeTabPro, setActiveTabPro] = useState<string>('mine');
	const [showProChat, setShowProChat] = useState<boolean>(false)
	const [proName, setProName] = useState<string>('')
	const [proId, setProId] = useState<string>('')
	const tabHeight: number = 520
	const command = commandDataContainer.useContainer()
	const {confirm} = Modal;

	useEffect(() => {
		let asInfoStr = localStorage.getItem("assistants")
		if (asInfoStr !== null) {
			const asInfo = JSON.parse(asInfoStr)
			const idsMap = asInfo.ids.map((id: string) => {
				const id_name = id.split(":")
				if (id_name.length > 1){
					return {label: id.split(":")[1], value: id.split(":")[0]};
				}
			});
			setAuthorisedIds(idsMap);
		}
	}, []);

	useEffect(()=>{
		command.getProHots().then((resp)=>{
			setHotPros(resp)
		})
	},[])

	const callPato = (id: string, callid: string) => {
		command.callPato(id, callid).then((res) => {
			Modal.success({
				content: t("waitingCall"),
			});
		})
	}
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

	const onChange: DatePickerProps['onChange'] = (_, dateString) => {
		changeQueryDate(dateString as string)
		// console.log(date, dateString);
	};

	const changeQueryDate = (datestring: string) => {
		setQueryDate(datestring);
	}

	const handleAutoChat = (callid: string) => {
		if (callid === ""){
			Modal.warning({
				content: t("requireId"),
			});
		}else{
			callPato(id, callid)
		}
	};
	const openProChat = (pro_id: string, pro_name: string) => {
		setProId(pro_id)
		setProName(pro_name)
		setShowProChat(true)
	}
	const pro_tabs = [
		{
			key: 'mine',
			label: t('mine'),
		},
		{
			key: 'system',
			label: t('system'),
		}
	];
	const onProTabChange = (key: string) => {
		setActiveTabPro(key);
	};
	return (
			<div className={styles.voice_instruct_container}>
				<div className={styles.voice_instruct_content}>
					<div hidden={!hideMessages}>
						<Card
							bodyStyle={{padding: "0"}}
							style={{ width: '100%', marginBottom:15 }}
							tabList={pro_tabs}
							activeTabKey={activeTabPro}
							onTabChange={onProTabChange}
							tabProps={{ size: 'small'}}
						>
							{
								activeTabPro === 'mine' &&
                  <div style={{height: tabHeight, overflow: "scroll"}}>
                      <List
                          itemLayout="horizontal"
                          size="small"
                          split={false}
                          dataSource={authorisedIds}
                          renderItem={(item, index) => (
					                  <List.Item
						                  key={index}
						                  className={styles.small_list_item}
						                  defaultValue={item.value}
					                  >
						                  <Row align={"middle"} style={{width: "100%"}}>
							                  <Col span={16}><h4>{item.label}</h4></Col>
							                  {/*<Col span={10}><h5>{item.subjects.join(',')}</h5></Col>*/}
							                  <Col span={6}>
								                  <AndroidOutlined style={{marginRight:10,fontSize:18}} onClick={()=> {
																		confirm({
																			icon: <ExclamationCircleFilled />,
																			content: t('startTalkWithPro'),
																			okText: t('confirm'),
																			cancelText: t('cancel'),
																			onOk() {
																				handleAutoChat(item.value)
																			}
																		})
																	}}/>
								                  <CommentOutlined style={{marginRight:10,fontSize:18}} onClick={() => openProChat(item.value, item.label)}/>
								                  <UnorderedListOutlined style={{fontSize:18}} onClick={()=>{
									                  Modal.info({
										                  content: t('show_pro_messages'),
										                  onOk() {
											                  getProHistory(id, item.value)
											                  setHideMessages(false)
										                  },
									                  });
								                  }}/>
							                  </Col>
						                  </Row>
					                  </List.Item>
				                  )}
                      />
                  </div>
							}
							{
								activeTabPro === 'system' &&
                  <div style={{height: tabHeight, overflow: "scroll"}}>
                      <List
                          itemLayout="horizontal"
                          size="small"
                          split={false}
                          dataSource={hotPros}
                          renderItem={(item, index) => (
														<List.Item
															key={index}
															className={styles.small_list_item}
															defaultValue={item.id}
														>
															<Row align={"middle"} style={{width: "100%"}}>
																<Col span={9}><h4>{item.name}</h4></Col>
																<Col span={9}><h5 style={{overflow:"hidden"}}>{item.subjects.join(',').substring(0,18)}</h5></Col>
																<Col span={6}>
																	<AndroidOutlined style={{marginLeft:10,fontSize:18}} onClick={()=>{
																		confirm({
																			icon: <ExclamationCircleFilled />,
																			content: t('startTalkWithPro'),
																			okText: t('confirm'),
																			cancelText: t('cancel'),
																			onOk() {
																				handleAutoChat(item.id)
																			}
																		})
																	}}/>
																	<CommentOutlined style={{marginLeft:10,fontSize:18}} onClick={() => openProChat(item.id, item.name)}/>
																	<UnorderedListOutlined style={{marginLeft:10,fontSize:18}} onClick={()=>{
																		Modal.info({
																			content: t('show_pro_messages'),
																			onOk() {
																				getProHistory(id, item.id)
																				setHideMessages(false)
																			},
																		});
																	}}/>
																</Col>
															</Row>
														</List.Item>
													)}
                      />
                  </div>
							}
						</Card>
					</div>
					<div hidden={hideMessages} style={{overflow: "scroll", height: 700, padding: 15}}>
						<Row>
							<LeftOutlined onClick={() => setHideMessages(true)}/>
						</Row>
						<Divider/>
						<DatePicker defaultValue={dayjs(queryDate)} size={"small"} style={{marginBottom: 10}}
						            onChange={onChange}/>
						<h5>{summary}</h5>
						<List
							itemLayout="vertical"
							size="small"
							dataSource={chatMessages}
							renderItem={(item) => (
								<List.Item
									key={item.session}
								>
									<Row>
										<Col span={24}>
											<h5>{item.sender.split('(')[0]}: {item.question}</h5>
										</Col>
									</Row>
									<Row>
										<Col span={24} style={{textAlign: "end"}}>
											<h5>{item.answer} : {item.receiver.split('(')[0]}</h5>
										</Col>
									</Row>
								</List.Item>
							)}
						/>
					</div>
					<AskProComponent activeId={id} visible={showProChat} pro_name={proName} pro_id={proId} onClose={()=>setShowProChat(false)} onShowProgress={onShowProgress}/>
				</div>
			</div>
	);
};

export default AIInstructMobileComponent;
