import React, {useEffect} from 'react';
import {useTranslations} from "next-intl";
import styles from "./AuthorizeComponent.module.css"
import commandDataContainer from "@/container/command";
import {getCookie} from "@/lib/utils";
import {Button, Col, Row} from "antd";

interface AuthorizeComponentProps {
	mobile: boolean;
}

const currentUrl = window.location.href;
const searchParams = new URLSearchParams(currentUrl);

const paramName = 'owner';
const token = searchParams.get(paramName);

console.log(token);

const AuthorizeComponent: React.FC<AuthorizeComponentProps> = ({mobile}) => {
	const t = useTranslations('others');
	const [id, setId] = React.useState<string>('');
	const [name, setName] = React.useState<string>('');

	const command = commandDataContainer.useContainer()

	useEffect(() => {
			command.queryPatoAuthToken(token).then((res) => {
				if (res.length > 1) {
					setId(res[0])
					setName(res[1])
				}
			})
	},[id])

	const handleAccept = (values: any) => {
		// let userid = "b120f295-fcaf-4ddf-a3f3-ac0fc54a5093"
		// let username = "Luca Williams"
		let ids = getCookie('authorized-ids');
		document.cookie = `authorized-ids=${ids},${id}:${name}`;
		alert(t('acceptOK'))
	};

	return (
		<div className={styles.authorize_container}>
			<div className={ mobile ? styles.authorize_content_mobile : styles.authorize_content}>
				<Row>
					<Col span={24} style={{textAlign: "center"}}>
						<div><h5>{t("tipsAuthorize")}</h5></div>
						<Button onClick={handleAccept}>接受</Button>
					</Col>
				</Row>
			</div>
		</div>
	);
}

export default AuthorizeComponent;
