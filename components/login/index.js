import React, { useState } from 'react';
import styles from './ModalLogin.module.css';
import {Flex, Select} from "antd";
import commandDataContainer from "../../container/command";

function ModalLogin({ isOpen, onClose, tips, options, mobile=false }) {
	const [username, setUsername] = useState('');
	const [userid, setUserid] = useState('');
	const command = commandDataContainer.useContainer()

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
			onClose(userid)
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
				<span className={styles.close_button} onClick={() => onClose('')}>&times;</span>
				<h5>{tips('notLoginTips')}</h5>
				<div className={styles.form_group}>
					<label>{tips('loginSelect')}</label>
					<Flex gap="middle" vertical={false} align="center" justify={"space-evenly"}>
						<select className={styles.login} id="userid" name="userid" onChange={userIdChange}>
							{options.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
						<button className={styles.login} onClick={handleLogin}>{tips('buttonLogin')}</button>
					</Flex>
				</div>
				<div className={styles.form_group}>
					<label>{tips('loginCreate')}</label>
					<Flex gap="middle" vertical={false} align="center" justify={"space-evenly"}>
						<input className={styles.login} id="username" name="username" onChange={usernameInput}/>
						<button className={styles.login} onClick={handleRegister}>{tips('buttonRegister')}</button>
					</Flex>
				</div>
			</div>
		</div>
	);
}

export default ModalLogin;
