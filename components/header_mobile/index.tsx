import {Button, Col, Descriptions, Divider, Flex, Row, Timeline} from "antd";
import Image from "next/image";
import utilStyles from "@/styles/utils.module.css";
import {EditOutlined, QrcodeOutlined, RightOutlined} from "@ant-design/icons";
import React, {useEffect, useState} from "react";
import commandDataContainer from "@/container/command";
import {useTranslations} from "next-intl";
import {PatoInfo, Persona, StatsInfo, TimeLineItem} from "@/common";
import TaskPanel from "@/components/taskPanel";
import styles from './HeaderPanelMobile.module.css'
import ISSForm from "@/components/iss";

const HeaderPanelMobile = ({activeId, onChangeId, onShowProgress, showQRCode, showDeposit}:
   {activeId:string,
	   onShowProgress: (s: boolean)=>void, onChangeId: (s: boolean)=>void,
	   showQRCode: ()=>void,
	   showDeposit: ()=>void,
	 }) =>
{
	const [userInfo, setUserInfo] = useState<PatoInfo>();
	const command = commandDataContainer.useContainer()
	const [editISS, setEditISS] = useState(false);
	const [userISS, setUserISS] = useState<Persona>();
	const t = useTranslations('Login');

	const pad = function(src: Number, size: number) {
		let s = String(src);
		while (s.length < (size || 2)) {s = "0" + s;}
		return s;
	};
	const copyToClipboard = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
			console.log('Text copied to clipboard');
		} catch (err) {
			console.error('Failed to copy text to clipboard: ', err);
		}
	};
	useEffect(() => {
		command.getPatoInfo(activeId).then((res): void => {
			if ( res !== null){
				setUserInfo(res);
			}
		})
		command.getPatoISS(activeId).then((res) => {
			if (res !== undefined){
				setUserISS(res)
			}
		})
	},[activeId]);

	return (
		<header className={styles.header_panel_mobile_container}>
			<Row justify="space-between" className={styles.header_user}>
				<Col span={8} style={{textAlign:"center", marginBottom: 20}}>
						<Image
							priority
							src="/images/notlogin.png"
							className={utilStyles.borderCircle}
							height={72}
							width={72}
							alt={userInfo?.name ?? ''}
						/>
				</Col>
				<Col span={16}>
					<h5 className={utilStyles.headingLg}>
						{userInfo?.name}
						<QrcodeOutlined  style={{marginLeft:10}} onClick={showQRCode}/>
					</h5>
					<a onClick={() => {
						copyToClipboard(userInfo?.id ?? '')
						alert("已复制ID")
					}}>{userInfo?.id === undefined ? '' : userInfo?.id.substring(0, 14) + '...' + userInfo?.id.substring(28, 36)}</a>
				</Col>
			</Row>
			<div className={styles.header_panel_mobile_info}>
			<Row className={styles.header_meta} onClick={()=> setEditISS(true)}>
				<Col span={12}>
					<h5>AI设定</h5>
				</Col>
				<Col className={styles.colorBarEnd} span={12}>
					<h5><RightOutlined /></h5>
				</Col>
			</Row>
			<Row className={styles.header_meta} onClick={showDeposit}>
				<Col className={styles.colorBar} span={12}>
					<h5>{t("Balance")}</h5>
				</Col>
				<Col className={styles.colorBarEnd} span={12}>
					<h5>{userInfo?.balance.toString()}<RightOutlined /></h5>
				</Col>
			</Row>
			<Row className={styles.header_meta}>
				<Col  className={styles.colorBar} span={12}>
					<h5>{t("MatrixTime")}</h5>
				</Col>
				<Col  className={styles.colorBarEnd} span={12}>
					<h5>{userInfo?.matrix_datetime}</h5>
				</Col>
			</Row>
			<Row className={styles.header_meta}>
				<Col  className={styles.colorBar} span={12}>
					<h5>{t("RegisteredTime")}</h5>
				</Col>
				<Col  className={styles.colorBarEnd} span={12}>
					<h5>{userInfo?.registered_datetime}</h5>
				</Col>
			</Row>
			<Row className={styles.header_meta}>
				<Col  className={styles.colorBar} span={12}>
					<h5>{t("SN")}</h5>
				</Col>
				<Col  className={styles.colorBarEnd} span={12}>
					<h5>{pad(userInfo=== undefined ? 0 : userInfo.sn, 5).toString()}</h5>
				</Col>
			</Row>
			<Row className={styles.header_meta}>
				<Col className={styles.colorBar} span={12}>
					<h5>{t("pro")}</h5>
				</Col>
				<Col  className={styles.colorBarEnd} span={12}>
					<h5>{userInfo?.professionals.join(' ')}</h5>
				</Col>
			</Row>
			<Row style={{padding:10}}>
				<Col span={24}>
					<Button style={{width: "100%"}} type={"primary"} onClick={() => onChangeId(false)}>切换账号</Button>
				</Col>
			</Row>
			</div>
			<ISSForm mobile={true} userISS={userISS!} visible={editISS} id={activeId} onClose={()=>{setEditISS(false)}}/>
		</header>
	)
}

export default HeaderPanelMobile
