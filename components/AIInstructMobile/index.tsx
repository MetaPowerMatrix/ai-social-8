import React, {useEffect, useState} from 'react';
import styles from "@/components/AIInstructMobile/AIInstructMobileComponent.module.css";
import {
	Button,
	Col, DatePicker,
	DatePickerProps, Divider,
	List, Row, UploadFile,
	UploadProps
} from "antd";
import {useTranslations} from "next-intl";
import {
	AudioOutlined, CloseOutlined, LeftOutlined,
	PauseOutlined, RightOutlined
} from "@ant-design/icons";
import {api_url, ChatMessage, getApiServer, getMQTTBroker} from "@/common";
import Image from "next/image";
import commandDataContainer from "@/container/command";
import {WebSocketManager} from "@/lib/WebsocketManager";
import TextArea from "antd/es/input/TextArea";
import mqtt from "mqtt";
import SubscriptionsComponent from "@/components/Subscriptions";
import {getCookie, getTodayDateString} from "@/lib/utils";
import dayjs from "dayjs";

interface AIInstructPros {
	id: string,
	serverUrl: string;
	onClose: ()=>void;
	visible: boolean;
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
	const [fileList, setFileList] = useState<UploadFile[]>([]);
	const [roleOnePortrait, setRoleOnePortrait] = useState<string>("/images/two-boy.png");
	const [activeAgentKey, setActiveAgentKey] = useState<string>("qa");
	const [openSub, setOpenSub] = useState<boolean>(false);
	const [authorisedIds, setAuthorisedIds] = useState<{ label: string, value: string }[]>([]);
	const [selectedIndex, setSelectedIndex] = useState<number | undefined>(undefined);
	const [callid, setCallid] = useState<string>("");
	const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
	const [queryDate, setQueryDate] = useState(getTodayDateString());
	const [summary, setSummary] = useState<string>("");
	const [hideMessages, setHideMessages] = useState<boolean>(true);
	const command = commandDataContainer.useContainer()

	useEffect(() => {
		const cookie2 = getCookie('authorized-ids');
		if (cookie2 !== "" || cookie2 !== null) {
			const ids = cookie2.split(',');
			const idsMap = ids.filter((element)=> {return (element !== '')} )
				.map((id) => {
					return {label: id.split(":")[1], value: id.split(":")[0]};
				});
			// console.log(idsMap)
			setAuthorisedIds(idsMap);
		}
	},[]);

	const callPato = (id: string, callid: string) => {
		command.callPato(id, callid).then((res) => {
			alert(t("waitingCall"))
		})
	}
	useEffect(()=> {
		if (id !== '' && callid !== '')
		{
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
	},[id, callid, queryDate])

	const onChange: DatePickerProps['onChange'] = (_, dateString) => {
		changeQueryDate(dateString as string)
		// console.log(date, dateString);
	};

	const changeQueryDate = (datestring: string) => {
		setQueryDate(datestring);
	}

	const handleAutoChat = () => {
		if (callid === ""){
			alert(t(t("requireId")))
		}
		callPato(id, callid)
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

	return (
			<div className={styles.voice_instruct_container}>
				<div className={styles.voice_instruct_content}>
					<h4 style={{textAlign:"center"}}>{t('pro')}</h4>
					<div hidden={!hideMessages}>
						<div style={{overflow: "scroll", padding: 15}}>
							<List
								itemLayout="horizontal"
								size="small"
								dataSource={authorisedIds}
								renderItem={(item, index) => (
									<List.Item
										key={index}
										className={selectedIndex != undefined && selectedIndex === index ? styles.list_item : ''}
										defaultValue={item.value}
										onClick={(e) => {
											setHideMessages(false)
											setSelectedIndex(index)
											setCallid(item.value)
										}}
									>
										<Row align={"middle"} style={{width: "100%"}}>
											<Col span={22}><h5>{item.label}</h5></Col>
											<Col span={2} style={{textAlign: "end"}}><RightOutlined/></Col>
										</Row>
									</List.Item>
								)}
							/>
							<Row style={{padding: 10}}>
								<Col span={24}>
									<Button style={{width: "100%", marginTop: 20}} type={"primary"}
									        onClick={handleAutoChat}>{t('automatic_comm')}</Button>
								</Col>
							</Row>
						</div>
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
					{activeAgentKey !== "qa" &&
              <Row align={"middle"} justify={"space-between"} style={{marginTop: 20}}>
                  <Col span={7}/>
                  <Col span={10} style={{textAlign: "center", height: 360}}>
                      <Image onClick={() => setOpenSub(true)} src={"/images/lock.png"} fill={true} alt={"lock"}/>
                  </Col>
                  <Col span={7}/>
              </Row>
					}
					<SubscriptionsComponent mobile={true} id={id} onClose={() => setOpenSub(false)} visible={openSub}
					                        onShowProgress={onShowProgress}/>
				</div>
			</div>
	);
};

export default AIInstructMobileComponent;
