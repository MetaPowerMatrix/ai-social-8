import React, { useState } from 'react';
import styles from './ModalLogin.module.css';
import {Flex, Select} from "antd";
import commandDataContainer from "../../container/command";
import {getCookie} from "@/lib/utils";

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
		// document.cookie = "username=John Doe; path=/; max-age=3600; secure";
		event.preventDefault();
		if (username === "") {
			alert("给你的Pato起一个响亮的名字吧！")
			return
		}
		let userid = await command.create_pato(username)
		if (userid !== "" || userid !== null) {
			// alert("创建成功")
			let ids = getCookie('available-ids');
			document.cookie = `active-id=${userid}`;
			document.cookie = `available-ids=${ids},${userid}:${username}`;
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
