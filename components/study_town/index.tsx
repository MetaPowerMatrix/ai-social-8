import {Button, Col, Divider, List, Modal, Row, Tabs, Timeline} from "antd";
import React, {useEffect, useState} from "react";
import styles from './StudyTownCompoent.module.css'
import {useTranslations} from "next-intl";
import commandDataContainer from "@/container/command";
import HotAI from "@/components/HotAI";
import {
	BankOutlined,
	CommentOutlined, ExclamationCircleFilled,
	ExperimentOutlined,
	SearchOutlined,
} from "@ant-design/icons";
import SummaryComponent from "@/components/summary";
import QueryEmbeddingComponent from "@/components/query_embedding";
import SharedKnowledges from "@/components/SharedKnowledges";
import HotTopics from "@/components/HotTopics";
import TextArea from "antd/es/input/TextArea";

const StudyTownCompoent = ({id, mobile, onShowProgress}:{id: string, mobile: boolean, onShowProgress: (s: boolean)=>void}) => {
	const [showTopics, setShowTopics] = useState<boolean>(false)
	const [activeTab, setActivTab] = useState('summary');
	const [topic, setTopic] = useState<string>('')
	const [topicChatHis, setTopicChatHis] = useState<string[]>([])
	const command = commandDataContainer.useContainer()
	const activeTown = 'study';
	const t = useTranslations('discovery');
	const {confirm} = Modal;

	const handleTodayEvent = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		event.preventDefault();
		if (topic === ""){
			Modal.warning({
				content: t('event_tips')
			})
			return
		}
		confirm({
			icon: <ExclamationCircleFilled />,
			content: t('talking_tips'),
			okText: t('confirm'),
			cancelText: t('cancel'),
			onOk() {
				command.create_today_event(id, topic, activeTown).then((response) => {
					Modal.success({
						content: t('talking')
					})
				})
			}
		})
	};

	const topicInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		event.preventDefault();
		setTopic(event.target.value)
	}
	const onSelectTopic = (name:string, id:string) =>{
		setTopic(name)
	}
	const queryTopicChatHis = () => {
		if (topic === ''){
			Modal.warning({
				content: t('event_tips')
			})
		}else{
			command.get_topic_chat_his(id, topic, activeTown).then((res) => {
				setTopicChatHis(res)
			})
		}
	}

	const tabContent = (key: string) => {
		return (
			<>
				{key === 'summary' &&
            <SummaryComponent activeId={id} onShowProgress={onShowProgress}/>
				}
				{key === 'query' &&
					<QueryEmbeddingComponent activeId={id} onShowProgress={onShowProgress} />
				}
				{key === 'library' &&
            <SharedKnowledges inTab={true} activeId={id} visible={true} canSelect={true} onClose={()=>{}}/>
				}
				{key === 'topic' &&
					<div style={{overflow:"scroll", height:490}}>
              <TextArea style={{marginBottom: 10}} value={topic} placeholder={t('topicTips')} rows={2} onChange={(e) => topicInput(e)}/>
							<Row>
									<Col span={8}>
                      <Button onClick={()=>setShowTopics(true)}>{t('event_pick')}</Button>
									</Col>
                  <Col span={8}>
                      <Button onClick={()=>queryTopicChatHis()}>{t('event_query')}</Button>
                  </Col>
                  <Col span={8}>
                      <Button type={"primary"} onClick={handleTodayEvent}>{t('event')}</Button>
                  </Col>
							</Row>
            <List
              itemLayout="vertical"
              size="small"
              split={false}
              dataSource={topicChatHis}
              renderItem={(item, index) => {
								return (
									<List.Item
										key={index}
									>
										<Row>
											<Col span={24}>
												<h5>{item}</h5>
											</Col>
										</Row>
									</List.Item>
								)
							}}
            />
					</div>
				}
			</>
		)
	}
	const tabs =[
		{label: t('summary'), key:"summary", icon: <ExperimentOutlined />},
		{label: t('query'), key:"query", icon: <SearchOutlined />},
		{label: t('library'), key:"library", icon: <BankOutlined />},
		{label: t('topic'), key:"topic", icon: <CommentOutlined/>},
	]
	return (
		<div className={styles.user_feed_container}>
			{ mobile &&
        <div style={{overflow: "scroll", height: 560}}>
          {activeTown === 'study' &&
              <Tabs
                  centered
                  tabBarGutter={40}
                  size={"middle"}
                  type={"line"}
                  animated={true}
                  tabPosition="top"
                  activeKey={activeTab}
                  onChange={(key) => setActivTab(key)}
                  items={tabs.map((tab, i) => {
				            return {
					            label: tab.label,
					            key: tab.key,
					            children: tabContent(tab.key),
					            icon: tab.icon
				            };
			            })}
              />
          }
        </div>
			}
			<HotTopics town={activeTown} activeId={id} onClose={()=>setShowTopics(false)} visible={showTopics} canSelect={false} onSelectName={onSelectTopic}/>
		</div>
	)
}


export default StudyTownCompoent
