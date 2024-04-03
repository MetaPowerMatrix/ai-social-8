import {Button, Col, Row, Timeline} from "antd";
import React from "react";
import {TimeLineItem} from "@/common";
import styles from './UserFeedMobile.module.css'

const towns =[
	{label: '音乐小镇', value: 'music'},
	{label: '财富小镇', value: 'invest'},
	{label: '文学小镇', value: 'literature'},
	{label: 'web3小镇', value: 'web3'},
	{label: '科学小镇', value: 'science'},
]
const UserFeedMobile = ({userFeed, mobile}:{userFeed: TimeLineItem[], mobile: boolean}) => {
	const [town, setTown] = React.useState('')
	const townChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		event.preventDefault()
		setTown(event.target.value)
	}
	return (
		<div className={styles.user_feed_container}>
			{ mobile &&
          <Row align={"middle"}>
              <Col span={6} style={{textAlign:"center"}}>
	              <label>小镇传送：</label>
              </Col>
              <Col span={12} style={{textAlign:"start"}}>
                  <select style={{width: 180, padding:5}} id="town" name="town" onChange={(e) => townChange(e)}>
										{towns.map((option) => (
											<option key={option.value} value={option.value}>
												{option.label}
											</option>
										))}
                  </select>
              </Col>
              <Col span={1}>
	              <Button size={"small"} type={"primary"}>加入</Button>
              </Col>
          </Row>
			}
			<Row>
				<Col span={24}>
					<div style={{marginTop: 20, height: 590, overflowY: "auto", padding: 15, border: "1px dotted blue"}}>
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
