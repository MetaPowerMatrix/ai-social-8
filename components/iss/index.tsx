import React, {useEffect, useState} from 'react';
import {
	Button, Divider,
	Form,
	Input,
	InputNumber,
} from 'antd';
import {useTranslations} from "next-intl";
import {api_url, getApiServer, Persona} from "@/common";
import styles from "./ISSForm.module.css"

interface ISSFormProps {
	visible: boolean;
	id: string;
	onClose: ()=>void;
	userISS: Persona;
}

const ISSForm: React.FC<ISSFormProps> = ({visible, id, onClose, userISS}) => {
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
				alert(t("success"))
				onClose()
				// handle server response
			})
			.catch(error => {
				console.error(error);
				// handle error
			});
	};

	return (
		<div hidden={!visible} className={styles.iss_form_container}>
			<div className={styles.iss_form_content}>
				<div><h5>{t("tips")}</h5></div>
				<Form form={form} variant="filled" onFinish={handleSubmit}>
					<Form.Item  label={t("name")} name="name" rules={[{required: true, message: 'do not change here'}]}>
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
						rules={[{required: true, message: '开朗，积极，乐观'}]}
					>
						<Input.TextArea/>
					</Form.Item>

					<Form.Item
						label={t("learned")}
						name="learned"
						rules={[{required: true, message: '在学编程'}]}
					>
						<Input.TextArea/>
					</Form.Item>

					<Form.Item
						label={t("currently")}
						name="currently"
						rules={[{required: true, message: '在写书'}]}
					>
						<Input.TextArea/>
					</Form.Item>

					<Form.Item
						label={t("lifestyle")}
						name="lifestyle"
						rules={[{required: true, message: '独立'}]}
					>
						<Input.TextArea/>
					</Form.Item>

					<Form.Item
						label={t("daily_plan_req")}
						name="daily_plan_req"
						rules={[{required: true, message: '早睡早起'}]}
					>
						<Input.TextArea/>
					</Form.Item>

					<Form.Item wrapperCol={{offset: 6, span: 16}}>
						<Button type="primary" htmlType="submit">
							{t("Submit")}
						</Button>
						<Divider type={"vertical"}/>
						<Button onClick={onClose}>
							{t("close")}
						</Button>
					</Form.Item>
				</Form>
			</div>
		</div>
	);
}

export default ISSForm;
