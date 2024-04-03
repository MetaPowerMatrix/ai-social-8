import {Col, Row, Timeline} from "antd";
import React from "react";
import {TimeLineItem} from "@/common";
import styles from './UserFeedMobile.module.css'

const UserFeedMobile = ({userFeed}:{userFeed: TimeLineItem[]}) => {
	return (
		<div className={styles.user_feed_container}>
			<Row>
				<Col span={24}>
					<div style={{marginTop:20, height: 620, overflowY: "auto", padding:15, border:"1px dotted blue"}}>
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
