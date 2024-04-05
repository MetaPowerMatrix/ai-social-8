import React, {useEffect, useState} from 'react';
import {
	Button, Col, Divider,
	Form,
	Input,
	InputNumber, Row,
} from 'antd';
import {useTranslations} from "next-intl";
import {api_url, getApiServer, Persona} from "@/common";
import styles from "./ISSForm.module.css"
import {LeftOutlined} from "@ant-design/icons";

interface ISSFormProps {
	visible: boolean;
	id: string;
	onClose: ()=>void;
	userISS: Persona;
	mobile: boolean;
}

const ISSForm: React.FC<ISSFormProps> = ({visible, id, onClose, userISS, mobile}) => {
	const t = useTranslations('ISSForm');
	const [form] = Form.useForm();

	useEffect(() => {
		form.setFieldsValue(userISS)
	},[userISS])

	const handleSubmit = (values: any) => {
		console.log(values);
		const url = getApiServer(80) + api_url.portal.character.edit + "/" + id;
		fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(values),
		})
			.then(response => response.json())
			.then(data => {
				console.log(data);
				alert(t("Success"))
				onClose()
				// handle server response
			})
			.catch(error => {
				console.error(error);
				// handle error
			});
	};
	return (
		<div hidden={!visible} className={ mobile?styles.iss_form_container_mobile:styles.iss_form_container}>
			{
				mobile &&
          <>
              <Row style={{padding: 10}}>
                  <LeftOutlined style={{fontSize: 20}} onClick={() => onClose()}/>
              </Row>
          </>
			}
			<div className={mobile ? styles.iss_form_content_mobile : styles.iss_form_content}>
				<Row>
					<Col span={24}>
						<Form
							variant="filled"
							form={form} onFinish={handleSubmit}
						>
							<Form.Item label={t("name")} name="name" rules={[{required: true, message: 'do not change here'}]}>
								<Input disabled={true}/>
							</Form.Item>

							<Form.Item
								label={t("age")}
								name="age"
								rules={[{required: true, message: '24'}]}
							>
								<InputNumber style={{width: '100%'}}/>
							</Form.Item>

							<Form.Item
								label={t("innate")}
								name="innate"
								rules={[{required: true, message: t('must')}]}
							>
								<Input.TextArea/>
							</Form.Item>

							<Form.Item
								label={t("learned")}
								name="learned"
								rules={[{required: true, message: t('must')}]}
							>
								<Input.TextArea/>
							</Form.Item>

							<Form.Item
								label={t("currently")}
								name="currently"
								rules={[{required: true, message: t('must')}]}
							>
								<Input.TextArea/>
							</Form.Item>

							<Form.Item
								label={t("lifestyle")}
								name="lifestyle"
								rules={[{required: true, message: t('must')}]}
							>
								<Input.TextArea/>
							</Form.Item>

							<Form.Item
								label={t("daily_plan_req")}
								name="daily_plan_req"
								rules={[{required: true, message: t('must')}]}
							>
								<Input.TextArea/>
							</Form.Item>
							<div style={{marginBottom: 10}}>{t("tips")}</div>

							<Form.Item>
								<Button type="primary" htmlType="submit">
									{t("Submit")}
								</Button>
								{!mobile &&
                    <>
                        <Divider type={"vertical"}/>
                        <Button onClick={onClose}>
													{t("close")}
                        </Button>
                    </>
								}
							</Form.Item>
						</Form>
					</Col>
				</Row>

			</div>
		</div>
	);
}

export default ISSForm;
