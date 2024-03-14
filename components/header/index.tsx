import {Descriptions, Flex} from "antd";
import Image from "next/image";
import utilStyles from "@/styles/utils.module.css";
import {EditOutlined} from "@ant-design/icons";
import React, {useEffect, useState} from "react";
import commandDataContainer from "@/container/command";
import {useTranslations} from "next-intl";
import {StatsInfo} from "@/common";

const HeaderPanel = ({activeName, activeId, onChangeId}:{activeName: string, activeId:string, onChangeId: (s: boolean)=>void}) => {
	const [userInfo, setUserInfo] = useState<StatsInfo[]>([]);
	const command = commandDataContainer.useContainer()
	const t = useTranslations('Login');

	const pad = function(src: Number, size: number) {
		let s = String(src);
		while (s.length < (size || 2)) {s = "0" + s;}
		return s;
	};

	useEffect(() => {
		command.getPatoInfo(activeId).then((res) => {
			if ( res !== null){
				let userStats: StatsInfo[] = []
				userStats.push({
					key: '1',
					label: "ID",
					children: res.id.substring(0, 8) + '...' + res.id.substring(34, 35)
				})
				userStats.push({
					key: '2',
					label: t("Name"),
					children: res.name,
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
					children: '10',
				})
				setUserInfo(userStats);
			}
		})
	},[activeId]);

	return (
		<header>
			<Flex vertical={false} justify="space-around" align="center">
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
				<Descriptions bordered={true} column={6} layout="vertical" items={userInfo}/>
			</Flex>
		</header>
	)
}

export default HeaderPanel
