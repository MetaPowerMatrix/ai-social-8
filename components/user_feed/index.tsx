import {Button, Col, Divider, Row, Timeline} from "antd";
import React, {useState} from "react";
import {TimeLineItem} from "@/common";
import styles from './UserFeedMobile.module.css'
import TextArea from "antd/es/input/TextArea";
import {useTranslations} from "next-intl";

const towns =[
	{label: '音乐小镇', value: 'music'},
	{label: '财富小镇', value: 'invest'},
	{label: '文学小镇', value: 'literature'},
	{label: 'web3小镇', value: 'web3'},
	{label: '科学小镇', value: 'science'},
]
const UserFeedMobile = ({userFeed, mobile}:{userFeed: TimeLineItem[], mobile: boolean}) => {
	const [town, setTown] = React.useState('')
	const [townTopic, setTownTopic] = useState('');
	const t = useTranslations('discovery');

	const townChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		event.preventDefault()
		setTown(event.target.value)
	}
	const topicInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		event.preventDefault();
		setTownTopic(event.target.value)
	}

	return (
		<div className={styles.user_feed_container}>
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
	          <Col span={24}>
	              <Button style={{marginTop:10,width:"100%"}} size={"small"} type={"primary"}>加入</Button>
	          </Col>
          </Row>
						<Divider/>
        </>
			}
			<Row>
				<Col span={24}>
					<div style={{marginTop: 20, height: 420, overflowY: "auto", padding: 15, border: "1px dotted blue"}}>
						<Timeline
							mode={"alternate"}
							items={userFeed}
						/>
					</div>
				</Col>
			</Row>
		</div>
	)
}


export default UserFeedMobile
