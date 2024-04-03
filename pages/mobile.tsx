import React, {useEffect, useState} from 'react';
import Head from 'next/head';
import {
	Avatar,
	Card,
	Col,
	DatePicker,
	DatePickerProps,
	Divider,
	Input,
	List,
	Rate,
	Row,
	Space,
	Tag,
	Tooltip
} from "antd";
import {DeleteOutlined, RedoOutlined} from "@ant-design/icons";
import commandDataContainer from "@/container/command"
import {ChatMessage, SessionList, sessionMessages} from "@/common";
import {useTranslations} from 'next-intl';
import {formatDateTimeString, getCookie, getTodayDateString} from "@/lib/utils";
import dayjs from "dayjs";
import LayoutMobile from "@/components/layout_mobile";

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

export default function Home() {
	const [activeId, setActiveId] = useState("");
	const command = commandDataContainer.useContainer()
	const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
	const [queryDate, setQueryDate] = useState(getTodayDateString());
	const [reloadTimes, setReloadTimes] = useState(0);
	const [sessionList, setSessionList] = useState<SessionList[]>([])
	const [dailyEvent, setDailyEvent] = useState('');
	const t = useTranslations('Index');

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
						created_at: item.messages[0]?.created_at
					}
				})
				setSessionList(sessions)
			}
		})
	},[activeId, queryDate, reloadTimes])
	const Messages = () => {
		return(
			<div style={{overflow: "scroll", height:700}}>
				<List
					itemLayout="horizontal"
					header={<MessageHeader queryDate={queryDate} onChangeDate={changeQueryDate} onClickReload={increaseReloadTimes}/>}
					size="small"
					dataSource={chatMessages}
					renderItem={(item) => (
						<List.Item
							key={item.subject}
							actions={[]}
						>
							<h5>{item.sender}: {item.question}</h5>
							<h5>{item.receiver === item.sender ? item.receiver+"#2":item.receiver}: {item.answer}</h5>
							<h5>{formatDateTimeString(item.created_at*1000)} <Tag color="green">{item.place}</Tag><Tag color="green">{item.subject}</Tag></h5>
						</List.Item>
					)}
				/>
			</div>
		)
	}
	return (
		<LayoutMobile onRefresh={increaseReloadTimes} onChangeId={(newId: string) => setActiveId(newId)} title={t('title')}
		              description={t('description')}>
			<Head>
				<title>{t('title')}</title>
			</Head>
			<Row align={"middle"} style={{padding:10}}>
				<Col span={4}><label>{t('event')}</label></Col>
				<Col span={16}>
					<Input placeholder={t('taskDailyTips')} onChange={(e) => dailyInput(e)}/>
				</Col>
				<Col span={4} style={{textAlign:"center"}}>
					<button onClick={(e) => handleTodayEvent(e)}>{t('submit')}</button>
				</Col>
			</Row>
			<div style={{overflow: "scroll", height: 700, padding: 10}}>
				<List
					itemLayout="horizontal"
					header={<MessageHeader queryDate={queryDate} onChangeDate={changeQueryDate} onClickReload={increaseReloadTimes}/>}
					size="small"
					dataSource={sessionList}
					renderItem={(item) => (
						<List.Item
							key={item.session}
							actions={[
								<DeleteOutlined key={"delete"} onClick={() => archiveSession(item.session)}/>
							]}
						>
							<List.Item.Meta
								avatar={<Avatar src={"/images/notlogin.png"} />}
								title={item.receiver.substring(0, 16)}
								description={<><Tag color="green">{item.place}</Tag><Tag color="green">{item.subject}</Tag>{formatDateTimeString(item.created_at)}</>}
							/>
							<Tooltip title={item.summary} color={"cyan"} key={"cyan"}>
								<h5>{item.summary.substring(0, 8)}</h5>
							</Tooltip>
						</List.Item>
					)}
				/>
			</div>
		</LayoutMobile>
);
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
