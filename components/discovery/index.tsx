import React, {useState} from "react";
import {Col, Row} from "antd";
import styles from "./DiscoveryComponent.module.css";
import {RightOutlined} from "@ant-design/icons";
import {useTranslations} from "next-intl";
import SummaryComponent from "@/components/summary";
import QueryEmbeddingComponent from "@/components/query_embedding";

const DiscoveryComponent = ({id, onShowProgress, showLiveChat}:{id:string, onShowProgress: (s: boolean)=>void, showLiveChat:()=>void}) => {
	const [showSummary, setShowSummary] = useState<boolean>(false);
	const [showQuery, setShowQuery] = useState<boolean>(false);
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
			<Row className={styles.header_meta} onClick={() => {setShowSummary(true)}}>
				<Col className={styles.colorBar} span={12}>
					<h5>{t("summary")}</h5>
				</Col>
				<Col className={styles.colorBarEnd} span={12}>
					<h5><RightOutlined/></h5>
				</Col>
			</Row>
			<Row className={styles.header_meta} onClick={() => {setShowQuery(true)}}>
				<Col className={styles.colorBar} span={12}>
					<h5>{t("query")}</h5>
				</Col>
				<Col className={styles.colorBarEnd} span={12}>
					<h5><RightOutlined/></h5>
				</Col>
			</Row>
			<SummaryComponent onClose={()=>setShowSummary(false)} activeId={id} visible={showSummary} onShowProgress={onShowProgress}/>
			<QueryEmbeddingComponent activeId={id} visible={showQuery} onShowProgress={onShowProgress} onClose={()=>setShowQuery(false)}/>
		</div>
	)
}

export default DiscoveryComponent;
