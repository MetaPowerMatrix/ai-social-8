import React, {useEffect, useState} from 'react';
import {useTranslations} from "next-intl";
import styles from "./AuthorizeComponent.module.css"
import commandDataContainer from "@/container/command";
import {Button, Col, Row} from "antd";

interface AuthorizeComponentProps {
	mobile: boolean;
}

const AuthorizeComponent: React.FC<AuthorizeComponentProps> = ({mobile}) => {
	const t = useTranslations('others');
	const [id, setId] = React.useState<string>('');
	const [name, setName] = React.useState<string>('');
	const [jumpUrl, setJumpUrl] = React.useState<string>('');
	const [activeId, setActiveId] = useState("");

	const command = commandDataContainer.useContainer()

	useEffect(() => {
		const currentUrl = window.location.search;
		console.log(currentUrl)
		const searchParams = new URLSearchParams(currentUrl);
		const paramName = 'owner';
		const token = searchParams.get(paramName);
		command.queryPatoAuthToken(token).then((res) => {
			console.log(res)
			if (res.length > 1) {
				setId(res[0])
				setName(res[1])
			}
		})
		const localInfoStr = localStorage.getItem("local_patos")
		if (localInfoStr === null) {
			setJumpUrl('https://social.metapowermatrix.ai/mobile?to=accept&back='+ encodeURI(window.location.href))
		}else {
			const localInfo = JSON.parse(localInfoStr)
			setActiveId(localInfo.active_id);
		}
	},[])

	useEffect(() => {
		if (jumpUrl !== ''){
			window.location.href = jumpUrl;
		}
	},[jumpUrl])

	const handleAccept = (values: any) => {
		command.join_kol(id, activeId)
		alert(t('acceptOK'))
		setJumpUrl('https://social.metapowermatrix.ai/mobile?to=kol')
	};

	return (
		<div className={styles.authorize_container}>
			<div className={ mobile ? styles.authorize_content_mobile : styles.authorize_content}>
				<Row>
					<Col span={24} style={{textAlign: "center"}}>
						<div><h5>{name}{t("tipsAuthorize")}</h5></div>
						<Button onClick={handleAccept}>{t('accept')}</Button>
					</Col>
				</Row>
			</div>
		</div>
	);
}

export default AuthorizeComponent;
