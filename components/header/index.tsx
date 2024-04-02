import {Col, Descriptions, Divider, Flex, Row, Timeline} from "antd";
import Image from "next/image";
import utilStyles from "@/styles/utils.module.css";
import {EditOutlined} from "@ant-design/icons";
import React, {useEffect, useState} from "react";
import commandDataContainer from "@/container/command";
import {useTranslations} from "next-intl";
import {StatsInfo, TimeLineItem} from "@/common";

const HeaderPanel = ({activeName, activeId, userFeed, onChangeId}:{activeName: string, activeId:string, userFeed: TimeLineItem[], onChangeId: (s: boolean)=>void}) => {
	const [userInfo, setUserInfo] = useState<StatsInfo[]>([]);
	const command = commandDataContainer.useContainer()
	const t = useTranslations('Login');

	const pad = function(src: Number, size: number) {
		let s = String(src);
		while (s.length < (size || 2)) {s = "0" + s;}
		return s;
	};

	useEffect(() => {
		command.getPatoInfo(activeId).then((res): void => {
			if ( res !== null){
				let userStats: StatsInfo[] = []
				userStats.push({
					key: '1',
					label: "ID",
					children: <a onClick={()=>alert(res.id)}>{res.id.substring(0, 8) + '...' + res.id.substring(32, 36)}</a>
				})
				userStats.push({
					key: '3',
					label: t("MatrixTime"),
					children: res.matrix_datetime,
				})
				userStats.push({
					key: '4',
					label: t("RegisteredTime"),
					children: res.registered_datetime,
				})
				userStats.push({
					key: '5',
					label: t("SN"),
					children: pad(res.sn, 5).toString(),
				})
				userStats.push({
					key: '6',
					label: t("Balance"),
					children: res.balance.toString(),
				})
				userStats.push({
					key: '7',
					label: t("pro"),
					children: res.professionals.join(','),
				})
				setUserInfo(userStats);
			}
		})
	},[activeId]);

	return (
		<header>
			<Row justify="space-between">
				<Col span={4}>
					<Flex gap="middle" vertical align="center">
						<Image
							priority
							src="/images/notlogin.png"
							className={utilStyles.borderCircle}
							height={72}
							width={72}
							alt={activeName}
						/>
						<Flex gap="middle" vertical={false} align="center">
							<h5 className={utilStyles.headingLg}>
								{activeName.length > 14 ? activeName.substring(0, 8) + '...' : activeName}
							</h5>
							<EditOutlined onClick={() => onChangeId(false)}/>
						</Flex>
					</Flex>
				</Col>
				<Col span={12}>
					<Descriptions style={{marginLeft:10}} size={"small"} bordered={true} column={3} layout="vertical" items={userInfo}/>
				</Col>
				<Col span={7}>
					<div style={{height: "155px", overflowY: "auto", padding:15, border:"1px dotted blue"}}>
						<Timeline
							mode={"alternate"}
							items={userFeed}
						/>
					</div>
				</Col>
			</Row>
		</header>
)
}

export default HeaderPanel
