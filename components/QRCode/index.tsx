import React, {useEffect} from 'react';
import {useTranslations} from "next-intl";
import styles from "./QRCodeComponent.module.css"
import QRCode from 'qrcode.react';
import {Col, Modal, Row} from "antd";
import {CloseOutlined} from "@ant-design/icons";
import commandDataContainer from "@/container/command";

interface QRCodeProps {
	visible: boolean;
	id: string,
	onClose: ()=>void;
	mobile: boolean;
}

const QRCodeComponent: React.FC<QRCodeProps> = ({visible, id, onClose, mobile}) => {
	const t = useTranslations('others');
	const [token, setToken] = React.useState<string>('');
	const command = commandDataContainer.useContainer()

	useEffect(() => {
		command.genPatoAuthToken(id).then((res) => {
			setToken(res)
		})
	},[visible])

	const copyToClipboard = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
			console.log('Text copied to clipboard');
		} catch (err) {
			console.error('Failed to copy text to clipboard: ', err);
		}
	};

	return (
		<div hidden={!visible} className={styles.qrcode_container}>
			<div className={ mobile ? styles.qrcode_content_mobile : styles.qrcode_content}>
				<Row>
					<Col span={8}>
						<CloseOutlined style={{color: "black", fontSize: 20}} onClick={() => onClose()}/>
					</Col>
				</Row>
				<Row>
					<Col span={24} style={{textAlign: "center"}}>
						<div><h5>{t("tipsQRCode")}</h5></div>
						<QRCode value={"https://social.metapowermatrix.ai/authorize?owner=" + token}/>
						<div><a>
							<span onClick={() => {
								copyToClipboard("https://social.metapowermatrix.ai/authorize?owner=" + token)
								Modal.success({
									content: (t('copied'))
								})
							}}>{t('copy')}
							</span>
						</a>
						</div>
					</Col>
				</Row>
			</div>
		</div>
	);
}

export default QRCodeComponent;
