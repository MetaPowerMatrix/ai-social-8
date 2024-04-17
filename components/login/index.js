import React, { useState } from 'react';
import styles from './ModalLogin.module.css';
import {Button, Col, Flex, Modal, Row, Select} from "antd";
import commandDataContainer from "../../container/command";
import {CloseOutlined, ExclamationCircleFilled} from "@ant-design/icons";
import {useTranslations} from "next-intl";

function ModalLogin({ isOpen, onClose, tips, options, mobile=false }) {
	const [username, setUsername] = useState('');
	const [userid, setUserid] = useState('');
	const command = commandDataContainer.useContainer()
	const t = useTranslations('Login');
	const {confirm} = Modal;

	const handleLogin = (event) => {
		event.preventDefault();
		// alert(userid)
		onClose(userid)
	};
	const handleRegister = async (event) => {
		event.preventDefault();
		if (username === "") {
			alert(t("name_tips"))
			return
		}
		let userid = await command.create_pato(username)
		if (userid !== "" || userid !== null) {
			// alert("创建成功")
			let localInfoStr = localStorage.getItem("local_patos")
			if (localInfoStr === null){
				const localInfo ={ids: [`${userid}:${username}`], active_id: `${userid}`}
				localStorage.setItem("local_patos", JSON.stringify(localInfo))
			}else{
				const localInfo = JSON.parse(localInfoStr)
				localInfo.ids.push(`${userid}:${username}`)
				const newlocalInfo = {ids: localInfo.ids, active_id: `${userid}`}
				localStorage.setItem("local_patos", JSON.stringify(newlocalInfo))
			}
			confirm({
				icon: <ExclamationCircleFilled />,
				content: t('login_tips'),
				okText: t('confirm'),
				cancelText: t('cancel'),
				onOk() {
					onClose(userid)
				}
			})
		}
	};
	const userIdChange = (event) => {
		event.preventDefault();
		setUserid(event.target.value)
	}
	const usernameInput = (event) => {
		event.preventDefault();
		setUsername(event.target.value)
	}

	if (!isOpen) return null;

	return (
		<div className={styles.modal}>
			<div className={mobile ? styles.modal_content_mobile : styles.modal_content}>
				<CloseOutlined onClick={() => onClose('')}/>
				<h4 style={{marginBottom:70, textAlign:"center"}}>{tips('notLoginTips')}</h4>
				<div className={styles.form_group}>
					<Row align={"middle"}>
						<Col span={16}>
							<select style={{padding:10, width:"100%"}} id="userid" name="userid" onChange={userIdChange}>
								{options.map((option) => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</select>
						</Col>
						<Col span={8} style={{textAlign:"end"}}>
							<Button type={"primary"} onClick={handleLogin}>{tips('buttonLogin')}</Button>
						</Col>
					</Row>
				</div>
				<div>
					<Row align={"middle"}>
						<Col span={16}>
							<input placeholder={tips('loginCreate')} style={{padding:10, width:"100%"}}  id="username" name="username" onChange={usernameInput}/>
						</Col>
						<Col span={8} style={{textAlign:"end"}}>
							<Button type={"primary"} onClick={handleRegister}>{tips('buttonRegister')}</Button>
						</Col>
					</Row>
				</div>
			</div>
		</div>
	);
}

export default ModalLogin;
