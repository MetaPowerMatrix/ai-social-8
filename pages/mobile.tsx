import React, {useEffect, useState} from 'react';
import Head from 'next/head';
import {Card, Col, DatePicker, DatePickerProps, Divider, List, Rate, Row, Space, Tag} from "antd";
import {DeleteOutlined, RedoOutlined} from "@ant-design/icons";
import commandDataContainer from "@/container/command"
import {ChatMessage, sessionMessages} from "@/common";
import {useTranslations} from 'next-intl';
import {getCookie, getTodayDateString} from "@/lib/utils";
import dayjs from "dayjs";
import LayoutMobile from "@/components/layout_mobile";

const MessageHeader = ({onChangeDate, onClickReload, onClickArchive, queryDate, summary}:{
	onChangeDate: (datestring: string)=>void,
	onClickReload: ()=>void,
	onClickArchive: ()=>void,
	queryDate: string, summary: string
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
					<DeleteOutlined onClick={onClickArchive}/>
				</Col>
				<Col span={16} style={{ textAlign: 'right' }}>
					<DatePicker defaultValue={dayjs(queryDate)} size={"small"} style={{textAlign: "end"}} onChange={onChange} />
				</Col>
			</Row>
			<Divider type={"horizontal"}/>
			<Row>
				<h5>{summary}</h5>
			</Row>
		</>
	)
}

export default function Home() {
	const [activeId, setActiveId] = useState("");
	const command = commandDataContainer.useContainer()
	const [sessionMessages, setSessionMessages] = useState<sessionMessages[]>([]);
	const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
	const [queryDate, setQueryDate] = useState(getTodayDateString());
	const [reloadTimes, setReloadTimes] = useState(0);
	const [sessionTabKey, setSessionTabKey] = useState<string>('');
	const [sessionList, setSessionList] = useState<{key: string, label: string}[]>([])
	const [summary, setSummary] = useState<string>('')
	const t = useTranslations('Index');

	const onTabChange = (key: string) => {
		let session_message = sessionMessages.filter((item) => item.session === key)
		if (session_message.length > 0){
			setChatMessages(session_message[0].messages)
			setSummary(session_message[0].summary)
			setSessionTabKey(session_message[0].session)
		}
	};

	const onChange: DatePickerProps['onChange'] = (_, dateString) => {
		changeQueryDate(dateString as string)
		// console.log(date, dateString);
	};

	const changeQueryDate = (datestring: string) => {
		setQueryDate(datestring);
	}

	const increaseReloadTimes = () => {
		setReloadTimes(reloadTimes + 1);
	}
	const archiveSession = () =>{
		command.archive_session(activeId, sessionTabKey, queryDate).then((res) => {
			if (res){
				alert("删除成功！")
			}
		})
	}

	const formatDateTimeString = (timestamp: number) : string => {
		const dayjsObject = dayjs(timestamp);
		return dayjsObject.format('YYYY-MM-DD HH:mm:ss')
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
			setSessionMessages([])
			setChatMessages([])
			if (response !== null) {
				let session_messages = response
				let sessions = session_messages.map((item) => {
					return {key: item.session, label: item.session.substring(0, 4) + '...' + item.session.substring(30, 34)}
				})
				setSessionList(sessions)
				setSessionMessages(session_messages)
				if (session_messages.length > 0){
					setChatMessages(session_messages[0].messages)
					setSummary(session_messages[0].summary)
					setSessionTabKey(session_messages[0].session)
				}
			}
		})
	},[activeId, queryDate, reloadTimes])

	return (
		<LayoutMobile onRefresh={increaseReloadTimes} onChangeId={(newId:string)=>setActiveId(newId)} title={t('title')} description={t('description')}>
			<Head>
				<title>{t('title')}</title>
			</Head>
			<Card
				style={{ width: '100%' }}
				tabList={sessionList}
				activeTabKey={sessionTabKey}
				onTabChange={onTabChange}
				tabProps={{
					size: 'small',
				}}
			>
				{
					chatMessages.length === 0 ?
						<div style={{textAlign: "center", width: "100%"}}>
							<h3>{t('noMessage')}</h3>
							<label>查看历史消息 <DatePicker defaultValue={dayjs(queryDate)} size={"small"} style={{textAlign: "end"}} onChange={onChange} /></label>
						</div>
						:
						<>
							<List
								itemLayout="vertical"
								header={<MessageHeader onClickArchive={archiveSession} summary={summary} queryDate={queryDate} onChangeDate={changeQueryDate} onClickReload={increaseReloadTimes}/>}
								size="small"
								pagination={{
									onChange: (page) => {
										console.log(page);
									},
									pageSize: 6,
								}}
								dataSource={chatMessages}
								footer={
									<div style={{color: "yellowgreen"}}>
										{t('taskTips')}
									</div>
								}
								renderItem={(item) => (
									<List.Item
										key={item.subject}
										actions={[
											<Rate key={item.created_at} defaultValue={3} allowClear={false}/>
										]}
									>
										<h5>{item.sender}: {item.question}</h5>
										<h5>{item.receiver === item.sender ? item.receiver+"#2":item.receiver}: {item.answer}</h5>
										<h5><Tag color="green">{item.place}</Tag>#{item.session}#{item.subject}#{formatDateTimeString(item.created_at*1000)}</h5>
									</List.Item>
								)}
							/>
						</>
				}
			</Card>

		</LayoutMobile>
	);
}

export async function getStaticProps({locale}: {locale: string}) {
	return {
		props: {
			messages:{
				...require(`../messages/${locale}.json`),
			}
		},
	};
}
