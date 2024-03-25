import React, {useEffect, useState} from 'react';
import styles from "@/components/LiveChat/LiveChatComponent.module.css";
import {Button, Col, Divider, Form, GetProp, Input, Row, Upload, UploadFile, UploadProps} from "antd";
import {useTranslations} from "next-intl";
import {
	AudioOutlined,
	CloseOutlined,
	DownOutlined,
	UploadOutlined,
	UpOutlined
} from "@ant-design/icons";
import {api_url, getApiServer} from "@/common";
import Image from "next/image";

interface LiveChatPros {
	id: string,
	serverUrl: string;
	onClose: ()=>void;
	visible: boolean;
	onShowProgress: (s: boolean)=>void;
}

const LiveChatComponent: React.FC<LiveChatPros>  = ({visible, serverUrl, id, onClose, onShowProgress}) => {
	const [form] = Form.useForm();
	const t = useTranslations('LiveChat');
	const [fileList, setFileList] = useState<UploadFile[]>([]);
	const [hideSettings, setHideSettings] = useState<boolean>(true);

	const close_clean = () => {

	}
	// Function to initialize audio recording and streaming
	const initAudioStream = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			return handleAudioStream(stream);
		} catch (error) {
			console.error('Error accessing the microphone:', error);
		}
	};

	const handleAudioStream = (stream: MediaStream) => {
		const mediaRecorder = new MediaRecorder(stream);
		const socket = new WebSocket(serverUrl+"/up");

		mediaRecorder.ondataavailable = (event) => {
			if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
				socket.send(event.data);
			}
		};

		mediaRecorder.start(1000); // Start recording, and emit data every 100ms

		socket.onopen = () => {
			console.log('WebSocket connection established. Streaming can start.');
		};

		return socket
	};

	useEffect(() => {
		if (visible){
			initAudioStream().then((socket) => {
				return () => {
					if (socket !== undefined){
						socket.close();
					}
				}
			});
		}
	}, [visible]);

	// useEffect(() => {
	// 	// Create a new WebSocket connection to the Rust server
	// 	const ws = new WebSocket(serverUrl);
	// 	ws.onmessage = (event) => {
	// 		// Received an audio frame from the server
	// 		const audioFrame = event.data;
	// 		console.log('Received audio frame:', audioFrame);
	//
	// 		// Here you would process and play the audio data
	// 		// Actual implementation depends on the audio data format and application requirements
	// 	};
	//
	// 	ws.onerror = (error) => {
	// 		console.error('WebSocket Error:', error);
	// 	};
	//
	// 	// Clean up the WebSocket connection when the component unmounts
	// 	return () => {
	// 		ws.close();
	// 	};
	// }, [serverUrl]);

	type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];
	const handleSubmit = (values: any) => {
		console.log(values);
		if (values.amount === ""){
			alert(t("requireAmount"))
		}
		onShowProgress(true);
		const formData = new FormData();
		formData.append('file', fileList[0] as FileType);
		formData.append('message', JSON.stringify({
			id: id, role1: values.role1,
			role2: values.role2,
		}));
		let url = getApiServer(80) + api_url.portal.interaction.live
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

	return (
		<div hidden={!visible}>
			<div className={styles.live_chat_container}>
				<div className={styles.live_chat_content}>
					<Row>
						<Col span={8}>
							<CloseOutlined onClick={onClose}/>
							<Divider type={"vertical"}/>
							{hideSettings?
								<DownOutlined onClick={() => setHideSettings(false)}/>
								:
								<UpOutlined onClick={() => setHideSettings(true)}/>
							}
						</Col>
					</Row>
					{
						!hideSettings &&
              <Row>
                  <Col span={20}>
                      <Form form={form} variant="filled" onFinish={handleSubmit}>
                          <Form.Item label={t("role1")} name="amount" rules={[{required: true, message: '必填项'}]}>
                              <Input/>
                          </Form.Item>
                          <Form.Item label={t("role2")} name="amount" rules={[{required: true, message: '必填项'}]}>
                              <Input/>
                          </Form.Item>
                          <Form.Item label={t("context")}>
                              <Upload {...props}>
                                  <Button icon={<UploadOutlined/>}>{t('Upload')}</Button>
                              </Upload>
                          </Form.Item>
                      </Form>
                      <Form.Item>
                          <Button type="primary" htmlType="submit">
														{t("confirm")}
                          </Button>
                      </Form.Item>
                  </Col>
              </Row>
					}
					<Divider type={"horizontal"}/>
					<Row align={"middle"} justify={"space-between"}>
						<Col span={8} style={{textAlign: "center", height: 300}}>
							<Image src={"/images/two-boy.png"} fill={true} alt={"role1"}/>
						</Col>
						<Col span={8} style={{textAlign: "center"}}>
							<AudioOutlined/>
						</Col>
						<Col span={8} style={{textAlign: "center", height: 300}}>
							<Image fill={true} src={"/images/two-boy.png"} alt={"role1"}/>
						</Col>
					</Row>
				</div>
			</div>
		</div>

	);
};

export default LiveChatComponent;
