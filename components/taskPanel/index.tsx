import {Button, Card, Flex, GetProp, Upload, UploadFile, UploadProps} from "antd";
import React, {useState} from "react";
import {useTranslations} from 'next-intl';
import TextArea from "antd/es/input/TextArea";
import commandDataContainer from "@/container/command";
import styles from "./TaskPanel.module.css"
import {UploadOutlined} from "@ant-design/icons";
import {api_url, getApiServer} from "@/common";

const TaskPanel = ({id, panelWidth, onShowProgress }:{id: string, onShowProgress: (s: boolean)=>void, panelWidth: number}) => {
	const t = useTranslations('Task');
	const command = commandDataContainer.useContainer()
	const [userPray, setUserPray] = useState('');
	const [dailyEvent, setDailyEvent] = useState('');
	const [knowledge, setKnowledge] = useState('');
	const [fileList, setFileList] = useState<UploadFile[]>([]);
	type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

	const handlePray = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		event.preventDefault();
		if (userPray === ""){
			alert('祈祷是要说话的')
			return
		}
		onShowProgress(true);
		command.pray(id, userPray).then((response) => {
			alert('God received')
			onShowProgress(false);
		})
	};
	const handleTodayEvent = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		event.preventDefault();
		if (dailyEvent === ""){
			alert('说说你想聊的话题吧')
			return
		}
		onShowProgress(true);
		command.create_today_event(id, dailyEvent).then((response) => {
			alert('等一等，马上会有人来和你聊天了')
			onShowProgress(false);
		})
	};
	const prayInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		event.preventDefault();
		setUserPray(event.target.value)
	}
	const dailyInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		event.preventDefault();
		setDailyEvent(event.target.value)
	}
	const knowledgeInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		event.preventDefault();
		setKnowledge(event.target.value)
	}

	const props: UploadProps = {
		onRemove: (file) => {
			const index = fileList.indexOf(file);
			const newFileList = fileList.slice();
			newFileList.splice(index, 1);
			setFileList(newFileList);
		},
		beforeUpload: (file) => {
			setFileList([...fileList, file]);

			return false;
		},
		fileList,
	};
	const handleKnowledge= (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		event.preventDefault(); // Prevent the default form submission
		if (fileList.length <= 0){
			alert("书籍是人类智慧的结晶，上传你的结晶吧")
			return
		}
		const formData = new FormData();
		formData.append('file', fileList[0] as FileType);
		formData.append('message', JSON.stringify({ id: id, message: knowledge}));

		onShowProgress(true);
		let url = getApiServer(80) + api_url.portal.task.upgrade
		fetch(url, {
			method: 'POST',
			body: formData,
		})
			.then(response => response.json())
			.then(data => {
				// console.log('Success:', data);
				if (data.code === "200") {
					alert('Upload successful!');
				}else{
					alert('Upload failed.');
				}
				onShowProgress(false);
			})
			.catch((error) => {
				console.error('Error:', error);
				alert('Upload failed.');
				onShowProgress(false);
			});
	};

	return(
		<div>
				<Card size={"small"} hoverable style={{width: panelWidth, backgroundColor: "#e9f5f9"}} title={t('taskDaily')}>
					<TextArea placeholder={t('taskDailyTips')} rows={3} onChange={(e) => dailyInput(e)}/>
					<button className={styles.task} onClick={(e) => handleTodayEvent(e)}>{t('submit')}</button>
				</Card>
				<Card size={"small"} hoverable style={{width: panelWidth, backgroundColor: "#e9f5f9"}} title={t('taskUpgrade')}>
					<TextArea style={{marginBottom: 10, display: "none"}} placeholder={t('knowledgeTips')} rows={2} onChange={(e) => knowledgeInput(e)}/>
					<Upload {...props}>
						<Button icon={<UploadOutlined />}>{t('Upload')}</Button>
					</Upload>
					<button className={styles.task} onClick={(e) => handleKnowledge(e)}>{t('start')}</button>
				</Card>
				<Card size={"small"} hoverable style={{width: panelWidth, backgroundColor: "#e9f5f9"}} title={t('taskPray')}>
					<TextArea placeholder={t('taskPrayTips')} rows={2} onChange={(e) => prayInput(e)}/>
					<button className={styles.task} onClick={(e) => handlePray(e)}>{t('submit')}</button>
				</Card>
		</div>
	)
}

export default TaskPanel;
