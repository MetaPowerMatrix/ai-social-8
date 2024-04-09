import {Button, Col, Modal, Row, Tabs, Timeline} from "antd";
import React, {useState} from "react";
import styles from './UserFeedMobile.module.css'
import {useTranslations} from "next-intl";
import commandDataContainer from "@/container/command";
import HotAI from "@/components/HotAI";
import {
	CheckOutlined,
	CommentOutlined,
	ExclamationCircleFilled,
	RedditOutlined,
	ShareAltOutlined
} from "@ant-design/icons";
import SummaryComponent from "@/components/summary";
import QueryEmbeddingComponent from "@/components/query_embedding";
import SharedKnowledges from "@/components/SharedKnowledges";
import HotTopics from "@/components/HotTopics";

const towns =[
	{label: '学习小镇', value: 'study'},
	{label: '音乐小镇', value: 'music'},
	{label: '财富小镇', value: 'invest'},
	{label: '文学小镇', value: 'literature'},
	{label: 'web3小镇', value: 'web3'},
	{label: '科学小镇', value: 'science'},
]
const TwonMobile = ({id, mobile, onShowProgress}:{id: string, mobile: boolean, onShowProgress: (s: boolean)=>void}) => {
	const [showHot, setShowHot] = useState<boolean>(false)
	const [showShared, setShowShared] = useState<boolean>(false)
	const [showTopics, setShowTopics] = useState<boolean>(false)
	const [sharedSig, setSharedSig] = useState<string>('')
	const [activeTab, setActivTab] = useState('summary');
	const [activeTown, setActivTown] = useState('study');
	const command = commandDataContainer.useContainer()
	const t = useTranslations('discovery');
	const {confirm} = Modal;

	const townChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		event.preventDefault()
		Modal.info({
			content: t('select_town_tips')
		})
		setActivTown(event.target.value)
	}
	const handleJoin = () => {
		confirm({
			icon: <ExclamationCircleFilled/>,
			content: t('join_tips'),
			okText: t('confirm'),
			cancelText: t('cancel'),
			onOk() {
				command.goTown(id, activeTown, '').then((res) => {
					Modal.success({
						content: t("join_ok"),
					});
				})
			}
		})
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
			</>
		)
	}
	const tabs =[
		{label: t('summary'), key:"summary", icon: <RedditOutlined />},
		{label: t('query'), key:"query", icon: <CommentOutlined/>},
	]
	return (
		<div className={styles.user_feed_container}>
			<h4 style={{textAlign:"center"}}>{t('town')}</h4>
			{ mobile &&
				<>
          <Row align={"middle"}>
              <Col span={24} style={{textAlign:"start"}}>
                  <select style={{width: "100%", padding:5, marginBottom:10}} id="town" name="town" onChange={(e) => townChange(e)}>
										{towns.map((option) => (
											<option key={option.value} value={option.value}>
												{option.label}
											</option>
										))}
                  </select>
              </Col>
          </Row>
          <Row>
	          <Col span={6}>
	              <Button onClick={handleJoin} style={{marginTop:10,width:"90%"}} size={"small"} type={"primary"}>{t('join')}</Button>
	          </Col>
            <Col span={6}>
	            <Button style={{marginTop:10,width:"90%"}} size={"small"} onClick={()=>{
			          Modal.info({
				          content: t('sharedKnowledge'),
				          onOk(){
					          setShowShared(true)
				          }
			          })
		          }}>{t('library')}</Button>
            </Col>
            <Col span={6}>
                <Button onClick={()=>{
                  Modal.info({
	                  content: t('sheniu_tips'),
	                  onOk() { setShowHot(true) },
                  });
                }} style={{marginTop:10,width:"90%"}} size={"small"}>{t('hot')}</Button>
            </Col>
              <Col span={6}>
                  <Button style={{marginTop:10,width:"90%"}} size={"small"} onClick={()=>{
					          Modal.info({
						          content: t('topic_tips'),
						          onOk() { setShowTopics(true) },
					          });
									}}>
	                  {t('topics')}
                  </Button>
              </Col>
          </Row>
            <div style={{overflow: "scroll", height: 508}}>
	            {activeTown === 'study' &&
                  <Tabs
                      centered
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
        </>
			}
			<SharedKnowledges activeId={id} visible={showShared} canSelect={true} onSelectName={(title, sig)=>{
				// alert(title)
				setSharedSig(sig)
				setShowShared(false)
			}} onClose={()=>setShowShared(false)}/>
			<HotAI onClose={()=>setShowHot(false)} visible={showHot} canSelect={false} onSelectName={()=>{}}/>
			<HotTopics activeId={id} onClose={()=>setShowTopics(false)} visible={showTopics} canSelect={false} onSelectName={()=>{}}/>
		</div>
	)
}


export default TwonMobile
