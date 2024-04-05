import {Button, Col, Divider, Row, Timeline} from "antd";
import React, {useState} from "react";
import {TimeLineItem} from "@/common";
import styles from './UserFeedMobile.module.css'
import TextArea from "antd/es/input/TextArea";
import {useTranslations} from "next-intl";
import commandDataContainer from "@/container/command";
import HotAI from "@/components/HotAI";

const towns =[
	{label: '音乐小镇', value: 'music'},
	{label: '财富小镇', value: 'invest'},
	{label: '文学小镇', value: 'literature'},
	{label: 'web3小镇', value: 'web3'},
	{label: '科学小镇', value: 'science'},
]
const UserFeedMobile = ({id, userFeed, mobile}:{id: string, userFeed: TimeLineItem[], mobile: boolean}) => {
	const [town, setTown] = React.useState('')
	const [townTopic, setTownTopic] = useState('');
	const [showHot, setShowHot] = useState<boolean>(false)
	const command = commandDataContainer.useContainer()
	const t = useTranslations('discovery');

	const townChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		event.preventDefault()
		setTown(event.target.value)
	}
	const topicInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		event.preventDefault();
		setTownTopic(event.target.value)
	}

	const handleJoin = () => {
		command.goTown(id, town, townTopic).then((res) => {
			alert("加入成功")
		})
	}

	return (
		<div className={styles.user_feed_container}>
			<h4 style={{textAlign:"center"}}>小镇</h4>
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
		          <Col span={24}>
                  <TextArea placeholder={t('topicTips')} rows={3} onChange={(e) => topicInput(e)}/>
		          </Col>
          </Row>
          <Row>
	          <Col span={20}>
	              <Button onClick={handleJoin} style={{marginTop:10,width:"90%"}} size={"small"} type={"primary"}>加入</Button>
	          </Col>
              <Col span={4}>
                  <Button onClick={()=>setShowHot(true)} style={{marginTop:10}} size={"small"}>小镇社牛</Button>
              </Col>
          </Row>
        </>
			}
			<Row>
				<Col span={24}>
					<div style={{marginTop: 20, height: 412, overflowY: "auto", padding: 15, border: "1px dotted blue"}}>
						<Timeline
							mode={"alternate"}
							items={userFeed}
						/>
					</div>
				</Col>
			</Row>
			<HotAI onClose={()=>setShowHot(false)} visible={showHot} canSelect={false} onSelectName={()=>{}}/>
		</div>
	)
}


export default UserFeedMobile
