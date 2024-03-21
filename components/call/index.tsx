import React from 'react';
import {
	Button, Divider,
	Form,
	Input,
} from 'antd';
import {useTranslations} from "next-intl";
import styles from "./CallPato.module.css"
import commandDataContainer from "@/container/command";

interface CallPatoProps {
	visible: boolean;
	id: string,
	onClose: ()=>void;
}

const CallPato: React.FC<CallPatoProps> = ({visible, id, onClose}) => {
	const t = useTranslations('ISSForm');
	const [form] = Form.useForm();
	const command = commandDataContainer.useContainer()

	const callPato = (id: string, callid: string) => {
		command.callPato(id, callid).then((res) => {
			alert("waiting for call answer")
		})
	}

	const handleSubmit = (values: any) => {
		console.log(values);
		if (values.id === ""){
			alert(t("requireId"))
		}
		callPato(id, values.id)
	};

	return (
		<div hidden={!visible} className={styles.call_form_container}>
			<div className={styles.call_form_content}>
				<div><h5>{t("tips2")}</h5></div>
				<Form form={form} variant="filled" onFinish={handleSubmit}>
					<Form.Item label={t("id")} name="id" rules={[{required: true, message: '必填项'}]}>
						<Input/>
					</Form.Item>
					<Form.Item wrapperCol={{offset: 6, span: 16}}>
						<Button type="primary" htmlType="submit">
							{t("Call")}
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

export default CallPato;
