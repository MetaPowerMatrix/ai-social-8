import {Button, Card, Flex, Form, GetProp, List, Select, Upload, UploadFile, UploadProps} from "antd";
import React, {useState} from "react";
import {useTranslations} from 'next-intl';
import TextArea from "antd/es/input/TextArea";
import commandDataContainer from "@/container/command";
import styles from "./TaskPanel.module.css"
import {UploadOutlined} from "@ant-design/icons";
import {api_url, getApiServer} from "@/common";

const TaskPanel = ({id, onShowProgress}:{id: string, onShowProgress: (s: boolean)=>void}) => {
	const t = useTranslations('Task');
	const command = commandDataContainer.useContainer()
	const [userPray, setUserPray] = useState('');
	const [dailyEvent, setDailyEvent] = useState('');
	const [knowledge, setKnowledge] = useState('');
	const [fileList, setFileList] = useState<UploadFile[]>([]);
	const [panelWidth, setPanelWidth] = useState(300);
	type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

	const handlePray = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		onShowProgress(true);
		event.preventDefault();
		command.pray(id, userPray).then((response) => {
			alert('God received')
			onShowProgress(false);
		})
	};
	const handleTodayEvent = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		onShowProgress(true);
		event.preventDefault();
		command.create_today_event(id, dailyEvent).then((response) => {
			alert('waiting some one to talk')
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
		onShowProgress(true);
		event.preventDefault(); // Prevent the default form submission
		const formData = new FormData();
		formData.append('file', fileList[0] as FileType);
		formData.append('message', JSON.stringify({ id: id, message: knowledge}));

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
		<>
			<Flex vertical justify="space-around" align="flex-start" gap={40}>
				<Card size={"small"} hoverable style={{width: panelWidth, backgroundColor: "#e9f5f9"}} title={t('taskDaily')}>
					<TextArea placeholder={t('taskDailyTips')} rows={3} onChange={(e) => dailyInput(e)}/>
					<button className={styles.task} onClick={(e) => handleTodayEvent(e)}>{t('submit')}</button>
				</Card>
				<Card size={"small"} hoverable style={{width: panelWidth, backgroundColor: "#e9f5f9"}} title={t('taskUpgrade')}>
					<TextArea style={{marginBottom: 10}} placeholder={t('knowledgeTips')} rows={2} onChange={(e) => knowledgeInput(e)}/>
					<Upload {...props}>
						<Button icon={<UploadOutlined />}>{t('Upload')}</Button>
					</Upload>
					<button className={styles.task} onClick={(e) => handleKnowledge(e)}>{t('start')}</button>
				</Card>
				<Card size={"small"} hoverable style={{width: panelWidth, backgroundColor: "#e9f5f9"}} title={t('taskPray')}>
					<TextArea placeholder={t('taskPrayTips')} rows={2} onChange={(e) => prayInput(e)}/>
					<button className={styles.task} onClick={(e) => handlePray(e)}>{t('submit')}</button>
				</Card>
			</Flex>
		</>
	)
}

export default TaskPanel;
