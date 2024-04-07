import React, {useEffect} from 'react';
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

	const command = commandDataContainer.useContainer()

	useEffect(() => {
		const currentUrl = window.location.search;
		console.log(currentUrl)
		const searchParams = new URLSearchParams(currentUrl);
		const paramName = 'owner';
		const token = searchParams.get(paramName);

		console.log(token);

		command.queryPatoAuthToken(token).then((res) => {
			console.log(res)
			if (res.length > 1) {
				setId(res[0])
				setName(res[1])
			}
		})
	},[])

	useEffect(() => {
		if (jumpUrl !== ''){
			window.location.href = jumpUrl;
		}
	},[jumpUrl])

	const handleAccept = (values: any) => {
		let asInfoStr = localStorage.getItem("assistants")
		if (asInfoStr === null){
			const asInfo ={ids: [`${id}:${name}`]}
			localStorage.setItem("local_patos", JSON.stringify(asInfo))
		}else{
			const asInfo = JSON.parse(asInfoStr)
			asInfo.ids.push(`${id}:${name}`)
			const newAsInfo = {ids: asInfo.ids}
			localStorage.setItem("assistants", JSON.stringify(newAsInfo))
		}
		alert(t('acceptOK'))
		setJumpUrl('https://social.metapowermatrix.ai/mobile?to=instruct')
	};

	return (
		<div className={styles.authorize_container}>
			<div className={ mobile ? styles.authorize_content_mobile : styles.authorize_content}>
				<Row>
					<Col span={24} style={{textAlign: "center"}}>
						<div><h5>{name}{t("tipsAuthorize")}</h5></div>
						<Button onClick={handleAccept}>{t('accept')}</Button>
						<a href="https://social.metapowermatrix.ai/mobile?to=instruct">{t('go_talk')}</a>
					</Col>
				</Row>
			</div>
		</div>
	);
}

export default AuthorizeComponent;
