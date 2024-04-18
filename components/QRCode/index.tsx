import React, {useEffect, useState} from 'react';
import {useTranslations} from "next-intl";
import styles from "./QRCodeComponent.module.css"
import QRCode from 'qrcode.react';
import {Button, Col, Form, Modal, Row} from "antd";
import {CloseOutlined} from "@ant-design/icons";
import commandDataContainer from "@/container/command";
import {KolInfo} from "@/common";
import BuyKolComponent from "@/components/BuyKol";

interface QRCodeProps {
	visible: boolean;
	id: string,
	onClose: ()=>void;
	mobile: boolean;
}

const QRCodeComponent: React.FC<QRCodeProps> = ({visible, id, onClose, mobile}) => {
	const t = useTranslations('others');
	const [token, setToken] = React.useState<string>('');
	const [reload, setReload] = useState<number>(0)
	const [isKol, setIsKol] = useState<boolean>(false)
	const [showBuyKol, setShowBuyKol] = useState<boolean>(false)
	const command = commandDataContainer.useContainer()

	useEffect(() => {
		command.query_kol_rooms().then((res) => {
			res.forEach((info) => {
				console.log(info)
				if (info.id === id) {
					setIsKol(true)
				}
			})
		})
		command.genPatoAuthToken(id).then((res) => {
			setToken(res)
		})
	},[id, reload])

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
				{
					isKol ?
						<>
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
						</>
						:
						<div style={{textAlign: "center"}}>
							<h5 style={{display: 'inline-block'}}>{t('shouldKol')}</h5>
							<a onClick={()=>setShowBuyKol(true)}>
								{t("buyKol")}
							</a>
						</div>
				}
			</div>
			<BuyKolComponent id={id} room_id={''}
			                 onClose={()=> {
												 setReload(reload+1)
				                 setShowBuyKol(false)
			                 }}
			                 visible={showBuyKol} onShowProgress={()=>{}} buyWhat={'kol'}
			/>
		</div>
	);
}

export default QRCodeComponent;
