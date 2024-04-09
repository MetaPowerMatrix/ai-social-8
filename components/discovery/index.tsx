import React, {useState} from "react";
import {Col, Row} from "antd";
import styles from "./DiscoveryComponent.module.css";
import {RightOutlined} from "@ant-design/icons";
import {useTranslations} from "next-intl";

const DiscoveryComponent = ({showLiveChat}:{showLiveChat:()=>void}) => {
	const t = useTranslations('AIInstruct');

	return (
		<div className={styles.container}>
			<h4 style={{textAlign:"center"}}>发现</h4>
			<Row className={styles.header_meta} onClick={() => showLiveChat()}>
				<Col className={styles.colorBar} span={12}>
					<h5>{t("live")}</h5>
				</Col>
				<Col className={styles.colorBarEnd} span={12}>
					<h5><RightOutlined/></h5>
				</Col>
			</Row>
		</div>
	)
}

export default DiscoveryComponent;
