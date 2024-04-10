import React, {useEffect, useState} from 'react';
import styles from "./HotTopicsComponent.module.css";
import {
	Col, List, Modal, Row
} from "antd";
import {useTranslations} from "next-intl";
import {
	LeftOutlined,
	PlusOutlined, SearchOutlined
} from "@ant-design/icons";
import commandDataContainer from "@/container/command";

interface HotAIPros {
	visible: boolean,
	activeId: string,
	town: string,
	canSelect: boolean,
	onSelectName: (name: string, id: string)=>void,
	onClose: ()=>void,
}

const HotTopicsComponent: React.FC<HotAIPros>  = ({activeId, town, visible, canSelect, onSelectName, onClose}) => {
	const t = useTranslations('discovery');
	const [hotTopics, setHotTopics] = useState<string[]>([])
	const command = commandDataContainer.useContainer()

	useEffect(()=> {
		if (visible)
		{
			command.getTopicHots().then((response) => {
				setHotTopics(response)
			})
		}
	},[visible])

	const addHotTopic= async (topic:string, subject:string) => {
		command.create_today_event(activeId, topic, town).then((response) => {
			Modal.success({
				content: t('waiting')
			})
		})
	};
	return (
		<div hidden={!visible} className={styles.hotai_container_mobile}>
			{
        <Row style={{padding: 10}}>
            <LeftOutlined style={{fontSize: 15}} onClick={() => onClose()}/>
        </Row>
			}
			<div className={styles.hotai_content_mobile}>
					<div style={{overflow: "scroll", padding: 15}}>
						<h3 style={{textAlign:"center"}}>{t('topics')}</h3>
						<List
							itemLayout="horizontal"
							size="small"
							dataSource={hotTopics}
							renderItem={(item, index) => (
								<List.Item
									key={index}
									defaultValue={item}
								>
									<Row align={"middle"} style={{width:"100%"}}>
										<Col span={10}><h5>{item}</h5></Col>
										<Col span={8}>
											<h5>讨论次数: {10}</h5>
										</Col>
										{
											canSelect &&
                        <Col span={2}><PlusOutlined onClick={()=> addHotTopic(item, item)}/></Col>
										}
										{
                        <Col span={2} style={{textAlign: "end"}}><SearchOutlined onClick={()=> {
													onSelectName(item, item)
	                        onClose()
                        }}/></Col>
										}
									</Row>
								</List.Item>
							)}
						/>
					</div>
			</div>
		</div>
	);
};

export default HotTopicsComponent;
