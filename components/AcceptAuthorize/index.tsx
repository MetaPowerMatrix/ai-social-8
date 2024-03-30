import React from 'react';
import {useTranslations} from "next-intl";
import styles from "./AuthorizeComponent.module.css"
import commandDataContainer from "@/container/command";
import Image from "next/image";
import {getCookie} from "@/lib/utils";
import {Button, Col, Row} from "antd";

interface AuthorizeComponentProps {
	mobile: boolean;
}

const AuthorizeComponent: React.FC<AuthorizeComponentProps> = ({mobile}) => {
	const t = useTranslations('others');
	const command = commandDataContainer.useContainer()

	const handleAccept = (values: any) => {
		let userid = ""
		let username = ""
		let ids = getCookie('authorized-ids');
		document.cookie = `authorized-ids=${ids},${userid}:${username}`;
	};

	return (
		<div className={styles.authorize_container}>
			<div className={ mobile ? styles.authorize_content_mobile : styles.authorize_content}>
				<Row>
					<Col span={24} style={{textAlign: "center"}}>
						<div><h5>{t("tipsAuthorize")}</h5></div>
						<Button>接受</Button>
					</Col>
				</Row>
			</div>
		</div>
	);
}

export default AuthorizeComponent;
