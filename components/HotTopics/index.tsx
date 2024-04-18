import React, {useEffect, useState} from 'react';
import styles from "./HotTopicsComponent.module.css";
import {
	Col, List, Modal, Row
} from "antd";
import {useTranslations} from "next-intl";
import {
	LeftOutlined,
	PlusOutlined, SearchOutlined, UnorderedListOutlined
} from "@ant-design/icons";
import commandDataContainer from "@/container/command";

interface HotAIPros {
	visible: boolean,
	onSelectName: (name: string, id: string)=>void,
	onQueryTopic: (topic: string)=>void,
}

const HotTopicsComponent: React.FC<HotAIPros>  = ({visible, onSelectName, onQueryTopic}) => {
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

	return (
		<div hidden={!visible} className={styles.hot_topic_container}>
			{/*{*/}
      {/*  <Row style={{padding: 10}}>*/}
      {/*      <LeftOutlined style={{fontSize: 15}} onClick={() => onClose()}/>*/}
      {/*  </Row>*/}
			{/*}*/}
			<div className={styles.hot_topic_content}>
					<div style={{overflow: "scroll", padding: 15}}>
						<h4 style={{textAlign:"start"}}>{t('topics')}</h4>
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
										<Col span={12}><h5>{item}</h5></Col>
										<Col span={6}>
											<h5>讨论次数: {10}</h5>
										</Col>
                    <Col span={3} style={{textAlign: "end", marginRight:10}}><PlusOutlined onClick={()=> {
											onSelectName(item, item)
                      // onClose()
                    }}/></Col>
										<Col span={2} style={{textAlign: "end"}}><UnorderedListOutlined onClick={()=> onQueryTopic(item)}/></Col>
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
