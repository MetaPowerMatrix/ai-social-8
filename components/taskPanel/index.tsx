import {Button, Card, Flex, Form, GetProp, List, Select, Upload, UploadFile, UploadProps} from "antd";
import React, {useState} from "react";
import {useTranslations} from 'next-intl';
import TextArea from "antd/es/input/TextArea";
import commandDataContainer from "@/container/command";
import styles from "./TaskPanel.module.css"
import {UploadOutlined} from "@ant-design/icons";
import {api_url} from "@/common";

const TaskPanel = ({id}:{id: string}) => {
	const t = useTranslations('Task');
	const command = commandDataContainer.useContainer()
	const [userPray, setUserPray] = useState('');
	const [dailySpecial, setDailySpecial] = useState('');
	const [knowledge, setKnowledge] = useState('');
	const [fileList, setFileList] = useState<UploadFile[]>([]);
	type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

	const handlePray = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		// document.cookie = "username=John Doe; path=/; max-age=3600; secure";
		event.preventDefault();
		command.pray(id, userPray).then((response) => {
			alert('God received')
		})
	};
	const prayInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		event.preventDefault();
		setUserPray(event.target.value)
	}
	const dailyInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		event.preventDefault();
		setDailySpecial(event.target.value)
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
		const formData = new FormData();
		formData.append('file', fileList[0] as FileType);
		formData.append('message', JSON.stringify({ id: id, message: knowledge}));

		let url = api_url.portal.task.upgrade
		fetch(url, {
			method: 'POST',
			body: formData,
		})
			.then(response => response.json())
			.then(data => {
				console.log('Success:', data);
				alert('Upload successful!');
			})
			.catch((error) => {
				console.error('Error:', error);
				alert('Upload failed.');
			});
	};

	return(
			<Flex vertical justify="space-around" align="flex-start" gap={80}>
				<Card hoverable style={{width: 260, backgroundColor: "#e9f5f9"}} title={t('taskDaily')}>
					<TextArea placeholder={t('taskDailyTips')} rows={4} onChange={(e) => dailyInput(e)}/>
					<button className={styles.task} onClick={(e) => handlePray(e)}>{t('view')}</button>
				</Card>
				<Card hoverable style={{width: 260, backgroundColor: "#e9f5f9"}} title={t('taskPray')}>
					<TextArea placeholder={t('taskPrayTips')} rows={4} onChange={(e) => prayInput(e)}/>
					<button className={styles.task} onClick={(e) => handlePray(e)}>{t('submit')}</button>
				</Card>
				<Card hoverable style={{width: 260, backgroundColor: "#e9f5f9"}} title={t('taskUpgrade')}>
					<TextArea style={{marginBottom: 10}} placeholder={t('knowledgeTips')} rows={2} onChange={(e) => knowledgeInput(e)}/>
					<Upload {...props}>
						<Button icon={<UploadOutlined />}>{t('Upload')}</Button>
					</Upload>
					<button className={styles.task} onClick={(e) => handleKnowledge(e)}>{t('start')}</button>
				</Card>
			</Flex>
	)
}

export default TaskPanel;
